@echo off
cd /d "%~dp0"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing requirements (this may take a minute)...
venv\Scripts\pip install -r requirements.txt
echo.
echo Starting Jarvis File Janitor...
venv\Scripts\python janitor.py
pause
