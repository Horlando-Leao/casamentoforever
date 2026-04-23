import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Wedding theme colors
        cream: {
          DEFAULT: '#FAF7F2',
          alt: '#FDFBF7',
          dark: '#EAE4D9'
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#DBC37E',
          dark: '#A68A3D'
        },
        'rose-gold': {
          DEFAULT: '#B76E79',
          light: '#D49BA4',
          dark: '#8E515B'
        },
        // Text colors
        'text-primary': '#2C2C2C',
        'text-secondary': '#666666',
        'text-light': '#999999',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -3px rgba(0, 0, 0, 0.08)',
        'floating': '0 20px 40px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
