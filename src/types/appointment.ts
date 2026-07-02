/**
 * Appointment shapes (docs/job card and parts.md §4.4).
 */

export type AppointmentStatus = "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show";

export interface AppointmentListRow {
  name: string;
  status: AppointmentStatus;
  appointment_date: string;
  appointment_time: string; // ISO datetime
  end_time?: string;
  customer_name: string;
  customer_mobile: string;
  license_plate: string;
  make_model: string;
  service_name?: string;
  services_summary?: string;
  primary_technician_name?: string;
  job_card?: string;
}

export interface AppointmentDetail extends AppointmentListRow {
  customer: string;
  customer_email?: string;
  vehicle: string;
  odometer_reading?: number;
  warranty_status?: string;
  complaint?: string;
  notes?: string;
  branch: string;
  bay?: string;
  service_advisor_name?: string;
}

export interface TodaySummary {
  date: string;
  total: number;
  by_status: Record<string, number>;
  confirmed: number;
  pending: number;
  in_progress: number;
  completed: number;
}

// ── service option shapes (ex_auto.api.appointments) ──

export interface AppointmentFilters {
  appointment_date?: string;
  branch?: string;
  status?: string;
}

export interface ListAppointmentsOpts {
  filters?: AppointmentFilters;
  search?: string;
  limit?: number;
  order_by?: string;
}
