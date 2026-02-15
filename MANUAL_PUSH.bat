@echo off
cd /d "%~dp0"
echo ==========================================================
echo               NOVA HOMUNCULUS - GITHUB SYNC
echo ==========================================================
echo.
echo [1] Checking Git Status...
git status
echo.

echo [2] Forcing Push to Remote...
echo.
echo [IMPORTANT] If a GitHub Login Window pops up, please sign in!
echo.

git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Normal push failed. Trying FORCE push...
    git push -f origin main
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [CRITICAL ERROR] Still failed! Use these commands manually:
    echo     git remote set-url origin https://github.com/VaradScript/nova-homunculus.git
    echo     git push -f origin main
    echo.
) else (
    echo.
    echo [SUCCESS] Your code is now live on GitHub!
)
pause
