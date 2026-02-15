# Nova Android Remote

This app is the "Remote Control" for the Nova Hybrid Ecosystem. It connects to your Nova PC Server to perform tasks.

## Features
1. **File Transfer**: Say "Send file to PC" to upload files to your computer.
2. **System Cleanup**: Say "Clean my PC" or "Clean workspace" to trigger the `file_janitor` on your PC.
3. **Security**: Say "Lock PC" to instantly lock your Windows workstation.

## Setup
1. Open this project in Android Studio.
2. Open `MainActivity.kt`.
3. Find `private val BASE_URL = "http://192.168.1.XX:8000"`.
4. Change `192.168.1.XX` to your PC's local IP address.
5. Build and install on your phone.

## Commands
| Command | Action |
| :--- | :--- |
| "Send file to PC" | Opens file picker -> Uploads to PC |
| "Clean my PC" | Triggers cleanup of Desktop/Downloads/Temp on PC |
| "Lock PC" | Locks the Windows Workstation |
