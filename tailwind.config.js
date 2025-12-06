/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: '#0a0b14',
        neon: '#16f195'
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0,0,0,0.45)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
