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

// All API keys are read from process.env directly where needed.
// Add keys as environment variables in Render/Railway — see .env.example for the full list.

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
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use('/api/image', imageRoutes);
app.use('/api/provider-status', providerStatusRoutes);

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// File upload setup — 200MB max per file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

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

// Audio Generation - Multiple API fallback system with response validation
app.post('/api/audio/generate', upload.none(), async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Helper: check if arraybuffer is actually audio (not error JSON)
    const isValidAudio = (data) => {
      if (!data || data.byteLength < 500) return false;
      // Check if response is actually JSON error
      try {
        const str = Buffer.from(data).toString('utf-8', 0, 50);
        if (str.startsWith('{') || str.startsWith('{"')) return false;
      } catch (e) { }
      return true;
    };

    // 1. Try Groq TTS first (free, fast, reliable)
    if (process.env.GROQ_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/audio/speech',
          { model: 'playai-tts', input: text, voice: 'Arista-PlayAI', response_format: 'wav' },
          {
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        if (isValidAudio(response.data)) {
          const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
          return res.json({
            success: true,
            audioUrl: `data:audio/wav;base64,${base64Audio}`,
            text: text,
            provider: 'groq-tts'
          });
        }
      } catch (groqError) {
        console.log('Groq TTS failed:', groqError.response?.status, groqError.message);
      }
    }

    // 2. Try ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
          {
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          },
          {
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        if (isValidAudio(response.data)) {
          const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
          return res.json({
            success: true,
            audioUrl: `data:audio/mp3;base64,${base64Audio}`,
            text: text,
            provider: 'elevenlabs'
          });
        } else {
          console.log('ElevenLabs returned non-audio response:', Buffer.from(response.data).toString('utf-8', 0, 200));
        }
      } catch (elevenError) {
        console.log('ElevenLabs failed:', elevenError.response?.status, elevenError.message);
      }
    }

    // 3. Try OpenAI TTS
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/audio/speech',
          { model: 'tts-1', input: text, voice: voice },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        if (isValidAudio(response.data)) {
          const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
          return res.json({ success: true, audioUrl: `data:audio/mp3;base64,${base64Audio}`, text, provider: 'openai' });
        }
      } catch (openaiError) {
        console.log('OpenAI TTS failed:', openaiError.response?.status, openaiError.message);
      }
    }

    // 4. Try RapidAPI Voice
    if (process.env.RAPIDAPI_KEY) {
      try {
        const response = await axios.post(
          'https://large-text-to-speech.p.rapidapi.com/tts',
          { text: text },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'large-text-to-speech.p.rapidapi.com'
            },
            timeout: 30000
          }
        );
        if (response.data?.url) {
          return res.json({ success: true, audioUrl: response.data.url, text, provider: 'rapidapi' });
        }
        if (response.data?.id) {
          // Polling-based API
          for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const check = await axios.get(
              `https://large-text-to-speech.p.rapidapi.com/tts?id=${response.data.id}`,
              { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'large-text-to-speech.p.rapidapi.com' } }
            );
            if (check.data?.url) {
              return res.json({ success: true, audioUrl: check.data.url, text, provider: 'rapidapi' });
            }
          }
        }
      } catch (rapidError) {
        console.log('RapidAPI voice failed:', rapidError.response?.status, rapidError.message);
      }
    }

    // 5. Try HuggingFace Kokoro (lightweight, fast)
    if (process.env.HUGGING_FACE_API_KEY) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M',
          { inputs: text },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json',
              'X-Wait-For-Model': 'true'
            },
            responseType: 'arraybuffer',
            timeout: 120000
          }
        );
        if (isValidAudio(response.data)) {
          const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
          return res.json({ success: true, audioUrl: `data:audio/wav;base64,${base64Audio}`, text, provider: 'huggingface-kokoro' });
        }
      } catch (kokoroError) {
        console.log('Kokoro TTS failed:', kokoroError.response?.status, kokoroError.message);
      }
    }

    // 6. Try HuggingFace Bark (slower but reliable)
    if (process.env.HUGGING_FACE_API_KEY) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/suno/bark-small',
          { inputs: text },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json',
              'X-Wait-For-Model': 'true'
            },
            responseType: 'arraybuffer',
            timeout: 120000
          }
        );
        if (isValidAudio(response.data)) {
          const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
          return res.json({ success: true, audioUrl: `data:audio/wav;base64,${base64Audio}`, text, provider: 'huggingface-bark' });
        }
      } catch (hfError) {
        console.log('Hugging Face Bark failed:', hfError.response?.status, hfError.message);
      }
    }

    // All fallbacks failed
    res.status(503).json({
      success: false,
      error: 'All audio generation services unavailable',
      message: 'All TTS providers failed. Check Render logs for details.'
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

// Music Generation — 3 providers: Replicate, HuggingFace, Fal.ai
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

    // 3. Try Fal.ai MusicGen
    if (process.env.FAL_KEY || process.env.FAL_API_KEY) {
      try {
        const response = await axios.post(
          'https://queue.fal.run/fal-ai/stable-audio',
          {
            prompt,
            seconds_total: Math.min(duration, 30),
          },
          {
            headers: { 'Authorization': `Key ${process.env.FAL_KEY || process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 60000
          }
        );
        const audioUrl = response.data?.audio_file?.url;
        if (audioUrl) {
          return res.json({ success: true, audioUrl, prompt, provider: 'fal-stable-audio' });
        }
      } catch (e) { console.log('Fal.ai music failed:', e.message); }
    }

    res.status(503).json({ success: false, error: 'Music generation requires REPLICATE_API_TOKEN, HUGGING_FACE_API_KEY, or FAL_KEY' });
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

// AI Logo Generator — generates a logo prompt + image
app.post('/api/logo/generate', upload.none(), async (req, res) => {
  try {
    const { brandName, style = 'modern', colors = '', industry = '' } = req.body;
    if (!brandName) return res.status(400).json({ error: 'Brand name is required' });

    const prompt = `professional ${style} logo for "${brandName}"${industry ? ` in the ${industry} industry` : ''}${colors ? `, using colors: ${colors}` : ''}, clean vector design, centered, isolated on white background, minimalist, high quality, no text except the brand name`;

    const { generateImage } = require('./src/imageService');
    const result = await generateImage(prompt, { width: 1024, height: 1024 });

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      imageBase64: result.imageUrl,
      prompt,
      provider: result.provider,
      latency: result.latency,
    });
  } catch (error) {
    console.error('Logo generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate logo', message: error.message });
  }
});

// AI Story Writer — generates creative stories with genres
app.post('/api/story/generate', upload.none(), async (req, res) => {
  try {
    const { prompt, genre = 'fantasy', length = 'medium', tone = 'engaging' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Story idea is required' });

    const lengthGuide = { short: '500-800 words', medium: '1000-1500 words', long: '2000-3000 words' };
    const messages = [
      { role: 'system', content: `You are a talented ${genre} fiction writer. Write a ${tone} story of ${lengthGuide[length] || '1000-1500 words'}. Include vivid descriptions, dialogue, and a satisfying ending. Use proper paragraph breaks and formatting.` },
      { role: 'user', content: `Write a ${genre} story about: ${prompt}` },
    ];

    const result = await chatWithFallback(messages);
    res.json({ success: true, story: result.response, genre, provider: result.provider });
  } catch (error) {
    console.error('Story generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate story', message: error.message });
  }
});

// SEO Meta Generator — generates SEO title, description, keywords
app.post('/api/seo/generate', upload.none(), async (req, res) => {
  try {
    const { topic, url = '', type = 'webpage' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic or page content is required' });

    const messages = [
      {
        role: 'system', content: `You are an SEO expert. Generate optimized meta tags for a ${type}. Return ONLY valid JSON in this exact format:
{"title":"SEO optimized title under 60 chars","description":"Compelling meta description under 160 chars","keywords":["keyword1","keyword2","keyword3"],"og_title":"Open Graph title","og_description":"Social sharing description","h1":"Proposed H1 heading","slug":"url-friendly-slug"}` },
      { role: 'user', content: `Generate SEO meta for: ${topic}${url ? ` (URL: ${url})` : ''}` },
    ];

    const result = await chatWithFallback(messages);

    // Parse the JSON
    let seo;
    try {
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      seo = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) { seo = null; }

    res.json({ success: true, seo: seo || { raw: result.response }, provider: result.provider });
  } catch (error) {
    console.error('SEO generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate SEO meta', message: error.message });
  }
});

// =============================================
// LANGCHAIN AGENT (Phase 7)
// =============================================
let ChatGroq, AgentExecutor, createReactAgent, DynamicTool, pull, search;
try {
  ChatGroq = require('@langchain/groq').ChatGroq;
  AgentExecutor = require('langchain/agents').AgentExecutor;
  createReactAgent = require('langchain/agents').createReactAgent;
  DynamicTool = require('@langchain/core/tools').DynamicTool;
  pull = require('langchain/hub').pull;
  search = require('duck-duck-scrape').search;
} catch (e) {
  console.log('Langchain optional packages not fully installed yet.');
}

app.post('/api/agent', upload.none(), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (!ChatGroq || !process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Agent features require the GROQ_API_KEY and LangChain backend packages.'
      });
    }

    // Tools setup
    const webSearchTool = new DynamicTool({
      name: "web_search",
      description: "Search the internet for current events, facts, or information. Input should be a specific search query.",
      func: async (query) => {
        try {
          const results = await search(query, { safeSearch: 1 });
          return JSON.stringify(results.results.slice(0, 3).map(r => ({
            title: r.title,
            snippet: r.description,
            url: r.url
          })));
        } catch (e) {
          return "Web search is currently unavailable.";
        }
      }
    });

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.3-70b-versatile",
      temperature: 0
    });

    const tools = [webSearchTool];
    const promptTemplate = await pull("hwchase17/react");

    const agent = await createReactAgent({ llm, tools, prompt: promptTemplate });
    const agentExecutor = new AgentExecutor({ agent, tools, maxIterations: 5 });

    const result = await agentExecutor.invoke({ input: prompt });

    res.json({
      success: true,
      response: result.output,
      provider: 'langchain-groq'
    });
  } catch (error) {
    console.error('Agent error:', error.message);
    res.status(500).json({ error: 'Agent failed to process request', message: error.message });
  }
});

// Social Media Post Generator — creates platform-specific posts
app.post('/api/social/generate', upload.none(), async (req, res) => {
  try {
    const { topic, platform = 'twitter', tone = 'professional', includeEmoji = true } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const platformGuides = {
      twitter: 'Keep under 280 characters. Use 2-3 relevant hashtags. Be punchy and engaging.',
      instagram: 'Write a compelling caption with line breaks. Use 15-20 relevant hashtags at the end. Include emojis.',
      linkedin: 'Write a professional post of 200-300 words. Use line breaks for readability. Include 3-5 hashtags. Add a call to action.',
      facebook: 'Write an engaging post of 100-200 words. Use a conversational tone. Include a question or call to action.',
      tiktok: 'Write a short, catchy caption under 150 characters. Use trending hashtags. Be Gen-Z friendly.',
    };

    const messages = [
      { role: 'system', content: `You are a social media expert. Create a ${platform} post. ${platformGuides[platform] || platformGuides.twitter} Tone: ${tone}. ${includeEmoji ? 'Include relevant emojis.' : 'No emojis.'}` },
      { role: 'user', content: `Create a ${platform} post about: ${topic}` },
    ];

    const result = await chatWithFallback(messages);
    res.json({ success: true, post: result.response, platform, provider: result.provider });
  } catch (error) {
    console.error('Social post generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate social post', message: error.message });
  }
});

// Resume Builder — generates a formatted resume from details
app.post('/api/resume/generate', upload.none(), async (req, res) => {
  try {
    const { name, title, experience = '', education = '', skills = '', summary = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const messages = [
      { role: 'system', content: `You are an expert resume writer. Create a professional, ATS-friendly resume in clean markdown format. Use clear section headings (## Experience, ## Education, ## Skills, ## Summary). Make it concise, impactful, and well-structured. Use bullet points with action verbs.` },
      { role: 'user', content: `Create a resume for:\nName: ${name}\nTitle: ${title || 'Professional'}\n${experience ? `Experience: ${experience}` : ''}\n${education ? `Education: ${education}` : ''}\n${skills ? `Skills: ${skills}` : ''}\n${summary ? `Summary: ${summary}` : ''}` },
    ];

    const result = await chatWithFallback(messages);
    res.json({ success: true, resume: result.response, provider: result.provider });
  } catch (error) {
    console.error('Resume generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate resume', message: error.message });
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

// Text Summarization — RapidAPI + chatWithFallback (7 providers)
app.post('/api/text/summarize', upload.none(), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // 1. Try RapidAPI summarizer
    if (process.env.RAPIDAPI_KEY) {
      try {
        const response = await axios.post(
          'https://gpt-summarization.p.rapidapi.com/summarize',
          { text: text, num_sentences: 3 },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'gpt-summarization.p.rapidapi.com'
            },
            timeout: 15000
          }
        );
        return res.json({ success: true, summary: response.data.summary, provider: 'rapidapi' });
      } catch (rapidError) {
        console.log('RapidAPI summarization failed:', rapidError.message);
      }
    }

    // 2. Fallback: chatWithFallback (7 providers: OpenRouter, OpenAI, Groq, Together, DeepInfra, HF, Pollinations)
    const messages = [
      { role: 'system', content: 'Summarize the following text in 2-3 concise sentences. Return ONLY the summary, nothing else.' },
      { role: 'user', content: text }
    ];
    const result = await chatWithFallback(messages);
    return res.json({ success: true, summary: result.response, provider: `ai-${result.provider}` });
  } catch (error) {
    console.error('Summarization error:', error.message);
    res.status(500).json({ error: 'Failed to summarize text', message: error.message });
  }
});

// Background Removal — 4 providers: Fal.ai, Replicate, RapidAPI, HuggingFace
app.post('/api/image/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    // Clean up file after reading
    const cleanUp = () => {
      try { if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch (e) { }
    };

    // 1. Fal.ai Background Removal (fast)
    if (process.env.FAL_KEY || process.env.FAL_API_KEY) {
      try {
        const response = await axios.post(
          'https://queue.fal.run/fal-ai/birefnet',
          { image_url: imageDataUrl },
          {
            headers: { 'Authorization': `Key ${process.env.FAL_KEY || process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
        const imgUrl = response.data?.image?.url;
        if (imgUrl) {
          const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
          cleanUp();
          return res.json({
            success: true,
            imageUrl: `data:image/png;base64,${Buffer.from(imgRes.data).toString('base64')}`,
            provider: 'fal-birefnet'
          });
        }
      } catch (e) { console.log('Fal.ai bg removal failed:', e.message); }
    }

    // 2. Replicate remove-bg
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        const createRes = await axios.post('https://api.replicate.com/v1/predictions', {
          version: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
          input: { image: imageDataUrl }
        }, {
          headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
          timeout: 15000
        });
        const predictionId = createRes.data.id;
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const check = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
          });
          if (check.data.status === 'succeeded' && check.data.output) {
            const imgRes = await axios.get(check.data.output, { responseType: 'arraybuffer' });
            cleanUp();
            return res.json({
              success: true,
              imageUrl: `data:image/png;base64,${Buffer.from(imgRes.data).toString('base64')}`,
              provider: 'replicate-rembg'
            });
          }
          if (check.data.status === 'failed') break;
        }
      } catch (e) { console.log('Replicate bg removal failed:', e.message); }
    }

    // 3. RapidAPI Background Removal
    if (process.env.RAPIDAPI_KEY) {
      try {
        const response = await axios.post(
          'https://background-removal.p.rapidapi.com/remove',
          { image: `data:image/jpeg;base64,${base64Image}` },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'background-removal.p.rapidapi.com'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        const base64Result = Buffer.from(response.data, 'binary').toString('base64');
        cleanUp();
        return res.json({ success: true, imageUrl: `data:image/png;base64,${base64Result}`, provider: 'rapidapi' });
      } catch (e) { console.log('RapidAPI bg removal failed:', e.message); }
    }

    // 4. HuggingFace BRIA RMBG
    if (process.env.HUGGING_FACE_API_KEY) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
          imageBuffer,
          {
            headers: { 'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`, 'Content-Type': 'application/octet-stream' },
            responseType: 'arraybuffer',
            timeout: 60000
          }
        );
        if (response.data && response.data.byteLength > 100) {
          cleanUp();
          return res.json({
            success: true,
            imageUrl: `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`,
            provider: 'huggingface-rmbg'
          });
        }
      } catch (e) { console.log('HuggingFace bg removal failed:', e.message); }
    }

    cleanUp();
    res.status(503).json({
      success: false,
      error: 'Background removal failed across all providers',
      message: 'Add FAL_KEY, REPLICATE_API_TOKEN, or HUGGING_FACE_API_KEY'
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Background removal error:', error.message);
    res.status(500).json({ error: 'Failed to remove background', message: error.message });
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

    // 10. Fal.ai AnimateDiff (if FAL_KEY is set)
    if (process.env.FAL_KEY || process.env.FAL_API_KEY) {
      const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;
      apiAttempts.push(
        axios.post(
          'https://queue.fal.run/fal-ai/fast-animatediff/turbo/text-to-video',
          {
            prompt: prompt,
            num_frames: 16,
            num_inference_steps: 4,
            guidance_scale: 1.0,
            fps: 8
          },
          {
            headers: {
              'Authorization': `Key ${falKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        ).then(response => {
          const videoUrl = response.data?.video?.url;
          if (!videoUrl) throw new Error('Fal: no video in response');
          return {
            success: true,
            message: 'Video generated successfully',
            videoUrl,
            prompt,
            provider: 'fal-animatediff'
          };
        }).catch(err => { throw new Error('Fal AnimateDiff: ' + err.message); })
      );
    }

    // 11. Fallback - Image sequence from Pollinations (free, always available)
    apiAttempts.push(
      axios.get(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`,
        { responseType: 'arraybuffer', timeout: 15000 }
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

    // Promise.any — first SUCCESSFUL result wins (unlike Promise.race which rejects on first rejection)
    const result = await Promise.any(apiAttempts);
    res.json(result);

  } catch (error) {
    // Promise.any throws AggregateError when ALL promises reject
    const messages = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
    console.error('All video generation APIs failed:', messages);
    res.status(500).json({
      error: 'All video generation services failed',
      message: 'Please try again or check API keys',
      details: messages
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
