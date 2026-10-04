import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./scene/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        surface: "#0d1322",
        "surface-glass": "rgba(8, 14, 28, 0.82)",
        "surface-card": "rgba(12, 20, 40, 0.85)",
        /* JEV Layer Colors */
        "jev-blue": {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          glow: "#2563EB",
        },
        "jev-violet": {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
          glow: "#7C3AED",
        },
        "jev-cyan": {
          DEFAULT: "#00D9FF",
          light: "#67E8F9",
          glow: "#06B6D4",
        },
        "jev-green": {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          glow: "#16A34A",
        },
        "jev-amber": {
          DEFAULT: "#F59E0B",
        },
        "jev-critical": {
          DEFAULT: "#EF4444",
        },
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 217, 255, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
