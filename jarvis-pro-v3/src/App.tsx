import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mic, MicOff } from 'lucide-react';
import { JarvisOrb } from './components/JarvisOrb';

// Safe Electron IPC
const ipcRenderer = (window as any).require?.('electron')?.ipcRenderer ?? null;
const sendIPC = (channel: string, ...args: any[]) => {
    try { ipcRenderer?.send(channel, ...args); } catch (_) { }
};

const WS_URL = 'ws://localhost:8000/ws/mic';
const API_URL = 'http://localhost:8000';

export default function App() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastResponse, setLastResponse] = useState('System Online.');
    const [isHovered, setIsHovered] = useState(false);
    const [status, setStatus] = useState('Connecting...');
    const [wsConnected, setWsConnected] = useState(false);

    const isSpeakingRef = useRef(false);
    const isActiveRef = useRef(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<any>(null);

    const setSpeaking = (val: boolean) => {
        isSpeakingRef.current = val;
        setIsSpeaking(val);
    };

    // ─── SPEAK ───────────────────────────────────────────────────────────────
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setSpeaking(true);
        setLastResponse(text);
        setStatus('Speaking...');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;

        const voices = window.speechSynthesis.getVoices();
        const female = voices.find(v =>
            v.name.includes('Zira') || v.name.includes('Aria') ||
            v.name.includes('Samantha') || v.name.toLowerCase().includes('female')
        );
        if (female) utterance.voice = female;

        utterance.onend = () => {
            setSpeaking(false);
            setStatus(isActiveRef.current ? 'Listening...' : 'Say "Nova"...');
            setIsListening(true); // server mic is always on
        };
        utterance.onerror = () => {
            setSpeaking(false);
            setIsListening(true);
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    // ─── COMMAND HANDLER ─────────────────────────────────────────────────────
    const handleCommand = useCallback(async (text: string) => {
        console.log('[CMD]', text, '| active:', isActiveRef.current);
        setTranscript(text);

        // Wake word
        if (!isActiveRef.current) {
            if (text.includes('nova') || text.includes('darking') || text.includes('hey nova')) {
                isActiveRef.current = true;
                speak("I'm listening. What do you need?");
            }
            return;
        }

        // Commands
        if (text.includes('hello') || text.includes('hi')) {
            speak('Hello! How can I help?');
        } else if (text.includes('time')) {
            speak(`It is ${new Date().toLocaleTimeString()}`);
        } else if (text.includes('date')) {
            speak(`Today is ${new Date().toLocaleDateString()}`);
        } else if (text.includes('thank')) {
            speak('Anytime!');
            isActiveRef.current = false;
        } else if (text.includes('stop') || text.includes('sleep') || text.includes('goodbye')) {
            speak('Going idle. Say Nova to wake me.');
            isActiveRef.current = false;
        } else if (text.includes('clean')) {
            speak('Initiating cleanup.');
            try { await fetch(`${API_URL}/command/clean`, { method: 'POST' }); }
            catch (_) { speak('Could not reach the core.'); }
        } else if (text.includes('lock')) {
            speak('Locking workstation.');
            try { await fetch(`${API_URL}/command/lock`, { method: 'POST' }); }
            catch (_) { }
        } else if (text.length > 2) {
            setStatus('Thinking...');
            try {
                const res = await fetch(`${API_URL}/invoke_ai`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: text, silent: true }),
                });
                const data = await res.json();
                if (data.reply) speak(data.reply);
            } catch (_) {
                speak("Can't reach my brain right now.");
            }
        }
    }, [speak]);

    // ─── WEBSOCKET CONNECTION ─────────────────────────────────────────────────
    const connectWS = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        console.log('[WS] Connecting to mic server...');
        setStatus('Connecting to mic...');

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] Connected!');
            setWsConnected(true);
            setIsListening(true);
            setStatus('Say "Nova"...');
            speak('Nova online. Say Nova to activate.');
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'transcript' && msg.text) {
                    // Ignore transcripts while speaking to avoid feedback
                    if (!isSpeakingRef.current) {
                        handleCommand(msg.text);
                    }
                }
            } catch (_) { }
        };

        ws.onclose = () => {
            console.log('[WS] Disconnected. Reconnecting...');
            setWsConnected(false);
            setIsListening(false);
            setStatus('Reconnecting...');
            reconnectTimer.current = setTimeout(() => connectWS(), 2000);
        };

        ws.onerror = (e) => {
            console.warn('[WS] Error:', e);
            setStatus('Server not ready, retrying...');
        };
    }, [handleCommand, speak]);

    // ─── INIT ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        sendIPC('set-ignore-mouse-events', true, { forward: true });

        // Wait for voices then connect
        const init = () => setTimeout(() => connectWS(), 500);
        if (window.speechSynthesis.getVoices().length > 0) {
            init();
        } else {
            window.speechSynthesis.onvoiceschanged = init;
        }

        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
            window.speechSynthesis.cancel();
        };
    }, []);

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="h-screen w-screen bg-transparent pointer-events-none relative overflow-hidden">

            {/* Status bubble - always visible */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-36 right-6 max-w-xs bg-black/85 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 text-xs text-cyan-300 font-mono pointer-events-none shadow-lg"
            >
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-cyan-500 font-bold">{status}</span>
                </div>
                {isSpeaking
                    ? <div className="opacity-80 truncate">💬 {lastResponse}</div>
                    : transcript
                        ? <div className="opacity-80 truncate">🎤 "{transcript}"</div>
                        : <div className="opacity-40">{wsConnected ? 'Mic active via server' : 'Waiting for server...'}</div>
                }
            </motion.div>

            {/* Orb */}
            <div
                className="fixed bottom-4 right-4 z-50 pointer-events-auto"
                onMouseEnter={() => { setIsHovered(true); sendIPC('set-ignore-mouse-events', false); }}
                onMouseLeave={() => { setIsHovered(false); sendIPC('set-ignore-mouse-events', true, { forward: true }); }}
            >
                <div className="relative group cursor-pointer">
                    <div className={`absolute inset-0 bg-cyan-500/20 blur-xl rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    <div className="transform transition-transform hover:scale-110">
                        <JarvisOrb isListening={isListening} isSpeaking={isSpeaking} isProcessing={false} />
                    </div>

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute -left-14 bottom-4 flex flex-col gap-2"
                            >
                                <button
                                    onClick={() => speak('System check complete. All systems nominal.')}
                                    className="p-2 bg-black/60 rounded-full border border-cyan-500/50 hover:bg-cyan-900 transition-colors"
                                    title="System Check"
                                >
                                    <Settings size={16} className="text-cyan-400" />
                                </button>
                                <button
                                    onClick={() => connectWS()}
                                    className="p-2 bg-black/60 rounded-full border border-cyan-500/50 hover:bg-cyan-900 transition-colors"
                                    title="Reconnect Mic"
                                >
                                    {wsConnected ? <Mic size={16} className="text-green-400" /> : <MicOff size={16} className="text-red-400" />}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
