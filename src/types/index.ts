/**
 * Canonical response shapes for the mobile slices. Ported from the portal's
 * `src/types/*` interfaces — the source of truth for the Frappe API. Mobile
 * uses a subset; pricing/approval fields stay on the web portal.
 */

export interface Customer {
  name: string; // Frappe docname
  fullName: string;
  phone: string;
  email?: string;
}

export interface Vehicle {
  name: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  odometer: number; // km
  customer: string; // Customer.name
  warrantyStatus: "Active" | "Expiring Soon" | "Expired";
  warrantyUntil?: string; // ISO date
}

export interface Appointment {
  name: string;
  time: string; // ISO datetime
  status: "Scheduled" | "Confirmed" | "Checked In" | "No Show" | "Completed";
  customerName: string;
  vehiclePlate: string;
  vehicleLabel: string; // e.g. "2021 Toyota Hilux"
  complaint: string;
  serviceType: string;
  bay?: string;
}

export interface ChecklistTask {
  name: string;
  label: string;
  done: boolean;
}

export interface PartLine {
  name: string;
  partNo: string;
  description: string;
  qty: number;
  status: "Requested" | "Awaiting Parts" | "Available" | "Fitted";
}

export interface TimeLog {
  name: string;
  task: string;
  startedAt: string; // ISO
  endedAt?: string; // ISO — absent while running
}

export interface JobCard {
  name: string;
  status: "Scheduled" | "In Progress" | "Quality Check" | "Completed" | "Delivered";
  vehiclePlate: string;
  vehicleLabel: string;
  customerName: string;
  complaint: string;
  bay?: string;
  assignedTo: string;
  checklist: ChecklistTask[];
  parts: PartLine[];
  timeLogs: TimeLog[];
  photoCount: number;
  signedOff: boolean;
}

export interface InspectionItem {
  name: string;
  label: string;
  section: string;
  result: "OK" | "Attention" | "Failed" | null;
  note?: string;
  photoCount: number;
}

export interface Inspection {
  name: string;
  template: string; // "Walk-around", "Pre-delivery QC", "Damage report"
  status: "Draft" | "In Progress" | "Completed";
  vehiclePlate: string;
  vehicleLabel: string;
  inspector: string;
  startedAt: string;
  items: InspectionItem[];
  signed: boolean;
}

export interface Requisition {
  name: string;
  partNo: string;
  description: string;
  qty: number;
  forJob: string;
  status: "Requested" | "Under Review" | "Awaiting Parts" | "Available" | "Rejected";
  requestedAt: string;
}
