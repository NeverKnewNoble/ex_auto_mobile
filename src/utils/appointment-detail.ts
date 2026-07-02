import type { IconName } from "@/components";
import type { AppointmentDetail } from "@/types/appointment";

export function primaryFab(
  appt: AppointmentDetail,
  h: { openJob: (n: string) => void; startJob: () => void; confirm: () => void; startVisit: () => void }
): { label: string; icon: IconName; onPress: () => void } | null {
  if (appt.job_card) return { label: "Open job card", icon: "open-outline", onPress: () => h.openJob(appt.job_card!) };
  switch (appt.status) {
    case "Pending":
      return { label: "Confirm", icon: "checkmark", onPress: h.confirm };
    case "Confirmed":
      return { label: "Start visit", icon: "play", onPress: h.startVisit };
    case "In Progress":
      return { label: "Open job card", icon: "construct", onPress: h.startJob };
    default:
      return null;
  }
}
