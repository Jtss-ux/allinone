@echo off
echo ======= 🚀 GHelper Auto-Deploy Script =======

cd /d "%~dp0"

for /f "delims=" %%i in ('git status --porcelain') do set "GIT_STATUS=%%i"

if "%GIT_STATUS%"=="" (
  echo ✅ Working directory clean, no new changes to publish.
) else (
  echo 📦 Adding new changes...
  git add .
  
  echo 📝 Committing changes...
  if "%~1"=="" (
    git commit -m "Auto-deploy update %date% %time%"
  ) else (
    git commit -m "%~1"
  )
  
  echo ☁️ Pushing to GitHub (which triggers Vercel/Render)...
  git push origin main
  
  if errorlevel 1 (
    echo ❌ Push failed. Please check your GitHub connection/authentication.
  ) else (
    echo 🎉 Success! Code is pushed.
    echo    - Frontend will deploy on Vercel
    echo    - Backend will deploy on Render
  )
)

echo =============================================
pause
