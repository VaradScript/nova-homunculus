import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CameraFeedProps {
    isActive: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ isActive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasPermission(true);

                    // Simple motion detection (placeholder for face detection)
                    setInterval(() => {
                        setFaceDetected(Math.random() > 0.3); // Simulated detection
                    }, 2000);
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasPermission(false);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 left-4 z-40"
        >
            <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Scan lines overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" />

                    {/* Face detection indicator */}
                    {faceDetected && hasPermission && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 border-2 border-green-400"
                        >
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-[8px] text-green-400 font-mono">USER DETECTED</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Status label */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                    <p className="text-[8px] text-cyan-400 font-mono text-center">
                        {hasPermission ? 'VISUAL SENSORS ACTIVE' : 'CAMERA OFFLINE'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
