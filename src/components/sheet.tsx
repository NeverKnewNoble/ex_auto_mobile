import { useEffect, useState } from "react";
import { Keyboard, Modal, Platform, Pressable, useWindowDimensions, View } from "react-native";
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
  /**
   * Full-height, top-anchored panel instead of a bottom sheet. Use for
   * searchable pickers so the search field sits at the top and the keyboard
   * (at the bottom) never covers it.
   */
  full?: boolean;
}

/** Bottom sheet — a slide-up panel for pickers, dialogs and forms. */
export function Sheet({ visible, onClose, title, children, height = 0.8, full = false }: SheetProps) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const [kb, setKb] = useState(0);

  // A Modal is its own window, so Android's adjustResize doesn't move it — track
  // the keyboard ourselves and lift the sheet above it.
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const s = Keyboard.addListener(showEvt, (e) => setKb(e.endCoordinates?.height ?? 0));
    const h = Keyboard.addListener(hideEvt, () => setKb(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  // Full-height variant: fills the screen from the top. The bottom padding
  // shrinks to sit exactly on top of the keyboard, so the list scrolls in the
  // space above it while the search field stays pinned at the top.
  if (full) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: kb || insets.bottom }}>
          <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
            <Display size={22}>{title}</Display>
            <Pressable onPress={onClose} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Icon name="close" size={20} color={palette.foreground} />
            </Pressable>
          </View>
          {children}
        </View>
      </Modal>
    );
  }

  // Keyboard up: cap to the space above it (sheet rises to the top) and lift it
  // clear of the keys. Keyboard down: normal bottom sheet at `height`.
  const maxHeight = kb > 0 ? screenH - kb - insets.top - 12 : screenH * height;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end" style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)" }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-2xl border border-border bg-background"
          style={{ maxHeight, marginBottom: kb, paddingBottom: kb ? 8 : insets.bottom + 8 }}
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
