/**
 * Garage Console palette — ported from portal/src/index.css.
 *
 * Colors are authored in OKLCH in the design source of truth. React Native
 * cannot reliably parse `oklch()` color strings, so we use the hex equivalents
 * the spec publishes "for design tools that can't take OKLCH". The OKLCH value
 * stays in the trailing comment so the two surfaces never drift.
 */

export type SignalTone = "go" | "warn" | "stop" | "info";

export interface ThemePalette {
  background: string;
  foreground: string;
  card: string;
  cardMuted: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  /** Status "signal" tones — solid color; tint at 10% / border at 40% in pills. */
  signal: Record<SignalTone, string>;
}

/** The bottom tab bar is ALWAYS dark — "it's a control panel" — in both themes. */
export const sidebar = {
  background: "#101216", // oklch(0.18 0.008 270)
  foreground: "#DBDAD5", // oklch(0.88 0.005 95)
  mutedForeground: "#7C7E84",
  primary: "#FB3B48", // oklch(0.65 0.22 27) — brighter red on dark
  accent: "#1C1E23", // oklch(0.235 0.008 270) — active item background
  border: "#23252B",
} as const;

export const light: ThemePalette = {
  background: "#F4F2EC", // oklch(0.962 0.006 95) — warm concrete
  foreground: "#1B1C20", // oklch(0.16 0.01 270) — near-black ink
  card: "#FFFFFF", // oklch(1 0 0)
  cardMuted: "#FBFAF7",
  primary: "#E11D2A", // oklch(0.585 0.215 27) — signal red
  primaryForeground: "#FCFCFC", // oklch(0.99 0 0)
  secondary: "#E8E6DF", // oklch(0.92 0.008 95)
  secondaryForeground: "#1B1C20",
  muted: "#EDEBE5", // oklch(0.94 0.006 95)
  mutedForeground: "#6B6C71", // oklch(0.45 0.01 270)
  accent: "#3FA9D6", // oklch(0.74 0.16 220) — electric cyan
  destructive: "#D32E2E", // oklch(0.55 0.22 25)
  border: "#DAD8D0", // oklch(0.88 0.008 90)
  input: "#DAD8D0",
  ring: "rgba(225,29,42,0.40)", // red @ 40%
  signal: {
    go: "#3DAE5A", // oklch(0.68 0.18 145)
    warn: "#D99A1C", // oklch(0.78 0.16 75)
    stop: "#E11D2A", // oklch(0.585 0.215 27)
    info: "#3B82E6", // oklch(0.66 0.16 230)
  },
};

export const dark: ThemePalette = {
  background: "#0B0C0F", // oklch(0.155 0.008 270) — asphalt
  foreground: "#F0EFEA", // oklch(0.95 0.006 95) — off-white
  card: "#16171B", // oklch(0.205 0.008 270) — lifted surface
  cardMuted: "#1B1D22",
  primary: "#FF3F4C", // oklch(0.66 0.22 27) — brighter red on dark
  primaryForeground: "#0B0C0F",
  secondary: "#1F2127",
  secondaryForeground: "#F0EFEA",
  muted: "#1C1E23",
  mutedForeground: "#9395A0",
  accent: "#46B6E6", // oklch(0.78 0.18 220)
  destructive: "#FF4D4D",
  border: "#2A2C31", // oklch(0.28 0.008 270)
  input: "#2A2C31",
  ring: "rgba(255,63,76,0.40)",
  signal: {
    go: "#46C266",
    warn: "#E6A82B",
    stop: "#FF3F4C",
    info: "#4C92F0",
  },
};

/** Convert a hex color to an rgba() string at the given alpha. */
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
