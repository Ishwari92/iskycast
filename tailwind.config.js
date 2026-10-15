/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Deep indigo "night" surfaces for the dark theme.
        night: {
          950: '#0f0e2a',
          900: '#16153b',
          850: '#1d1c4a',
          800: '#262559',
          700: '#33326f',
        },
        brand: {
          300: '#b9b0ff',
          400: '#9d8ffb',
          500: '#7c6cf6',
          600: '#6553e8',
          700: '#5242c9',
        },
      },
      boxShadow: {
        panel: '0 10px 40px -12px rgba(8, 6, 32, 0.55)',
        soft: '0 8px 30px -12px rgba(60, 50, 140, 0.18)',
        glow: '0 8px 24px -6px rgba(124, 108, 246, 0.55)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
