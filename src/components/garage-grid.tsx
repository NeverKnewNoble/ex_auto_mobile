import { useMemo } from "react";
import { useWindowDimensions, View } from "react-native";

const CELL = 32;

/**
 * The `.garage-grid` signature — a faint drafting-grid backdrop (32px cells,
 * foreground @ ~5%) behind main content. Fixed to the viewport so it reads like
 * paper under the work, not something that scrolls with it.
 */
export function GarageGrid() {
  const { width, height } = useWindowDimensions();

  const { cols, rows } = useMemo(
    () => ({ cols: Math.ceil(width / CELL), rows: Math.ceil(height / CELL) }),
    [width, height]
  );

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {Array.from({ length: cols }).map((_, i) => (
        <View key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-foreground/5" style={{ left: i * CELL }} />
      ))}
      {Array.from({ length: rows }).map((_, i) => (
        <View key={`h${i}`} className="absolute left-0 right-0 h-px bg-foreground/5" style={{ top: i * CELL }} />
      ))}
    </View>
  );
}
