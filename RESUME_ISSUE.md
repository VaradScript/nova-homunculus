# Nova Homunculus - Troubleshooting Guide

## 🔴 Current Status: "AI Not Responding"
The system is installed and code is pushed to GitHub, but the Voice Interaction is silent or unresponsive.

## 🛠️ Checklist for Next Session

### 1. Check Ollama (The Brain)
- Open a terminal and run: `ollama list`
- Ensure **`llama3.2`** is listed.
- Try running it manually: `ollama run llama3.2`
- Ask it "Hello" in the terminal to verify it works.

### 2. Check Microphone (The Ears)
- The Electron app is set to use the **Default System Microphone**.
- Ensure your JBL Headset is set as **Default Device** in Windows Sound Settings -> Input.

### 3. Debugging Flow
1. Run **`RUN_HOMUNCULUS.bat`**.
2. Look at the **Python Terminal** (Black window).
3. When you speak, do you see:
   - `[NOVA]: User asked: ...` (Server received text)
   - `Ollama Error: ...` (AI failed to generate reply)
   - Or nothing at all? (Microphone issue)

## 📍 Resume Command
Simply run **`RUN_HOMUNCULUS.bat`** to start everything up again.
