import { useRouter, type Href } from "expo-router";
import { View } from "react-native";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Readout,
  Screen,
  Small,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { listNotifications, markNotificationRead } from "@/services";
import { timeAgo } from "@/lib/format";
import { useTheme } from "@/theme";
import type { NotificationLog } from "@/types/notification";

/** Document types we can deep-link to, with each detail screen's param name. */
const ROUTES: Partial<Record<string, { pathname: string; key: "id" | "name" }>> = {
  "Job Card": { pathname: "/pages/job-detail", key: "id" },
  "Parts Requisition": { pathname: "/pages/requisition-detail", key: "name" },
  "Inspection Report": { pathname: "/pages/inspection-detail", key: "name" },
  Appointment: { pathname: "/pages/appointment-detail", key: "id" },
};

/** Frappe subjects can carry HTML — flatten to plain text for the list. */
function plain(subject: string): string {
  return subject
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Notifications() {
  const router = useRouter();
  const { data, loading, error, refresh, setData } = useFetch(() => listNotifications(30), []);

  const open = (n: NotificationLog) => {
    // Optimistically mark read, then fire-and-forget the server update.
    if (!n.read) {
      setData((prev) => (prev ?? []).map((x) => (x.name === n.name ? { ...x, read: 1 } : x)));
      markNotificationRead(n.name).catch(() => refresh());
    }
    const route = n.document_type ? ROUTES[n.document_type] : undefined;
    if (route && n.document_name) {
      // pathname is computed from the doc type, so it can't be statically typed.
      router.push({ pathname: route.pathname, params: { [route.key]: n.document_name } } as Href);
    }
  };

  return (
    <Screen>
      <AppHeader back eyebrow="Your activity" title="Notifications" />

      {loading ? (
        <LoadingState label="Loading notifications" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : !Array.isArray(data) || data.length === 0 ? (
        <EmptyState icon="notifications-off-outline" title="No notifications" hint="Job, parts and inspection updates land here." />
      ) : (
        data.map((n) => <NotificationRow key={n.name} n={n} onPress={() => open(n)} />)
      )}
    </Screen>
  );
}

function NotificationRow({ n, onPress }: { n: NotificationLog; onPress: () => void }) {
  const { palette } = useTheme();
  const unread = !n.read;
  const linkable = n.document_type ? ROUTES[n.document_type] : undefined;

  return (
    <Card onPress={onPress} accent={unread ? "bg-primary" : undefined}>
      <View className="flex-row items-start gap-3">
        <View className="mt-1">
          <Icon
            name={unread ? "notifications" : "notifications-outline"}
            size={18}
            color={unread ? palette.primary : palette.mutedForeground}
          />
        </View>

        <View className="flex-1">
          <Bold className={`text-[15px] leading-[20px] ${unread ? "" : "text-muted-foreground"}`}>
            {plain(n.subject) || n.document_type || "Notification"}
          </Bold>

          <View className="mt-1.5 flex-row items-center gap-2">
            {n.document_type ? (
              <Readout size={12} weight="semibold" className="text-muted-foreground">
                {n.document_type}
                {n.document_name ? ` · ${n.document_name}` : ""}
              </Readout>
            ) : null}
          </View>

          <View className="mt-1.5 flex-row items-center gap-2">
            <Caption>{timeAgo(n.creation)}</Caption>
            {linkable ? (
              <>
                <Caption>·</Caption>
                <Small className="text-primary">Open</Small>
              </>
            ) : null}
          </View>
        </View>

        {unread ? <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" /> : null}
      </View>
    </Card>
  );
}
