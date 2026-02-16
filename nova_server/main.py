import os
import time
import threading
import shutil
import socket
import ctypes
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
import uvicorn
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import pyttsx3
from send2trash import send2trash
import ollama

# ==========================================
# CONFIGURATION
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RECEIVED_FOLDER = os.path.join(BASE_DIR, "Received")
os.makedirs(RECEIVED_FOLDER, exist_ok=True)

# TTS CONFIG
tts_queue = []
tts_lock = threading.Lock()

# ==========================================
# CORE SERVICES (TTS & WATCHDOG)
# ==========================================
def process_tts_queue():
    """Worker thread to handle voice feedback sequentially."""
    while True:
        if tts_queue:
            text = tts_queue.pop(0)
            try:
                engine = pyttsx3.init()
                # Set a reasonable rate
                engine.setProperty('rate', 170)
                engine.say(text)
                engine.runAndWait()
            except Exception as e:
                print(f"TTS Error: {e}")
        time.sleep(0.5)

tts_thread = threading.Thread(target=process_tts_queue, daemon=True)
tts_thread.start()

def speak(text):
    """Add text to the speech queue."""
    print(f"[NOVA]: {text}")
    tts_queue.append(text)

class FileHandler(FileSystemEventHandler):
    """Monitors the Received folder for new uploads."""
    def on_created(self, event):
        if not event.is_directory:
            print(f"File buffer detected: {event.src_path}")
            # We delay slightly to ensure the file write is finished if it's external,
            # though FastAPI handles the upload write before this triggers usually.
            speak("File received successfully")

def start_watchdog():
    event_handler = FileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=RECEIVED_FOLDER, recursive=False)
    observer.start()
    print(f"Monitoring folder: {RECEIVED_FOLDER}")

# ==========================================
# JANITOR LOGIC (CLEANUP)
# ==========================================
def get_waste_files():
    waste_files = []
    empty_folders = []
    total_size = 0
    
    home = Path.home()
    paths_to_scan = [
        home / "Downloads",
        home / "Desktop",
        Path(os.environ.get('TEMP'))
    ]
    
    thirty_days_ago = time.time() - (30 * 86400)
    waste_extensions = ['.tmp', '.crdownload', '.log', '.bak', '.old', '.chk']
    
    print("Scanning for waste...")
    
    for folder in paths_to_scan:
        if not folder.exists(): 
            continue
            
        for root, dirs, files in os.walk(folder, topdown=False):
            root_path = Path(root)
            
            # Check Files
            for file in files:
                file_path = root_path / file
                try:
                    stats = file_path.stat()
                    is_waste = False
                    
                    if file_path.suffix.lower() in waste_extensions:
                        is_waste = True
                    elif (folder == home / "Downloads" or folder == home / "Desktop"):
                        if stats.st_mtime < thirty_days_ago:
                            is_waste = True
                            
                    if is_waste:
                        waste_files.append(file_path)
                        total_size += stats.st_size
                except Exception:
                    continue
            
            # Check for Empty Folders
            if root_path not in paths_to_scan:
                try:
                    if not any(root_path.iterdir()):
                        empty_folders.append(root_path)
                except Exception:
                    pass
                    
    return waste_files, empty_folders, total_size

def format_size(size):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} TB"

def perform_cleanup_task():
    """Background task to perform cleanup."""
    speak("Starting system cleanup.")
    waste, folders, size = get_waste_files()
    
    if not waste and not folders:
        speak("System is already clean.")
        return

    readable_size = format_size(size)
    speak(f"Found {len(waste)} files and {len(folders)} empty folders. Size: {readable_size}. cleaning now.")
    
    deleted_files = 0
    for f in waste:
        try:
            send2trash(str(f))
            deleted_files += 1
        except: pass
        
    deleted_folders = 0
    for f in folders:
        try:
            f.rmdir()
            deleted_folders += 1
        except: pass
        
    speak(f"Cleanup complete. Freed {readable_size}.")

# ==========================================
# SYSTEM COMMANDS
# ==========================================
def lock_workstation():
    speak("Locking workstation.")
    ctypes.windll.user32.LockWorkStation()

# ==========================================
# API SERVER
# ==========================================
app = FastAPI()

@app.on_event("startup")
async def startup_event():
    start_watchdog()

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "system": "Nova Core",
        "endpoints": [
            "/upload (POST)",
            "/command/clean (POST)",
            "/command/lock (POST)"
        ]
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(RECEIVED_FOLDER, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            while content := await file.read(1024 * 1024):
                buffer.write(content)
        # Voice feedback handled by Watchdog
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/command/clean")
def trigger_cleanup(background_tasks: BackgroundTasks):
    background_tasks.add_task(perform_cleanup_task)
    return {"status": "Cleanup started"}

@app.post("/command/lock")
def trigger_lock():
    lock_workstation()
    return {"status": "Locked"}

class AIRequest(str):
    pass

@app.post("/invoke_ai")
async def invoke_ai(data: dict):
    prompt = data.get("prompt", "")
    silent = data.get("silent", True) # Default to silent (let client speak)
    print(f"User asked: {prompt}")
    
    try:
        response = ollama.chat(model='llama3.2', messages=[
            {
                'role': 'system',
                'content': 'You are Jarvis, a helpful AI assistant. Keep answers short and concise (under 2 sentences).'
            },
            {
                'role': 'user',
                'content': prompt
            },
        ])
        reply = response['message']['content']
        
        if not silent:
            speak(reply)
            
        return {"reply": reply}
    except Exception as e:
        print(f"Ollama Error: {e}")
        # SIMPLE FALLBACK
        fallback = "I cannot reach my neural core, but I exist."
        if "hello" in prompt.lower(): fallback = "Greetings, user."
        elif "time" in prompt.lower(): fallback = f"It is {time.strftime('%I:%M %p')}"
        elif "who" in prompt.lower(): fallback = "I am the Novus Homunculus system."
        
        if not silent:
            speak(fallback)
            
        return {"reply": fallback}

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

if __name__ == "__main__":
    local_ip = get_local_ip()
    print(f"========================================")
    print(f" NOVA HYBRID SERVER ONLINE")
    print(f" IP Address: {local_ip}")
    print(f"========================================")
    uvicorn.run(app, host="0.0.0.0", port=8000)
