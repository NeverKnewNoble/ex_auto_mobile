import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Divider,
  ErrorState,
  Fab,
  FieldReadout,
  Icon,
  AppointmentDetailSkeleton,
  ReadoutRow,
  Screen,
  SectionLabel,
  Small,
  StatusPill,
  type IconName,
} from "@/components";
import { useAction } from "@/hooks/use-action";
import { useFetch } from "@/hooks/use-fetch";
import {
  cancelAppointment,
  confirmAppointment,
  getAppointment,
  markAppointmentNoShow,
  startAppointmentVisit,
} from "@/services";
import { dateTimeShort, num } from "@/lib/format";
import { useTheme } from "@/theme";
import { primaryFab } from "@/utils/appointment-detail";
import type { MetaProps } from "@/types/appointment-detail";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette } = useTheme();
  const { data: appt, loading, error, refresh } = useFetch(() => getAppointment(id), [id]);
  const { run, busy } = useAction();

  if (loading)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Appointment" />
        <AppointmentDetailSkeleton />
      </Screen>
    );
  if (error || !appt)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Appointment" />
        <ErrorState message={error ?? "Not found"} onRetry={refresh} />
      </Screen>
    );

  const act = (fn: () => Promise<unknown>, success: string) => run(fn, { success, onDone: refresh });
  const fab = primaryFab(appt, {
    openJob: (n) => router.replace({ pathname: "/pages/job-detail", params: { id: n } }),
    startJob: () => router.push("/pages/job-create"),
    confirm: () => act(() => confirmAppointment(appt.name), "Confirmed"),
    startVisit: () => act(() => startAppointmentVisit(appt.name), "Visit started"),
  });

  const showSecondary = !appt.job_card && (appt.status === "Pending" || appt.status === "Confirmed");

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={appt.name} title={appt.make_model} titleSize={24} />

        <View className="flex-row items-center gap-2.5">
          <StatusPill status={appt.status} live={appt.status === "In Progress"} />
          <View className="flex-row items-center gap-1.5">
            <Icon name="time-outline" size={15} color={palette.mutedForeground} />
            <Caption>{dateTimeShort(appt.appointment_time)}</Caption>
          </View>
        </View>

        {/* Customer & vehicle */}
        <Card>
          <SectionLabel>Customer & vehicle</SectionLabel>
          <ReadoutRow>
            <FieldReadout flex label="Customer" value={appt.customer_name} />
            <FieldReadout flex label="Mobile" value={appt.customer_mobile} />
          </ReadoutRow>
          <Divider className="my-3" />
          <ReadoutRow>
            <FieldReadout flex label="Plate" value={appt.license_plate} />
            <FieldReadout flex label="Odometer" value={appt.odometer_reading ? `${num(appt.odometer_reading)} km` : "—"} />
          </ReadoutRow>
          {appt.warranty_status ? (
            <View className="mt-3 flex-row items-center gap-2.5">
              <Caption>Warranty</Caption>
              <StatusPill status={appt.warranty_status === "Active" ? "Active" : appt.warranty_status} small />
            </View>
          ) : null}
        </Card>

        {/* Service */}
        <Card>
          <SectionLabel>Service</SectionLabel>
          <Bold className="mt-1 text-[15px]">{appt.service_name ?? appt.services_summary ?? "Service"}</Bold>
          {appt.complaint ? <Small className="mt-1.5">{appt.complaint}</Small> : null}
          <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
            {appt.bay ? <Meta icon="location-outline" text={appt.bay} /> : null}
            {appt.service_advisor_name ? <Meta icon="person-outline" text={appt.service_advisor_name} /> : null}
            {appt.primary_technician_name ? <Meta icon="construct-outline" text={appt.primary_technician_name} /> : null}
            {appt.end_time ? <Meta icon="hourglass-outline" text={`ends ${dateTimeShort(appt.end_time)}`} /> : null}
          </View>
        </Card>

        {showSecondary && (
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button label="No show" variant="ghost" icon="close-circle-outline" block onPress={() => act(() => markAppointmentNoShow(appt.name), "Marked no-show")} />
            </View>
            <View className="flex-1">
              <Button label="Cancel" variant="ghost" icon="ban" block onPress={() => act(() => cancelAppointment(appt.name), "Cancelled")} />
            </View>
          </View>
        )}

        <Small className="px-1">
          {appt.job_card
            ? `Job card ${appt.job_card} is open for this visit.`
            : "Confirm arrival, start the visit, then open a job card to begin work."}
        </Small>
      </Screen>

      {fab ? <Fab label={busy ? "Working…" : fab.label} icon={fab.icon} onPress={fab.onPress} /> : null}
    </View>
  );
}

function Meta({ icon, text }: MetaProps) {
  const { palette } = useTheme();
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={15} color={palette.mutedForeground} />
      <Caption>{text}</Caption>
    </View>
  );
}
