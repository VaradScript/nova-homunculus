import React from 'react';
import { motion } from 'framer-motion';

interface PartnerAvatarProps {
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
}

export const PartnerAvatar: React.FC<PartnerAvatarProps> = ({ isListening, isSpeaking, isProcessing }) => {
    // Determine which avatar image to show based on state
    const getAvatarSrc = () => {
        if (isSpeaking) return '/avatar_talking.png';
        if (isListening) return '/avatar_listening.png';
        return '/avatar_idle.png';
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Simplified Outer Ring - Single, lightweight */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute border border-cyan/20 rounded-full"
                style={{ width: '110%', height: '110%', left: '-5%', top: '-5%' }}
            />

            {/* Central Avatar - Optimized */}
            <div className="relative w-[400px] h-[400px] rounded-2xl shadow-[0_0_40px_rgba(140,82,255,0.4)] overflow-hidden border-2 border-white/20 z-10 bg-gradient-to-br from-[#1a0b2e] to-[#0f0b14]">
                {/* Avatar Image - Simple fade transition */}
                <img
                    key={getAvatarSrc()}
                    src={getAvatarSrc()}
                    alt="Darking AI"
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{
                        filter: isListening ? "brightness(1.2)" : "brightness(1)",
                    }}
                />



                {/* Speaking indicator - simple pulse */}
                {isSpeaking && (
                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-24 h-12 bg-rose/30 blur-xl rounded-full animate-pulse" />
                )}
            </div>

            {/* Simple glow effect */}
            <div
                className="absolute rounded-2xl z-[-1] transition-shadow duration-1000"
                style={{
                    width: '400px',
                    height: '400px',
                    boxShadow: isSpeaking
                        ? '0 0 60px rgba(255,77,141,0.6)'
                        : '0 0 40px rgba(0,229,255,0.4)'
                }}
            />
        </div>
    );
};
