@echo off
cd /d "%~dp0"
echo Hard resetting local repository to match latest changes...

git checkout -B main
git add .
git commit -m "Final Release: Nova Homunculus Ecosystem" --allow-empty
git push -f origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git push failed. Please check your internet connection or GitHub credentials.
    pause
    exit /b
)

echo.
echo [SUCCESS] Code pushed to GitHub successfully!
pause
