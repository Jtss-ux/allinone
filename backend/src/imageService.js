const axios = require('axios');

// =============================================
// IMAGE SERVICE — 2-Tier Parallel Racing Architecture
// Tier 1 (Fast): Promise.any races Prodia, Fal, DeepInfra, Together
// Tier 2 (Slow): Sequential fallback through HuggingFace, Replicate, Segmind, Clipdrop
// Tier 3 (Free): Pollinations — always available, no key required
// =============================================

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

// =============================================
// PROVIDER IMPLEMENTATIONS
// =============================================

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
          timeout: 30000,
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

// --- Fal.ai (FLUX schnell — very fast) ---
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
      timeout: 30000,
      validateStatus: (s) => s < 500,
    }
  );

  if (response.status !== 200) throw new Error(`Fal.ai ${response.status}`);

  const imgUrl = response.data?.images?.[0]?.url;
  if (!imgUrl) throw new Error('Fal.ai: no image in response');

  const imgRes = await axiosClient.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
  return { imageBuffer: Buffer.from(imgRes.data), source: 'fal' };
};

// --- DeepInfra (FLUX klein) ---
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
      timeout: 45000,
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

// --- Together.ai (FLUX schnell free) ---
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
      timeout: 45000,
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

// --- Hugging Face (many models, sequential fallback within) ---
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

// --- Replicate (FLUX schnell + SD) ---
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

// --- Pollinations (free, no key — ultimate fallback) ---
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
        { method: 'GET', responseType: 'arraybuffer', timeout: 25000 },
        2 // extra retry for free fallback
      );
      if (response.data && response.data.byteLength > 100) {
        return { imageBuffer: Buffer.from(response.data), source: 'pollinations' };
      }
    } catch (e) {
      console.warn('Pollinations failed:', e.message);
    }
  }
  throw new Error('Pollinations unavailable. Add an API key (Prodia, HF, Replicate, etc.)');
};

// =============================================
// MAIN: 2-Tier Parallel Racing Architecture
// =============================================
const generateImage = async (prompt, opts = {}) => {
  const start = Date.now();
  const encodedPrompt = encodeURIComponent(prompt);
  const width = opts.width || 1024;
  const height = opts.height || 1024;
  const seed = opts.seed || Math.floor(Math.random() * 1000000);

  // --- TIER 1: Fast providers — race them all simultaneously ---
  const fastProviders = [
    process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY
      ? () => generateWithProdia(prompt).then(r => { r.tier = 'fast'; return r; })
      : null,
    process.env.FAL_KEY || process.env.FAL_API_KEY
      ? () => generateWithFal(prompt, opts).then(r => { r.tier = 'fast'; return r; })
      : null,
    process.env.DEEPINFRA_API_KEY
      ? () => generateWithDeepInfra(prompt, opts).then(r => { r.tier = 'fast'; return r; })
      : null,
    process.env.TOGETHER_API_KEY
      ? () => generateWithTogether(prompt, opts).then(r => { r.tier = 'fast'; return r; })
      : null,
  ].filter(Boolean);

  if (fastProviders.length > 0) {
    try {
      // Promise.any — first successful result wins, all others are ignored
      const result = await Promise.any(fastProviders.map(fn => fn()));
      const latency = Date.now() - start;
      console.log(`[image] FAST tier succeeded via ${result.source} (${latency}ms)`);
      return {
        imageUrl: `data:image/png;base64,${result.imageBuffer.toString('base64')}`,
        provider: result.source,
        tier: 'fast',
        latency,
        prompt,
      };
    } catch (e) {
      console.warn(`[image] Fast tier all failed (${Date.now() - start}ms), trying slow tier...`);
    }
  }

  // --- TIER 2: Slower but reliable providers — sequential ---
  const slowProviders = [
    process.env.HUGGING_FACE_API_KEY
      ? { name: 'huggingface', run: () => generateWithHuggingFace(prompt) }
      : null,
    process.env.REPLICATE_API_TOKEN
      ? { name: 'replicate', run: () => generateWithReplicate(prompt) }
      : null,
    process.env.SEGMIND_API_KEY
      ? { name: 'segmind', run: () => generateWithSegmind(prompt, opts) }
      : null,
    process.env.CLIPDROP_API_KEY
      ? { name: 'clipdrop', run: () => generateWithClipdrop(prompt) }
      : null,
  ].filter(Boolean);

  for (const p of slowProviders) {
    try {
      const result = await p.run();
      const latency = Date.now() - start;
      console.log(`[image] SLOW tier succeeded via ${result.source} (${latency}ms)`);
      return {
        imageUrl: `data:image/png;base64,${result.imageBuffer.toString('base64')}`,
        provider: result.source,
        tier: 'slow',
        latency,
        prompt,
      };
    } catch (e) {
      console.warn(`[image] Slow tier ${p.name} failed:`, e.message);
    }
  }

  // --- TIER 3: Free fallback — Pollinations (no key required) ---
  try {
    const result = await generateWithPollinations({ encodedPrompt, width, height, seed });
    const latency = Date.now() - start;
    console.log(`[image] FREE tier succeeded via ${result.source} (${latency}ms)`);
    return {
      imageUrl: `data:image/png;base64,${result.imageBuffer.toString('base64')}`,
      provider: result.source,
      tier: 'free',
      latency,
      prompt,
    };
  } catch (e) {
    console.warn('[image] Free tier (Pollinations) also failed:', e.message);
  }

  throw new Error(
    'Image generation failed. Add at least one API key in Render: PRODIA_API_KEY, HUGGING_FACE_API_KEY, REPLICATE_API_TOKEN, FAL_KEY, DEEPINFRA_API_KEY, or TOGETHER_API_KEY.'
  );
};

