import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1A56DB",
          green: "#16A34A",
          amber: "#D97706",
          red: "#DC2626",
          gray: "#6B7280",
          border: "#E2E8F0",
          surface: "#F4F6F8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
} satisfies Config;
