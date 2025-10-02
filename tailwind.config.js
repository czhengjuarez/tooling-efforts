/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FDF2F7',
          100: '#FCE7F0',
          200: '#F8CDE0',
          300: '#F2A6C7',
          400: '#E975A7',
          500: '#8F1F57',
          600: '#7A1B4A',
          700: '#65173D',
          800: '#501230',
          900: '#3D0E25',
        },
        secondary: {
          500: '#DD388B',
          600: '#C5327C',
          700: '#AD2C6D',
        },
        accent: {
          100: '#F5DEEA',
          200: '#F0C8DD',
          300: '#EBB2D0',
        }
      }
    },
  },
  plugins: [],
}
