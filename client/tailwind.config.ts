import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0F5EA8",
          navy: "#0F2F58",
          sky: "#5FA8FF",
          green: "#157347",
          amber: "#B7791F",
          red: "#B42318",
          gray: "#5A6880",
          border: "#C9DDF7",
          surface: "#F1F7FF",
        },
      },
      fontFamily: {
        sans: ["Aptos", "\"Segoe UI\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        none: "none",
        panel: "0 20px 48px rgba(12, 41, 82, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
