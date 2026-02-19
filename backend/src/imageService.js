const axios = require('axios');
const FormData = require('form-data');

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
  const q = `?width=${width}&height=${height}&seed=${seed}`;

  return [
    `${base}${q}&model=flux&nologo=true&noCache=true`,
    `${base}${q}&model=turbo&nologo=true&noCache=true`,
    `${base}${q}&nologo=true&noCache=true`,
    `${base}${q}&model=flux&nologo=true`,
    `${base}${q}&model=turbo&nologo=true`,
  ];
};

const generateWithPollinations = async ({ encodedPrompt, width, height, seed }) => {
  const pollinationsUrls = buildPollinationsUrls({ encodedPrompt, width, height, seed });
  const errors = [];

  for (const url of pollinationsUrls.slice(0, 3)) {
    try {
      const response = await requestWithRetry(
        url,
        { method: 'GET', responseType: 'arraybuffer', timeout: 25000 },
        1
      );

      return { imageBuffer: Buffer.from(response.data), source: 'pollinations' };
    } catch (error) {
      errors.push(error.message);
      console.warn(`Pollinations fallback failed: ${error.message}`);
    }
  }

  throw new Error(`Pollinations unavailable (530). Try adding REPLICATE_API_TOKEN or TOGETHER_API_KEY.`);
};

const generateWithHuggingFace = async (prompt) => {
  if (!process.env.HUGGING_FACE_API_KEY) {
    throw new Error('HUGGING_FACE_API_KEY is not configured');
  }

  const hfModels = [
    'stabilityai/stable-diffusion-xl-base-1.0',
    'black-forest-labs/FLUX.1-schnell',
    'ByteDance/Hyper-SD',
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

const generateWithTogether = async (prompt, opts = {}) => {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  const response = await axiosClient.post(
    'https://api.together.xyz/v1/images/generations',
    {
      prompt,
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      steps: opts.steps || 20,
      width: opts.width || 1024,
      height: opts.height || 1024,
      seed: opts.seed ?? Math.floor(Math.random() * 1000000),
      response_format: 'base64',
      output_format: 'png',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      timeout: 60000,
    }
  );

  if (response.status !== 200 || !response.data?.data?.[0]?.b64_json) {
    throw new Error(`Together.ai failed: ${response.status}`);
  }
  return {
    imageBuffer: Buffer.from(response.data.data[0].b64_json, 'base64'),
    source: 'together',
  };
};

const generateWithProdia = async (prompt) => {
  const key = process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY;
  if (!key) {
    throw new Error('PRODIA_API_KEY not configured');
  }

  const response = await axiosClient.post(
    'https://inference.prodia.com/v2/job',
    {
      type: 'inference.flux-fast.schnell.txt2img.v1',
      config: { prompt },
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'image/png',
      },
      responseType: 'arraybuffer',
      timeout: 60000,
      validateStatus: (s) => s < 500,
    }
  );

  if (response.status !== 200) {
    let errMsg = response.statusText;
    try {
      const d = response.data;
      if (Buffer.isBuffer(d)) errMsg = d.toString('utf8').slice(0, 200);
      else if (typeof d === 'string') errMsg = d.slice(0, 200);
      else if (d?.error) errMsg = d.error;
    } catch (_) {}
    throw new Error(`Prodia ${response.status}: ${errMsg}`);
  }
  const data = response.data;
  if (!data || (Buffer.isBuffer(data) && data.length < 100)) {
    throw new Error('Prodia returned empty or invalid image');
  }
  return { imageBuffer: Buffer.isBuffer(data) ? data : Buffer.from(data), source: 'prodia' };
};

const generateWithSegmind = async (prompt, opts = {}) => {
  if (!process.env.SEGMIND_API_KEY) {
    throw new Error('SEGMIND_API_KEY not configured');
  }

  const response = await axiosClient.post(
    'https://api.segmind.com/v1/sdxl1.0-txt2img',
    {
      prompt,
      samples: 1,
      scheduler: 'UniPC',
      num_inference_steps: opts.steps || 25,
      guidance_scale: 7.5,
      width: opts.width || 1024,
      height: opts.height || 1024,
      seed: opts.seed ?? Math.floor(Math.random() * 1000000),
    },
    {
      headers: { 'x-api-key': process.env.SEGMIND_API_KEY, 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
      timeout: 60000,
    }
  );

  if (response.status !== 200) {
    throw new Error(`Segmind failed: ${response.status}`);
  }
  return { imageBuffer: Buffer.from(response.data), source: 'segmind' };
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

  if (process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY) {
    providers.push({
      name: 'prodia',
      func: () => generateWithProdia(prompt)
    });
  }

  if (process.env.HUGGING_FACE_API_KEY) {
    providers.push({
      name: 'huggingface',
      func: () => generateWithHuggingFace(prompt)
    });
  }

  if (process.env.REPLICATE_API_TOKEN) {
    providers.push({
      name: 'replicate',
      func: () => generateWithReplicate(prompt)
    });
  }

  if (process.env.TOGETHER_API_KEY) {
    providers.push({
      name: 'together',
      func: () => generateWithTogether(prompt, opts)
    });
  }

  if (process.env.SEGMIND_API_KEY) {
    providers.push({
      name: 'segmind',
      func: () => generateWithSegmind(prompt, opts)
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

  throw new Error(
    'Image generation failed. Add one of these API keys in Render: REPLICATE_API_TOKEN (replicate.com), TOGETHER_API_KEY (together.ai, free FLUX), PRODIA_API_KEY (prodia.com), or HUGGING_FACE_API_KEY.'
  );
};

const generateImageToImageReplicate = async (imageDataUrl, prompt, opts = {}) => {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const strength = opts.strength ?? 0.75;
  const response = await axiosClient.post(
    'https://api.replicate.com/v1/predictions',
    {
      version: 'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      input: {
        image: imageDataUrl,
        prompt,
        prompt_strength: strength,
        num_inference_steps: 25,
      },
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const predictionId = response.data.id;
  let result;

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const check = await axiosClient.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` } }
    );

    if (check.data.status === 'succeeded') {
      result = check.data;
      break;
    }
    if (check.data.status === 'failed') {
      throw new Error(check.data.error || 'Replicate img2img failed');
    }
  }

  if (result?.output?.[0]) {
    const imgResponse = await axiosClient.get(result.output[0], {
      responseType: 'arraybuffer',
    });
    const imageBuffer = Buffer.from(imgResponse.data, 'binary');
    return {
      imageUrl: `data:image/png;base64,${imageBuffer.toString('base64')}`,
      source: 'replicate-img2img',
    };
  }
  throw new Error('Replicate img2img timeout or no output');
};

const generateImageToImage = async (imageBuffer, prompt, opts = {}) => {
  const mime = 'image/png';
  const base64 = imageBuffer.toString('base64');
  const imageDataUrl = `data:${mime};base64,${base64}`;

  if (process.env.REPLICATE_API_TOKEN) {
    try {
      const result = await generateImageToImageReplicate(imageDataUrl, prompt, opts);
      return { imageUrl: result.imageUrl, provider: result.source };
    } catch (e) {
      console.warn('Replicate img2img failed:', e.message);
    }
  }

  throw new Error('Image transformation requires REPLICATE_API_TOKEN. Please add it in Render environment variables.');
};

module.exports = { generateImage, generateImageToImage };
