# ✅ Setup Checklist - AI Content Studio

## Before You Start

### Installations Required
- [ ] Node.js (LTS version) - https://nodejs.org
- [ ] Python (3.8+) - https://python.org  
- [ ] Git (optional) - https://git-scm.com
- [ ] Docker (optional) - https://docker.com

### Verify Installations
Open Command Prompt and run:
```bash
node --version
npm --version
python --version
```

---

## Setup Process

### Choose Your Startup Method

#### Method 1: Using Windows Batch Script (Easiest for Windows)
- [ ] Navigate to: `Desktop/AI-Content-Studio`
- [ ] Double-click: `start-all.bat`
- [ ] Wait for 3 terminal windows to open
- [ ] Wait for "running" messages
- [ ] Open browser to: http://localhost:3000

#### Method 2: Manual 3-Terminal Setup (Most Control)

Terminal 1 - Frontend:
- [ ] Open Command Prompt
- [ ] Run: `cd Desktop/AI-Content-Studio/frontend`
- [ ] Run: `npm install`
- [ ] Run: `npm run dev`
- [ ] Wait for: `Local: http://localhost:3000`

Terminal 2 - Backend:
- [ ] Open new Command Prompt
- [ ] Run: `cd Desktop/AI-Content-Studio/backend`
- [ ] Run: `npm install`
- [ ] Run: `npm start`
- [ ] Wait for: `Backend server running at http://localhost:5000`

Terminal 3 - Python ML:
- [ ] Open new Command Prompt
- [ ] Run: `cd Desktop/AI-Content-Studio/ml-models`
- [ ] Run: `python -m venv venv`
- [ ] Run: `venv\Scripts\activate`
- [ ] Run: `pip install -r requirements.txt`
- [ ] Run: `python app.py`
- [ ] Wait for: `ML Service running at http://localhost:5001`

#### Method 3: Docker (Advanced)
- [ ] Open Command Prompt in project folder
- [ ] Make sure Docker Desktop is running
- [ ] Run: `docker-compose up --build`
- [ ] Wait for all services to start
- [ ] Open browser to: http://localhost:3000

---

## After Startup

### Verify Everything Works

- [ ] Open http://localhost:3000 in browser
- [ ] See the AI Studio dashboard
- [ ] Check sidebar shows all tools
- [ ] Click on "Image Generator"
- [ ] Enter a test prompt (e.g., "A cat")
- [ ] Click "Generate Image"
- [ ] See success message with Job ID

### Check Backend Health

- [ ] Open: http://localhost:5000/api/health
- [ ] Should see: `{"status":"Backend is running!"}`

### Check ML Service Health

- [ ] Open: http://localhost:5001/api/health
- [ ] Should see: Server status with device info

---

## Troubleshooting Checklist

### Issue: Port Already in Use

- [ ] Check if another app is using the port
- [ ] Kill existing processes:
  - Windows: `netstat -ano | findstr :3000`
  - Then: `taskkill /PID <PID> /F`
- [ ] Or change the port in startup commands

### Issue: npm: command not found

- [ ] Node.js not installed or not in PATH
- [ ] Reinstall Node.js from https://nodejs.org
- [ ] Check "Add to PATH" during installation
- [ ] Restart terminal after installing

### Issue: python: command not found

- [ ] Python not installed or not in PATH
- [ ] Reinstall Python from https://python.org
- [ ] Check "Add Python to PATH" during installation
- [ ] Restart terminal after installing

### Issue: Backend Can't Connect to Frontend

- [ ] Make sure all 3 services are running
- [ ] Check firewall settings
- [ ] Check CORS is enabled in backend
- [ ] Verify localhost:5000 is accessible

### Issue: npm install takes forever

- [ ] This is normal, first time can take 2-5 minutes
- [ ] Make sure you have good internet connection
- [ ] Don't interrupt the process

### Issue: Python venv activation fails

- [ ] Use: `venv\Scripts\activate` (Windows)
- [ ] Not: `source venv/bin/activate` (that's for Mac/Linux)
- [ ] Should see `(venv)` at start of command line

---

## First Time Setup Timing

| Step | Time | Status |
|------|------|--------|
| Install Node.js | 5 min | One-time |
| Install Python | 5 min | One-time |
| npm install (frontend) | 2-3 min | First time only |
| npm install (backend) | 1-2 min | First time only |
| pip install (ml-models) | 2-3 min | First time only |
| **Total First Time** | **15-20 min** | Then 10-15 sec startup |

---

## Project Files Location

Everything is at:
```
C:\Users\YourUsername\Desktop\AI-Content-Studio\
```

### Key Files to Know

- `start-all.bat` - Start script for Windows
- `README.md` - Project overview
- `QUICK-START.md` - Quick reference
- `SETUP-INSTRUCTIONS.md` - Detailed setup
- `frontend/README.md` - Frontend docs
- `backend/README.md` - Backend docs
- `ml-models/README.md` - ML docs
- `docker-compose.yml` - Docker config

---

## Next Steps After Setup

### Phase 1: Explore (Today)
- [ ] Navigate all tools in sidebar
- [ ] Test all tool pages
- [ ] Check UI responsiveness
- [ ] Understand the layout

### Phase 2: Integrate Models (This Week)
- [ ] Read `ml-models/README.md`
- [ ] Download Stable Diffusion model
- [ ] Uncomment model loading code
- [ ] Test image generation
- [ ] Integrate video models
- [ ] Integrate audio models

### Phase 3: Add Features (Next Week)
- [ ] Add database for job storage
- [ ] Implement job tracking
- [ ] Add file download
- [ ] Add user accounts
- [ ] Add rate limiting

### Phase 4: Deploy (Next Month)
- [ ] Set up server/cloud account
- [ ] Configure Docker images
- [ ] Deploy with docker-compose
- [ ] Set up domain name
- [ ] Enable SSL certificate

---

## Important Notes

⚠️ **First Run Takes Time**
- Model downloads will be slow on first run
- Python packages installation takes several minutes
- This is normal! Be patient!

⚠️ **Keep Terminals Open**
- Keep all 3 (or docker) running while using the app
- Don't close terminals or services will stop
- Closing the app will require restarting

⚠️ **Port Conflicts**
- Frontend: 3000
- Backend: 5000
- ML Service: 5001
- Make sure these ports are free

⚠️ **Internet Connection**
- Needed for npm/pip installs
- Not needed after that (unless using API models)

---

## Success Checklist

Once everything is running:

- [ ] Browser shows: http://localhost:3000
- [ ] Sidebar displays all tools
- [ ] Dashboard loads without errors
- [ ] Can click on different tools
- [ ] Tool pages load properly
- [ ] No console errors in browser
- [ ] All 3 terminals show "running"
- [ ] Backend responds to health check
- [ ] ML Service responds to health check

---

## You're Ready! 🚀

If you can check all the boxes above, you're ready to start developing!

### Quick Tips:
1. **Keep this checklist handy** - Refer to it if something breaks
2. **Read the documentation** - Each folder has helpful READMEs
3. **Search errors online** - Chances are someone solved it before
4. **Be patient** - First setup takes time, but it's one-time only

---

**Status**: Ready to Launch ✅
**Last Updated**: February 14, 2026
**Version**: 1.0

Good luck! 🎉
