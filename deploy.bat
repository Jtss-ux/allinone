@echo off
echo ==========================================
echo   AI CONTENT STUDIO - FREE DEPLOYMENT
echo ==========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Checking GitHub setup...
if not exist .git (
    echo Creating Git repository...
    git init
    git add .
    git commit -m "Initial commit"
    echo.
    echo !!! IMPORTANT !!!
    echo Create a repository on GitHub first!
    echo Then run these commands:
    echo   git remote add origin https://github.com/YOUR_USERNAME/ai-content-studio.git
    echo   git branch -M main
    echo   git push -u origin main
    echo.
    pause
    exit /b 0
) else (
    echo Git repository already exists!
)

echo.
echo [2/5] Installing dependencies...
call npm run install:all

echo.
echo [3/5] Testing locally...
start cmd /k "npm run backend"
timeout /t 3 >nul
start cmd /k "npm run frontend"
timeout /t 5 >nul

echo.
echo [4/5] Local deployment info:
echo Frontend will be at: http://localhost:3000
echo Backend will be at: http://localhost:5000
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [5/5] Installing Vercel CLI...
    npm i -g vercel
)

echo.
echo ==========================================
echo   DEPLOYMENT OPTIONS
echo ==========================================
echo.
echo Choose your deployment method:
echo.
echo 1. Vercel + Cyclic (RECOMMENDED - Always FREE)
echo 2. Vercel + Render + UptimeRobot (FREE)
echo 3. Vercel Only (Serverless - No Backend)
echo 4. Just test locally for now
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto cyclic
if "%choice%"=="2" goto render
if "%choice%"=="3" goto vercelonly
if "%choice%"=="4" goto localonly
goto end

:cyclic
echo.
echo ==========================================
echo   Deploying with Cyclic (FREE)
echo ==========================================
echo.
echo Please follow these steps:
echo.
echo 1. Go to https://cyclic.sh
echo 2. Sign up with GitHub
echo 3. Click "Link Your Own"
echo 4. Select your repository
echo 5. Set Root Directory: backend
echo 6. Deploy!
echo.
echo After deployment:
echo - Copy your Cyclic URL (e.g., https://your-app.cyclic.app)
echo - Go to Vercel Dashboard
echo - Add environment variable: NEXT_PUBLIC_API_URL=your-cyclic-url
echo.
pause
start https://cyclic.sh
start https://vercel.com
goto end

:render
echo.
echo ==========================================
echo   Deploying with Render + UptimeRobot
echo ==========================================
echo.
echo Step 1: Deploy Backend to Render
echo   - Go to https://render.com
echo   - Create Web Service from your GitHub repo
echo   - Root Directory: backend
echo   - Select FREE plan
echo   - Copy the URL after deployment
echo.
echo Step 2: Setup UptimeRobot
echo   - Go to https://uptimerobot.com
echo   - Add new monitor
echo   - URL: your-render-url/api/health
echo   - Interval: 5 minutes
echo.
echo Step 3: Deploy Frontend to Vercel
echo   - Go to https://vercel.com
echo   - Import your repo
echo   - Framework: Next.js, Root: frontend
echo   - Add NEXT_PUBLIC_API_URL env var
echo.
pause
start https://render.com
start https://uptimerobot.com
start https://vercel.com
goto end

:vercelonly
echo.
echo ==========================================
echo   Deploying Frontend Only (Vercel)
echo ==========================================
echo.
echo This option uses Vercel serverless functions.
echo Good for 60+ tools, but file uploads won't work.
echo.
echo Run this command to deploy:
echo   cd frontend
echo   vercel
echo.
pause
cd frontend
vercel
goto end

:localonly
echo.
echo ==========================================
echo   Running Locally
echo ==========================================
echo.
echo Your app is now running!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
goto end

:end
echo.
echo ==========================================
echo   Done!
echo ==========================================
echo.
echo For help, see:
echo - FREE-DEPLOYMENT-GUIDE.md (detailed guide)
echo - QUICK-DEPLOY.md (quick reference)
echo.
pause
