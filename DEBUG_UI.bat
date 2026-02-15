@echo off
cd /d "%~dp0"
cd jarvis-pro-v3

echo [DEBUG] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b
)

echo [DEBUG] Starting Homunculus Interface...
call npm run start:desktop
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Startup failed!
    pause
    exit /b
)

pause
