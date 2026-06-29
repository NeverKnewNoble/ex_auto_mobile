/**
 * Typography roles — three Google fonts, bundled with the app so the shop floor
 * never depends on the network.
 *
 *   Body / UI  → Atkinson Hyperlegible  (max legibility under garage lighting)
 *   Display    → Big Shoulders Display  (condensed motorsport "console" headers)
 *   Mono       → JetBrains Mono         (numeric readouts: IDs, plates, times)
 *
 * Font family strings below match the keys registered in `useFonts` (see
 * src/theme/fonts.ts). Reference these, never raw family names, at call sites.
 */

export const fontFamily = {
  body: "Atkinson_400Regular",
  bodyBold: "Atkinson_700Bold",
  bodyItalic: "Atkinson_400Regular_Italic",
  display: "BigShoulders_700Bold",
  displayMedium: "BigShoulders_500Medium",
  displayBlack: "BigShoulders_900Black",
  mono: "JetBrains_400Regular",
  monoMedium: "JetBrains_500Medium",
  monoSemiBold: "JetBrains_600SemiBold",
} as const;

/**
 * Readout treatment — any number that updates or gets read aloud (IDs, plates,
 * times, totals): JetBrains Mono, tabular figures, tight tracking.
 */
export const readout = {
  fontFamily: fontFamily.monoMedium,
  fontVariant: ["tabular-nums" as const],
  letterSpacing: -0.3,
};

/** Condensed display header. Big Shoulders runs short, so size up vs body. */
export function displayTitle(size: number) {
  return {
    fontFamily: fontFamily.display,
    fontSize: size,
    // Big Shoulders has tall caps — keep the line box a touch ABOVE the font
    // size and disable Android's extra font padding so the top isn't clipped.
    lineHeight: Math.round(size * 1.12),
    letterSpacing: 0.2,
    includeFontPadding: false,
    paddingTop: 2,
  };
}

export const text = {
  /** Page eyebrow / section label — uppercase, tracked, muted. */
  eyebrow: {
    fontFamily: fontFamily.monoSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
  },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 21 },
  bodyBold: { fontFamily: fontFamily.bodyBold, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 16 },
};
