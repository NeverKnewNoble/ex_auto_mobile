export { fontFamily, readout, displayTitle, text } from "./typography";
export { fontAssets } from "./fonts";
export {
  light,
  dark,
  sidebar,
  alpha,
  type ThemePalette,
  type SignalTone,
} from "./colors";
export { ThemeProvider, useTheme, type ThemeMode } from "./theme-context";
export { toneClass, statusToneClass } from "./tone";

/** Base radius 12px; derived scale mirrors the portal's `--radius` ramp. */
export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 999,
} as const;

/** 4pt spacing grid. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;
