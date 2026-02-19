const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.REPLIT_DEV_PORT || 5000;

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

// Image Generation using Hugging Face (Stable Diffusion)
app.post('/api/image/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, negative_prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!HUGGING_FACE_API_KEY) {
      return res.status(500).json({ 
        error: 'Hugging Face API key not configured',
        message: 'Please set HUGGING_FACE_API_KEY in environment variables'
      });
    }

    // Call Hugging Face API for image generation
    const apiUrl = `https://api-inference.huggingface.co/models/${MODELS.IMAGE}`;
    const response = await axios.post(
      apiUrl,
      { inputs: prompt, parameters: { negative_prompt } },
      {
        headers: { 
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert to base64
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt
    });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

// Audio Generation using Hugging Face (Bark)
app.post('/api/audio/generate', upload.none(), async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!HUGGING_FACE_API_KEY) {
      return res.status(500).json({ 
        error: 'Hugging Face API key not configured',
        message: 'Please set HUGGING_FACE_API_KEY in environment variables'
      });
    }

    // Use Bark for audio generation
    const apiUrl = `https://api-inference.huggingface.co/models/${MODELS.AUDIO_BARK}`;
    const response = await axios.post(
      apiUrl,
      { inputs: text },
      {
        headers: { 
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert to base64
    const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    res.json({
      success: true,
      audioUrl: audioUrl,
      text: text
    });
  } catch (error) {
    console.error('Audio generation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate audio',
      message: error.message 
    });
  }
});

// Video Generation using Hugging Face
app.post('/api/video/generate', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!HUGGING_FACE_API_KEY) {
      return res.status(500).json({ 
        error: 'Hugging Face API key not configured',
        message: 'Please set HUGGING_FACE_API_KEY in environment variables'
      });
    }

    // Use zeroscope for video generation
    const apiUrl = `https://api-inference.huggingface.co/models/${MODELS.VIDEO_ZEROS}`;
    const response = await axios.post(
      apiUrl,
      { inputs: prompt },
      {
        headers: { 
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert to base64
    const base64Video = Buffer.from(response.data, 'binary').toString('base64');
    const videoUrl = `data:video/mp4;base64,${base64Video}`;

    res.json({
      success: true,
      videoUrl: videoUrl,
      prompt: prompt
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
