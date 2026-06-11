/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../DieuPhoiVien/frontend/src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        saira: ['"Saira Stencil One"', 'cursive'],
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out both',
        'slide-down': 'slideDown 0.25s ease-out both',
        'slide-up':   'slideUp 0.35s ease-out both',
        'scale-in':   'scaleIn 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
