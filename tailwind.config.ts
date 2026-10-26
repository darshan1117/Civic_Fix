import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
          950: "#172554",
          DEFAULT: "#1d4ed8",
        },
        status: {
          submitted: "#64748b",   // slate/gray
          acknowledged: "#2563eb",// blue
          in_progress: "#d97706", // amber
          resolved: "#16a34a",    // green
          closed: "#475569",      // slate
          rejected: "#dc2626",    // red
          reopened: "#ea580c",    // orange
          overdue: "#b91c1c",     // crimson
        }
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
