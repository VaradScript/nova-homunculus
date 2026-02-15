@echo off
cd /d "%~dp0"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing requirements...
venv\Scripts\pip install -r requirements.txt
echo Starting Nova Server...
echo ------------------------------------------------
echo PLEASE ACCEPT FIREWALL PERMISSION IF PROMPTED
echo ------------------------------------------------
venv\Scripts\python main.py
pause
