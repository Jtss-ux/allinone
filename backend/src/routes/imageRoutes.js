const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateImage, generateImageToImage } = require('../imageService');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/generate', async (req, res) => {
  try {
    const { prompt, negative_prompt, num_inference_steps, guidance_scale, width, height, seed } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let enhancedPrompt = prompt;
    if (num_inference_steps >= 40) {
      enhancedPrompt += ', highly detailed, masterpiece, best quality, 8k, sharp focus';
    } else if (num_inference_steps >= 25) {
      enhancedPrompt += ', detailed, high quality, sharp';
    }
    if (negative_prompt) {
      enhancedPrompt += ` [avoid: ${negative_prompt}]`;
    }

    const result = await generateImage(enhancedPrompt, {
      steps: num_inference_steps || 20,
      width: width ? parseInt(width, 10) : 1024,
      height: height ? parseInt(height, 10) : 1024,
      seed: seed ? parseInt(seed, 10) : undefined,
    });

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      imageBase64: result.imageUrl,
      prompt: req.body.prompt,
      provider: result.provider,
    });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate image', message: error.message });
  }
});

router.post('/img2img', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.prompt_text || '';
    const strength = parseFloat(req.body.strength || req.body.prompt_strength || 0.75);

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    let imageBuffer = req.file?.buffer;
    if (!imageBuffer && req.body.image) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    }
    if (!imageBuffer) {
      return res.status(400).json({ error: 'Invalid image' });
    }

    const result = await generateImageToImage(imageBuffer, prompt, { strength });

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      imageBase64: result.imageUrl,
      jobId: `img2img-${Date.now()}`,
    });
  } catch (error) {
    console.error('Image img2img error:', error.message);
    res.status(500).json({ error: 'Failed to transform image', message: error.message });
  }
});

module.exports = router;
