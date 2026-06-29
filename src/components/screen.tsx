import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/theme";
import { GarageGrid } from "./garage-grid";

interface ScreenProps {
  children: React.ReactNode;
  grid?: boolean;
  scroll?: boolean;
  /** Extra bottom padding so a FAB / tab bar never covers the last row. */
  pad?: boolean;
}

/** Standard page frame: safe area + asphalt/concrete + optional drafting grid. */
export function Screen({ children, grid = true, scroll = true, pad = true }: ScreenProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const body = <View className="gap-3 px-4">{children}</View>;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      {grid && <GarageGrid />}
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: pad ? 120 : 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </View>
    </View>
  );
}

/** Header pinned, body scrolls. */
export function ScreenFrame({
  header,
  children,
  grid = true,
  pad = true,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  grid?: boolean;
  pad?: boolean;
}) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      {grid && <GarageGrid />}
      <View style={{ paddingTop: insets.top }}>{header}</View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: pad ? 130 : 24, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}
