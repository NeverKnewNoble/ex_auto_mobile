import { Pressable, ScrollView, View } from "react-native";
import { Caption } from "./text";

export interface TabDef {
  key: string;
  label: string;
  badge?: number;
}

/** Horizontal scrollable tab strip — Job Card detail tabs. */
export function Tabs({ tabs, value, onChange }: { tabs: TabDef[]; value: string; onChange: (key: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
              active ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <Caption className={`font-mono-semibold tracking-[0.3px] ${active ? "text-primary" : "text-muted-foreground"}`}>
              {t.label}
            </Caption>
            {t.badge != null && t.badge > 0 ? (
              <View className="min-w-[18px] items-center rounded-full bg-primary px-1">
                <Caption className="font-mono-semibold text-primary-foreground">{t.badge}</Caption>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
