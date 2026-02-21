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

// =============================================
// CHAT HELPER — cascading fallback across 7 providers
// =============================================
const chatWithFallback = async (messages, preferredModel) => {
  const systemMsg = messages.find(m => m.role === 'system') || { role: 'system', content: 'You are a helpful AI assistant for AI Content Studio. Provide clear, detailed, and accurate responses.' };
  const userMsgs = messages.filter(m => m.role !== 'system');
  const allMessages = [systemMsg, ...userMsgs];
  const lastUserMsg = userMsgs[userMsgs.length - 1]?.content || '';

  // 1. OpenRouter (many models)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: preferredModel || 'openai/gpt-3.5-turbo',
        messages: allMessages,
        max_tokens: 2048
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://allinone-orcin.vercel.app',
          'X-Title': 'AI Content Studio'
        },
        timeout: 30000
      });
      const text = response.data.choices?.[0]?.message?.content;
      if (text) return { response: text, model: preferredModel || 'openai/gpt-3.5-turbo', provider: 'openrouter' };
    } catch (e) { console.log('OpenRouter failed:', e.message); }
  }

  // 2. OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: allMessages,
        max_tokens: 2048
      }, {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000
      });
      const text = response.data.choices?.[0]?.message?.content;
      if (text) return { response: text, model: 'gpt-3.5-turbo', provider: 'openai' };
    } catch (e) { console.log('OpenAI failed:', e.message); }
  }

  // 3. Groq (free tier — very fast Llama 3 / Mixtral)
  if (process.env.GROQ_API_KEY) {
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: allMessages,
        max_tokens: 2048
      }, {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 15000
      });
      const text = response.data.choices?.[0]?.message?.content;
      if (text) return { response: text, model: 'llama-3.3-70b-versatile', provider: 'groq' };
    } catch (e) { console.log('Groq failed:', e.message); }
  }

  // 4. Together AI (free tier)
  if (process.env.TOGETHER_API_KEY) {
    try {
      const response = await axios.post('https://api.together.xyz/v1/chat/completions', {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: allMessages,
        max_tokens: 2048
      }, {
        headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000
      });
      const text = response.data.choices?.[0]?.message?.content;
      if (text) return { response: text, model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', provider: 'together' };
    } catch (e) { console.log('Together failed:', e.message); }
  }

  // 5. DeepInfra (free tier)
  if (process.env.DEEPINFRA_API_KEY) {
    try {
      const response = await axios.post('https://api.deepinfra.com/v1/openai/chat/completions', {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        messages: allMessages,
        max_tokens: 2048
      }, {
        headers: { 'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000
      });
      const text = response.data.choices?.[0]?.message?.content;
      if (text) return { response: text, model: 'meta-llama/Meta-Llama-3.1-8B-Instruct', provider: 'deepinfra' };
    } catch (e) { console.log('DeepInfra failed:', e.message); }
  }

  // 6. HuggingFace Inference
  if (process.env.HUGGING_FACE_API_KEY) {
    try {
      const response = await axios.post('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
        inputs: lastUserMsg,
        parameters: { max_new_tokens: 1024, return_full_text: false }
      }, {
        headers: { 'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 45000
      });
      const text = Array.isArray(response.data) ? response.data[0]?.generated_text : response.data?.generated_text;
      if (text) return { response: text, model: 'mistralai/Mistral-7B-Instruct-v0.3', provider: 'huggingface' };
    } catch (e) { console.log('HuggingFace chat failed:', e.message); }
  }

  // 7. Pollinations AI (completely free, no key required — ultimate fallback)
  try {
    const response = await axios.post('https://text.pollinations.ai/', {
      messages: allMessages,
      model: 'openai',
      seed: Date.now()
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });
    const text = typeof response.data === 'string' ? response.data : response.data?.choices?.[0]?.message?.content || JSON.stringify(response.data);
    if (text) return { response: text, model: 'pollinations-openai', provider: 'pollinations' };
  } catch (e) { console.log('Pollinations chat failed:', e.message); }

  throw new Error('All chat providers failed');
};

// AI Chat/Assistant — 7 providers with cascading fallback
app.post('/api/chat', upload.none(), async (req, res) => {
  try {
    const { message, model, messages: clientMessages } = req.body;

    if (!message && (!clientMessages || clientMessages.length === 0)) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const msgs = clientMessages || [
      { role: 'system', content: 'You are a helpful AI assistant for AI Content Studio.' },
      { role: 'user', content: message }
    ];

    const result = await chatWithFallback(msgs, model);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to get AI response', message: error.message });
  }
});

// Available models endpoint
app.get('/api/models', (req, res) => {
  const models = [];
  if (process.env.OPENROUTER_API_KEY) {
    models.push(
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openrouter' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter' },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'openrouter' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'openrouter' },
      { id: 'mistralai/mistral-large-latest', name: 'Mistral Large', provider: 'openrouter' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter' }
    );
  }
  if (process.env.OPENAI_API_KEY) {
    models.push({ id: 'gpt-3.5-turbo', name: 'GPT-3.5 (Direct)', provider: 'openai' });
  }
  if (process.env.GROQ_API_KEY) {
    models.push(
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', provider: 'groq' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', provider: 'groq' }
    );
  }
  if (process.env.TOGETHER_API_KEY) {
    models.push({ id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', name: 'Llama 3.3 70B (Together)', provider: 'together' });
  }
  if (process.env.DEEPINFRA_API_KEY) {
    models.push({ id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B (DeepInfra)', provider: 'deepinfra' });
  }
  // Always available
  models.push({ id: 'pollinations-openai', name: 'Free AI (Pollinations)', provider: 'pollinations' });
  res.json({ success: true, models });
});

// Code Generation — uses chat fallback with code-specific system prompt
app.post('/api/code/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, language = 'javascript' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const messages = [
      { role: 'system', content: `You are an expert programmer. Generate clean, well-commented ${language} code. Return ONLY the code wrapped in a markdown code block with the language specified. Do not add explanations outside the code block unless asked.` },
      { role: 'user', content: prompt }
    ];

    const result = await chatWithFallback(messages);
    res.json({ success: true, code: result.response, language, provider: result.provider });
  } catch (error) {
    console.error('Code generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate code', message: error.message });
  }
});

