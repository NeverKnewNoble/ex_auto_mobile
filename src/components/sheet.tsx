import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { Display } from "./text";
import { Icon } from "./icon";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Fraction of screen height (default 0.8). */
  height?: number;
}

/** Bottom sheet — a slide-up panel for pickers, dialogs and forms. */
export function Sheet({ visible, onClose, title, children, height = 0.8 }: SheetProps) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end" style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)" }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-2xl border border-border bg-background"
          style={{ maxHeight: `${height * 100}%`, paddingBottom: insets.bottom + 8 }}
        >
          <View className="h-1 w-10 self-center rounded-full bg-border" style={{ marginTop: 10 }} />
          <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
            <Display size={22}>{title}</Display>
            <Pressable onPress={onClose} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Icon name="close" size={20} color={palette.foreground} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
