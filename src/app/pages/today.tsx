import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  Icon,
  Readout,
  ScreenFrame,
  SectionLabel,
  Small,
  StatusPill,
} from "@/components";
import { appointments, BRANCH } from "@/data/mock";
import { dayLabel, timeOf } from "@/lib/format";
import { useTheme } from "@/theme";
import type { Appointment } from "@/types";

export default function Today() {
  const router = useRouter();

  const checkedIn = appointments.filter((a) => a.status === "Checked In").length;
  const done = appointments.filter((a) => a.status === "Completed").length;
  const stats = [
    { label: "Booked", value: appointments.length },
    { label: "Checked in", value: checkedIn },
    { label: "Delivered", value: done },
  ];

  return (
    <ScreenFrame
      header={
        <AppHeader
          eyebrow={`${dayLabel("2026-06-28")} · ${BRANCH}`}
          title="Today"
          actions={[{ icon: "search", onPress: () => router.push("/pages/lookup") }]}
        />
      }
    >
      <View className="flex-row gap-2">
        {stats.map((s) => (
          <Card key={s.label} compact className="flex-1">
            <Readout size={26} weight="semibold">
              {s.value}
            </Readout>
            <Caption className="mt-0.5">{s.label}</Caption>
          </Card>
        ))}
      </View>

      <SectionLabel right={<Caption>{appointments.length} appts</Caption>}>Schedule</SectionLabel>

      {appointments.map((appt) => (
        <AppointmentCard
          key={appt.name}
          appt={appt}
          onPress={() => router.push({ pathname: "/pages/appointment-detail", params: { id: appt.name } })}
        />
      ))}
    </ScreenFrame>
  );
}

function AppointmentCard({ appt, onPress }: { appt: Appointment; onPress: () => void }) {
  const { palette } = useTheme();
  const live = appt.status === "Checked In";

  return (
    <Card onPress={onPress} accent={live ? "bg-signal-info" : undefined}>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="time-outline" size={16} color={palette.mutedForeground} />
          <Readout size={17} weight="semibold">
            {timeOf(appt.time)}
          </Readout>
        </View>
        <StatusPill status={appt.status} live={live} small />
      </View>

      <Bold className="text-[16px]">{appt.vehicleLabel}</Bold>
      <View className="mb-2 mt-0.5 flex-row items-center gap-2">
        <Readout size={13} className="text-muted-foreground">
          {appt.vehiclePlate}
        </Readout>
        <Caption>·</Caption>
        <Caption>{appt.customerName}</Caption>
      </View>

      <Small numberOfLines={2}>{appt.complaint}</Small>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="rounded-full bg-muted px-2.5 py-1">
          <Caption>{appt.serviceType}</Caption>
        </View>
        <Icon name="chevron-forward" size={18} color={palette.mutedForeground} />
      </View>
    </Card>
  );
}
