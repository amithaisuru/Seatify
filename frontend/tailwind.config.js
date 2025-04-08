/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optional: Define custom colors if you want
        primary: {
          light: '#48CFCB',      // Light theme primary color
          lighter: '#F5F5F5',    // Dark theme primary color
          dark: '#038C8FFF',      // Dark theme primary color
          darker: '#202828FF', 
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}