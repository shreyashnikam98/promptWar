/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0f1d',
          navy: '#0f172a',
          surface: '#1e293b',
          blue: '#2563eb',
          electric: '#38bdf8',
          accent: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(56, 189, 248, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
