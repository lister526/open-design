/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070a12',
          900: '#0b0f1a',
          800: '#111827',
          700: '#1b2333',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b6d4ff',
          300: '#85b6ff',
          400: '#4d8eff',
          500: '#2466ff',
          600: '#1349e6',
          700: '#1039b4',
          800: '#13328f',
          900: '#152e72',
        },
        accent: {
          400: '#34e3c4',
          500: '#11c9a6',
          600: '#06a587',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.10)',
        glow: '0 0 0 1px rgba(36,102,255,.12), 0 20px 60px -20px rgba(36,102,255,.35)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}
