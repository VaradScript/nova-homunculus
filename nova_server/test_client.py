import requests
import os

# Create a dummy file to upload
with open("test_upload.txt", "w") as f:
    f.write("Hello from Nova Test Script!")

url = "http://127.0.0.1:8000/upload"
files = {'file': open('test_upload.txt', 'rb')}

print(f"Sending file to {url}...")
try:
    response = requests.post(url, files=files)
    print("Response Status:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print(f"Failed to connect: {e}")
    print("Make sure the server is running!")

files['file'].close()
# os.remove("test_upload.txt") # Keep it so we can see it
