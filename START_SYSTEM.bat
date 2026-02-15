@echo off
TITLE Darking System Launcher
COLOR 0A
CLS

ECHO ----------------------------------------------------
ECHO          STARTING DARKING SYSTEM (JARVIS)
ECHO ----------------------------------------------------

:: 1. Start Python Backend (Hidden or Minimized)
ECHO Starting Neural Core (Backend)...
cd /d "%~dp0"
start /min cmd /k "python darking_core.py"

:: 2. Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: 3. Open Frontend Interface
ECHO Launching Visual Interface...
cd /d "%~dp0\jarvis-pro-v3"
start npm run dev

:: 4. Auto-Open Browser (Optional if dev server doesn't do it)
timeout /t 5 /nobreak >nul
start http://localhost:5173

ECHO System Online. Hello Sir.
PAUSE
