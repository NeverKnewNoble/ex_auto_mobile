import { Text, type TextProps } from "react-native";

type Props = TextProps & { className?: string };

const join = (...c: (string | undefined | false)[]) => c.filter(Boolean).join(" ");

/** Body / UI text — Atkinson Hyperlegible. */
export function AppText({ className, ...rest }: Props) {
  return <Text className={join("font-sans text-[15px] leading-[21px] text-foreground", className)} {...rest} />;
}

export function Bold({ className, ...rest }: Props) {
  return <Text className={join("font-sans-bold text-[15px] leading-[21px] text-foreground", className)} {...rest} />;
}

export function Small({ className, ...rest }: Props) {
  return <Text className={join("font-sans text-[13px] leading-[18px] text-muted-foreground", className)} {...rest} />;
}

export function Caption({ className, ...rest }: Props) {
  return <Text className={join("font-sans text-[12px] leading-[16px] text-muted-foreground", className)} {...rest} />;
}

/** Uppercase tracked label — section eyebrows. */
export function Eyebrow({ className, ...rest }: Props) {
  return (
    <Text
      className={join("font-mono-semibold text-[11px] uppercase tracking-[1.4px] text-muted-foreground", className)}
      {...rest}
    />
  );
}

/** Condensed console heading — Big Shoulders Display. */
export function Display({ size = 30, className, style, ...rest }: Props & { size?: number }) {
  // Tall caps: keep the line box above the font size and kill Android padding.
  return (
    <Text
      className={join("font-display text-foreground", className)}
      style={[{ fontSize: size, lineHeight: Math.round(size * 1.12), includeFontPadding: false, paddingTop: 2, letterSpacing: 0.2 }, style]}
      {...rest}
    />
  );
}

/** Numeric readout — JetBrains Mono, tabular figures. IDs / plates / times. */
export function Readout({
  size = 14,
  weight = "medium",
  className,
  style,
  ...rest
}: Props & { size?: number; weight?: "regular" | "medium" | "semibold" }) {
  const family =
    weight === "semibold" ? "font-mono-semibold" : weight === "regular" ? "font-mono" : "font-mono-medium";
  return (
    <Text
      className={join(family, "text-foreground", className)}
      style={[{ fontSize: size, letterSpacing: -0.3, fontVariant: ["tabular-nums"] }, style]}
      {...rest}
    />
  );
}
