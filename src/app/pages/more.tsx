import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Display,
  Divider,
  Icon,
  LiveDot,
  Readout,
  ScreenFrame,
  SectionLabel,
  Sheet,
  Small,
  useToast,
  type IconName,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { useSession } from "@/hooks/use-session";
import { availableDiskSpace, cacheStats, clearCache, unreadNotificationCount, type CacheStats } from "@/services";
import { bytes } from "@/lib/format";
import { useTheme, type ThemeMode } from "@/theme";
import type { RowProps } from "@/types/more";

export default function More() {
  const router = useRouter();
  const { palette, setMode } = useTheme();
  const { user, signOut } = useSession();
  const toast = useToast();
  const [sel, setSel] = useState<ThemeMode>("system");
  const { data: unread } = useFetch(() => unreadNotificationCount(), []);

  // Offline & storage sheet — stats are read from disk on open, not every render.
  const [storageOpen, setStorageOpen] = useState(false);
  const [stats, setStats] = useState<CacheStats>({ count: 0, bytes: 0 });
  const [free, setFree] = useState(0);
  const [clearing, setClearing] = useState(false);

  const readStats = () => {
    setStats(cacheStats());
    setFree(availableDiskSpace());
  };

  // Show the cached size on the row without waiting for the sheet to open.
  useEffect(readStats, []);

  const openStorage = () => {
    readStats();
    setStorageOpen(true);
  };

  const handleClear = () => {
    setClearing(true);
    clearCache();
    readStats();
    setClearing(false);
    toast.show("Cache cleared", "success");
  };

  const name = user?.full_name ?? user?.name ?? "Signed-in user";
  const email = user?.email ?? user?.name ?? "";
  const branch = user?.branch;
  const initials =
    name
      .replace(/[^A-Za-z ]/g, "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2) || "EX";

  return (
    <>
      <ScreenFrame header={<AppHeader eyebrow="Account & settings" title="More" />}>
      {/* Profile */}
      <Card>
        <View className="flex-row items-center gap-3.5">
          <View className="h-[54px] w-[54px] items-center justify-center rounded-full border border-primary/40 bg-primary/[0.12]">
            <Bold className="text-[18px] text-primary">{initials}</Bold>
          </View>
          <View className="flex-1">
            <Bold className="text-[17px]">{name}</Bold>
            {email ? <Small>{email}</Small> : null}
            {branch ? <Caption className="mt-0.5">{branch}</Caption> : null}
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
        <Row
          icon="notifications-outline"
          label="Notifications"
          badge={unread ?? undefined}
          onPress={() => router.push("/pages/notifications")}
        />
        <Divider />
        <Row
          icon="cloud-offline-outline"
          label="Offline & storage"
          hint={stats.count ? bytes(stats.bytes) : undefined}
          onPress={openStorage}
        />
      </Card>

      <View className="mt-2">
        <Button
          label="Sign out"
          variant="ghost"
          icon="log-out-outline"
          block
          onPress={async () => {
            await signOut();
            router.replace("/pages/auth/landing");
          }}
        />
      </View>
      </ScreenFrame>

      <Sheet visible={storageOpen} onClose={() => setStorageOpen(false)} title="Offline & storage" height={0.6}>
        <View className="gap-4 px-4 pb-3 pt-1">
          <Small>
            Screens you open are cached on this device so they load instantly and keep working offline. The cache
            refreshes on its own once you’re back online.
          </Small>

          <Card>
            <View className="flex-row items-end justify-between">
              <View>
                <Caption>Cached data</Caption>
                <Display size={30} className="mt-0.5">
                  {bytes(stats.bytes)}
                </Display>
              </View>
              <View className="items-end">
                <Caption>Responses</Caption>
                <Readout size={22} className="mt-0.5">
                  {stats.count}
                </Readout>
              </View>
            </View>
            <Divider className="my-3.5" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <LiveDot size={7} color={palette.signal.go} />
                <Small className="text-muted-foreground">Free on device</Small>
              </View>
              <Readout size={13} className="text-muted-foreground">
                {bytes(free)}
              </Readout>
            </View>
          </Card>

          <Button
            label={stats.count ? `Clear cache (${bytes(stats.bytes)})` : "Cache is empty"}
            variant="ghost"
            icon="trash-outline"
            block
            loading={clearing}
            disabled={stats.count === 0 || clearing}
            onPress={handleClear}
          />
          <Caption className="text-center text-muted-foreground">
            Clearing won’t sign you out — cached screens just reload from the server next time.
          </Caption>
        </View>
      </Sheet>
    </>
  );
}

function Row({ icon, label, hint, badge, onPress }: RowProps) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-[15px] active:opacity-70">
      <Icon name={icon} size={20} color={palette.mutedForeground} />
      <Bold className="flex-1 text-[15px]">{label}</Bold>
      {badge ? (
        <View className="min-w-[20px] items-center rounded-full bg-primary px-1.5 py-0.5">
          <Caption className="font-mono-semibold text-primary-foreground">{badge > 99 ? "99+" : badge}</Caption>
        </View>
      ) : null}
      {hint ? <Caption>{hint}</Caption> : null}
      <Icon name="chevron-forward" size={18} color={palette.mutedForeground} />
    </Pressable>
  );
}
