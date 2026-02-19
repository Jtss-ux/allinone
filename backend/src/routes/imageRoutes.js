const express = require('express');
const { generateImage } = require('../imageService');

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { prompt, num_inference_steps, width, height, seed } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateImage(prompt, { steps: num_inference_steps, width, height, seed });

    res.json(result);
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate image', message: error.message });
  }
});

module.exports = router;
