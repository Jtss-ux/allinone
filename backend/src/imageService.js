const axios = require('axios');

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
      if (response.status >= 200 && response.status < 300) return response;
      if (!shouldRetry(response.status) || attempt === maxRetries) {
        const err = new Error(`Request failed with status code ${response.status}`);
        err.status = response.status;
        throw err;
      }
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw error;
    }
    await wait(250 * (attempt + 1));
  }
  throw lastError || new Error('Request failed after retries');
};

// --- Prodia (flux-fast + flux-2.klein fallback) ---
const generateWithProdia = async (prompt) => {
  const key = process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY;
  if (!key) throw new Error('PRODIA_API_KEY not configured');

  const models = [
    { type: 'inference.flux-fast.schnell.txt2img.v1', name: 'prodia-flux-fast' },
    { type: 'inference.flux-2.klein.4b.txt2img.v1', name: 'prodia-flux-klein' },
  ];

  for (const { type, name } of models) {
    try {
      const response = await axiosClient.post(
        'https://inference.prodia.com/v2/job',
        { type, config: { prompt } },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Accept: 'image/png',
          },
          responseType: 'arraybuffer',
          timeout: 45000,
          validateStatus: (s) => s < 500,
        }
      );
      if (response.status === 200 && response.data && response.data.length > 100) {
        return { imageBuffer: Buffer.from(response.data), source: name };
      }
    } catch (e) {
      console.warn(`Prodia ${type} failed:`, e.message);
    }
  }
  throw new Error('Prodia: all models failed');
};

// --- Hugging Face (many models) ---
const HF_MODELS = [
  'stabilityai/stable-diffusion-xl-base-1.0',
  'black-forest-labs/FLUX.1-schnell',
  'ByteDance/Hyper-SD',
  'stabilityai/stable-diffusion-2-1',
  'runwayml/stable-diffusion-v1-5',
  'dreamlike-art/dreamlike-photoreal-2.0',
];

const generateWithHuggingFace = async (prompt) => {
  const key = process.env.HUGGING_FACE_API_KEY;
  if (!key) throw new Error('HUGGING_FACE_API_KEY not configured');

  const max = Math.min(HF_MODELS.length, parseInt(process.env.MAX_IMAGE_FALLBACKS, 10) || 6);

  for (let i = 0; i < max; i++) {
    const model = HF_MODELS[i];
    try {
      const response = await requestWithRetry(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          data: {
            inputs: prompt,
            options: { wait_for_model: true, use_cache: false },
          },
          timeout: 60000,
        },
        1
      );
      if (response.data && response.data.byteLength > 100) {
        return { imageBuffer: Buffer.from(response.data), source: `huggingface:${model}` };
      }
    } catch (e) {
      console.warn(`HF ${model} failed:`, e.message);
    }
  }
  throw new Error('Hugging Face: all models failed');
};

// --- Replicate (try FLUX schnell, then SD) ---
const REPLICATE_MODELS = [
  { version: 'black-forest-labs/flux-schnell:bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00', inputKey: 'prompt', pollMs: 2000 },
  { version: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf', inputKey: 'prompt', pollMs: 2000 },
];

const generateWithReplicate = async (prompt) => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');

  const headers = { Authorization: `Token ${token}`, 'Content-Type': 'application/json' };

  for (const model of REPLICATE_MODELS) {
    try {
      const createRes = await axiosClient.post(
        'https://api.replicate.com/v1/predictions',
        { version: model.version, input: { [model.inputKey]: prompt } },
        { headers }
      );

      if (createRes.status !== 201 && createRes.status !== 200) throw new Error(`create ${createRes.status}`);

      const predictionId = createRes.data.id;
      for (let i = 0; i < 40; i++) {
        await wait(model.pollMs || 2000);
        const check = await axiosClient.get(`https://api.replicate.com/v1/predictions/${predictionId}`, { headers });
        const status = check.data?.status;
        if (status === 'succeeded') {
          const out = check.data?.output;
          const url = Array.isArray(out) ? out[0] : (typeof out === 'string' ? out : out?.url);
          if (url) {
            const img = await axiosClient.get(url, { responseType: 'arraybuffer' });
            return { imageBuffer: Buffer.from(img.data), source: `replicate:${model.version.split('/')[1]?.split(':')[0] || 'sd'}` };
          }
        }
        if (status === 'failed') break;
      }
    } catch (e) {
      console.warn(`Replicate ${model.version.split(':')[0]} failed:`, e.message);
    }
  }
  throw new Error('Replicate: all models failed');
};

