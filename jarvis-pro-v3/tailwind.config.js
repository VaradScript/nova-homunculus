/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                charcoal: "#050505", // True black
                cyan: "#00E5FF",     // Jarvis Cyan
                blue: {
                    DEFAULT: "#00A8FF", // Jarvis Deep Blue
                    glow: "rgba(0, 229, 255, 0.3)",
                },
                gold: "#FFD700",
                rose: "#FF3C3C",     // Alert Red
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
