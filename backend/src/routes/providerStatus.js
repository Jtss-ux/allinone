const express = require('express');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    // Chat providers
    openrouter: !!process.env.OPENROUTER_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    together: !!process.env.TOGETHER_API_KEY,
    deepinfra: !!process.env.DEEPINFRA_API_KEY,
    huggingface: !!process.env.HUGGING_FACE_API_KEY,
    pollinations: true, // always available (free)

    // Image providers
    prodia: !!(process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY),
    replicate: !!process.env.REPLICATE_API_TOKEN,
    fal: !!(process.env.FAL_KEY || process.env.FAL_API_KEY),
    segmind: !!process.env.SEGMIND_API_KEY,
    clipdrop: !!process.env.CLIPDROP_API_KEY,

    // Audio providers
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    rapidapi: !!process.env.RAPIDAPI_KEY,

    // Video providers
    ltx: !!process.env.LTX_API_KEY,
    runway: !!process.env.RUNWAY_API_KEY,
    pika: !!process.env.PIKA_API_KEY,
    gen2: !!process.env.GEN2_API_KEY,
    kaiber: !!process.env.KAIBER_API_KEY,
    synthesia: !!process.env.SYNTHESIA_API_KEY,
    heygen: !!process.env.HEYGEN_API_KEY,

    // Summary counts
    _summary: {
      image: ['prodia', 'huggingface', 'replicate', 'fal', 'deepinfra', 'together', 'segmind', 'clipdrop', 'pollinations']
        .filter(p => {
          if (p === 'pollinations') return true;
          if (p === 'prodia') return !!(process.env.PRODIA_API_KEY || process.env.PRODIA_LEGACY_API_KEY);
          if (p === 'fal') return !!(process.env.FAL_KEY || process.env.FAL_API_KEY);
          if (p === 'replicate') return !!process.env.REPLICATE_API_TOKEN;
          if (p === 'huggingface') return !!process.env.HUGGING_FACE_API_KEY;
          if (p === 'deepinfra') return !!process.env.DEEPINFRA_API_KEY;
          if (p === 'together') return !!process.env.TOGETHER_API_KEY;
          if (p === 'segmind') return !!process.env.SEGMIND_API_KEY;
          if (p === 'clipdrop') return !!process.env.CLIPDROP_API_KEY;
          return false;
        }).length,
      chat: ['openrouter', 'openai', 'groq', 'together', 'deepinfra', 'huggingface', 'pollinations']
        .filter(p => {
          if (p === 'pollinations') return true;
          return !!process.env[`${p.toUpperCase()}_API_KEY`] || !!process.env.OPENROUTER_API_KEY && p === 'openrouter';
        }).length,
      video: ['ltx', 'runway', 'pika', 'gen2', 'kaiber', 'synthesia', 'heygen', 'fal', 'replicate', 'huggingface', 'pollinations']
        .filter(p => {
          if (p === 'pollinations') return true;
          if (p === 'fal') return !!(process.env.FAL_KEY || process.env.FAL_API_KEY);
          if (p === 'replicate') return !!process.env.REPLICATE_API_TOKEN;
          if (p === 'huggingface') return !!process.env.HUGGING_FACE_API_KEY;
          return !!process.env[`${p.toUpperCase()}_API_KEY`];
        }).length,
      audio: ['openai', 'elevenlabs', 'rapidapi', 'huggingface', 'groq']
        .filter(p => {
          if (p === 'openai') return !!process.env.OPENAI_API_KEY;
          if (p === 'elevenlabs') return !!process.env.ELEVENLABS_API_KEY;
          if (p === 'rapidapi') return !!process.env.RAPIDAPI_KEY;
          if (p === 'huggingface') return !!process.env.HUGGING_FACE_API_KEY;
          if (p === 'groq') return !!process.env.GROQ_API_KEY;
          return false;
        }).length,
    }
  });
});

module.exports = router;
