const plugin = require("tailwindcss/plugin");

/**
 * Inter is shipped as one static .ttf per weight (no variable font), and React
 * Native cannot synthesise weights from a single family the way a browser can.
 * So `font-medium`, `font-semibold`, ... are re-mapped to swap the *family*
 * instead of only setting `fontWeight`. The class names stay identical to the
 * web front-end, which keeps markup portable between the two codebases.
 */
const interWeights = {
  thin: "Inter_100Thin",
  extralight: "Inter_200ExtraLight",
  light: "Inter_300Light",
  normal: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
  black: "Inter_900Black",
};

const interFontWeights = plugin(({ addUtilities }) => {
  addUtilities(
    Object.fromEntries(
      Object.entries(interWeights).map(([name, family]) => [
        `.font-${name}`,
        // fontWeight is reset because Android falls back to the system font when
        // a custom family is paired with a weight it has no variant for.
        { fontFamily: family, fontWeight: "normal" },
      ]),
    ),
  );
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Fixed brand colours, not theme tokens. The auth screens and splash
        // are always dark and always on-brand, whatever the app theme.
        brand: {
          maroon: "#8B2226",
          "maroon-pressed": "#71191C",
          navy: "#122041",
          ink: "#090E1A",
        },
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          1: "hsl(var(--chart-1) / <alpha-value>)",
          2: "hsl(var(--chart-2) / <alpha-value>)",
          3: "hsl(var(--chart-3) / <alpha-value>)",
          4: "hsl(var(--chart-4) / <alpha-value>)",
          5: "hsl(var(--chart-5) / <alpha-value>)",
        },
      },
      // Mirrors the front-end scale: --radius is 10px, the rest are multiples.
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px",
        "4xl": "26px",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        heading: ["Inter_600SemiBold"],
      },
    },
  },
  plugins: [interFontWeights],
};
