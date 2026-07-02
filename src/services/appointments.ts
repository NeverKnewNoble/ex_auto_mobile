import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  AppointmentDetail,
  AppointmentListRow,
  ListAppointmentsOpts,
  TodaySummary,
} from "@/types/appointment";
import type { StatusCounts } from "@/types/job-card";

const E = ENDPOINTS.appointments;

/** Appointment endpoints (Part 5 §4.4) — ex_auto.api.appointments. */
export class AppointmentService {
  static list(opts: ListAppointmentsOpts = {}) {
    return call<AppointmentListRow[]>(E.list, { limit: 50, order_by: "appointment_time asc", ...opts });
  }
  static listToday(date: string, branch?: string) {
    return call<AppointmentListRow[]>(E.list, { filters: { appointment_date: date, branch }, order_by: "appointment_time asc", limit: 50 });
  }
  static todaySummary(branch?: string) {
    return call<TodaySummary>(E.todaySummary, { branch });
  }
  static statusCounts() {
    return call<StatusCounts>(E.statusCounts, {});
  }
  static get(name: string) {
    return call<AppointmentDetail>(E.getDetail, { name });
  }
  static confirm(name: string) {
    return call<AppointmentDetail>(E.confirm, { name });
  }
  static startVisit(name: string) {
    return call<AppointmentDetail>(E.startVisit, { name });
  }
  static complete(name: string) {
    return call<AppointmentDetail>(E.complete, { name });
  }
  static cancel(name: string, reason?: string) {
    return call<AppointmentDetail>(E.cancel, { name, reason });
  }
  static markNoShow(name: string, reason?: string) {
    return call<AppointmentDetail>(E.markNoShow, { name, reason });
  }
}

// ── public API ──
export const listAppointments = (opts?: ListAppointmentsOpts) => AppointmentService.list(opts);
export const listTodayAppointments = (date: string, branch?: string) => AppointmentService.listToday(date, branch);
export const getTodaySummary = (branch?: string) => AppointmentService.todaySummary(branch);
export const appointmentStatusCounts = () => AppointmentService.statusCounts();
export const getAppointment = (name: string) => AppointmentService.get(name);
export const confirmAppointment = (name: string) => AppointmentService.confirm(name);
export const startAppointmentVisit = (name: string) => AppointmentService.startVisit(name);
export const completeAppointment = (name: string) => AppointmentService.complete(name);
export const cancelAppointment = (name: string, reason?: string) => AppointmentService.cancel(name, reason);
export const markAppointmentNoShow = (name: string, reason?: string) => AppointmentService.markNoShow(name, reason);
