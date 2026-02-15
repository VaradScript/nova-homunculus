@echo off
echo ========================================
echo   DARKING AI PARTNER - STARTUP
echo ========================================
echo.

echo [1/2] Starting Python Core Backend...
start "Darking Core" cmd /k "cd /d %~dp0 && python -m uvicorn darking_core:app --host 0.0.0.0 --port 5000"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Web Interface...
start "Darking UI" cmd /k "cd /d %~dp0jarvis-pro-v3 && npm run dev"

echo.
echo ========================================
echo   DARKING IS STARTING...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Wait 10 seconds, then open: http://localhost:5173
echo.
pause
