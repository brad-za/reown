/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Add any custom colors if needed
            },
            maxWidth: {
                '7xl': '80rem',
            },
        },
    },
    plugins: [],
}
