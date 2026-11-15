/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Agritech Green Palette (WCAG 2.2 AA compliant contrast on white/dark)
        emerald: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d", // Primary brand button & icon color (4.8:1 on white)
          800: "#166534", // Hover state (7.1:1 on white)
          900: "#14532d", // High-contrast text & active state (10.5:1 on white)
          950: "#052e16", // Deep forest background tone
        },
        mrittika: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
        },
        // High-contrast Warm Earth & Harvest Tones
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309", // Readable amber text (4.7:1 on white)
          800: "#92400e", // Deep amber (7.3:1 on white)
          900: "#78350f",
        },
        // Slate neutrals with crisp contrast
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b", // Readable muted text (4.6:1 on white)
          600: "#475569", // Supporting text (7.0:1 on white)
          700: "#334155", // High-contrast secondary text (9.5:1 on white)
          800: "#1e293b",
          900: "#0f172a", // Primary text (16.5:1 on white)
          950: "#020617",
        },
        // Apple HIG Aesthetic Palette
        apple: {
          canvas: "#f5f5f7",
          subtle: "#fbfbfd",
          surface: "#ffffff",
          dark: "#1d1d1f",
          darker: "#161617",
          black: "#000000",
          gray: "#86868b",
          border: "rgba(0, 0, 0, 0.08)",
          borderDark: "rgba(255, 255, 255, 0.12)",
          green: "#008037",
          blue: "#0071e3",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Plus Jakarta Sans",
          "Hind Siliguri",
          "Noto Sans Bengali",
          "Segoe UI",
          "sans-serif",
        ],
        bangla: [
          "Hind Siliguri",
          "Noto Sans Bengali",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Plus Jakarta Sans",
          "Hind Siliguri",
          "sans-serif",
        ],
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        "xs": "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "card": "0 2px 12px 0 rgba(0, 0, 0, 0.04), 0 8px 24px -4px rgba(0, 0, 0, 0.04)",
        "elevated": "0 12px 36px -4px rgba(0, 0, 0, 0.08), 0 4px 14px -2px rgba(0, 0, 0, 0.03)",
        "floating": "0 20px 48px -8px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        "apple": "0 4px 24px -2px rgba(0, 0, 0, 0.04), 0 12px 40px -4px rgba(0, 0, 0, 0.06)",
        "apple-hover": "0 20px 48px -12px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
        "focus-emerald": "0 0 0 3px rgba(21, 128, 61, 0.18)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        "apple-card": "1.75rem", // 28px
        "apple-bento": "2rem",    // 32px
      },
    },
  },
  plugins: [],
};
