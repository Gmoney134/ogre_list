/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{ts,tsx,mdx}', // Only include ts, tsx, and mdx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}