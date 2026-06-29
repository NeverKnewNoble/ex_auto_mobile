import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  Divider,
  Fab,
  FieldReadout,
  Icon,
  ReadoutRow,
  Screen,
  SectionLabel,
  Small,
  StatusPill,
} from "@/components";
import { appointments, jobCards, vehicles } from "@/data/mock";
import { dayLabel, num, timeOf } from "@/lib/format";
import { useTheme } from "@/theme";

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette } = useTheme();

  const appt = appointments.find((a) => a.name === id) ?? appointments[0];
  const vehicle = vehicles.find((v) => v.plate === appt.vehiclePlate);
  const existingJob = jobCards.find((j) => j.vehiclePlate === appt.vehiclePlate);

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={appt.name} title={appt.vehicleLabel} titleSize={26} />

        <View className="flex-row items-center gap-2.5">
          <StatusPill status={appt.status} live={appt.status === "Checked In"} />
          <View className="flex-row items-center gap-1.5">
            <Icon name="time-outline" size={15} color={palette.mutedForeground} />
            <Caption>
              {dayLabel(appt.time)} · {timeOf(appt.time)}
            </Caption>
          </View>
        </View>

        {/* Customer + vehicle */}
        <Card>
          <SectionLabel>Customer & vehicle</SectionLabel>
          <ReadoutRow>
            <FieldReadout flex label="Customer" value={appt.customerName} />
            <FieldReadout flex label="Plate" value={appt.vehiclePlate} />
          </ReadoutRow>
          <Divider className="my-3" />
          {vehicle ? (
            <ReadoutRow>
              <FieldReadout flex label="Odometer" value={`${num(vehicle.odometer)} km`} />
              <FieldReadout flex label="VIN" value={vehicle.vin} />
            </ReadoutRow>
          ) : (
            <Small>No vehicle record matched this plate.</Small>
          )}
          {vehicle ? (
            <View className="mt-3">
              <FieldReadout
                label="Warranty"
                value={vehicle.warrantyStatus + (vehicle.warrantyUntil ? ` · until ${vehicle.warrantyUntil}` : "")}
              />
            </View>
          ) : null}
        </Card>

        {/* Complaint */}
        <Card>
          <SectionLabel>Reported complaint</SectionLabel>
          <Bold className="mt-1 text-[15px]">{appt.serviceType}</Bold>
          <Small className="mt-1.5">{appt.complaint}</Small>
          {appt.bay ? (
            <View className="mt-3 flex-row items-center gap-1.5">
              <Icon name="location-outline" size={15} color={palette.mutedForeground} />
              <Caption>Assigned to {appt.bay}</Caption>
            </View>
          ) : null}
        </Card>

        <Small className="px-1">
          {existingJob
            ? `A job card already exists for this vehicle (${existingJob.name}).`
            : "Starting a job card converts this appointment into live work."}
        </Small>
      </Screen>

      <Fab
        label={existingJob ? "Open job card" : "Start job card"}
        icon={existingJob ? "open-outline" : "play"}
        onPress={() =>
          existingJob
            ? router.replace({ pathname: "/pages/job-detail", params: { id: existingJob.name } })
            : router.replace("/pages/jobs")
        }
      />
    </View>
  );
}
