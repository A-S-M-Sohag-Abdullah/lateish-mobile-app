import { colorScheme as nativewindColorScheme } from "nativewind";
import { createContext, useContext, useEffect } from "react";

type Theme = "dark";
type ResolvedTheme = "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  /** Kept for API compatibility with the web context; always true here. */
  hydrated: boolean;
}

/**
 * The app is dark-only — light and system modes are not offered. This provider
 * keeps the same hook API as front-end/src/contexts/theme-context.tsx so shared
 * markup stays portable, but every value is pinned to "dark" and `setTheme` is
 * a no-op.
 *
 * NativeWind owns the actual `dark` class on the tree (darkMode: "class" in
 * tailwind.config.js). We lock it to "dark" at module-eval time so the very
 * first paint is dark, with no light flash while the device setting is read.
 */
nativewindColorScheme.set("dark");

const VALUE: ThemeContextValue = {
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
  hydrated: true,
};

const ThemeContext = createContext<ThemeContextValue>(VALUE);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Re-assert after mount in case a native module reset the scheme during
  // startup (splash, font loading, fast refresh).
  useEffect(() => {
    nativewindColorScheme.set("dark");
  }, []);

  return <ThemeContext.Provider value={VALUE}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