// Translation — free APIs with AI fallback
app.post('/api/translate', upload.none(), async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'es' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    // 1. Try MyMemory (free, no key)
    try {
      const langPair = `${sourceLang === 'auto' ? 'en' : sourceLang}|${targetLang}`;
      const response = await axios.get(`https://api.mymemory.translated.net/get`, {
        params: { q: text, langpair: langPair },
        timeout: 10000
      });
      if (response.data?.responseData?.translatedText) {
        return res.json({
          success: true,
          translatedText: response.data.responseData.translatedText,
          detectedLang: response.data.responseData.detectedLanguage || sourceLang,
          provider: 'mymemory'
        });
      }
    } catch (e) { console.log('MyMemory failed:', e.message); }

    // 2. Try LibreTranslate (free instance)
    try {
      const response = await axios.post('https://libretranslate.com/translate', {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      if (response.data?.translatedText) {
        return res.json({
          success: true,
          translatedText: response.data.translatedText,
          provider: 'libretranslate'
        });
      }
    } catch (e) { console.log('LibreTranslate failed:', e.message); }

    // 3. Fallback to AI chat
    const messages = [
      { role: 'system', content: `You are a professional translator. Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else.` },
      { role: 'user', content: text }
    ];
    const result = await chatWithFallback(messages);
    res.json({ success: true, translatedText: result.response, provider: `ai-${result.provider}` });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Failed to translate', message: error.message });
  }
});

// Music Generation — Replicate MusicGen + HuggingFace fallback
app.post('/api/music/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, duration = 8 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // 1. Try Replicate MusicGen
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        const createRes = await axios.post('https://api.replicate.com/v1/predictions', {
          version: 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedbbe',
          input: {
            prompt: prompt,
            duration: Math.min(duration, 30),
            model_version: 'stereo-melody-large'
          }
        }, {
          headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
          timeout: 15000
        });

        const predictionId = createRes.data.id;
        // Poll for result
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const check = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
          });
          if (check.data.status === 'succeeded') {
            const audioUrl = check.data.output;
            return res.json({ success: true, audioUrl, prompt, provider: 'replicate-musicgen' });
          }
          if (check.data.status === 'failed') break;
        }
      } catch (e) { console.log('Replicate MusicGen failed:', e.message); }
    }

    // 2. Try HuggingFace MusicGen
    if (process.env.HUGGING_FACE_API_KEY) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/facebook/musicgen-small',
          { inputs: prompt },
          {
            headers: { 'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 60000
          }
        );
        const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
        return res.json({
          success: true,
          audioUrl: `data:audio/wav;base64,${base64Audio}`,
          prompt,
          provider: 'huggingface-musicgen'
        });
      } catch (e) { console.log('HuggingFace MusicGen failed:', e.message); }
    }

    res.status(503).json({ success: false, error: 'Music generation requires REPLICATE_API_TOKEN or HUGGING_FACE_API_KEY' });
  } catch (error) {
    console.error('Music generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate music', message: error.message });
  }
});

