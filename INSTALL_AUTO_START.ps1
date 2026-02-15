# Darling AI - Auto-Start Installer
# This script adds Darling to Windows startup

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  DARLING AI - AUTO-START SETUP" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$startupFolder = [Environment]::GetFolderPath('Startup')
$batchPath = "$PSScriptRoot\START_DARKING.bat"
$shortcutPath = "$startupFolder\Darling AI.lnk"

Write-Host "Creating startup shortcut..." -ForegroundColor Yellow

# Create shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $batchPath
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Darling AI Partner - Auto Start"
$Shortcut.IconLocation = "shell32.dll,277"
$Shortcut.Save()

Write-Host ""
Write-Host "✓ Auto-start enabled!" -ForegroundColor Green
Write-Host ""
Write-Host "Darling will now start automatically when you log in." -ForegroundColor Cyan
Write-Host ""
Write-Host "Shortcut created at:" -ForegroundColor Gray
Write-Host $shortcutPath -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
