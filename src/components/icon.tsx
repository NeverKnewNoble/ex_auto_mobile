import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/theme";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Thin wrapper so call sites never import the vendor set directly. */
export function Icon({ name, size = 22, color }: IconProps) {
  const { palette } = useTheme();
  return <Ionicons name={name} size={size} color={color ?? palette.foreground} />;
}
