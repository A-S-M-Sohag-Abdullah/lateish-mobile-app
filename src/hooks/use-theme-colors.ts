import { useTheme } from "@/contexts/theme-context";
import { colorsByScheme, type ColorTokens } from "@/lib/theme";

/** Literal colour values for the active scheme — for icons, navigators, charts. */
export function useThemeColors(): ColorTokens {
  const { resolvedTheme } = useTheme();
  return colorsByScheme[resolvedTheme];
}
