/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F17",
        darkSurface: "#111827",
        darkCard: "#131B2B",
        darkBorder: "#1F293D",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'glow-blue': '0 0 35px -5px rgba(37, 99, 235, 0.35)',
        'glow-purple': '0 0 35px -5px rgba(147, 51, 234, 0.35)',
      },
    },
  },
  plugins: [],
};
