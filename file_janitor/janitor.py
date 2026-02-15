import os
import time
import shutil
import winshell
import speech_recognition as sr
import pyttsx3
from send2trash import send2trash
from pathlib import Path

# Initialize Voice Engine
engine = pyttsx3.init()
engine.setProperty('rate', 170)
engine.setProperty('volume', 1.0)

def speak(text):
    print(f"\n[JARVIS]: {text}")
    engine.say(text)
    engine.runAndWait()

def listen_command():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("\n[LISTENING] Waiting for wake word 'Jarvis'...")
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
            command = recognizer.recognize_google(audio).lower()
            print(f"[HEARD]: {command}")
            return command
        except sr.WaitTimeoutError:
            return ""
        except sr.UnknownValueError:
            return ""
        except Exception as e:
            print(f"Error: {e}")
            return ""

def get_waste_files():
    waste_files = []
    empty_folders = []
    total_size = 0
    
    # 1. Define Paths to Clean
    home = Path.home()
    paths_to_scan = [
        home / "Downloads",
        home / "Desktop",
        Path(os.environ.get('TEMP'))
    ]
    
    # 2. Define Rules
    thirty_days_ago = time.time() - (30 * 86400)
    waste_extensions = ['.tmp', '.crdownload', '.log', '.bak', '.old', '.chk']
    
    print("\n[SCANNING] Analyzing system directories for unused data...")
    
    for folder in paths_to_scan:
        if not folder.exists(): 
            continue
            
        # Walk bottom-up to handle nested empty folders correctly
        for root, dirs, files in os.walk(folder, topdown=False):
            root_path = Path(root)
            
            # Check Files
            for file in files:
                file_path = root_path / file
                try:
                    stats = file_path.stat()
                    
                    # Rule 1: Specific Extensions (Always delete temp files)
                    if file_path.suffix.lower() in waste_extensions:
                        waste_files.append(file_path)
                        total_size += stats.st_size
                        continue

                    # Rule 2: Old Files in Downloads/Desktop > 30 Days
                    if (folder == home / "Downloads" or folder == home / "Desktop"):
                        if stats.st_mtime < thirty_days_ago:
                            waste_files.append(file_path)
                            total_size += stats.st_size
                except Exception:
                    continue
            
            # Check for Empty Folders (Rule 3)
            # We skip the main scan roots themselves, only subfolders
            if root_path not in paths_to_scan:
                try:
                    # If directory is empty (no files and no subdirs)
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

def confirm_and_clean(waste_files, empty_folders, total_size):
    if not waste_files and not empty_folders:
        speak("System scan complete. No useless files or empty folders found.")
        return

    readable_size = format_size(total_size)
    file_count = len(waste_files)
    folder_count = len(empty_folders)
    
    report = f"Scan complete. I found {file_count} useless files taking up {readable_size}"
    if folder_count > 0:
        report += f", and {folder_count} empty folders"
    report += "."
    
    speak(report)
    
    # Details in console
    print(f"\n[REPORT] Size: {readable_size}")
    if waste_files:
        print("[FILES TO DELETE Example]:")
        for f in waste_files[:3]: print(f" - {f.name}")
    if empty_folders:
        print("[EMPTY FOLDERS Example]:")
        for f in empty_folders[:3]: print(f" - {f.name}")
    
    speak("Shall I recycle these items?")
    
    # Listen for confirmation
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("\n[CONFIRMATION] Waiting for 'Yes' or 'Proceed'...")
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=8)
            response = recognizer.recognize_google(audio).lower()
            print(f"[REPLY]: {response}")
            
            if "yes" in response or "proceed" in response or "sure" in response:
                speak("Cleaning up now.")
                
                # Delete Files
                deleted_files = 0
                for file_path in waste_files:
                    try:
                        send2trash(str(file_path))
                        deleted_files += 1
                    except Exception as e:
                        print(f"Failed to recycle {file_path.name}: {e}")
                
                # Delete Folders (Using rmdir since they are empty)
                deleted_folders = 0
                for folder_path in empty_folders:
                    try:
                        folder_path.rmdir()
                        deleted_folders += 1
                    except Exception as e:
                        print(f"Failed to remove folder {folder_path.name}: {e}")
                
                speak(f"Cleanup finished. Removed {deleted_files} files and {deleted_folders} empty folders.")
            else:
                speak("Operation cancelled.")
        except sr.WaitTimeoutError:
            speak("No response detected. Cancelling.")
        except Exception:
            speak("I didn't catch that. Cancelling.")

def main():
    speak("Janitor Protocol Online. Say 'Clean up' to begin.")
    
    while True:
        command = listen_command()
        
        if "jarvis" in command:
            speak("I am listening.")
            command = listen_command()
            
        if "clean" in command or "delete" in command or "waste" in command:
            files, folders, size = get_waste_files()
            confirm_and_clean(files, folders, size)
            
        elif "exit" in command or "stop" in command:
            speak("Going offline.")
            break
        
        time.sleep(0.5)

if __name__ == "__main__":
    main()
