import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "1rem", // Rounded corners globally
        md: "0.75rem",
        sm: "0.5rem",
      },
      colors: {
        background: "#f9fafb", // light gray
        foreground: "#111827", // almost black
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1f2937",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#374151",
        },
        primary: {
          DEFAULT: "#2563eb", // Blue-600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#9333ea", // Purple-600
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#f59e0b", // Amber
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc2626", // Red-600
          foreground: "#ffffff",
        },
        border: "#e5e7eb",
        input: "#d1d5db",
        ring: "#3b82f6",
        chart: {
          "1": "#2563eb",
          "2": "#9333ea",
          "3": "#f59e0b",
          "4": "#10b981",
          "5": "#ef4444",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-in",
        "fade-in": "fade-in 0.3s ease-in",
        "fade-out": "fade-out 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
