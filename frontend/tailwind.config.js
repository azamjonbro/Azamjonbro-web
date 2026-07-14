/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#030712',
          card: '#0f172a',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#6366f1',    // Indigo
          secondary: '#a855f7',  // Violet
          success: '#10b981',    // Cyber Green
          error: '#ef4444',      // Cyber Red
          textMuted: '#94a3b8',
          textLight: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
