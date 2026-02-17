# 🚀 Deployment Guide - AI Content Studio

## Overview
This guide will help you deploy the AI Content Studio platform online with:
- ✅ 24/7 uptime
- ✅ No local GPU/CPU usage
- ✅ Easy updates via Git
- ✅ Free hosting options available

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend       │────▶│   ML Service    │
│   (Next.js)     │     │   (Express)      │     │   (Python)      │
│   Vercel        │     │   Railway/Render │     │   HuggingFace/  │
│                 │     │                  │     │   RunPod        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Prerequisites
1. GitHub account
2. Vercel account (free)
3. Railway or Render account (free tier)
4. (Optional) Hugging Face account for ML models

---

## Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd C:\Users\JTS\Desktop\AI-Content-Studio
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Content Studio with 68 tools"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/ai-content-studio.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Frontend to Vercel

### Option A: Vercel Dashboard (Recommended)
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` or `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
7. Click "Deploy"

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow prompts
```

**Features:**
- ✅ Automatic deployments on every git push
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ 100GB bandwidth/month (free tier)

---

## Step 3: Deploy Backend to Railway (Recommended)

Railway offers 24/7 uptime on free tier with $5 credit/month.

### Setup
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start` or `node server.js`
   - **Port**: `5000` (or Railway will assign one)

7. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ML_SERVICE_URL=https://your-ml-service.com  # Optional
   ```

8. Generate Domain:
   - Go to Settings → Domains
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://ai-studio-backend.up.railway.app`)

9. Update Frontend Environment Variable:
   - Go back to Vercel dashboard
   - Update `NEXT_PUBLIC_API_URL` with Railway URL
   - Redeploy frontend

### Alternative: Deploy to Render
1. Go to https://render.com
2. Create Web Service
3. Connect GitHub repo
4. Configure similar to Railway
5. Note: Render free tier sleeps after 15 min inactivity (not 24/7)

---

## Step 4: ML Service Options

Since ML models require GPU/CPU, here are your options:

### Option A: Disable ML Features (Easiest)
Comment out ML-dependent features in frontend:
- Image generation
- Audio generation
- Video generation
- All other tools will work 100%

**68 tools will still work**, just not the AI generation ones.

### Option B: Hugging Face Inference API (Recommended)
Use Hugging Face's serverless inference (pay-per-use, no GPU management):

1. Create account at https://huggingface.co
2. Get API token
3. Update backend to use Hugging Face API instead of local models
4. Deploy backend with token as env variable

**Cost**: ~$0.001-0.01 per request (very cheap for low usage)

### Option C: RunPod/Vast.ai (For heavy usage)
For 24/7 GPU access:
- RunPod: https://runpod.io (serverless GPU, pay-per-second)
- Vast.ai: https://vast.ai (rent GPUs cheaply)

**Cost**: $0.20-2.00/hour depending on GPU

### Option D: Google Colab (Free but not 24/7)
Run ML models on Google Colab with ngrok tunnel.
- Free GPU (T4)
- Not 24/7 (sessions timeout)
- Good for testing

---

## Step 5: Environment Variables Setup

### Frontend (.env.local for local, Vercel for production)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_NAME=AI Content Studio
```

### Backend (Railway/Render Environment Variables)
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
HUGGINGFACE_API_TOKEN=your_token_here  # Optional
```

---

## Step 6: Easy Updates Workflow

Once deployed, updating is simple:

```bash
# Make changes locally
cd C:\Users\JTS\Desktop\AI-Content-Studio

# Edit files...

# Commit and push
git add .
git commit -m "Add new features"
git push origin main

# That's it! Vercel and Railway will auto-deploy!
```

**Automatic Deployments:**
- Vercel: Auto-deploys on every push to main
- Railway: Auto-deploys on every push to main
- Both show build logs in their dashboards

---

## Step 7: Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `ai-studio.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update CORS_ORIGIN in backend with new domain

### Add Custom Domain to Railway
1. Railway Dashboard → Your Service → Settings → Domains
2. Add custom domain
3. Configure DNS

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|---------|
| Vercel (Frontend) | ✅ Free | 100GB bandwidth, 6000 build minutes |
| Railway (Backend) | ✅ $5 credit/month | ~500 hours runtime |
| Hugging Face API | ✅ Free tier | 30k requests/month |
| **Total** | **$0/month** | For low-medium traffic |

For higher traffic:
- Vercel Pro: $20/month
- Railway: $5/month (keeps running 24/7)
- Hugging Face: Pay-per-use (~$0.001/request)

---

## Monitoring & Logs

### Vercel
- Dashboard shows deployment logs
- Analytics for traffic
- Error tracking

### Railway
- Real-time logs
- Metrics dashboard
- Auto-restart on crashes

---

## Troubleshooting

### CORS Errors
Update backend CORS settings:
```javascript
// backend/server.js
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Build Failures
Check:
1. All dependencies in package.json
2. No local file references
3. Environment variables set correctly

### API Not Connecting
1. Check if backend URL is correct in frontend env
2. Verify backend is running (check Railway dashboard)
3. Test API endpoint directly in browser

---

## Quick Start Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy Frontend (Vercel)
cd frontend
vercel --prod

# 3. Deploy Backend (Railway)
# Use Railway dashboard or CLI
railway login
railway init
railway up
```

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code
3. ✅ Deploy frontend to Vercel
4. ✅ Deploy backend to Railway
5. ✅ Choose ML option (A, B, C, or D)
6. ✅ Test all tools
7. ✅ Share your URL!

**Your platform will be live at:**
- Frontend: `https://ai-studio.vercel.app`
- Backend: `https://ai-studio-backend.up.railway.app`

All 68 tools working 24/7 without using your local resources! 🎉
