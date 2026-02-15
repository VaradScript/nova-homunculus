# 🎤 BETTER ANIME VOICE GUIDE

## Problem: Windows TTS sounds robotic

## ✅ SOLUTION 1: Use Better Windows Voices (Easy)

### Install High-Quality TTS Voices:

1. **Open Windows Settings**
   - Press `Win + I`
   - Go to **Time & Language** → **Speech**

2. **Add Voices**
   - Click "Add voices"
   - Download these (if available):
     - **Microsoft Aria** (Best quality)
     - **Microsoft Jenny** (Natural female)
     - **Microsoft Zira** (Clear female)

3. **Restart Browser**
   - Close and reopen your browser
   - The new voices will be available

---

## ✅ SOLUTION 2: Use Coqui TTS (Anime-like, Offline)

### Install Coqui TTS:
```powershell
pip install TTS
```

### Test Voices:
```powershell
# List available voices
tts --list_models

# Test a voice
tts --text "Hello, I'm Darling" --model_name "tts_models/en/vctk/vits" --speaker_idx "p225" --out_path test.wav
```

### Best Anime-like Voices:
- `tts_models/en/vctk/vits` - Speaker p225, p226 (young female)
- `tts_models/en/ljspeech/tacotron2-DDC` (clear female)

---

## ✅ SOLUTION 3: Use ElevenLabs (Best Quality, Requires Internet)

### Free Tier: 10,000 characters/month

1. Sign up at https://elevenlabs.io
2. Get API key
3. Install library:
```powershell
pip install elevenlabs
```

4. Update `darling_service.py` to use ElevenLabs

---

## ✅ SOLUTION 4: Voice Cloning (Advanced)

### Use RVC (Retrieval-based Voice Conversion)

1. Download RVC: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
2. Find anime character voice models
3. Convert TTS output through RVC

**Popular Anime Voice Models:**
- Hatsune Miku
- Kizuna AI
- Custom trained models

---

## 🚀 QUICK FIX (Recommended for Now)

### Update App.tsx to use better voice settings:

The voice is already optimized in your current code with:
- Rate: 0.95 (slower, clearer)
- Pitch: 1.15 (feminine)
- Priority voices: Google UK/US Female, Zira

### To make it even better:

1. **Install Microsoft Aria** (if on Windows 11)
2. **Use Chrome** (better voice quality than Edge/Firefox)
3. **Increase volume** in Windows sound settings

---

## 🎯 BEST OPTION FOR ANIME VOICE

### Use Coqui TTS with VITS model:

```python
# Add to darling_service.py
from TTS.api import TTS

# Initialize TTS
tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=False)

# Generate speech
tts.tts_to_file(
    text="Hello! I'm Darling!",
    speaker="p225",  # Young female voice
    file_path="output.wav"
)
```

Then play the audio file instead of using browser TTS.

---

## 📝 CURRENT STATUS

✅ **Animated Avatar** - DONE (3 states: idle, talking, listening)
❌ **Better Voice** - Needs Coqui TTS or better Windows voices

**Next Step:** Install Coqui TTS for anime-quality voice

```powershell
pip install TTS
```

Then I'll update the backend to use it!
