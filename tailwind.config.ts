import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Wedding theme colors
        cream: '#FAF7F2',
        gold: '#C9A84C',
        'rose-gold': '#B76E79',
        // Text colors
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'text-light': '#999999',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
