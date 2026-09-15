/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f1',
          100: '#e1f3df',
          200: '#c5e6c1',
          300: '#9cd295',
          400: '#86bc64',
          500: '#679e43',
          600: '#507e33',
          700: '#3f622a',
          800: '#354f24',
          900: '#2c4220',
        }
      }
    },
  },
  plugins: [],
}
