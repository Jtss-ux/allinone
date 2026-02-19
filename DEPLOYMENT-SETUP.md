# GHelper Deployment Setup (Render + Vercel)

## Single Backend on Render (Recommended)

Deploy the **Node backend only** on Render. The backend includes:
- Image generation (text-to-image)
- Image transformation (img2img)
- Background removal (RapidAPI)
- Audio generation (OpenAI / ElevenLabs / RapidAPI / Hugging Face)
- Video generation (LTX, Runway, Replicate, etc.)
- Chat, summarization

### 1. Render Setup

1. Connect your GitHub repo to Render.
2. Create a **Web Service** from the `backend` folder (or root with `backend` as root directory).
3. Build: `npm install`
4. Start: `npm start`
5. Render assigns `PORT` automatically.

### 2. Environment Variables (Render)

Add these in Render dashboard → Environment:

| Variable | Required | Notes |
|----------|----------|-------|
| `PRODIA_API_KEY` or `PRODIA_LEGACY_API_KEY` | **Recommended** | [prodia.com](https://prodia.com). Tries flux-fast + flux-klein. |
| `HUGGING_FACE_API_KEY` | **Recommended** | [hf.co/settings/tokens](https://huggingface.co/settings/tokens). 6 SD/FLUX models. |
| `REPLICATE_API_TOKEN` | Optional | [replicate.com](https://replicate.com). FLUX schnell + SD. Also for img2img. |
| `FAL_KEY` | Optional | [fal.ai](https://fal.ai). FLUX schnell. |
| `DEEPINFRA_API_KEY` | Optional | [deepinfra.com](https://deepinfra.com). FLUX-2-klein. |
| `TOGETHER_API_KEY` | Optional | [together.ai](https://together.ai). 3mo free FLUX. |
| `SEGMIND_API_KEY` | Optional | [segmind.com](https://segmind.com). SDXL. |
| `OPENAI_API_KEY` | Optional | For chat, TTS, summarization. |
| `RAPIDAPI_KEY` | Optional | For audio, background removal, summarization. |
| `CLIPDROP_API_KEY` | Optional | Alternative image provider. |
| `SEGMIND_API_KEY` | Optional | Free tier at [segmind.com](https://segmind.com). |
| `OPENROUTER_API_KEY` | Optional | Chat fallback. |
| `ELEVENLABS_API_KEY` | Optional | TTS. |
| `LTX_API_KEY` | Optional | Video. |
| `RUNWAY_API_KEY` | Optional | Video. |

**Minimum for image tools:** `REPLICATE_API_TOKEN` (or `HUGGING_FACE_API_KEY` or `CLIPDROP_API_KEY`). Pollinations is used as a free fallback (no key) but can be unstable (530 errors).

### 3. Vercel Frontend Setup

1. Import the project in Vercel.
2. Set **Root Directory** to `frontend`.
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_ML_SERVICE_URL` | `https://your-backend.onrender.com` **(same as backend)** |

Using the **same URL** for both makes image and img2img requests go to the Node backend, which serves both endpoints.

### 4. CORS

The backend allows all origins (`*`). If needed, set `CORS_ORIGIN` to your Vercel URL.

---

## Optional: Separate ML Service (Python)

If you run the Python ML service (Flask, port 5001) on Railway or another host:

- Set `NEXT_PUBLIC_ML_SERVICE_URL` to the ML service URL (e.g. `https://your-ml.railway.app`).
- Keep `NEXT_PUBLIC_BACKEND_URL` pointing to the Node backend.

---

## API Endpoints Summary

| Endpoint | Backend (Node) | ML (Python) |
|----------|----------------|-------------|
| `POST /api/image/generate` | ✅ | ✅ |
| `POST /api/image/img2img` | ✅ (Replicate) | ✅ (local SD) |
| `POST /api/image/remove-background` | ✅ (RapidAPI) | ❌ |
| `POST /api/audio/generate` | ✅ | ✅ |
| `POST /api/video/generate` | ✅ | Placeholder |
| `POST /api/chat` | ✅ | ❌ |

---

## Troubleshooting

- **"Image generation services temporarily unavailable"** → Add `REPLICATE_API_TOKEN` or `HUGGING_FACE_API_KEY`.
- **Pollinations 530** → Normal when their servers are busy. Replicate/HuggingFace handle most traffic.
- **img2img fails** → Requires `REPLICATE_API_TOKEN`.
- **Background removal fails** → Add `RAPIDAPI_KEY` and subscribe to background-removal API on RapidAPI.
