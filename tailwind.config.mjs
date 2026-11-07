import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: "rgb(var(--color-accent) / <alpha-value>)",
        },
        page: "rgb(var(--color-page) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
      },
      transitionTimingFunction: {
        soft: "var(--ease-out-soft)",
        "soft-in-out": "var(--ease-in-out-soft)",
      },
      fontFamily: {
        sans: ["DM Sans", ...defaultTheme.fontFamily.sans],
        serif: ["Fraunces", ...defaultTheme.fontFamily.serif],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