// --- Fal.ai ---
const generateWithFal = async (prompt, opts = {}) => {
  const key = process.env.FAL_KEY || process.env.FAL_API_KEY;
  if (!key) throw new Error('FAL_KEY not configured');

  const response = await axiosClient.post(
    'https://queue.fal.run/fal-ai/flux/schnell',
    {
      prompt,
      image_size: 'square_hd',
      num_inference_steps: 4,
      output_format: 'png',
    },
    {
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      timeout: 45000,
      validateStatus: (s) => s < 500,
    }
  );

  if (response.status !== 200) throw new Error(`Fal.ai ${response.status}`);

  const imgUrl = response.data?.images?.[0]?.url;
  if (!imgUrl) throw new Error('Fal.ai: no image in response');

  const imgRes = await axiosClient.get(imgUrl, { responseType: 'arraybuffer' });
  return { imageBuffer: Buffer.from(imgRes.data), source: 'fal' };
};

// --- DeepInfra ---
const generateWithDeepInfra = async (prompt, opts = {}) => {
  const key = process.env.DEEPINFRA_API_KEY;
  if (!key) throw new Error('DEEPINFRA_API_KEY not configured');

  const response = await axiosClient.post(
    'https://api.deepinfra.com/v1/openai/images/generations',
    {
      prompt,
      model: 'black-forest-labs/FLUX-2-klein-4b',
      size: '1024x1024',
      n: 1,
      response_format: 'b64_json',
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      timeout: 60000,
      validateStatus: (s) => s < 500,
    }
  );

  if (response.status !== 200 || !response.data?.data?.[0]?.b64_json) {
    throw new Error(`DeepInfra ${response.status}`);
  }
  return {
    imageBuffer: Buffer.from(response.data.data[0].b64_json, 'base64'),
    source: 'deepinfra',
  };
};

// --- Together.ai ---
const generateWithTogether = async (prompt, opts = {}) => {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) throw new Error('TOGETHER_API_KEY not configured');

  const response = await axiosClient.post(
    'https://api.together.xyz/v1/images/generations',
    {
      prompt,
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      steps: 20,
      width: opts.width || 1024,
      height: opts.height || 1024,
      seed: opts.seed ?? Math.floor(Math.random() * 1000000),
      response_format: 'base64',
      output_format: 'png',
    },
    {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      responseType: 'json',
      timeout: 60000,
    }
  );

  if (response.status !== 200 || !response.data?.data?.[0]?.b64_json) {
    throw new Error(`Together ${response.status}`);
  }
  return {
    imageBuffer: Buffer.from(response.data.data[0].b64_json, 'base64'),
    source: 'together',
  };
};

// --- Segmind ---
const generateWithSegmind = async (prompt, opts = {}) => {
  const key = process.env.SEGMIND_API_KEY;
  if (!key) throw new Error('SEGMIND_API_KEY not configured');

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
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
      timeout: 60000,
    }
  );

  if (response.status !== 200) throw new Error(`Segmind ${response.status}`);
  return { imageBuffer: Buffer.from(response.data), source: 'segmind' };
};

// --- Clipdrop ---
const generateWithClipdrop = async (prompt) => {
  const key = process.env.CLIPDROP_API_KEY;
  if (!key) throw new Error('CLIPDROP_API_KEY not configured');

  const response = await axiosClient.post(
    'https://clipdrop-api.co/text-to-image/v1',
    { prompt },
    { headers: { 'x-Api-Key': key }, responseType: 'arraybuffer', timeout: 45000 }
  );

  if (response.status !== 200) throw new Error(`Clipdrop ${response.status}`);
  return { imageBuffer: Buffer.from(response.data), source: 'clipdrop' };
};

// --- Pollinations (free, no key) ---
const buildPollinationsUrls = ({ encodedPrompt, width, height, seed }) => {
  const base = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
  const q = `?width=${width}&height=${height}&seed=${seed}`;
  return [
    `${base}${q}&model=flux&nologo=true&noCache=true`,
    `${base}${q}&model=turbo&nologo=true&noCache=true`,
    `${base}${q}&nologo=true&noCache=true`,
  ];
};

