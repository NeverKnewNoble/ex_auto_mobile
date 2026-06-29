import { Pressable, ScrollView, View } from "react-native";
import { useTheme } from "@/theme";
import { Icon } from "./icon";
import { Caption } from "./text";

/**
 * Camera capture is a reason the app is mobile. This is the capture surface:
 * an "add photo" tile (opens the camera) followed by captured thumbnails.
 * Thumbnails are placeholders in the design pass — real ones come from the
 * upload path (services/files.ts → /api/method/upload_file).
 */
export function PhotoStrip({ count, onAdd, size = 76 }: { count: number; onAdd?: () => void; size?: number }) {
  const { palette } = useTheme();
  const dim = { width: size, height: size };
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      <Pressable
        onPress={onAdd}
        style={dim}
        className="items-center justify-center gap-[3px] rounded-md border-[1.5px] border-dashed border-primary/50 bg-primary/[0.06] active:opacity-80"
      >
        <Icon name="camera" size={22} color={palette.primary} />
        <Caption className="text-primary">Add</Caption>
      </Pressable>

      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={dim}
          className="items-center justify-center rounded-md border border-border bg-muted"
        >
          <Icon name="image" size={22} color={palette.mutedForeground} />
        </View>
      ))}
    </ScrollView>
  );
}
