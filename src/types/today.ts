import type { AppointmentListRow } from "@/types/appointment";

export interface AppointmentRowProps {
  appt: AppointmentListRow;
  onPress: () => void;
}
