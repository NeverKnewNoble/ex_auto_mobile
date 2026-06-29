import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "nativewind";
import { dark, light, sidebar, type ThemePalette } from "./colors";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /**
   * Active resolved palette — for the few imperative needs that can't take a
   * className: icon tint, Reanimated colors, status-tone selection.
   */
  palette: ThemePalette;
  /** Always-dark control-panel tokens for the tab bar (React Navigation style). */
  sidebar: typeof sidebar;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const value = useMemo<ThemeContextValue>(
    () => ({
      palette: isDark ? dark : light,
      sidebar,
      isDark,
      mode: (colorScheme ?? "system") as ThemeMode,
      setMode: setColorScheme,
      toggle: toggleColorScheme,
    }),
    [isDark, colorScheme, setColorScheme, toggleColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
