@echo off
title Homunculus Ecosystem

echo ===========================================
echo IGNITING NOVA HOMUNCULUS
echo ===========================================

cd /d "%~dp0"

REM Step 1: Ensure Brain (Nova Server) is prepped
if not exist "nova_server\venv" (
    echo [SYSTEM] Creating Neural Pathways (Python venv)...
    cd nova_server
    call setup_server.bat
    cd ..
) else (
    echo [SYSTEM] Neural Pathways Detected.
)

REM Step 2: Start the Interface (Electron + React)
echo.
echo [SYSTEM] Launching Visual Cortex...
cd jarvis-pro-v3
npm run start:desktop

pause
