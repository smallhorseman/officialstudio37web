/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'vintage': ['Playfair Display', 'serif'],
        'vintage-text': ['Crimson Text', 'serif'],
        'serif': ['Crimson Text', 'serif'],
      },
      colors: {
        cream: '#F3E3C3',
        dark: '#181818',
        'dark-secondary': '#232323',
        'dark-tertiary': '#262626',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      screens: {
        'xs': '475px',
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
}
