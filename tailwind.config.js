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
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
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
