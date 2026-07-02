import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  TodaySkeleton,
  Readout,
  ScreenFrame,
  SectionLabel,
  Small,
  StatusPill,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { getTodaySummary, listTodayAppointments } from "@/services";
import { dayLabel, timeOf } from "@/lib/format";
import { useTheme } from "@/theme";
import type { AppointmentRowProps } from "@/types/today";

const TODAY = "2026-06-29";

export default function Today() {
  const router = useRouter();
  const summary = useFetch(() => getTodaySummary(), []);
  const { data: rows, loading, error, refresh } = useFetch(() => listTodayAppointments(TODAY), []);

  const s = summary.data;
  const stats = [
    { label: "Booked", value: s?.total ?? 0, tone: "text-foreground" },
    { label: "Confirmed", value: s?.confirmed ?? 0, tone: "text-foreground" },
    { label: "Pending", value: s?.pending ?? 0, tone: "text-signal-warn" },
    { label: "Done", value: s?.completed ?? 0, tone: "text-signal-go" },
  ];

  return (
    <ScreenFrame header={<AppHeader back eyebrow={dayLabel(TODAY)} title="Appointments" />}>
      <View className="flex-row gap-2">
        {stats.map((st) => (
          <Card key={st.label} compact className="flex-1">
            <Readout size={22} weight="semibold" className={st.tone}>
              {st.value}
            </Readout>
            <Caption className="mt-0.5">{st.label}</Caption>
          </Card>
        ))}
      </View>

      <SectionLabel right={<Caption>{rows?.length ?? 0}</Caption>}>Schedule</SectionLabel>

      {loading ? (
        <TodaySkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : !Array.isArray(rows) || rows.length === 0 ? (
        <EmptyState icon="today-outline" title="No appointments today" />
      ) : (
        rows.map((appt) => (
          <AppointmentRow
            key={appt.name}
            appt={appt}
            onPress={() => router.push({ pathname: "/pages/appointment-detail", params: { id: appt.name } })}
          />
        ))
      )}
    </ScreenFrame>
  );
}

function AppointmentRow({ appt, onPress }: AppointmentRowProps) {
  const { palette } = useTheme();
  const live = appt.status === "In Progress";

  return (
    <Card onPress={onPress} accent={live ? "bg-signal-info" : undefined}>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="time-outline" size={16} color={palette.mutedForeground} />
          <Readout size={17} weight="semibold">
            {timeOf(appt.appointment_time)}
          </Readout>
        </View>
        <StatusPill status={appt.status} live={live} small />
      </View>

      <Bold className="text-[16px]">{appt.make_model}</Bold>
      <View className="mt-0.5 flex-row items-center gap-2">
        <Readout size={13} className="text-muted-foreground">
          {appt.license_plate}
        </Readout>
        <Caption>·</Caption>
        <Caption>{appt.customer_name}</Caption>
      </View>

      {appt.service_name || appt.services_summary ? (
        <Small numberOfLines={1} className="mt-2">
          {appt.service_name ?? appt.services_summary}
        </Small>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        {appt.primary_technician_name ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name="person-outline" size={14} color={palette.mutedForeground} />
            <Caption>{appt.primary_technician_name}</Caption>
          </View>
        ) : (
          <Caption>Unassigned</Caption>
        )}
        <View className="flex-row items-center gap-2">
          {appt.job_card ? <Caption className="text-signal-info">{appt.job_card}</Caption> : null}
          <Icon name="chevron-forward" size={18} color={palette.mutedForeground} />
        </View>
      </View>
    </Card>
  );
}
