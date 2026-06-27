import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0d2445",
          yellow: "#ffcd05",
          white: "#ffffff",
          neutral: "#fafafa",
          border: "#dbdbdb",
          ink: "#000000",
          muted: "#a0a0a0",
          surface: "#132d52",
          50: "#f3f6fa",
          100: "#e7edf5",
          500: "#0d2445",
          600: "#0a1c36",
          700: "#071427"
        },
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          muted: "var(--surface-muted)",
          header: "var(--surface-header)"
        },
        ink: {
          primary: "var(--text-primary)",
          body: "var(--text-body)",
          muted: "var(--text-muted)"
        },
        line: "var(--border-default)"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(13, 36, 69, 0.08)",
        lift: "0 18px 48px rgba(13, 36, 69, 0.14)",
        yellow: "0 12px 34px rgba(255, 205, 5, 0.22)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "drawer-in": {
          "0%": { opacity: "0", transform: "translateX(var(--drawer-shift))" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both",
        "drawer-in": "drawer-in 260ms ease-out both",
        shimmer: "shimmer 1.45s infinite"
      }
    }
  },
  plugins: []
};

export default config;
