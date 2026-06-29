import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";
import { Icon } from "./icon";
import { Caption, Small } from "./text";

/**
 * Signature capture — the second device-native capability. In the design pass
 * this is the tap-to-sign surface; a real pad (gesture path → upload_file)
 * drops in behind the same frame. `signed` shows the captured state.
 */
export function SignaturePad({
  signed,
  signerName,
  onSign,
}: {
  signed?: boolean;
  signerName?: string;
  onSign?: () => void;
}) {
  const { palette } = useTheme();

  if (signed) {
    return (
      <View className="h-[120px] items-center justify-center gap-1.5 rounded-md border border-signal-go/50 bg-signal-go/[0.08]">
        <Icon name="checkmark-circle" size={28} color={palette.signal.go} />
        <Small className="text-signal-go">Signed{signerName ? ` · ${signerName}` : ""}</Small>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onSign}
      className="h-[120px] items-center justify-center gap-1.5 rounded-md border-[1.5px] border-dashed border-border bg-card active:opacity-80"
    >
      <Icon name="create-outline" size={26} color={palette.mutedForeground} />
      <Caption>Tap to capture signature</Caption>
    </Pressable>
  );
}
