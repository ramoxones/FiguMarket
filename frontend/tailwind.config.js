/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1474FB',
          dark: '#1474FB',
          light: '#1474FB',
        },
      },
    },
  },
  plugins: [],
}