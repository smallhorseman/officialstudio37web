/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#E6D5B8',
        'brand-dark': '#181818',
        'brand-bg': '#232323',
        'brand-accent': '#262626',
      },
      fontFamily: {
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pretty: '0 4px 32px 0 rgba(230,213,184,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.10)'
      },
      borderRadius: {
        pretty: '1.5rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};
}
