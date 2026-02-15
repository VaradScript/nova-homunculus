import React from 'react';
import { motion } from 'framer-motion';

interface JarvisOrbProps {
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({ isListening, isSpeaking, isProcessing }) => {
    // Rotation variants for rings
    const spinTransition = {
        repeat: Infinity,
        ease: "linear",
        duration: 8
    };

    const reverseSpinTransition = {
        repeat: Infinity,
        ease: "linear",
        duration: 10
    };

    // Color states
    const coreColor = isProcessing ? "rgba(255, 255, 255, 0.9)" : isSpeaking ? "rgba(255, 60, 60, 0.8)" : isListening ? "rgba(0, 255, 200, 0.8)" : "rgba(0, 180, 255, 0.6)";
    const glowColor = isProcessing ? "rgba(255, 255, 255, 0.6)" : isSpeaking ? "rgba(255, 30, 30, 0.5)" : isListening ? "rgba(0, 255, 200, 0.4)" : "rgba(0, 100, 255, 0.3)";

    return (
        <div className="relative w-[500px] h-[500px] flex items-center justify-center perspective-[1000px]">
            {/* 1. Deep Background Glow (Atmosphere) */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [0.9, 1.1, 0.9]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-[80px]"
                style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
                }}
            />

            {/* 2. Outer Ring - Static Tech markings */}
            <div className="absolute w-[380px] h-[380px] rounded-full border border-cyan-500/10" />

            {/* 3. Gyroscopic Ring 1 (Large) */}
            <motion.div
                animate={{ rotateX: 360, rotateY: 180, rotateZ: 45 }}
                transition={{ ...spinTransition, duration: 15 }}
                className="absolute w-[340px] h-[340px] rounded-full border border-cyan-400/30 border-t-cyan-200/80 border-b-transparent"
                style={{ borderStyle: "solid", borderWidth: "1px" }}
            />

            {/* 4. Gyroscopic Ring 2 (Medium) */}
            <motion.div
                animate={{ rotateY: 360, rotateZ: -120 }}
                transition={{ ...reverseSpinTransition, duration: 12 }}
                className="absolute w-[280px] h-[280px] rounded-full border-[2px] border-cyan-500/20 border-r-cyan-100/60 border-l-transparent"
            />

            {/* 5. Gyroscopic Ring 3 (Small inner) - Reacts more to sound */}
            <motion.div
                animate={{ rotateZ: 360, scale: isSpeaking ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute w-[220px] h-[220px] rounded-full border border-white/40 border-dashed"
            />

            {/* 6. The Arc Reactors / Data Bits */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[420px] h-[420px]"
            >
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
                <div className="absolute bottom-0 right-1/2 w-3 h-1 bg-blue-300 rounded-full shadow-[0_0_10px_blue]" />
            </motion.div>

            {/* 7. Central Core (The "Eye") */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Core Glare */}
                <motion.div
                    animate={{
                        scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.1, 1] : 1,
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md"
                    style={{
                        background: `radial-gradient(circle, ${coreColor} 0%, transparent 70%)`
                    }}
                />

                {/* Solid Core Center */}
                <motion.div
                    animate={{
                        scale: isSpeaking ? [0.9, 1.1, 0.9] : [1, 1],
                    }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-white/90 shadow-[0_0_50px_rgba(0,255,255,0.8)]"
                    style={{
                        boxShadow: `0 0 40px ${coreColor}, inset 0 0 20px ${coreColor}`
                    }}
                />

                {/* Inner Data Rings within Core */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute w-20 h-20 border border-white/50 rounded-full border-t-transparent"
                />
            </div>

            {/* 8. Text Overlay / Status (Optional decorative text) */}
            <div className="absolute bottom-[-60px] flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] tracking-[0.3em] text-cyan-500/60 font-mono">
                    {isProcessing ? "PROCESSING DATA..." : isListening ? "LISTENING..." : isSpeaking ? "SPEAKING..." : "SYSTEM ONLINE"}
                </span>
                <div className="flex gap-1 mt-2">
                    <div className={`w-1 h-1 rounded-full ${isListening ? "bg-green-400 animate-pulse" : "bg-cyan-900"}`} />
                    <div className={`w-1 h-1 rounded-full ${isSpeaking ? "bg-red-400 animate-pulse" : "bg-cyan-900"}`} />
                    <div className="w-1 h-1 rounded-full bg-cyan-900" />
                </div>
            </div>
        </div>
    );
};
