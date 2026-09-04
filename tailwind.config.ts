import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body-face)", "var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        // --font-heading-face is set per-site from the couple's headingFontKey
        // in site-shell.tsx. It falls back to Cormorant, so every existing
        // `font-display` usage keeps working unchanged while now honouring the
        // choice the customizer has always let couples make.
        display: ["var(--font-heading-face)", "var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        luxe: ["var(--font-cinzel)", "Cinzel", "Georgia", "serif"],
        tamil: ["var(--font-tamil)", "Noto Serif Tamil", "Georgia", "serif"],
      },
      colors: {
        ink: "#1f1724",
        // NOTE: never name a custom color "rose" (or any other Tailwind
        // palette name) — it replaces the entire built-in scale, silently
        // killing every rose-50…rose-900 class used for error states.
        blush: "#f6ece7",
        gold: "#b88c4a",
        mist: "#f5f2ee",
        pine: "#31493c",
      },
      boxShadow: {
        glow: "0 18px 45px rgba(37, 19, 22, 0.12)",
        card: "0 20px 65px rgba(37, 19, 22, 0.08)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(255,255,255,0.75), transparent 38%), radial-gradient(circle at top right, rgba(184,140,74,0.20), transparent 32%), linear-gradient(135deg, rgba(246,236,231,1) 0%, rgba(255,250,247,1) 45%, rgba(255,245,238,1) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        shimmer: "shimmer 2.5s infinite linear",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
