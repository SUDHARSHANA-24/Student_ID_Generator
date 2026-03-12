/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    300: '#6C9CD2',
                    400: '#4B77A8',
                    600: '#2B548B',  
                    800: '#1A3A68',  
                    900: '#0F2646', 
                },
                crimson: {
                    50: '#FCE8EC',
                    300: '#C9324E',
                    600: '#9D1D3A',
                    800: '#7A132B',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
            },
        }
    },
    plugins: [],
}
