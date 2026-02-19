const axios = require('axios');
const https = require('https');
const FormData = require('form-data');

const keepAliveAgent = new https.Agent({ keepAlive: true });

const axiosClient = axios.create({
  timeout: 45000,
  validateStatus: () => true,
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (status) => !status || status === 429 || status === 530 || status >= 500;

const requestWithRetry = async (url, options = {}, maxRetries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await axiosClient({ url, ...options });

      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      if (!shouldRetry(response.status) || attempt === maxRetries) {
        const error = new Error(`Request failed with status code ${response.status}`);
        error.status = response.status;
        throw error;
      }
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
    }

    await wait(250 * (attempt + 1));
  }

  throw lastError || new Error('Request failed after retries');
};

const buildPollinationsUrls = ({ encodedPrompt, width, height, seed }) => {
  const base = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

  return [
    `${base}?width=${width}&height=${height}&seed=${seed}&model=flux&enhance=true&nologo=true&noCache=true`,
    `${base}?width=${width}&height=${height}&seed=${seed}&model=turbo&nologo=true&noCache=true`,
    `${base}?width=${width}&height=${height}&seed=${seed}&nologo=true&noCache=true`,
    `${base}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&noCache=true`,
  ];
};

const generateWithPollinations = async ({ encodedPrompt, width, height, seed }) => {
  const pollinationsUrls = buildPollinationsUrls({ encodedPrompt, width, height, seed });
  const errors = [];

  for (const url of pollinationsUrls.slice(0, process.env.MAX_IMAGE_FALLBACKS || 5)) {
    try {
      const response = await requestWithRetry(
        url,
        { method: 'GET', responseType: 'arraybuffer' },
        2
      );

      return { imageBuffer: Buffer.from(response.data), source: 'pollinations' };
    } catch (error) {
      errors.push(error.message);
      console.warn(`Pollinations fallback failed: ${error.message}`);
    }
  }

  throw new Error(`All Pollinations fallbacks failed. ${errors.join(' | ')}`);
};

const generateWithHuggingFace = async (prompt) => {
  if (!process.env.HUGGING_FACE_API_KEY) {
    throw new Error('HUGGING_FACE_API_KEY is not configured');
  }

  const hfModels = [
    'prompthero/openjourney',
    'CompVis/stable-diffusion-v1-4',
  ];

  const errors = [];

  for (const model of hfModels.slice(0, process.env.MAX_IMAGE_FALLBACKS || 5)) {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    try {
      const response = await requestWithRetry(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          data: {
            inputs: prompt,
            options: {
              wait_for_model: true,
              use_cache: false,
            },
          },
          timeout: 60000,
        },
        1
      );

      return { imageBuffer: Buffer.from(response.data), source: `huggingface:${model}` };
    } catch (error) {
      errors.push(`${model}: ${error.message}`);
      console.warn(`Hugging Face fallback failed (${model}): ${error.message}`);
    }
  }

  throw new Error(`All Hugging Face fallbacks failed. ${errors.join(' | ')}`);
};

const generateWithClipdrop = async (prompt) => {
  if (!process.env.CLIPDROP_API_KEY) {
    throw new Error('CLIPDROP_API_KEY not configured');
  }

  const response = await axiosClient.post('https://clipdrop-api.co/text-to-image/v1', { prompt }, {
    headers: { 'x-Api-Key': process.env.CLIPDROP_API_KEY },
    responseType: 'arraybuffer'
  });

  return { imageBuffer: Buffer.from(response.data), source: 'clipdrop' };
};

const generateWithReplicate = async (prompt) => {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const response = await axiosClient.post('https://api.replicate.com/v1/predictions', {
    version: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
    input: { prompt }
  }, {
    headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' }
  });

  const predictionId = response.data.id;
  let result;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const check = await axiosClient.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    if (check.data.status === 'succeeded') {
      result = check.data;
      break;
    } else if (check.data.status === 'failed') {
      throw new Error('Replicate generation failed');
    }
  }
  if (result?.output?.[0]) {
    const imgResponse = await axiosClient.get(result.output[0], { responseType: 'arraybuffer' });
    return { imageBuffer: Buffer.from(imgResponse.data, 'binary'), source: 'replicate' };
  }
  throw new Error('Replicate timeout or no output');
};

const generateImage = async (prompt, opts = {}) => {
  const start = Date.now();

  const providers = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      func: () => generateWithOpenAI(prompt, opts.steps)
    });
  }

  if (process.env.DEEPAI_API_KEY) {
    providers.push({
      name: 'deepai',
      func: () => generateWithDeepAI(prompt)
    });
  }

  if (process.env.REPLICATE_API_TOKEN) {
    providers.push({
      name: 'replicate',
      func: () => generateWithReplicate(prompt)
    });
  }

  if (process.env.HUGGING_FACE_API_KEY) {
    providers.push({
      name: 'huggingface',
      func: () => generateWithHuggingFace(prompt)
    });
  }

  if (process.env.CLIPDROP_API_KEY) {
    providers.push({
      name: 'clipdrop',
      func: () => generateWithClipdrop(prompt)
    });
  }

  providers.push({
    name: 'pollinations',
    func: () => generateWithPollinations({
      encodedPrompt: encodeURIComponent(prompt),
      width: opts.width || 1024,
      height: opts.height || 1024,
      seed: opts.seed || Math.floor(Math.random() * 1000000)
    })
  });

  const errors = [];

  for (const p of providers) {
    try {
      const result = await p.func();
      const latency = Date.now() - start;
      return {
        imageUrl: `data:image/png;base64,${result.imageBuffer.toString('base64')}`,
        provider: result.source,
        latency,
        prompt
      };
    } catch (error) {
      errors.push(`${p.name}: ${error.message}`);
    }
  }

  // Fallback static image if all providers fail
  const staticImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return {
    imageUrl: staticImage,
    provider: 'fallback',
    latency: Date.now() - start,
    prompt
  };
};

module.exports = { generateImage };
