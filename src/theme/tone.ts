import type { SignalTone } from "./colors";
import { statusTone } from "@/types/workflow";

/**
 * Tailwind class triplets per signal tone. Written as full literal strings so
 * NativeWind can statically detect them (dynamic `bg-signal-${t}` would not be
 * compiled). text = solid, fill = 10% tint, border = 40%.
 */
export const toneClass: Record<SignalTone, { text: string; fill: string; border: string }> = {
  go: { text: "text-signal-go", fill: "bg-signal-go/10", border: "border-signal-go/40" },
  warn: { text: "text-signal-warn", fill: "bg-signal-warn/10", border: "border-signal-warn/40" },
  stop: { text: "text-signal-stop", fill: "bg-signal-stop/10", border: "border-signal-stop/40" },
  info: { text: "text-signal-info", fill: "bg-signal-info/10", border: "border-signal-info/40" },
};

export function statusToneClass(status: string) {
  return toneClass[statusTone(status)];
}
