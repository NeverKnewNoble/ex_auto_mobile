import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Divider,
  Icon,
  LiveDot,
  Readout,
  ScreenFrame,
  SectionLabel,
  Small,
  type IconName,
} from "@/components";
import { BRANCH, CURRENT_TECH } from "@/data/mock";
import { useTheme, type ThemeMode } from "@/theme";

export default function More() {
  const router = useRouter();
  const { palette, setMode } = useTheme();
  const [sel, setSel] = useState<ThemeMode>("system");

  const initials = CURRENT_TECH.replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <ScreenFrame header={<AppHeader eyebrow="Account & settings" title="More" />}>
      {/* Profile */}
      <Card>
        <View className="flex-row items-center gap-3.5">
          <View className="h-[54px] w-[54px] items-center justify-center rounded-full border border-primary/40 bg-primary/[0.12]">
            <Bold className="text-[18px] text-primary">{initials}</Bold>
          </View>
          <View className="flex-1">
            <Bold className="text-[17px]">{CURRENT_TECH}</Bold>
            <Small>Technician · {BRANCH}</Small>
          </View>
          <Icon name="qr-code-outline" size={22} color={palette.mutedForeground} />
        </View>
      </Card>

      {/* Appearance */}
      <SectionLabel>Appearance</SectionLabel>
      <Card>
        <View className="mb-3 flex-row items-center gap-2.5">
          <Icon name="contrast-outline" size={18} color={palette.mutedForeground} />
          <Small className="text-foreground">Theme — dark + high contrast reads best under glare</Small>
        </View>
        <View className="flex-row gap-2">
          {(["light", "dark", "system"] as ThemeMode[]).map((m) => {
            const active = sel === m;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  setSel(m);
                  setMode(m);
                }}
                className={`h-11 flex-1 items-center justify-center rounded-md border ${
                  active ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                <Caption className={`font-mono-semibold uppercase tracking-[0.5px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {m}
                </Caption>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Sync status */}
      <SectionLabel>Sync</SectionLabel>
      <Card>
        <View className="flex-row items-center gap-2.5">
          <LiveDot size={8} color={palette.signal.go} />
          <Bold className="flex-1 text-[15px]">All changes synced</Bold>
          <Readout size={12} className="text-muted-foreground">
            10:34
          </Readout>
        </View>
        <Small className="mt-2">
          Photos and checklist ticks queue locally and reconcile when you’re back in range. 0 items pending.
        </Small>
      </Card>

      {/* Settings list */}
      <SectionLabel>Settings</SectionLabel>
      <Card className="p-0">
        <Row icon="search-outline" label="Vehicle lookup" onPress={() => router.push("/pages/lookup")} />
        <Divider />
        <Row icon="notifications-outline" label="Notifications" />
        <Divider />
        <Row icon="cloud-offline-outline" label="Offline & storage" />
        <Divider />
        <Row icon="information-circle-outline" label="About EX Auto Field" hint="v1.0.0" />
      </Card>

      <View className="mt-2">
        <Button
          label="Sign out"
          variant="ghost"
          icon="log-out-outline"
          block
          onPress={() => router.replace("/pages/auth/landing")}
        />
      </View>
    </ScreenFrame>
  );
}

function Row({ icon, label, hint, onPress }: { icon: IconName; label: string; hint?: string; onPress?: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-[15px] active:opacity-70">
      <Icon name={icon} size={20} color={palette.mutedForeground} />
      <Bold className="flex-1 text-[15px]">{label}</Bold>
      {hint ? <Caption>{hint}</Caption> : null}
      <Icon name="chevron-forward" size={18} color={palette.mutedForeground} />
    </Pressable>
  );
}
