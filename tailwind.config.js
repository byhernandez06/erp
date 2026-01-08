// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1173d4",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "content-light": "#101922",
                "content-dark": "#f6f7f8",
                "subtle-light": "#9ca3af",
                "subtle-dark": "#6b7280",
                "border-light": "#e5e7eb",
                "border-dark": "#374151",
            },
            fontFamily: {
                display: ["Public Sans", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px",
            },
        },
    },
    plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};
