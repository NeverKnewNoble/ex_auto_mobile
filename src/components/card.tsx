import { Pressable, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  /** Tighter padding for dense list cards. */
  compact?: boolean;
  /** Left accent rail as a bg-* class, e.g. "bg-signal-stop" (running job). */
  accent?: string;
}

/** Card surface — sits on the concrete/asphalt background. */
export function Card({ children, onPress, className, compact, accent }: CardProps) {
  const base = `relative overflow-hidden rounded-lg border border-border bg-card ${
    compact ? "p-3" : "p-4"
  } ${className ?? ""}`;

  const rail = accent ? <View className={`absolute left-0 top-0 bottom-0 w-[3px] ${accent}`} /> : null;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${base} active:opacity-90`}>
        {rail}
        {children}
      </Pressable>
    );
  }

  return (
    <View className={base}>
      {rail}
      {children}
    </View>
  );
}
