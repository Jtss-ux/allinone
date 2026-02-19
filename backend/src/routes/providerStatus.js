const express = require('express');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    openai: !!process.env.OPENAI_API_KEY,
    pollinations: true,
    huggingface: !!process.env.HUGGING_FACE_API_KEY
  });
});

module.exports = router;
