import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme";
import { Icon, type IconName } from "./icon";

interface FabProps {
  label: string;
  icon: IconName;
  onPress?: () => void;
}

/**
 * Thumb-reachable primary action — floats the signal-red CTA bottom-right
 * (Start Job, Add Photo, Sign Off).
 */
export function Fab({ label, icon, onPress }: FabProps) {
  const { palette } = useTheme();
  return (
    <View className="absolute right-4 bottom-[22px]" pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        className="h-[54px] flex-row items-center gap-2 rounded-full border border-white/15 bg-primary px-5 active:opacity-90"
        style={{
          shadowColor: palette.primary,
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        <Icon name={icon} size={20} color={palette.primaryForeground} />
        <Text className="font-sans-bold text-[15.5px] text-primary-foreground">{label}</Text>
      </Pressable>
    </View>
  );
}
