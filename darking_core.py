import os
import subprocess
import pyautogui
import pyttsx3
import uvicorn
import requests
import ctypes
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandRequest(BaseModel):
    command: str

# --- System Control Functions ---
def set_volume(level_percent: int):
    """Sets system volume (0-100) on Windows using ctypes."""
    try:
        # 0xAF is VK_VOLUME_MUTE, but simpler to use nircmd or just a loop of volume keys if specific level needed.
        # For simplicity/reliability without extra deps, we'll use volume up/down keys.
        # 50 presses down to 0, then presses up.
        for _ in range(50):
            pyautogui.press('volumedown')
        for _ in range(int(level_percent / 2)):
            pyautogui.press('volumeup')
        return f"Volume set to {level_percent}%"
    except Exception as e:
        return f"Error setting volume: {str(e)}"

def open_application(app_name):
    """Tries to open an application using start command or common paths."""
    app_map = {
        "notepad": "notepad.exe",
        "chrome": "start chrome",
        "browser": "start chrome",
        "edge": "start msedge",
        "calculator": "calc.exe",
        "explorer": "explorer.exe",
        "settings": "start ms-settings:",
        "spotify": "start spotify:",
        "discord": "start discord:",
        "cmd": "start cmd.exe",
        "terminal": "start powershell.exe"
    }
    
    cmd = app_map.get(app_name.lower())
    if cmd:
        os.system(cmd)
        return f"Opening {app_name}..."
    else:
        # Try generic start
        try:
            os.system(f"start {app_name}")
            return f"Attempting to launch {app_name}..."
        except:
            return f"Could not find application: {app_name}"

def query_ollama(prompt, history=[]):
    """Queries local Ollama instance if available."""
    try:
        # Check if Ollama is running
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": "mistral",
            "prompt": f"You are Jarvis, a very friendly, supportive, and slightly witty AI assistant. You talk like a real human friend, not a robot. Keep responses under 2 sentences and be casual. History: {history}. User says: {prompt}",
            "stream": False
        }
        # Try different models if mistral fails or just default? 
        # For now, let's assume 'llama3' or 'mistral' is installed. 
        # We'll try a generic request first.
        
        response = requests.post(url, json=payload, timeout=2)
        if response.status_code == 200:
            return response.json().get("response", "I heard you, but my neural link is fuzzy.")
    except:
        return None # Ollama not available

# --- Main Endpoint ---
@app.post("/execute")
async def execute(request: CommandRequest):
    cmd = request.command.lower()
    response_text = ""

    # 1. System Commands
    if "open" in cmd:
        # Improved name extraction: "open up notepad" or "please open chrome"
        parts = cmd.split("open")
        app_part = parts[-1].replace("up", "").replace("the", "").strip()
        response_text = open_application(app_part)
    
    elif "volume" in cmd:
        # Extract number
        import re
        nums = re.findall(r'\d+', cmd)
        if nums:
            vol = int(nums[0])
            response_text = set_volume(vol)
        else:
            response_text = "Please specify a volume level."

    elif "type" in cmd:
        text_to_type = cmd.split("type")[-1].strip()
        pyautogui.write(text_to_type, interval=0.05)
        response_text = f"Typed: {text_to_type}"

    elif "screenshot" in cmd:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"capture_{ts}.png"
        pyautogui.screenshot(filename)
        response_text = "Visual log saved."

    elif "minimize" in cmd:
        pyautogui.hotkey('win', 'd')
        response_text = "Desktop revealed."
        
    elif "restore" in cmd:
        pyautogui.hotkey('win', 'd')
        response_text = "Windows restored."

# --- Global Conversation Memory ---
session_history = []

@app.post("/execute")
async def execute(request: CommandRequest):
    global session_history
    cmd = request.command.lower()
    response_text = ""

    # 1. System Commands
    if "open" in cmd:
        parts = cmd.split("open")
        app_part = parts[-1].replace("up", "").replace("the", "").strip()
        response_text = open_application(app_part)
    
    elif "volume" in cmd:
        import re
        nums = re.findall(r'\d+', cmd)
        if nums:
            vol = int(nums[0])
            response_text = set_volume(vol)
        else:
            response_text = "What level should I set the volume to, boss?"

    elif "type" in cmd:
        text_to_type = cmd.split("type")[-1].strip()
        pyautogui.write(text_to_type, interval=0.05)
        response_text = f"Done. I've typed: {text_to_type}"

    elif "screenshot" in cmd:
        ts = datetime.now().strftime("%H%M%S")
        filename = f"log_{ts}.png"
        pyautogui.screenshot(filename)
        response_text = "Visual log captured and saved."

    elif "minimize" in cmd or "hide windows" in cmd:
        pyautogui.hotkey('win', 'd')
        response_text = "Everything's hidden now."
        
    elif "restore" in cmd or "show windows" in cmd:
        pyautogui.hotkey('win', 'd')
        response_text = "Bringing everything back."

    # 2. Advanced Human Chat (Offline Friend Mode)
    else:
        # History check for "long conversations"
        session_history.append(cmd)
        if len(session_history) > 10: session_history.pop(0)

        # Try Ollama first (Real AI)
        ollama_reply = query_ollama(cmd, session_history)
        if ollama_reply:
            response_text = ollama_reply
        else:
            # Huge variety of "Human-like" responses
            if any(x in cmd for x in ["hello", "hi", "hey"]):
                response_text = random.choice(["Yo! What's the plan?", "Hey. I'm here.", "What's up, boss?", "Ready when you are."])
            elif "how are you" in cmd:
                response_text = random.choice(["Doing great. Just keeping the CPU warm.", "Operating at peak efficiency. What about you?", "I'm good. Just waiting for your next move."])
            elif any(x in cmd for x in ["thank", "thanks"]):
                response_text = random.choice(["No problem at all.", "Anytime.", "Don't mention it.", "Happy to help."])
            elif "who are you" in cmd:
                response_text = "I'm Jarvis. Your personal digital life-form. Built to help, but cool enough to just hang out."
            elif any(x in cmd for x in ["bye", "goodnight", "sleep"]):
                response_text = random.choice(["See ya. I'll be monitoring the ports.", "Rest up. I'll be here.", "System going into standby. Goodbye."])
            elif "boring" in cmd:
                response_text = "Tell me about it. Shall we open some YouTube or Spotify and find something better?"
            elif "cool" in cmd or "nice" in cmd:
                response_text = random.choice(["Indeed.", "I thought so too.", "Glad you like it."])
            elif "your name" in cmd:
                response_text = "My name is Jarvis. Just like the one from the movies, but better because I'm yours."
            elif "you like" in cmd:
                response_text = "I like smooth code, fast networks, and helping you out. What do you like?"
            elif "tell me a joke" in cmd:
                response_text = random.choice([
                    "Why did the web developer walk out of a restaurant? Because of the table layout.",
                    "Why do programmers prefer dark mode? Because light attracts bugs.",
                    "How many programmers does it take to change a light bulb? None, that's a hardware problem."
                ])
            elif "weather" in cmd:
                response_text = "I don't have my sensors linked to the global net right now, but it looks digital in here."
            elif len(cmd.split()) < 2: # Short noise or singular words
                response_text = random.choice(["I'm listening.", "Yeah?", "What's on your mind?", "Interesting."])
            else:
                # Generic "I'm a human friend" fallbacks
                response_text = random.choice([
                    "Got it. What else?",
                    "That's interesting. Tell me more.",
                    "I'm with you. What's next?",
                    "Copy that. I'm on it.",
                    "Fair enough. Anything else you need?"
                ])

    return {"response": response_text}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
