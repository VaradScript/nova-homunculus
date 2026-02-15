import React from 'react';

export const CRTOverlay: React.FC = () => {
    return (
        <>
            {/* Scanlines and RGB Shift */}
            <div className="fixed inset-0 z-[100] crt-overlay pointer-events-none opacity-40 mix-blend-overlay"></div>

            {/* Vignette & Flicker */}
            <div className="fixed inset-0 z-[101] crt-vignette crt-flicker pointer-events-none mix-blend-multiply"></div>

            {/* Optional: subtle noise or grain could be added here if needed */}
        </>
    );
};
