# JARVIS AI Assistant - Full Desktop Experience

A premium, movie-accurate JARVIS AI assistant with advanced features including camera integration, voice control, and desktop automation.

## 🎯 Features

### Core Capabilities
- **Always-On Voice Control**: No wake word needed - just talk naturally
- **Desktop Automation**: Control your PC with voice commands
- **Camera Integration**: Live video feed with face detection
- **System Tray Integration**: Runs in background with tray icon
- **Offline Mode**: Works without internet using local AI

### Visual Interface
- **Holographic Orb**: Animated 3D core that reacts to voice
- **Live Telemetry**: Real-time CPU, RAM, and network monitoring
- **CRT Effects**: Authentic retro-futuristic aesthetic
- **Camera Feed**: Live video with scan lines and detection indicators

### Voice Commands
- **System Control**: "Open Chrome", "Set volume to 50", "Take screenshot"
- **Conversation**: Talk naturally - "How are you?", "What's up?"
- **Window Management**: "Minimize windows", "Restore windows"

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Windows 10/11

### Installation
```powershell
# Install dependencies
cd jarvis-pro-v3
npm install

# Install Python packages
pip install fastapi uvicorn requests pyautogui pyttsx3 pydantic
```

### Running the System

**Option 1: Desktop App (Recommended)**
```powershell
npm run start:desktop
```

**Option 2: Web Browser**
```powershell
# Terminal 1: Start backend
cd ..
python darking_core.py

# Terminal 2: Start frontend
cd jarvis-pro-v3
npm run dev
```

**Option 3: One-Click Launcher**
Double-click `START_SYSTEM.bat` in the main folder.

### Auto-Start on Windows Boot
1. Press `Win + R`, type `shell:startup`, press Enter
2. Create a shortcut to `START_SYSTEM.bat`
3. Move the shortcut to the Startup folder

## 🎮 Usage

### First Launch
1. Click "INITIALIZE NEURAL LINK" when prompted
2. Allow microphone and camera permissions
3. Wait for "Hello there! I'm ready..." greeting

### System Tray Controls
Right-click the tray icon to:
- **Open Jarvis**: Show the main interface
- **Pause Listening**: Mute the microphone
- **Restart Neural Core**: Reboot the Python backend
- **Exit**: Fully shut down

### Camera Controls
- Click the camera icon (top-left) to toggle video feed
- Green border indicates face detection active

## 🛠️ Tech Stack

**Frontend:**
- Vite + React + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Electron for desktop packaging

**Backend:**
- FastAPI (Python web server)
- PyAutoGUI (desktop automation)
- pyttsx3 (text-to-speech)
- Optional: Ollama (local AI)

## 📦 Building Installer

To create a Windows installer:
```powershell
npm run package
```

The installer will be in `jarvis-pro-v3/release/`.

## 🔧 Configuration

### Voice Settings
Edit `src/App.tsx` line 43-49 to change voice preferences.

### Backend Commands
Edit `darking_core.py` to add custom commands and responses.

### Ollama Integration (Optional)
1. Install Ollama from https://ollama.ai
2. Run: `ollama pull mistral`
3. Jarvis will automatically use it for smarter responses

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js` and `src/index.css` to modify the color scheme.

### Add Commands
In `darking_core.py`, add new entries to the `conversations` dictionary or system command handlers.

## 📝 Future Enhancements
- [ ] Real face detection using TensorFlow.js
- [ ] Multi-language support
- [ ] Custom wake word training
- [ ] Integration with smart home devices
- [ ] Calendar and email management

## 🐛 Troubleshooting

**"Not listening"**
- Click the screen once to activate audio permissions
- Check microphone permissions in Windows Settings

**"Connection error"**
- Ensure Python backend is running on port 5000
- Check firewall settings

**Camera not working**
- Allow camera permissions in browser/Electron
- Check if another app is using the camera

## 📄 License
MIT License - Feel free to modify and distribute

## 🙏 Credits
Inspired by Marvel's JARVIS and modern AI assistants.

---

**Made with ❤️ for the future**
