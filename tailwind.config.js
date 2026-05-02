/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                bg: "#171614",
                surface: "#1d1c19",
                "surface-2": "#24221f",
                border: "#38342e",
                text: "#ece6dc",
                muted: "#b2aa9f",
                faint: "#7d766d",
                primary: "#57a9ad",
                success: "#7fb159",
                warning: "#db9a47",
                error: "#d777a0",
            },
        },
    },
    plugins: [],
};