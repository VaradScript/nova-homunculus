package com.example.myapplication

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream
import java.util.*

class MainActivity : AppCompatActivity(), RecognitionListener {

    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var tts: TextToSpeech
    private lateinit var statusText: TextView
    private lateinit var listenButton: Button
    
    // TODO: Update to your PC's IP. Ensure port 8000 is open.
    private val BASE_URL = "http://192.168.1.XX:8000"
    private val UPLOAD_URL = "$BASE_URL/upload"
    private val CLEAN_URL = "$BASE_URL/command/clean"
    private val LOCK_URL = "$BASE_URL/command/lock"

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            speak("File selected. Sending to PC.")
            uploadFile(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        listenButton = findViewById(R.id.listenButton)

        // Initialize TTS
        tts = TextToSpeech(this) { status ->
            if (status != TextToSpeech.ERROR) {
                tts.language = Locale.US
            }
        }

        // Initialize Speech Recognizer
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer.setRecognitionListener(this)

        listenButton.setOnClickListener {
            checkPermissions()
        }
    }

    private fun checkPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), 1)
        } else {
            startListening()
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        
        speechRecognizer.startListening(intent)
        statusText.text = "Listening..."
        listenButton.isEnabled = false
    }

    override fun onResults(results: Bundle?) {
        listenButton.isEnabled = true
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val command = matches[0].lowercase()
            statusText.text = "Heard: $command"
            
            if (command.contains("hello nova")) {
                speak("Hello! I am ready.")
            } 
            else if (command.contains("send file")) {
                openFilePicker()
            } 
            else if (command.contains("clean my pc") || command.contains("clean workspace")) {
                sendSystemCommand(CLEAN_URL, "Cleaning protocol initiated.")
            }
            else if (command.contains("lock pc") || command.contains("lock my pc")) {
                sendSystemCommand(LOCK_URL, "Locking workstation.")
            }
            else {
                 statusText.text = "Unknown command: $command"
            }
        }
    }

    private fun openFilePicker() {
        filePickerLauncher.launch("*/*")
    }

    private fun sendSystemCommand(url: String, successMessage: String) {
        val client = OkHttpClient()
        val request = Request.Builder().url(url).post(RequestBody.create(null, ByteArray(0))).build()
        
        Thread {
            try {
                val response = client.newCall(request).execute()
                runOnUiThread {
                    if (response.isSuccessful) {
                        speak(successMessage)
                        Toast.makeText(this, "Command Sent", Toast.LENGTH_SHORT).show()
                    } else {
                        speak("I could not reach the PC.")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    speak("Connection Error")
                }
            }
        }.start()
    }

    private fun uploadFile(uri: Uri) {
        val file = getFileFromUri(uri) ?: return
        val client = OkHttpClient()
        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", file.name, file.asRequestBody("application/octet-stream".toMediaTypeOrNull()))
            .build()
            
        val request = Request.Builder().url(UPLOAD_URL).post(requestBody).build()
            
        Thread {
            try {
                val response = client.newCall(request).execute()
                runOnUiThread {
                    if (response.isSuccessful) {
                        speak("Transfer complete.")
                    } else {
                        speak("Transfer failed.")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    speak("Error connecting to PC")
                }
            }
        }.start()
    }
    
    private fun getFileFromUri(uri: Uri): File? {
        val contentResolver = applicationContext.contentResolver
        val tempFile = File(cacheDir, "upload_temp_file_${System.currentTimeMillis()}")
        try {
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            val outputStream = FileOutputStream(tempFile)
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.close()
            return tempFile
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }
    
    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() { statusText.text = "Processing..." }
    override fun onError(error: Int) { 
        statusText.text = "Error code: $error" 
        listenButton.isEnabled = true
    }
    override fun onPartialResults(partialResults: Bundle?) {}
    override fun onEvent(eventType: Int, params: Bundle?) {}

    private fun speak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }
}
