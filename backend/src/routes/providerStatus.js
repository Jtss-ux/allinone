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
  });
});

module.exports = router;
