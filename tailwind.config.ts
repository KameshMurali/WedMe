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
        // The biggest display moments only — the homepage h1 and the ceremony
        // day word. Rozha One is Devanagari-derived and ships one heavy weight,
        // which is why it is reserved for type large enough to carry it rather
        // than offered as a general heading face.
        royal: ["var(--font-rozha)", "Rozha One", "var(--font-marcellus)", "Georgia", "serif"],
        tamil: ["var(--font-tamil)", "Noto Serif Tamil", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "Noto Naskh Arabic", "Georgia", "serif"],
        sc: ["var(--font-sc)", "Noto Serif SC", "Georgia", "serif"],
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
        // TOKEN-DRIVEN ON PURPOSE, and it has to stay that way.
        //
        // This was three hardcoded cream literals — rgba(255,255,255,0.75) over
        // rgba(246,236,231)->rgba(255,245,238) — left behind when the marketing
        // page inverted to the dark .band-ink scope. A decoration carrying its
        // own colour cannot follow a scope, so the mesh went on painting cream
        // inside the ink header pill (`absolute inset-0 bg-hero-mesh opacity-90`
        // in page.tsx) while the text above it still resolved .band-ink's
        // near-white --text: 1.17:1, measured. The public templates had the
        // mirror of the same bug — every one of the sixteen got the same beige
        // placeholder regardless of its palette, and the dark ones got a pale
        // slab (see the note in components/public/sections.tsx).
        //
        // Anchored to --surface, which is by definition the panel colour that
        // the scope's --text and --muted are chosen against, so the mesh is
        // correct in BOTH scopes with one value: dark violet inside .band-ink,
        // near-white on paper, and the template's own surface on a wedding site.
        // Only --surface/--background/--primary/--accent appear here: those are
        // the four that site-shell.tsx publishes per template. --elevated is
        // NOT one of them, so using it would fall back to :root's #ffffff and
        // drop a white radial into every dark template.
        //
        // Keep the tints small. They are the only thing that can carry the mesh
        // away from --surface, and --muted on --surface is the tightest pair on
        // the page (measured 5.6:1 at these percentages inside .band-ink).
        "hero-mesh":
          "radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 10%, var(--surface)), transparent 38%), radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 12%, transparent), transparent 32%), linear-gradient(135deg, color-mix(in srgb, var(--background) 40%, var(--surface)) 0%, var(--surface) 45%, color-mix(in srgb, var(--accent) 8%, var(--surface)) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // The hero entrance. fade-up travels 14px in 0.7s, which reads as "the
        // page loaded" rather than as motion — fine for small chrome, too timid
        // for a full-height editorial band. This one travels twice as far, over
        // a slightly longer beat, and lands with a touch of settle rather than
        // easing flat to a stop.
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-rise": "fade-rise 0.85s var(--ease-settle) both",
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
