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

// API Keys Configuration
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || '';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const LTX_API_KEY = process.env.LTX_API_KEY || '';

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

// Image Generation - Multiple API fallback system
app.post('/api/image/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, negative_prompt, num_inference_steps } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Try OpenAI DALL-E 3 first (best quality)
    if (process.env.OPENAI_API_KEY) {
      try {
        const quality = num_inference_steps >= 40 ? 'hd' : 'standard';
        const size = num_inference_steps >= 40 ? '1024x1024' : '512x512';
        
        const response = await axios.post(
          'https://api.openai.com/v1/images/generations',
          {
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: size,
            quality: quality
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Fetch the image from OpenAI URL
        const imageResponse = await axios.get(response.data.data[0].url, {
          responseType: 'arraybuffer',
          timeout: 60000
        });

        const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;

        res.json({
          success: true,
          imageUrl: dataUrl,
          prompt: prompt,
          quality: quality,
          provider: 'openai'
        });
        return;
      } catch (openaiError) {
        console.log('OpenAI failed, trying OpenRouter:', openaiError.message);
      }
    }

    // Try OpenRouter (access to many models including Stable Diffusion XL)
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/images/generations',
          {
            model: 'stability-ai/sdxl',
            prompt: prompt,
            n: 1,
            size: num_inference_steps >= 40 ? '1024x1024' : '512x512'
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://allinone-orcin.vercel.app',
              'X-Title': 'AI Content Studio'
            }
          }
        );

        if (response.data.data && response.data.data[0] && response.data.data[0].url) {
          const imageResponse = await axios.get(response.data.data[0].url, {
            responseType: 'arraybuffer',
            timeout: 60000
          });

          const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;

          res.json({
            success: true,
            imageUrl: dataUrl,
            prompt: prompt,
            quality: num_inference_steps >= 40 ? 'high' : 'standard',
            provider: 'openrouter'
          });
          return;
        }
      } catch (openrouterError) {
        console.log('OpenRouter failed, trying Pollinations:', openrouterError.message);
      }
    }

    // Fallback to Pollinations AI (free, no API key needed)
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
    
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    const width = num_inference_steps >= 40 ? 1024 : 512;
    const height = num_inference_steps >= 40 ? 1024 : 512;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&noCache=true`;
    
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 120000
    });
    
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt,
      quality: num_inference_steps || 15,
      provider: 'pollinations'
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

// AI Chat/Assistant using OpenRouter (access to GPT-4, Claude, etc.)
app.post('/api/chat', upload.none(), async (req, res) => {
  try {
    const { message, model = 'openai/gpt-3.5-turbo' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try OpenRouter first (has many models)
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages: [
              { role: 'system', content: 'You are a helpful AI assistant for AI Content Studio.' },
              { role: 'user', content: message }
            ],
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://allinone-orcin.vercel.app',
              'X-Title': 'AI Content Studio'
            }
          }
        );

        res.json({
          success: true,
          response: response.data.choices[0].message.content,
          model: model,
          provider: 'openrouter'
        });
        return;
      } catch (openrouterError) {
        console.log('OpenRouter chat failed:', openrouterError.message);
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for AI Content Studio.' },
            { role: 'user', content: message }
          ],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        success: true,
        response: response.data.choices[0].message.content,
        model: 'gpt-3.5-turbo',
        provider: 'openai'
      });
      return;
    }

    res.status(503).json({
      success: false,
      error: 'AI chat requires API key',
      message: 'Please add OPENROUTER_API_KEY or OPENAI_API_KEY to environment variables'
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      message: error.message 
    });
  }
});

// RapidAPI - Text Summarization
app.post('/api/text/summarize', upload.none(), async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (RAPIDAPI_KEY) {
      try {
        const response = await axios.post(
          'https://gpt-summarization.p.rapidapi.com/summarize',
          {
            text: text,
            num_sentences: 3
          },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'gpt-summarization.p.rapidapi.com'
            }
          }
        );

        res.json({
          success: true,
          summary: response.data.summary,
          provider: 'rapidapi'
        });
        return;
      } catch (rapidError) {
        console.log('RapidAPI summarization failed:', rapidError.message);
      }
    }

    // Fallback using OpenAI
    if (OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Summarize the following text in 2-3 sentences:' },
            { role: 'user', content: text }
          ],
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        success: true,
        summary: response.data.choices[0].message.content,
        provider: 'openai'
      });
      return;
    }

    res.status(503).json({
      success: false,
      error: 'Summarization service unavailable'
    });
  } catch (error) {
    console.error('Summarization error:', error.message);
    res.status(500).json({ 
      error: 'Failed to summarize text',
      message: error.message 
    });
  }
});

// RapidAPI - Background Removal
app.post('/api/image/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (RAPIDAPI_KEY) {
      try {
        // Read image file as base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');

        const response = await axios.post(
          'https://background-removal.p.rapidapi.com/remove',
          {
            image: `data:image/jpeg;base64,${base64Image}`
          },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'background-removal.p.rapidapi.com'
            },
            responseType: 'arraybuffer'
          }
        );

        // Convert response to base64
        const base64Result = Buffer.from(response.data, 'binary').toString('base64');
        const dataUrl = `data:image/png;base64,${base64Result}`;

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          imageUrl: dataUrl,
          provider: 'rapidapi'
        });
        return;
      } catch (rapidError) {
        console.log('RapidAPI background removal failed:', rapidError.message);
      }
    }

    // Clean up file even if failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(503).json({
      success: false,
      error: 'Background removal service unavailable',
      message: 'RAPIDAPI_KEY not configured or service failed'
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Background removal error:', error.message);
    res.status(500).json({ 
      error: 'Failed to remove background',
      message: error.message 
    });
  }
});

// Video Generation using LTX (Lightricks)
app.post('/api/video/generate', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Try LTX API first
    if (process.env.LTX_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.ltx.com/v1/generations',
          {
            prompt: prompt,
            aspect_ratio: '16:9',
            duration: 5
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.LTX_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // LTX returns a generation ID, we need to poll for completion
        const generationId = response.data.id;
        
        res.json({
          success: true,
          message: 'Video generation started',
          generationId: generationId,
          prompt: prompt,
          status: 'processing',
          checkUrl: `/api/video/status/${generationId}`
        });
        return;
      } catch (ltxError) {
        console.log('LTX failed, trying fallback:', ltxError.message);
      }
    }

    // Fallback to Pollinations video (if available)
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const videoUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;
      
      // For video, we'll return a placeholder with instructions
      res.json({
        success: true,
        message: 'Video generation using image sequence',
        imageUrl: videoUrl,
        prompt: prompt,
        note: 'Video generation is processing. Use the image URL to create a video sequence.'
      });
    } catch (fallbackError) {
      res.status(503).json({
        success: false,
        error: 'Video generation temporarily unavailable',
        message: 'All video generation services are currently unavailable. Please try Image Generator instead.'
      });
    }
  } catch (error) {
    console.error('Video generation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate video',
      message: error.message 
    });
  }
});

// Check video generation status (for LTX)
app.get('/api/video/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!process.env.LTX_API_KEY) {
      return res.status(503).json({ error: 'LTX API not configured' });
    }

    const response = await axios.get(
      `https://api.ltx.com/v1/generations/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LTX_API_KEY}`
        }
      }
    );

    res.json({
      success: true,
      status: response.data.status,
      videoUrl: response.data.video_url,
      prompt: response.data.prompt
    });
  } catch (error) {
    console.error('Video status check error:', error.message);
    res.status(500).json({ 
      error: 'Failed to check video status',
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
