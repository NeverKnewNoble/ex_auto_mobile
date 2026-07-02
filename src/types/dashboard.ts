/**
 * Dashboard shapes (docs/job card and parts.md Part 4). Every endpoint is a
 * silent read scoped by optional `branch`.
 */
import type { IconName } from "@/components";
import type { JobCardStatus, Priority } from "./job-card";
import type { AppointmentStatus } from "./appointment";

export interface PrimaryKpis {
  jobs_on_floor: number;
  today_appointments: number;
  appointments_unconfirmed: number;
  bay_utilization_pct: number;
  bay_load: number;
  bay_capacity: number;
  revenue_mtd: number;
}

export interface SecondaryKpis {
  pipeline_value: number;
  warranty_open: number;
  parts_short: number;
  amc_due: number;
}

export interface FloorLiveJob {
  name: string;
  status: JobCardStatus;
  priority: Priority;
  make_model?: string;
  license_plate?: string;
  primary_technician_name?: string;
  expected_delivery_date?: string;
}

export interface PulseAppointment {
  name: string;
  status: AppointmentStatus;
  appointment_time: string;
  customer_name: string;
  license_plate: string;
  service_name?: string;
}

export interface PulseEstimate {
  name: string;
  customer_name: string;
  amount: number;
  status: string;
}

export interface PulseReminder {
  name: string;
  label: string;
  due: string;
}

export interface TodayPulse {
  appointments: PulseAppointment[];
  estimates: PulseEstimate[];
  reminders: PulseReminder[];
}

export interface StatusMixEntry {
  status: string;
  count: number;
}

export interface AttentionItem {
  name: string;
  kind: "job" | "requisition" | "inspection" | "appointment";
  label: string;
  detail: string;
  tone: "warn" | "stop" | "info";
  ref?: string;
}

export interface DashboardSnapshot {
  kpis_primary: PrimaryKpis;
  kpis_secondary: SecondaryKpis;
  workshop_floor_live: FloorLiveJob[];
  today_pulse: TodayPulse;
  status_mix: StatusMixEntry[];
  attention_feed: AttentionItem[];
}

export interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  subTone?: string;
  valueSize?: number;
  icon: IconName;
  onPress?: () => void;
  className?: string;
}

export interface FloorRowProps {
  job: FloorLiveJob;
  onPress: () => void;
}

export interface PulseRowProps {
  appt: PulseAppointment;
  onPress: () => void;
}

export interface AttentionRowProps {
  item: AttentionItem;
  color: string;
  onPress: () => void;
}
