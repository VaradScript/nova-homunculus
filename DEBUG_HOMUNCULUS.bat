@echo off
title Homunculus Ecosystem DEBUG MODE

cd /d "%~dp0"

echo ===========================================
echo [DEBUG] Checking Nova Server...
echo ===========================================
cd nova_server
if not exist venv (
    echo [ERROR] Virtual Environment missing!
    echo Creating it now...
    python -m venv venv
    venv\Scripts\pip install -r requirements.txt
) else (
    echo [OK] Virtual Environment exists.
)
cd ..

echo ===========================================
echo [DEBUG] Checking UI Dependencies...
echo ===========================================
cd jarvis-pro-v3
if not exist node_modules (
    echo [ERROR] Node Modules missing!
    echo Installing dependencies...
    npm install
) else (
    echo [OK] Node Modules exist.
)

echo ===========================================
echo [DEBUG] Launching...
echo ===========================================
npm run start:desktop

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Launch failed with code %ERRORLEVEL%.
    pause
)
pause
