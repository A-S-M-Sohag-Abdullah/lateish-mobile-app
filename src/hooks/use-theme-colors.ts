import { darkColors, type ColorTokens } from "@/lib/theme";

/**
 * Literal colour values for icons, navigators, charts and `placeholderTextColor`.
 * The app is dark-only, so this is always the dark palette.
 */
export function useThemeColors(): ColorTokens {
  return darkColors;
}