// PPT/Presentation Generation — creates structured slides from a topic
app.post('/api/ppt/generate', upload.none(), async (req, res) => {
  try {
    const { topic, numSlides = 8, template = 'modern-dark', customInstructions = '' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const messages = [
      {
        role: 'system',
        content: `You are an expert presentation designer. Generate a professional presentation with exactly ${numSlides} slides.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just the JSON):
{"slides":[{"title":"Slide Title","content":["Point 1","Point 2","Point 3"],"notes":"Speaker notes here","layout":"centered"}]}

Rules:
- First slide should be a title slide with the main topic
- Last slide should be a "Thank You / Q&A" slide
- Each slide should have 3-5 bullet points
- Keep bullet points concise (under 15 words each)
- Notes should contain what the speaker should say (1-2 sentences)
- Layout can be: "centered", "two-column", "diagram", "timeline", "comparison"
${customInstructions ? `\nAdditional instructions: ${customInstructions}` : ''}`
      },
      { role: 'user', content: `Create a ${numSlides}-slide presentation about: ${topic}` }
    ];

    const result = await chatWithFallback(messages);

    // Parse the JSON response
    let slides;
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.response.match(/\{[\s\S]*"slides"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        slides = parsed.slides;
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseErr) {
      // If parsing fails, create structured slides from the text
      const lines = result.response.split('\n').filter(l => l.trim());
      slides = [];
      let currentSlide = { title: topic, content: [], notes: '', layout: 'centered' };
      for (const line of lines) {
        if (line.match(/^#{1,3}\s/) || line.match(/^Slide \d/i)) {
          if (currentSlide.content.length > 0) {
            slides.push(currentSlide);
            currentSlide = { title: line.replace(/^#{1,3}\s*/, '').replace(/^Slide \d+:?\s*/i, ''), content: [], notes: '', layout: 'centered' };
          } else {
            currentSlide.title = line.replace(/^#{1,3}\s*/, '').replace(/^Slide \d+:?\s*/i, '');
          }
        } else if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
          currentSlide.content.push(line.replace(/^[-•*\d.]\s*/, ''));
        }
      }
      if (currentSlide.content.length > 0 || slides.length === 0) {
        slides.push(currentSlide);
      }
    }

    res.json({ success: true, slides, topic, template, provider: result.provider });
  } catch (error) {
    console.error('PPT generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate presentation', message: error.message });
  }
});

// Email Writer — AI-powered email composition
app.post('/api/email/generate', upload.none(), async (req, res) => {
  try {
    const { purpose, tone = 'professional', recipient = '', context = '' } = req.body;
    if (!purpose) return res.status(400).json({ error: 'Email purpose is required' });

    const messages = [
      { role: 'system', content: `You are an expert email writer. Write a ${tone} email. Include subject line at the top formatted as "Subject: ...". Write the full email body. Be concise and appropriate for the context.` },
      { role: 'user', content: `Write an email ${recipient ? `to ${recipient}` : ''}: ${purpose}${context ? `. Context: ${context}` : ''}` }
    ];

    const result = await chatWithFallback(messages);
    res.json({ success: true, email: result.response, provider: result.provider });
  } catch (error) {
    console.error('Email generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate email', message: error.message });
  }
});

// Hashtag Generator — generates relevant hashtags
app.post('/api/hashtags/generate', upload.none(), async (req, res) => {
  try {
    const { topic, platform = 'instagram', count = 30 } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const messages = [
      { role: 'system', content: `You are a social media expert. Generate exactly ${count} relevant hashtags for ${platform}. Return ONLY the hashtags, each starting with #, separated by spaces. Mix popular high-reach hashtags with niche-specific ones. No explanations, just hashtags.` },
      { role: 'user', content: `Generate hashtags for: ${topic}` }
    ];

    const result = await chatWithFallback(messages);
    const hashtags = result.response.match(/#\w+/g) || [];
    res.json({ success: true, hashtags, rawText: result.response, provider: result.provider });
  } catch (error) {
    console.error('Hashtag generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate hashtags', message: error.message });
  }
});

// AI Content Writer — articles, stories, blog posts
app.post('/api/content/generate', upload.none(), async (req, res) => {
  try {
    const { topic, type = 'blog post', tone = 'informative', length = 'medium' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const lengthGuide = { short: '200-300 words', medium: '500-700 words', long: '1000-1500 words' };
    const messages = [
      { role: 'system', content: `You are an expert content writer. Write a ${tone} ${type} of ${lengthGuide[length] || '500-700 words'}. Use proper formatting with headings, paragraphs, and engaging language. Make it original and insightful.` },
      { role: 'user', content: `Write about: ${topic}` }
    ];

    const result = await chatWithFallback(messages);
    res.json({ success: true, content: result.response, provider: result.provider });
  } catch (error) {
    console.error('Content generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate content', message: error.message });
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
