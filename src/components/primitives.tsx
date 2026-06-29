import { View } from "react-native";
import { Caption, Eyebrow, Readout } from "./text";

/** Hairline divider matching the border token. */
export function Divider({ className }: { className?: string }) {
  return <View className={`h-px bg-border ${className ?? ""}`} />;
}

/** Section eyebrow with optional trailing node (count, action). */
export function SectionLabel({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View className="mt-2 mb-0.5 flex-row items-center justify-between">
      <Eyebrow>{children}</Eyebrow>
      {right}
    </View>
  );
}

/** Label over a mono readout value — the spec's data-row treatment. */
export function FieldReadout({ label, value, flex }: { label: string; value: string; flex?: boolean | number }) {
  return (
    <View className={`gap-0.5 ${flex ? "flex-1" : ""}`}>
      <Caption>{label}</Caption>
      <Readout size={14.5}>{value}</Readout>
    </View>
  );
}

/** Two FieldReadouts on one line — common in vehicle/job headers. */
export function ReadoutRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row gap-4">{children}</View>;
}
