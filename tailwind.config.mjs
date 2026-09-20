/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--c-primary)",
          dark: "var(--c-primary-dark)",
          light: "var(--c-primary-light)",
        },
        accent: "var(--c-secondary)",
        ink: "var(--c-ink)",
        cream: "var(--c-bg)",
        subtle: "#6B7A88",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 2px 8px -2px rgba(16,24,40,.06)",
        lift: "0 2px 4px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.10)",
        cta: "0 4px 12px -4px rgba(34,197,94,.45)",
        bar: "0 8px 30px -8px rgba(16,24,40,.20), 0 2px 8px -4px rgba(16,24,40,.10)",
        drawer: "-8px 0 24px -8px rgba(16,24,40,.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};