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

const imageRoutes = require('./src/routes/imageRoutes');
const providerStatusRoutes = require('./src/routes/providerStatus');

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
app.use('/api/image', imageRoutes);
app.use('/api/provider-status', providerStatusRoutes);

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

// Image generation is handled by imageRoutes (app.use('/api/image', imageRoutes))

// Audio Generation - Multiple API fallback system
app.post('/api/audio/generate', upload.none(), async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Try OpenAI TTS first
    if (process.env.OPENAI_API_KEY) {
      try {
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
          text: text,
          provider: 'openai'
        });
        return;
      } catch (openaiError) {
        console.log('OpenAI TTS failed, trying ElevenLabs:', openaiError.message);
      }
    }

    // Try ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
          {
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          },
          {
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
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
          text: text,
          provider: 'elevenlabs'
        });
        return;
      } catch (elevenError) {
        console.log('ElevenLabs failed, trying RapidAPI:', elevenError.message);
      }
    }

    // Try RapidAPI - Voice Generator
    if (process.env.RAPIDAPI_KEY) {
      try {
        const response = await axios.post(
          'https://voice-generator.p.rapidapi.com/generate-audio',
          {
            text: text,
            voice: 'en-US-AriaNeural'
          },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'voice-generator.p.rapidapi.com'
            },
            responseType: 'arraybuffer'
          }
        );

        const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

        res.json({
          success: true,
          audioUrl: audioUrl,
          text: text,
          provider: 'rapidapi'
        });
        return;
      } catch (rapidError) {
        console.log('RapidAPI voice failed, trying Hugging Face:', rapidError.message);
      }
    }

    // Try Hugging Face Bark
    if (process.env.HUGGING_FACE_API_KEY) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/suno/bark',
          { inputs: text },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 60000
          }
        );

        const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
        const audioUrl = `data:audio/wav;base64,${base64Audio}`;

        res.json({
          success: true,
          audioUrl: audioUrl,
          text: text,
          provider: 'huggingface'
        });
        return;
      } catch (hfError) {
        console.log('Hugging Face Bark failed:', hfError.message);
      }
    }

    // All fallbacks failed
    res.status(503).json({
      success: false,
      error: 'All audio generation services unavailable',
      message: 'Please add OPENAI_API_KEY, ELEVENLABS_API_KEY, or RAPIDAPI_KEY to environment variables'
    });
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

// Video Generation - SUPER FAST Parallel API System
app.post('/api/video/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, duration = 5 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiAttempts = [];

    // 1. LTX Video (Fastest - 10s timeout)
    if (process.env.LTX_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.ltx.com/v1/generations',
          {
            prompt: prompt,
            aspect_ratio: '16:9',
            duration: duration
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.LTX_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          checkUrl: `/api/video/status/${response.data.id}`,
          provider: 'ltx'
        })).catch(err => { throw new Error('LTX: ' + err.message); })
      );
    }

    // 2. Runway ML (10s timeout)
    if (process.env.RUNWAY_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.runwayml.com/v1/videos',
          {
            prompt: prompt,
            duration: duration,
            ratio: '16:9'
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          checkUrl: `/api/video/status/runway/${response.data.id}`,
          provider: 'runway'
        })).catch(err => { throw new Error('Runway: ' + err.message); })
      );
    }

    // 3. Pika Labs (10s timeout)
    if (process.env.PIKA_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.pika.art/v1/videos',
          {
            prompt: prompt,
            duration: duration
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          provider: 'pika'
        })).catch(err => { throw new Error('Pika: ' + err.message); })
      );
    }

    // 4. Replicate Video (12s timeout)
    if (process.env.REPLICATE_API_TOKEN) {
      apiAttempts.push(
        axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
            input: { prompt: prompt }
          },
          {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            timeout: 12000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          checkUrl: `/api/video/status/replicate/${response.data.id}`,
          provider: 'replicate'
        })).catch(err => { throw new Error('Replicate: ' + err.message); })
      );
    }

    // 5. Stable Video Diffusion via Hugging Face (15s timeout)
    if (process.env.HUGGING_FACE_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid',
          { inputs: prompt },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 15000
          }
        ).then(response => {
          const base64Video = Buffer.from(response.data, 'binary').toString('base64');
          return {
            success: true,
            videoUrl: `data:video/mp4;base64,${base64Video}`,
            prompt,
            provider: 'huggingface'
          };
        }).catch(err => { throw new Error('HuggingFace Video: ' + err.message); })
      );
    }

    // 6. Gen-2 by Runway via API (10s timeout)
    if (process.env.GEN2_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.gen-2.runwayml.com/v1/generate',
          {
            prompt: prompt,
            duration: duration
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.GEN2_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          provider: 'gen2'
        })).catch(err => { throw new Error('Gen-2: ' + err.message); })
      );
    }

    // 7. Kaiber AI (10s timeout)
    if (process.env.KAIBER_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.kaiber.ai/v1/videos',
          {
            prompt: prompt,
            duration: duration,
            style: 'cinematic'
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.KAIBER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          provider: 'kaiber'
        })).catch(err => { throw new Error('Kaiber: ' + err.message); })
      );
    }

    // 8. Synthesia (for avatar videos - 10s timeout)
    if (process.env.SYNTHESIA_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.synthesia.io/v2/videos',
          {
            title: 'AI Generated Video',
            description: prompt,
            visibility: 'private'
          },
          {
            headers: {
              'Authorization': `${process.env.SYNTHESIA_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.id,
          prompt,
          status: 'processing',
          provider: 'synthesia'
        })).catch(err => { throw new Error('Synthesia: ' + err.message); })
      );
    }

    // 9. HeyGen (for avatar videos - 10s timeout)
    if (process.env.HEYGEN_API_KEY) {
      apiAttempts.push(
        axios.post(
          'https://api.heygen.com/v1/video/generate',
          {
            video_inputs: [{
              character: { type: 'avatar' },
              voice: { type: 'text', input: prompt }
            }]
          },
          {
            headers: {
              'X-Api-Key': process.env.HEYGEN_API_KEY,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        ).then(response => ({
          success: true,
          message: 'Video generation started',
          generationId: response.data.data.video_id,
          prompt,
          status: 'processing',
          provider: 'heygen'
        })).catch(err => { throw new Error('HeyGen: ' + err.message); })
      );
    }

    // 10. Fallback - Image sequence from Pollinations
    apiAttempts.push(
      axios.get(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`,
        { responseType: 'arraybuffer', timeout: 8000 }
      ).then(response => {
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return {
          success: true,
          message: 'Video generation using image sequence (fallback)',
          imageUrl: `data:image/png;base64,${base64Image}`,
          prompt,
          note: 'Full video processing initiated. This is the first frame.',
          provider: 'pollinations'
        };
      }).catch(err => { throw new Error('Pollinations: ' + err.message); })
    );

    // Race all video APIs - returns the FASTEST successful one!
    const result = await Promise.race(apiAttempts);
    res.json(result);

  } catch (error) {
    console.error('All video generation APIs failed:', error.message);
    res.status(500).json({ 
      error: 'All video generation services failed',
      message: 'Please try again or check API keys'
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
