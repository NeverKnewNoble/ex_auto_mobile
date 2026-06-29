import { Pressable, Text, View } from "react-native";
import { toneClass, type SignalTone } from "@/theme";

export interface Segment<T extends string> {
  value: T;
  label: string;
  tone: SignalTone;
}

interface SegmentedProps<T extends string> {
  segments: Segment<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

/**
 * The one-hand inspection control: OK / Attention / Fail as big segments, tinted
 * in their signal tone when active. Sized to tap without looking (≥44pt).
 */
export function Segmented<T extends string>({ segments, value, onChange }: SegmentedProps<T>) {
  return (
    <View className="flex-row gap-1.5 rounded-md border border-border bg-muted p-1">
      {segments.map((seg) => {
        const active = value === seg.value;
        const t = toneClass[seg.tone];
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            className={`min-h-[46px] flex-1 items-center justify-center rounded-sm border ${
              active ? `${t.fill} ${t.border}` : "border-transparent"
            }`}
          >
            <Text
              className={`text-[14px] ${active ? `font-sans-bold ${t.text}` : "font-sans text-muted-foreground"}`}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