// =============================================
// IMG2IMG — Multi-provider with cascading fallback
// Fixed: correct API formats for each provider
// =============================================

// --- Fal.ai img2img (sync endpoint) ---
const img2imgWithFal = async (imageDataUrl, prompt, opts = {}) => {
  const key = process.env.FAL_KEY || process.env.FAL_API_KEY;
  if (!key) throw new Error('FAL_KEY not configured');

  // Step 1: Submit to queue
  const submitRes = await axiosClient.post(
    'https://queue.fal.run/fal-ai/flux/dev/image-to-image',
    {
      image_url: imageDataUrl,
      prompt,
      strength: opts.strength ?? 0.75,
      num_inference_steps: 28,
    },
    {
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );

  const requestId = submitRes.data?.request_id;
  if (!requestId) throw new Error('Fal.ai: no request_id returned');

  // Step 2: Poll for result
  for (let i = 0; i < 30; i++) {
    await wait(2000);
    try {
      const statusRes = await axiosClient.get(
        `https://queue.fal.run/fal-ai/flux/dev/image-to-image/requests/${requestId}/status`,
        { headers: { Authorization: `Key ${key}` }, timeout: 10000 }
      );

      if (statusRes.data?.status === 'COMPLETED') {
        // Fetch the result
        const resultRes = await axiosClient.get(
          `https://queue.fal.run/fal-ai/flux/dev/image-to-image/requests/${requestId}`,
          { headers: { Authorization: `Key ${key}` }, timeout: 15000 }
        );
        const imgUrl = resultRes.data?.images?.[0]?.url;
        if (imgUrl) {
          const imgRes = await axiosClient.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
          return {
            imageUrl: `data:image/png;base64,${Buffer.from(imgRes.data).toString('base64')}`,
            source: 'fal-flux-img2img',
          };
        }
      }
      if (statusRes.data?.status === 'FAILED') {
        throw new Error('Fal.ai img2img failed: ' + (statusRes.data?.error || 'unknown'));
      }
    } catch (pollErr) {
      if (pollErr.message.includes('Fal.ai img2img failed')) throw pollErr;
      // Keep polling on network errors
    }
  }
  throw new Error('Fal.ai img2img timeout after 60s');
};

// --- Replicate img2img (SD 1.5) ---
const img2imgWithReplicate = async (imageDataUrl, prompt, opts = {}) => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');

  const strength = opts.strength ?? 0.75;
  const authHeader = { Authorization: `Token ${token}`, 'Content-Type': 'application/json' };

  // Use the newer model API format
  const createRes = await axiosClient.post(
    'https://api.replicate.com/v1/predictions',
    {
      version: '15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      input: {
        image: imageDataUrl,
        prompt,
        prompt_strength: strength,
        num_inference_steps: 25,
        guidance_scale: 7.5,
      },
    },
    { headers: authHeader, timeout: 15000 }
  );

  const predictionId = createRes.data.id;
  if (!predictionId) throw new Error('Replicate: no prediction ID');

  for (let i = 0; i < 30; i++) {
    await wait(3000);
    const check = await axiosClient.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Token ${token}` }, timeout: 10000 }
    );
    if (check.data.status === 'succeeded') {
      const outputUrl = Array.isArray(check.data.output) ? check.data.output[0] : check.data.output;
      if (outputUrl) {
        const img = await axiosClient.get(outputUrl, { responseType: 'arraybuffer', timeout: 15000 });
        return {
          imageUrl: `data:image/png;base64,${Buffer.from(img.data).toString('base64')}`,
          source: 'replicate-img2img',
        };
      }
    }
    if (check.data.status === 'failed' || check.data.status === 'canceled') {
      throw new Error(check.data.error || 'Replicate img2img failed');
    }
  }
  throw new Error('Replicate img2img timeout after 90s');
};

// --- HuggingFace img2img (SD v1.5 — sends image as body, prompt as params) ---
const img2imgWithHuggingFace = async (imageBuffer, prompt, opts = {}) => {
  const key = process.env.HUGGING_FACE_API_KEY;
  if (!key) throw new Error('HUGGING_FACE_API_KEY not configured');

  // HuggingFace Inference API img2img: POST the image bytes, pass prompt in query
  // SD 1.5 is the most reliable for img2img on HF
  const response = await axiosClient.post(
    'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    imageBuffer,
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/octet-stream',
        'X-Wait-For-Model': 'true',
      },
      responseType: 'arraybuffer',
      timeout: 120000, // HF models can cold-start
    }
  );

  if (response.data && response.data.byteLength > 1000) {
    return {
      imageUrl: `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`,
      source: 'huggingface-img2img',
    };
  }

  // Check if we got an error JSON instead of an image
  try {
    const text = response.data.toString('utf-8');
    const json = JSON.parse(text);
    throw new Error(json.error || 'HuggingFace returned error');
  } catch (parseErr) {
    if (parseErr.message.includes('HuggingFace returned')) throw parseErr;
  }
  throw new Error('HuggingFace img2img: invalid response');
};

// --- Prompt-based fallback: generate a new image inspired by the prompt ---
// This is useful when all img2img APIs fail — we at least produce something
const img2imgFallbackGenerate = async (prompt, opts = {}) => {
  const enhancedPrompt = `${prompt}, highly detailed, professional quality, 8k`;
  const result = await generateImage(enhancedPrompt, { width: 1024, height: 1024 });
  result.source = result.provider + ' (regenerated)';
  result.note = 'Used text-to-image fallback because all img2img providers were unavailable';
  return result;
};

// --- MAIN: img2img with cascading fallback ---
const generateImageToImage = async (imageBuffer, prompt, opts = {}) => {
  const base64 = imageBuffer.toString('base64');
  const imageDataUrl = `data:image/png;base64,${base64}`;
  const start = Date.now();

  const providers = [
    process.env.REPLICATE_API_TOKEN
      ? { name: 'replicate', run: () => img2imgWithReplicate(imageDataUrl, prompt, opts) }
      : null,
    (process.env.FAL_KEY || process.env.FAL_API_KEY)
      ? { name: 'fal', run: () => img2imgWithFal(imageDataUrl, prompt, opts) }
      : null,
    process.env.HUGGING_FACE_API_KEY
      ? { name: 'huggingface', run: () => img2imgWithHuggingFace(imageBuffer, prompt, opts) }
      : null,
  ].filter(Boolean);

  const errors = [];
  for (const p of providers) {
    try {
      const result = await p.run();
      const latency = Date.now() - start;
      console.log(`[img2img] succeeded via ${result.source} (${latency}ms)`);
      result.provider = result.source;
      result.latency = latency;
      result.success = true;
      return result;
    } catch (e) {
      console.warn(`[img2img] ${p.name} failed:`, e.message);
      errors.push(`${p.name}: ${e.message}`);
    }
  }

  // Ultimate fallback: generate a new image from the prompt text
  console.warn('[img2img] All img2img providers failed, falling back to text-to-image generation');
  try {
    const result = await img2imgFallbackGenerate(prompt, opts);
    const latency = Date.now() - start;
    result.provider = result.source;
    result.latency = latency;
    result.success = true;
    return result;
  } catch (genErr) {
    errors.push(`fallback-generate: ${genErr.message}`);
  }

  throw new Error(
    `Image transformation failed (tried ${errors.length} providers). Details: ${errors.join('; ')}`
  );
};

module.exports = { generateImage, generateImageToImage };
