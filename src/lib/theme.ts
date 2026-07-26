/**
 * The same tokens as src/global.css, as literal colour values.
 *
 * Tailwind classes cover anything that renders as a View/Text, but native
 * navigators (expo-router / react-navigation), SVG icons and props like
 * `placeholderTextColor` need a real colour string. Keep both files in sync.
 */
export type ColorTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  input: string;
  ring: string;
};

export const lightColors: ColorTokens = {
  background: "hsl(0, 0%, 100%)",
  foreground: "hsl(0, 0%, 4%)",
  card: "hsl(0, 0%, 100%)",
  cardForeground: "hsl(0, 0%, 4%)",
  primary: "hsl(0, 0%, 9%)",
  primaryForeground: "hsl(0, 0%, 98%)",
  secondary: "hsl(0, 0%, 96%)",
  muted: "hsl(0, 0%, 96%)",
  mutedForeground: "hsl(0, 0%, 45%)",
  accent: "hsl(0, 0%, 96%)",
  accentForeground: "hsl(0, 0%, 9%)",
  destructive: "hsl(0, 84%, 60%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  info: "hsl(199, 89%, 48%)",
  border: "hsl(0, 0%, 90%)",
  input: "hsl(0, 0%, 90%)",
  ring: "hsl(0, 0%, 63%)",
};

export const darkColors: ColorTokens = {
  background: "hsl(222, 47%, 5%)",
  foreground: "hsl(0, 0%, 98%)",
  card: "hsl(222, 47%, 7%)",
  cardForeground: "hsl(0, 0%, 98%)",
  primary: "hsl(0, 0%, 98%)",
  primaryForeground: "hsl(222, 47%, 11%)",
  secondary: "hsl(222, 30%, 14%)",
  muted: "hsl(222, 30%, 14%)",
  mutedForeground: "hsl(220, 9%, 60%)",
  accent: "hsl(33, 100%, 55%)",
  accentForeground: "hsl(0, 0%, 0%)",
  destructive: "hsl(0, 62%, 30%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  info: "hsl(199, 89%, 48%)",
  border: "hsl(222, 30%, 18%)",
  input: "hsl(222, 30%, 18%)",
  ring: "hsl(0, 0%, 83%)",
};

export const colorsByScheme = {
  light: lightColors,
  dark: darkColors,
} as const;
