@echo off
REM AI Content Studio - Windows Startup Script
REM This script opens 3 terminal windows and starts each service

echo.
echo ================================
echo AI Content Studio - Startup
echo ================================
echo.
echo This will open 3 new terminal windows:
echo 1. Frontend (React)
echo 2. Backend (Node.js API)
echo 3. ML Service (Python)
echo.
echo Press any key to continue...
pause

REM Get the current directory
setlocal enabledelayedexpansion
set PROJECT_DIR=%~dp0

REM Terminal 1 - Frontend
echo Starting Frontend...
start cmd /k "cd /d %PROJECT_DIR%frontend && title Frontend - AI Studio && npm install && npm run dev"

REM Wait 2 seconds before starting next
timeout /t 2 /nobreak

REM Terminal 2 - Backend
echo Starting Backend...
start cmd /k "cd /d %PROJECT_DIR%backend && title Backend - AI Studio && npm install && npm start"

REM Wait 2 seconds before starting next
timeout /t 2 /nobreak

REM Terminal 3 - ML Service
echo Starting Python ML Service...
start cmd /k "cd /d %PROJECT_DIR%ml-models && title ML Service - AI Studio && python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && python app.py"

echo.
echo ================================
echo All services starting...
echo ================================
echo.
echo Waiting for services to start (this may take 1-2 minutes)...
echo.
echo Once all 3 terminals show "running", open your browser to:
echo http://localhost:3000
echo.
echo Press any key to close this window...
pause
