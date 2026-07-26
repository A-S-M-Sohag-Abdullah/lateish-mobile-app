import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme as nativewindColorScheme, useColorScheme } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  /** False until the persisted preference has been read from storage. */
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

function isTheme(value: string | null): value is Theme {
  return value === "dark" || value === "light" || value === "system";
}

/**
 * Mirrors front-end/src/contexts/theme-context.tsx. NativeWind owns the actual
 * `dark` class on the tree (darkMode: "class" in tailwind.config.js); this
 * provider just persists the user's choice and exposes the same hook API as web.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        const next = isTheme(stored) ? stored : DEFAULT_THEME;
        setThemeState(next);
        nativewindColorScheme.set(next);
      })
      .catch(() => {
        if (!cancelled) nativewindColorScheme.set(DEFAULT_THEME);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    nativewindColorScheme.set(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: (colorScheme ?? DEFAULT_THEME) as ResolvedTheme,
        setTheme,
        hydrated,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
