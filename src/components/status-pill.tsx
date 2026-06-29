import { Text, View } from "react-native";
import { statusToneClass } from "@/theme";
import { statusTone } from "@/types/workflow";
import { useTheme } from "@/theme";
import { LiveDot } from "./live-dot";

interface StatusPillProps {
  /** A workflow status string — tone is resolved via statusTone(). */
  status: string;
  /** Show the live scanline dot (running time log / active inspection). */
  live?: boolean;
  small?: boolean;
  className?: string;
}

/** Tinted 10% fill, 40% border, solid text — the portal's signal pill. */
export function StatusPill({ status, live, small, className }: StatusPillProps) {
  const tone = statusToneClass(status);
  const { palette } = useTheme();
  const dotColor = palette.signal[statusTone(status)];

  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-full border ${tone.fill} ${tone.border} ${
        small ? "px-2 py-[3px]" : "px-2.5 py-[5px]"
      } ${className ?? ""}`}
    >
      {live && <LiveDot size={7} color={dotColor} />}
      <Text className={`font-mono-semibold tracking-[0.3px] ${tone.text} ${small ? "text-[10px]" : "text-[11px]"}`}>
        {status}
      </Text>
    </View>
  );
}
