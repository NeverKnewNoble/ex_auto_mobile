import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@/theme";
import { Bold, Caption } from "./text";
import { Button } from "./button";
import { Icon, type IconName } from "./icon";

export function LoadingState({ label }: { label?: string }) {
  const { palette } = useTheme();
  return (
    <View className="items-center justify-center gap-3 py-16">
      <ActivityIndicator color={palette.primary} />
      {label ? <Caption>{label}</Caption> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { palette } = useTheme();
  return (
    <View className="items-center gap-3 rounded-lg border border-border bg-card px-8 py-12">
      <Icon name="cloud-offline-outline" size={32} color={palette.signal.stop} />
      <Bold className="text-center text-[15px]">Couldn’t load</Bold>
      <Caption className="text-center">{message}</Caption>
      {onRetry ? <Button label="Try again" variant="secondary" icon="refresh" small onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  icon = "file-tray-outline",
  title,
  hint,
}: {
  icon?: IconName;
  title: string;
  hint?: string;
}) {
  const { palette } = useTheme();
  return (
    <View className="items-center gap-2 rounded-lg border border-border bg-card px-8 py-12">
      <Icon name={icon} size={30} color={palette.mutedForeground} />
      <Bold className="text-center text-[15px]">{title}</Bold>
      {hint ? <Caption className="text-center">{hint}</Caption> : null}
    </View>
  );
}
