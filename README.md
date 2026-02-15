# Nova Homunculus Ecosystem

The **Nova Homunculus Ecosystem** is a hybrid AI assistant platform that spans across your PC (Windows) and Mobile (Android). It transforms your computer into a "Living Desktop" (Homunculus) managed by a powerful Python brain (Nova Server).

## 🌟 Core Components

### 1. The Brain: Nova Server (`nova_server/`)
A Python FastAPI server that acts as the central intelligence of the system.
- **Functions**:
    - `POST /upload`: Receives files from mobile.
    - `POST /command/clean`: Triggers the "File Janitor" to clean clutter (Desktop/Downloads/Temp).
    - `POST /command/lock`: Instant Windows Lock.
    - `POST /invoke_ai`: Connects to `ollama` for intelligent conversations.
- **Local Address**: `http://YOUR_PC_IP:8000`

### 2. The Face: Homunculus Interface (`jarvis-pro-v3/`)
A futuristic, transparent Electron overlay that sits on your desktop.
- **Features**:
    - **Interactive Avatar**: Hover to reveal controls.
    - **Voice Command**: "Active Listening" for commands like "Clean waste", "Lock PC", "Time".
    - **Visual Feedback**: Displays system status and responses.
    - **Intelligent Fallback**: Uses Ollama (Llama 3.2) to chat if the command is unrecognized.

### 3. The Remote: Nova Android (`nova_android/`)
Your mobile command center.
- **Capabilities**:
    - **"Send file to PC"**: Uploads files directly to your PC.
    - **"Clean my PC"**: Remotely triggers the Janitor.
    - **"Lock PC"**: Secure your workstation from anywhere on Wi-Fi.

## 🚀 Usage

### Starting the System
Simply run the master script:
**`RUN_HOMUNCULUS.bat`**
(This will start both the Python Brain and the Electron Interface).

### Voice Commands (PC Interface)
- **"Hello"**: Wakes up the assistant.
- **"Clean waste"**: Initiates system cleanup.
- **"Lock PC"**: Locks the screen.
- **"Time"**: Tells current time.
- **Any other query**: e.g., "Tell me a joke", "What is quantum computing?" (Requires Ollama).

### Mobile Setup
1. Open `nova_android` in Android Studio.
2. Update `MainActivity.kt` with your PC's IP address.
3. Install on phone.
4. Ensure phone is on the same Wi-Fi.

## 📂 Directory Structure
- `nova_server/`: Python Backend.
- `jarvis-pro-v3/`: React/Electron Frontend.
- `nova_android/`: Android App Source.
- `Received/`: Default folder for incoming files.
