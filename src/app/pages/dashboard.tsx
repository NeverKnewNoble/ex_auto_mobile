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
  DashboardSkeleton,
  Readout,
  ScreenFrame,
  SectionLabel,
  Small,
  StatusPill,
  type IconName,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { getDashboardSnapshot } from "@/services";
import { dateShort, money, timeOf } from "@/lib/format";
import { useTheme } from "@/theme";
import type { AttentionRowProps, FloorRowProps, KpiProps, PulseRowProps } from "@/types/dashboard";
import { routeAttention } from "@/utils/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const { palette } = useTheme();
  const { data: snap, loading, error, refresh } = useFetch(() => getDashboardSnapshot(), []);

  const header = (
    <AppHeader
      eyebrow="Today"
      title="Workshop"
      actions={[
        { icon: "refresh", onPress: refresh },
        { icon: "search", onPress: () => router.push("/pages/lookup") },
      ]}
    />
  );

  if (loading)
    return (
      <ScreenFrame header={header}>
        <DashboardSkeleton />
      </ScreenFrame>
    );
  if (error || !snap)
    return (
      <ScreenFrame header={header}>
        <ErrorState message={error ?? "Couldn’t load"} onRetry={refresh} />
      </ScreenFrame>
    );

  // Be tolerant of partial/absent/wrong-typed panels from the live backend.
  const k = snap.kpis_primary ?? ({} as Partial<typeof snap.kpis_primary>);
  const floor = Array.isArray(snap.workshop_floor_live) ? snap.workshop_floor_live : [];
  const pulse = Array.isArray(snap.today_pulse?.appointments) ? snap.today_pulse.appointments : [];
  const attention = Array.isArray(snap.attention_feed) ? snap.attention_feed : [];

  return (
    <ScreenFrame header={header}>
      {/* Headline KPIs */}
      <View className="flex-row flex-wrap gap-2">
        <Kpi
          className="w-[48.5%]"
          label="Jobs on Floor"
          value={`${k.jobs_on_floor ?? 0}`}
          onPress={() => router.push("/pages/jobs")}
          icon="construct"
        />
        <Kpi
          className="w-[48.5%]"
          label="Today’s Appointments"
          value={`${k.today_appointments ?? 0}`}
          sub={(k.appointments_unconfirmed ?? 0) > 0 ? `${k.appointments_unconfirmed} unconfirmed` : "all confirmed"}
          subTone={(k.appointments_unconfirmed ?? 0) > 0 ? "text-signal-warn" : "text-muted-foreground"}
          onPress={() => router.push("/pages/today")}
          icon="today"
        />
        <Kpi className="w-[48.5%]" label="Bay Utilisation" value={`${k.bay_utilization_pct ?? 0}%`} sub={`${k.bay_load ?? 0}/${k.bay_capacity ?? 0} bays`} icon="grid" />
        <Kpi className="w-[48.5%]" label="Revenue MTD" value={money(k.revenue_mtd ?? 0)} valueSize={20} icon="cash" />
      </View>

      {/* Workshop floor live */}
      <SectionLabel right={<Caption>{floor.length}</Caption>}>On the floor</SectionLabel>
      {floor.length === 0 ? (
        <EmptyState icon="construct-outline" title="Floor is clear" />
      ) : (
        floor.map((job) => (
          <FloorRow key={job.name} job={job} onPress={() => router.push({ pathname: "/pages/job-detail", params: { id: job.name } })} />
        ))
      )}

      {/* Today's pulse */}
      <SectionLabel right={<Caption>{pulse.length}</Caption>}>Today’s pulse</SectionLabel>
      {pulse.length === 0 ? (
        <EmptyState icon="today-outline" title="No appointments today" />
      ) : (
        pulse.map((a) => (
          <PulseRow key={a.name} appt={a} onPress={() => router.push({ pathname: "/pages/appointment-detail", params: { id: a.name } })} />
        ))
      )}

      {/* Attention feed */}
      <SectionLabel right={<Caption>{attention.length}</Caption>}>Needs attention</SectionLabel>
      {attention.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" title="All clear" />
      ) : (
        attention.map((it) => (
          <AttentionRow
            key={`${it.kind}-${it.name}`}
            item={it}
            color={palette.signal[it.tone]}
            onPress={() => routeAttention(router, it)}
          />
        ))
      )}
    </ScreenFrame>
  );
}

function Kpi({
  label,
  value,
  sub,
  subTone = "text-muted-foreground",
  valueSize = 30,
  icon,
  onPress,
  className,
}: KpiProps) {
  const { palette } = useTheme();
  return (
    <Card onPress={onPress} className={className}>
      <View className="mb-1 flex-row items-center justify-between">
        <Caption>{label}</Caption>
        <Icon name={icon} size={15} color={palette.mutedForeground} />
      </View>
      <Readout size={valueSize} weight="semibold">
        {value}
      </Readout>
      {sub ? <Caption className={`mt-0.5 ${subTone}`}>{sub}</Caption> : null}
    </Card>
  );
}

function FloorRow({ job, onPress }: FloorRowProps) {
  const { palette } = useTheme();
  const hot = job.priority === "Urgent" || job.priority === "High";
  return (
    <Card compact onPress={onPress} accent={hot ? "bg-signal-stop" : undefined}>
      <View className="flex-row items-center justify-between">
        <Readout size={14} weight="semibold" className="text-muted-foreground">
          {job.name}
        </Readout>
        <View className="flex-row items-center gap-2">
          <StatusPill status={job.priority} small />
          <StatusPill status={job.status} small live={job.status === "In Progress"} />
        </View>
      </View>
      <Bold className="mt-1.5 text-[15px]">{job.make_model}</Bold>
      <View className="mt-1 flex-row items-center gap-2">
        <Readout size={12} className="text-muted-foreground">
          {job.license_plate}
        </Readout>
        <Caption>· {job.primary_technician_name || "Unassigned"}</Caption>
        <View className="flex-1" />
        <Icon name="flag-outline" size={13} color={palette.mutedForeground} />
        <Caption>{dateShort(job.expected_delivery_date)}</Caption>
      </View>
    </Card>
  );
}

function PulseRow({ appt, onPress }: PulseRowProps) {
  return (
    <Card compact onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <Readout size={15} weight="semibold">
          {timeOf(appt.appointment_time)}
        </Readout>
        <View className="flex-1">
          <Bold className="text-[14.5px]">{appt.customer_name}</Bold>
          <Caption>
            {appt.license_plate}
            {appt.service_name ? ` · ${appt.service_name}` : ""}
          </Caption>
        </View>
        <StatusPill status={appt.status} small live={appt.status === "In Progress"} />
      </View>
    </Card>
  );
}

function AttentionRow({ item, color, onPress }: AttentionRowProps) {
  return (
    <Card compact onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <Icon name="alert-circle" size={20} color={color} />
        <View className="flex-1">
          <Bold className="text-[14px]">{item.label}</Bold>
          {item.detail ? <Caption className="mt-0.5">{item.detail}</Caption> : null}
        </View>
        <Icon name="chevron-forward" size={16} color={color} />
      </View>
    </Card>
  );
}
