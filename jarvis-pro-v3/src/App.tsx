import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Settings } from 'lucide-react';
import { JarvisOrb } from './components/JarvisOrb';

// Electron IPC
const { ipcRenderer } = window.require('electron');

export default function App() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastResponse, setLastResponse] = useState("System Online.");
    const [isHovered, setIsHovered] = useState(false);

    // Initial Setup
    useEffect(() => {
        // Set mouse ignore by default so clicks pass through empty space
        ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });

        // Start listening immediately
        startListening();

        speak("Homunculus Interface Active.");
    }, []);

    // Toggle transparency based on hover
    const handleMouseEnter = () => {
        setIsHovered(true);
        ipcRenderer.send('set-ignore-mouse-events', false); // Enable clicks
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        ipcRenderer.send('set-ignore-mouse-events', true, { forward: true }); // Pass clicks
    };

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            // Explicitly restart listening after speaking
            startListening();
        };

        setLastResponse(text);
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false; // MUST be false for better reliability

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript.toLowerCase();
            console.log("Heard:", text);
            setTranscript(text);
            handleCommand(text);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Robust restart loop
            if (!isSpeaking) {
                setTimeout(() => {
                    try { recognition.start(); } catch (e) { }
                }, 100);
            }
        };

        recognition.onerror = (event: any) => {
            console.log("Mic Error:", event.error);
            if (event.error !== 'aborted' && !isSpeaking) {
                setTimeout(() => {
                    try { recognition.start(); } catch (e) { }
                }, 500);
            }
        };

        try { recognition.start(); } catch (e) { }
    };

    const [isActive, setIsActive] = useState(false); // For wake word logic

    const handleCommand = async (text: string) => {
        setTranscript(text);

        // Wake word logic: "Darking"
        if (!isActive) {
            if (text.includes("darking") || text.includes("hey darking") || text.includes("nova") || text.includes("hello")) {
                setIsActive(true);
                speak("I'm listening, love. What can I do for you?");
                return;
            }
            // If not active, ignore other texts (or just wait)
            return;
        }

        // --- ACTIVE COMMANDS ---

        // Simple local commands
        if (text.includes("hello") || text.includes("hi")) {
            speak("Greetings. I am ready.");
        } else if (text.includes("time")) {
            speak(`It is ${new Date().toLocaleTimeString()}`);
        } else if (text.includes("thank you") || text.includes("thanks")) {
            speak("Anytime, darling.");
            setIsActive(false); // Go back to idle/wake-word mode?
        } else if (text.includes("stop") || text.includes("go to sleep")) {
            speak("Understood. I'll be here if you need me.");
            setIsActive(false);
        } else if (text.includes("clean") || text.includes("waste")) {
            speak("Initiating cleanup protocol.");
            try {
                await fetch('http://localhost:8000/command/clean', { method: 'POST' });
            } catch (e) {
                speak("I could not reach the core.");
            }
        } else if (text.includes("lock")) {
            speak("Locking workstation.");
            try {
                await fetch('http://localhost:8000/command/lock', { method: 'POST' });
            } catch (e) { }
        } else {
            // Intelligent Fallback (Ollama via Nova Server)
            try {
                if (text.length > 2) {
                    const response = await fetch('http://localhost:8000/invoke_ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    const data = await response.json();
                    if (data.reply) {
                        speak(data.reply);
                    }
                }
            } catch (e) {
                speak("I am having trouble connecting to my brain.");
            }
        }
    };

    return (
        <div className="h-screen w-screen bg-transparent pointer-events-none relative overflow-hidden">

            {/* Minimal Status Display (Only visible when speaking/listening) */}
            <AnimatePresence>
                {(isSpeaking || transcript) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-32 right-8 w-64 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 text-sm text-cyan-400 font-mono pointer-events-none"
                    >
                        {isSpeaking ? `Checking: ${lastResponse}` : `Heard: "${transcript}"`}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Avatar (Interactive Zone) */}
            <div
                className="fixed bottom-4 right-4 z-50 pointer-events-auto"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="relative group cursor-pointer">
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-cyan-500/20 blur-xl rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    {/* The Orb Component */}
                    <div className="transform transition-transform hover:scale-110">
                        <JarvisOrb isListening={isListening} isSpeaking={isSpeaking} isProcessing={false} />
                    </div>

                    {/* Controls (Only on hover) */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute -left-12 bottom-4 flex flex-col gap-2"
                            >
                                <button onClick={() => speak("System check.")} className="p-2 bg-black/60 rounded-full border border-cyan-500/50 hover:bg-cyan-900">
                                    <Settings size={16} className="text-cyan-400" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
