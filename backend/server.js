const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.REPLIT_DEV_PORT || 5000;
const MAX_IMAGE_FALLBACKS = Number(process.env.MAX_IMAGE_FALLBACKS || 5);

const keepAliveAgent = new https.Agent({ keepAlive: true });

const axiosClient = axios.create({
  timeout: 45000,
  httpsAgent: keepAliveAgent,
  validateStatus: () => true,
});

// Hugging Face API configuration
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || '';

// AI Models on Hugging Face
const MODELS = {
  // Image Generation - Using a working model
  IMAGE: 'runwayml/stable-diffusion-v1-5',
  
  // Audio Generation
  AUDIO_BARK: 'suno/bark',
  AUDIO_SPEECHT5: 'microsoft/speecht5_tts',
  
  // Video Generation (placeholder - requires more setup)
  VIDEO_ZEROS: 'damo-vilab/text-to-video-ms-1.7b',
};

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
    `${base}?width=${width}&height=${height}&nologo=true&noCache=true`,
  ];
};

const generateWithPollinations = async ({ encodedPrompt, width, height, seed }) => {
  const pollinationsUrls = buildPollinationsUrls({ encodedPrompt, width, height, seed });
  const errors = [];

  for (const url of pollinationsUrls.slice(0, MAX_IMAGE_FALLBACKS)) {
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
  if (!HUGGING_FACE_API_KEY) {
    throw new Error('HUGGING_FACE_API_KEY is not configured');
  }

  const hfModels = [
    MODELS.IMAGE,
    'stabilityai/stable-diffusion-xl-base-1.0',
  ];

  const errors = [];

  for (const model of hfModels.slice(0, MAX_IMAGE_FALLBACKS)) {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    try {
      const response = await requestWithRetry(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
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

// CORS configuration - Allow all origins for now (you can restrict this later)
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Routes

// Root route - quick response for health checks
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Image Generation - Using Pollinations AI (Free, No API Key Required)
app.post('/api/image/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, negative_prompt, num_inference_steps, guidance_scale } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build the prompt with quality settings
    let enhancedPrompt = prompt;
    
    // Add quality modifiers based on steps
    if (num_inference_steps >= 40) {
      enhancedPrompt += ', highly detailed, masterpiece, best quality, 8k, sharp focus';
    } else if (num_inference_steps >= 25) {
      enhancedPrompt += ', detailed, high quality, sharp';
    }
    
    // Add negative prompt if provided
    if (negative_prompt) {
      enhancedPrompt += ` | ${negative_prompt}`;
    }
    
    // Use Pollinations AI - free, no API key needed
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    const fastMode = Number(num_inference_steps || 20) <= 20;
    const width = fastMode ? 768 : 1024;
    const height = fastMode ? 768 : 1024;

    const providers = [
      () => generateWithPollinations({ encodedPrompt, width, height, seed }),
      () => generateWithHuggingFace(enhancedPrompt),
    ];

    let generationResult;
    const providerErrors = [];

    for (const provider of providers) {
      try {
        generationResult = await provider();
        break;
      } catch (providerError) {
        providerErrors.push(providerError.message);
      }
    }

    if (!generationResult) {
      throw new Error(providerErrors.join(' || '));
    }

    const base64Image = generationResult.imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt,
      quality: num_inference_steps || 15,
      provider: generationResult.source,
    });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

// Audio Generation using ElevenLabs (Free tier available)
app.post('/api/audio/generate', upload.none(), async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use OpenAI TTS API (requires OPENAI_API_KEY)
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1',
          input: text,
          voice: voice
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

      res.json({
        success: true,
        audioUrl: audioUrl,
        text: text
      });
    } else {
      // Fallback: Return a message that audio generation requires OpenAI key
      res.status(503).json({
        success: false,
        error: 'Audio generation requires OpenAI API key',
        message: 'Please add OPENAI_API_KEY to environment variables'
      });
    }
  } catch (error) {
    console.error('Audio generation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate audio',
      message: error.message 
    });
  }
});

// Video Generation using Pollinations
app.post('/api/video/generate', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // For now, return a message that video generation is processing
    // Video generation requires more complex setup
    res.json({
      success: false,
      error: 'Video generation coming soon',
      message: 'Video generation is being configured. Please use Image Generator for now.'
    });
  } catch (error) {
    console.error('Video generation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate video',
      message: error.message 
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`
  });
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
});
