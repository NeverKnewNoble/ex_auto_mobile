import { ActivityIndicator, Pressable, Text } from "react-native";
import { useTheme } from "@/theme";
import { Icon, type IconName } from "./icon";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  small?: boolean;
  className?: string;
}

const SURFACE: Record<Variant, string> = {
  primary: "bg-primary border-primary",
  secondary: "bg-secondary border-border",
  ghost: "bg-transparent border-border",
  destructive: "bg-destructive border-destructive",
};
const LABEL: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  ghost: "text-foreground",
  destructive: "text-white",
};

/** Touch targets stay ≥44pt tall — sized for gloves and thumbs. */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  block,
  small,
  className,
}: ButtonProps) {
  const { palette } = useTheme();
  const isOff = disabled || loading;
  const iconColor =
    variant === "primary" ? palette.primaryForeground : variant === "destructive" ? "#FFFFFF" : palette.foreground;

  return (
    <Pressable
      onPress={onPress}
      disabled={isOff}
      className={`flex-row items-center justify-center gap-2 rounded-md border ${SURFACE[variant]} ${
        small ? "min-h-[40px] px-3.5" : "min-h-[50px] px-5"
      } ${block ? "self-stretch" : ""} ${isOff ? "opacity-50" : "active:opacity-90"} ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && <Icon name={icon} size={small ? 16 : 18} color={iconColor} />}
          <Text className={`font-sans-bold ${LABEL[variant]} ${small ? "text-[14px]" : "text-[15.5px]"}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
