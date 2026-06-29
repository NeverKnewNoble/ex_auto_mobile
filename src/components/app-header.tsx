import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { Display, Eyebrow } from "./text";
import { Icon, type IconName } from "./icon";

interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  tint?: string;
}

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  titleSize?: number;
  back?: boolean;
  actions?: HeaderAction[];
}

export function AppHeader({ eyebrow, title, titleSize = 30, back, actions }: AppHeaderProps) {
  const { palette } = useTheme();
  const router = useRouter();

  return (
    <View className="px-4 pt-2 pb-3">
      <View className="flex-row items-end justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          {back && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-card"
            >
              <Icon name="chevron-back" size={22} />
            </Pressable>
          )}
          <View className="flex-1">
            {eyebrow ? <Eyebrow className="mb-[3px]">{eyebrow}</Eyebrow> : null}
            <Display size={titleSize} numberOfLines={1}>
              {title}
            </Display>
          </View>
        </View>

        {actions?.length ? (
          <View className="ml-2 flex-row gap-2">
            {actions.map((a, i) => (
              <Pressable
                key={i}
                onPress={a.onPress}
                hitSlop={8}
                className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-card"
              >
                <Icon name={a.icon} size={22} color={a.tint ?? palette.foreground} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