const generateWithPollinations = async ({ encodedPrompt, width, height, seed }) => {
  const urls = buildPollinationsUrls({ encodedPrompt, width, height, seed });

  for (const url of urls) {
    try {
      const response = await requestWithRetry(
        url,
        { method: 'GET', responseType: 'arraybuffer', timeout: 20000 },
        1
      );
      if (response.data && response.data.byteLength > 100) {
        return { imageBuffer: Buffer.from(response.data), source: 'pollinations' };
      }
    } catch (e) {
      console.warn('Pollinations failed:', e.message);
    }
  }
  throw new Error('Pollinations unavailable (530). Add an API key (Prodia, HF, Replicate, etc.)');
};

// --- Main: try all providers in order ---
const generateImage = async (prompt, opts = {}) => {
  const start = Date.now();
  const encodedPrompt = encodeURIComponent(prompt);
  const width = opts.width || 1024;
  const height = opts.height || 1024;
  const seed = opts.seed || Math.floor(Math.random() * 1000000);

  const providers = [
    process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY
      ? { name: 'prodia', run: () => generateWithProdia(prompt) }
      : null,
    process.env.HUGGING_FACE_API_KEY
      ? { name: 'huggingface', run: () => generateWithHuggingFace(prompt) }
      : null,
    process.env.REPLICATE_API_TOKEN
      ? { name: 'replicate', run: () => generateWithReplicate(prompt) }
      : null,
    process.env.FAL_KEY || process.env.FAL_API_KEY
      ? { name: 'fal', run: () => generateWithFal(prompt, opts) }
      : null,
    process.env.DEEPINFRA_API_KEY
      ? { name: 'deepinfra', run: () => generateWithDeepInfra(prompt, opts) }
      : null,
    process.env.TOGETHER_API_KEY
      ? { name: 'together', run: () => generateWithTogether(prompt, opts) }
      : null,
    process.env.SEGMIND_API_KEY
      ? { name: 'segmind', run: () => generateWithSegmind(prompt, opts) }
      : null,
    process.env.CLIPDROP_API_KEY
      ? { name: 'clipdrop', run: () => generateWithClipdrop(prompt) }
      : null,
    { name: 'pollinations', run: () => generateWithPollinations({ encodedPrompt, width, height, seed }) },
  ].filter(Boolean);

  const errors = [];

  for (const p of providers) {
    try {
      const result = await p.run();
      const latency = Date.now() - start;
      console.log(`[image] succeeded via ${result.source} (${latency}ms)`);
      return {
        imageUrl: `data:image/png;base64,${result.imageBuffer.toString('base64')}`,
        provider: result.source,
        latency,
        prompt,
      };
    } catch (error) {
      errors.push(`${p.name}: ${error.message}`);
    }
  }

  throw new Error(
    'Image generation failed. Add at least one API key in Render: PRODIA_API_KEY, HUGGING_FACE_API_KEY, REPLICATE_API_TOKEN, FAL_KEY, DEEPINFRA_API_KEY, or TOGETHER_API_KEY.'
  );
};

// --- Img2Img (Replicate) ---
const generateImageToImageReplicate = async (imageDataUrl, prompt, opts = {}) => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');

  const strength = opts.strength ?? 0.75;
  const createRes = await axiosClient.post(
    'https://api.replicate.com/v1/predictions',
    {
      version: 'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      input: { image: imageDataUrl, prompt, prompt_strength: strength, num_inference_steps: 25 },
    },
    {
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    }
  );

  const predictionId = createRes.data.id;
  for (let i = 0; i < 40; i++) {
    await wait(2000);
    const check = await axiosClient.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (check.data.status === 'succeeded') {
      const url = check.data.output?.[0];
      if (url) {
        const img = await axiosClient.get(url, { responseType: 'arraybuffer' });
        return {
          imageUrl: `data:image/png;base64,${Buffer.from(img.data).toString('base64')}`,
          source: 'replicate-img2img',
        };
      }
    }
    if (check.data.status === 'failed') {
      throw new Error(check.data.error || 'Replicate img2img failed');
    }
  }
  throw new Error('Replicate img2img timeout');
};

const generateImageToImage = async (imageBuffer, prompt, opts = {}) => {
  const base64 = imageBuffer.toString('base64');
  const imageDataUrl = `data:image/png;base64,${base64}`;

  if (process.env.REPLICATE_API_TOKEN) {
    try {
      return await generateImageToImageReplicate(imageDataUrl, prompt, opts);
    } catch (e) {
      console.warn('Replicate img2img failed:', e.message);
    }
  }

  throw new Error('Img2img requires REPLICATE_API_TOKEN. Add it in Render environment variables.');
};

module.exports = { generateImage, generateImageToImage };
