# AI Content Studio - Quick Start Guide

## What You've Got

A complete full-stack AI content generation platform with:
- **Frontend**: React + Next.js (Beautiful UI)
- **Backend**: Node.js + Express (API Server)
- **ML Pipeline**: Python Flask (AI Models)
- **Docker**: Optional containerization

---

## 🚀 Quick Start (Recommended for Beginners)

### Option 1: Run Everything Locally (Easiest)

Open **3 Terminal Windows** and run these commands in each:

**Terminal 1 - Frontend:**
```bash
cd Desktop/AI-Content-Studio/frontend
npm install
npm run dev
```
📱 Opens at: http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd Desktop/AI-Content-Studio/backend
npm install
npm start
```
⚙️ Runs at: http://localhost:5000

**Terminal 3 - Python ML Service:**
```bash
cd Desktop/AI-Content-Studio/ml-models
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
🤖 Runs at: http://localhost:5001

### When All 3 Are Running:
- Go to http://localhost:3000 in your browser
- You'll see the AI Studio dashboard
- Click on any tool to test it!

---

## 🐳 Option 2: Using Docker (Advanced)

If you want everything in containers:

```bash
cd Desktop/AI-Content-Studio

# Build and start all services
docker-compose up --build

# In another terminal, you can stop everything with:
docker-compose down
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:5000
- ML Service at http://localhost:5001

---

## 📁 Project Structure

```
AI-Content-Studio/
├── frontend/                 # React app (npm run dev)
│   ├── src/app/            # Main pages
│   ├── src/components/      # UI components
│   └── package.json
│
├── backend/                 # Node.js API (npm start)
│   ├── server.js           # Main server
│   ├── package.json
│   └── uploads/            # Generated files
│
├── ml-models/              # Python AI (python app.py)
│   ├── app.py             # Flask server
│   ├── requirements.txt
│   └── venv/              # Virtual environment
│
└── docker-compose.yml      # Docker configuration
```

---

## ✅ What's Included

### Image Tools
- Image Generator (Text → Image)
- Image Editor
- Image Upscaler
- Background Remover
- Skin Enhancer
- Image Extender

### Video Tools
- Video Generator (Text → Video)
- Video Editor
- Clip Editor
- Video Upscaler
- Lip Sync

### Audio Tools
- Voice Generator (Text → Speech)
- Sound Effects
- Music Generator

### Other Tools
- Design Editor
- Mockup Generator
- Icon Generator
- And more...

---

## 🔧 Troubleshooting

### Port Already in Use?
If port 3000, 5000, or 5001 is already in use:

**Frontend (port 3000):**
```bash
# In frontend folder, edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (port 5000):**
```bash
# In backend folder, create .env:
PORT=3001
```

**ML Service (port 5001):**
```bash
# In ml-models/app.py, change:
PORT = os.getenv('PORT', 3002)
```

### Backend Not Connecting?
Make sure all 3 services are running:
```bash
# Test backend
curl http://localhost:5000/api/health

# Test ML service
curl http://localhost:5001/api/health
```

### Python Virtual Environment Issues?

**Windows:**
```bash
cd ml-models
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd ml-models
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🎯 Next Steps

1. ✅ Install Node.js, Python, Git, Docker
2. ✅ Download all files (they're created for you!)
3. ⏳ Run the 3 terminals with the commands above
4. 🌐 Open http://localhost:3000
5. 🎨 Start creating!

---

## 📚 Detailed Documentation

Each folder has its own README:
- `frontend/README.md` - React/Next.js setup
- `backend/README.md` - Express API setup
- `ml-models/README.md` - Python ML setup

---

## 🚨 Important Notes

- **First run is slow**: ML models (~10GB) download on first use
- **GPU Recommended**: For video/image generation, an NVIDIA GPU helps
- **Free Forever**: Using open-source models, no API keys needed!

---

## ❓ Questions?

Check the README files in each folder for detailed documentation.

**Happy Creating! 🎉**
