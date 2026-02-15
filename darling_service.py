import os
import sys
import subprocess
import pyautogui
import pyttsx3
import uvicorn
import threading
import webbrowser
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pystray import Icon, Menu, MenuItem
from PIL import Image, ImageDraw
import winreg
import time

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandRequest(BaseModel):
    command: str

# Global state
assistant_active = True
tray_icon = None

def create_icon_image(color="purple"):
    """Create a simple heart icon for system tray"""
    width = 64
    height = 64
    image = Image.new('RGB', (width, height), color=(15, 11, 20))
    dc = ImageDraw.Draw(image)
    
    # Draw heart shape
    if color == "purple":
        fill_color = (212, 140, 255)  # Active purple
    else:
        fill_color = (100, 100, 100)  # Inactive gray
    
    # Simple heart using polygon
    dc.ellipse([10, 15, 30, 35], fill=fill_color)
    dc.ellipse([34, 15, 54, 35], fill=fill_color)
    dc.polygon([10, 28, 32, 50, 54, 28], fill=fill_color)
    
    return image

def speak_offline(text):
    """Text to speech with female voice"""
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        for voice in voices:
            if "female" in voice.name.lower() or "zira" in voice.name.lower():
                engine.setProperty('voice', voice.id)
                break
        engine.setProperty('rate', 160)
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"TTS Error: {e}")

def toggle_assistant(icon, item):
    """Toggle assistant on/off from tray"""
    global assistant_active
    assistant_active = not assistant_active
    
    # Update icon
    if assistant_active:
        icon.icon = create_icon_image("purple")
        speak_offline("I'm back online, love.")
    else:
        icon.icon = create_icon_image("gray")
        speak_offline("Going to sleep mode. Call me when you need me.")

def open_dashboard(icon, item):
    """Open web dashboard"""
    webbrowser.open('http://localhost:5173')

def quit_assistant(icon, item):
    """Quit the assistant"""
    speak_offline("Shutting down. See you soon, darling.")
    icon.stop()
    os._exit(0)

def setup_tray_icon():
    """Create system tray icon"""
    global tray_icon
    
    icon_image = create_icon_image("purple")
    menu = Menu(
        MenuItem('Open Dashboard', open_dashboard),
        MenuItem('Toggle On/Off', toggle_assistant),
        MenuItem('Quit', quit_assistant)
    )
    
    tray_icon = Icon("Darling AI", icon_image, "Darling - Your AI Partner", menu)
    tray_icon.run()

def add_to_startup():
    """Add to Windows startup"""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Run",
            0, winreg.KEY_SET_VALUE
        )
        
        script_path = os.path.abspath(__file__)
        startup_command = f'pythonw "{script_path}"'
        
        winreg.SetValueEx(key, "DarlingAI", 0, winreg.REG_SZ, startup_command)
        winreg.CloseKey(key)
        return True
    except Exception as e:
        print(f"Startup registration failed: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Run on server start"""
    # Add to startup if not already
    add_to_startup()
    
    # Greet user
    speak_offline("Good morning, darling. I'm here and ready for you.")
    
    # Auto-open dashboard after 5 seconds
    def delayed_open():
        time.sleep(5)
        webbrowser.open('http://localhost:5173')
    
    threading.Thread(target=delayed_open, daemon=True).start()

@app.get("/")
async def root():
    return {
        "status": "online" if assistant_active else "sleeping",
        "name": "Darling AI Partner",
        "message": "Your personal assistant is ready"
    }

@app.get("/status")
async def get_status():
    return {"active": assistant_active}

@app.post("/toggle")
async def toggle_status():
    global assistant_active
    assistant_active = not assistant_active
    return {"active": assistant_active}

@app.post("/execute")
async def execute(request: CommandRequest):
    if not assistant_active:
        return {"response": "I'm in sleep mode, babe. Wake me up first."}
    
    cmd = request.command.lower()
    
    # Notepad
    if "notepad" in cmd:
        subprocess.Popen(['notepad.exe'])
        return {"response": "I've opened Notepad for you, darling."}
    
    # Screenshot
    if "screenshot" in cmd or "screen shot" in cmd:
        try:
            screenshot = pyautogui.screenshot()
            filename = f'screenshot_{int(time.time())}.png'
            screenshot.save(filename)
            return {"response": f"Screenshot saved as {filename}, babe."}
        except Exception as e:
            return {"response": f"Couldn't take screenshot: {e}"}
    
    # Type text
    if "type" in cmd:
        text_to_type = cmd.split("type", 1)[1].strip()
        pyautogui.write(text_to_type, interval=0.05)
        return {"response": f"I've typed that for you, chinnu."}
    
    # Open browser
    if "browser" in cmd or "chrome" in cmd:
        os.system("start chrome")
        return {"response": "Chrome is launching, love."}
    
    # Calculator
    if "calculator" in cmd or "calc" in cmd:
        os.system("calc")
        return {"response": "Calculator opened, darling."}
    
    # File Explorer
    if "explorer" in cmd or "files" in cmd:
        os.system("explorer")
        return {"response": "File Explorer is open, babe."}
    
    # Task Manager
    if "task manager" in cmd:
        os.system("taskmgr")
        return {"response": "Task Manager opened."}
    
    # Shutdown/Sleep
    if "shutdown" in cmd:
        return {"response": "Are you sure? Say 'confirm shutdown' to proceed."}
    
    if "confirm shutdown" in cmd:
        os.system("shutdown /s /t 30")
        return {"response": "Shutting down in 30 seconds. Sweet dreams, darling."}
    
    if "sleep" in cmd or "hibernate" in cmd:
        os.system("shutdown /h")
        return {"response": "Putting the system to sleep. Rest well, love."}
    
    # Volume control
    if "volume up" in cmd:
        for _ in range(5):
            pyautogui.press('volumeup')
        return {"response": "Volume increased, babe."}
    
    if "volume down" in cmd:
        for _ in range(5):
            pyautogui.press('volumedown')
        return {"response": "Volume decreased, darling."}
    
    if "mute" in cmd:
        pyautogui.press('volumemute')
        return {"response": "Audio muted, chinnu."}
    
    # Media controls
    if "play" in cmd or "pause" in cmd:
        pyautogui.press('playpause')
        return {"response": "Done, love."}
    
    if "next" in cmd:
        pyautogui.press('nexttrack')
        return {"response": "Next track, darling."}
    
    if "previous" in cmd or "back" in cmd:
        pyautogui.press('prevtrack')
        return {"response": "Previous track, babe."}
    
    # System info
    if "task" in cmd or "system" in cmd:
        files = os.listdir(".")
        return {"response": f"I've scanned the directory, darling. Found {len(files)} items. Everything looks good."}
    
    # Default response
    return {"response": "I'm here for you, babe. What would you like me to do?"}

def run_server():
    """Run FastAPI server"""
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="error")

if __name__ == "__main__":
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Give server time to start
    time.sleep(2)
    
    # Run system tray (this blocks)
    setup_tray_icon()
