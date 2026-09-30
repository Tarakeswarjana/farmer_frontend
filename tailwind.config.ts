import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        cream: "var(--color-cream)",
        earth: "var(--color-earth)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        surface: "var(--color-surface)",
        line: "var(--color-line)",
        warning: "#F59E0B",
        danger: "#DC2626",
        success: "#16A34A",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27, 94, 32, 0.06), 0 8px 24px rgba(27, 94, 32, 0.04)",
      },
      minHeight: {
        touch: "3rem",
      },
    },
  },
  plugins: [],
};

export default config;
