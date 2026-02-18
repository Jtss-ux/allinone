const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.REPLIT_DEV_PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://allinone-opal.vercel.app', 'https://allinone--rosabellaismyna.replit.app', '*.pages.dev', '*.cloudflareapps.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Image Generation
app.post('/api/image/generate', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // TODO: Integrate with Python ML service or external API
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Image generation queued',
      prompt,
      estimatedTime: '30 seconds'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Generation
app.post('/api/video/generate', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // TODO: Integrate with Python ML service
    res.json({
      success: true,
      message: 'Video generation queued',
      prompt,
      estimatedTime: '2-5 minutes'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audio Generation
app.post('/api/audio/generate', upload.none(), async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // TODO: Integrate with audio generation service
    res.json({
      success: true,
      message: 'Audio generation queued',
      text,
      voice: voice || 'default',
      estimatedTime: '10 seconds'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Upload
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
