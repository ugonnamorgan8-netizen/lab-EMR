import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0F4C81",
          green: "#157347",
          amber: "#B7791F",
          red: "#B42318",
          gray: "#5B6470",
          border: "#D8E0EA",
          surface: "#EEF2F6",
        },
      },
      fontFamily: {
        sans: ["Aptos", "\"Segoe UI\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        none: "none",
        panel: "0 18px 40px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
