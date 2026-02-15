@echo off
cd /d "%~dp0"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing dependencies...
venv\Scripts\pip install -r requirements.txt
echo.
echo ===================================================
echo   NOVA HYBRID ECOSYSTEM SERVER
echo ===================================================
echo   [1] File Upload Service (Active)
echo   [2] Janitor Cleanup Service (Active)
echo   [3] System Control Service (Active)
echo.
venv\Scripts\python main.py
pause
