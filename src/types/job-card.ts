/**
 * Job Card shapes — mirror the Frappe `Job Card` doctype + child tables exactly
 * (docs/job card and parts.md §1.3). Field names match the API payload so the
 * mobile client is a 1:1 swap on the same backend.
 */

export type JobCardStatus =
  | "Draft"
  | "Approved"
  | "Scheduled"
  | "In Progress"
  | "Quality Check"
  | "Completed"
  | "Invoiced"
  | "Delivered"
  | "Cancelled";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type FuelLevel = "" | "Empty" | "1/4" | "1/2" | "3/4" | "Full";

/** Generic workflow actions accepted by job_cards.apply_action. */
export type JobAction =
  | "Approve"
  | "Schedule"
  | "Start Work"
  | "Send to QC"
  | "Pass QC"
  | "Mark Invoiced"
  | "Deliver"
  | "Cancel"
  | "Reopen";

export interface JobTechnicianRow {
  technician: string;
  technician_name: string;
  role?: string;
  is_primary: 0 | 1 | boolean;
  allocated_hours?: number;
  actual_hours?: number;
}

export interface JobPartRow {
  item_code: string;
  item_name: string;
  qty: number;
  actual_qty_used?: number;
  uom: string;
  rate: number;
  amount: number;
  warehouse?: string;
  is_reserved?: boolean;
  is_issued?: boolean;
}

export type LaborStatus = "Pending" | "In Progress" | "Completed";

export interface JobLaborRow {
  service_type: string;
  service_name: string;
  estimated_hours: number;
  actual_hours?: number;
  rate: number;
  amount: number;
  technician?: string;
  status: LaborStatus;
}

export type ChecklistResult = "" | "Pass" | "Fail" | "N/A";

export interface JobChecklistRow {
  checklist_item: string;
  category?: string;
  is_mandatory: 0 | 1 | boolean;
  result: ChecklistResult;
  remarks?: string;
}

export interface JobTimeLogRow {
  technician: string;
  technician_name: string;
  operation: string;
  from_time: string;
  to_time?: string;
  duration_hours: number;
  billable: 0 | 1 | boolean;
}

export interface JobRequisitionLink {
  name: string;
  status: string;
  requested_at: string;
  is_urgent: boolean;
  total_amount: number;
  warehouse?: string;
  approved_at?: string;
  issued_at?: string;
  stock_entry?: string;
  modified?: string;
}

export interface JobReturnLink {
  name: string;
  status: string;
  return_date: string;
  return_reason: string;
  stock_entry?: string;
  credit_note?: string;
}

/** Lightweight row for the list screen — renders a card without a second fetch. */
export interface JobCardListRow {
  name: string;
  status: JobCardStatus;
  priority: Priority;
  customer_name: string;
  customer_mobile: string;
  make_model: string;
  license_plate: string;
  branch: string;
  primary_technician_name: string;
  expected_delivery_date?: string;
  grand_total: number;
  modified: string;
}

export interface JobCardDetail {
  // Header / identity
  name: string;
  status: JobCardStatus;
  priority: Priority;
  posting_date: string;
  expected_delivery_date?: string;
  branch: string;
  service_advisor?: string;
  customer: string;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  vehicle: string;
  license_plate: string;
  make_model: string;
  odometer_reading: number;
  fuel_level: FuelLevel;
  // Complaint
  customer_complaints: string;
  diagnosis_summary: string;
  service_advisor_notes: string;
  // Technician
  primary_technician?: string;
  primary_technician_name?: string;
  // Child tables
  technicians: JobTechnicianRow[];
  parts: JobPartRow[];
  labor_items: JobLaborRow[];
  checklist: JobChecklistRow[];
  time_logs: JobTimeLogRow[];
  parts_requisitions: JobRequisitionLink[];
  parts_returns: JobReturnLink[];
  // Totals
  parts_total: number;
  labor_total: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  rounded_total?: number;
  // Lifecycle stamps
  started_at?: string;
  completed_at?: string;
  qc_passed_at?: string;
  delivered_at?: string;
  qc_inspector?: string;
  qc_remarks?: string;
  // Links
  service_estimate?: string;
  appointment?: string;
  sales_invoice?: string;
  warranty_claim?: string;
  customer_signature?: string;
  delivery_acknowledgment?: string;
}

/** Payload for the create form (frappe.client.insert). */
export interface JobCardCreate {
  posting_date: string;
  expected_delivery_date?: string;
  branch: string;
  priority: Priority;
  service_advisor?: string;
  primary_technician?: string;
  service_estimate?: string;
  customer: string;
  customer_mobile?: string;
  customer_email?: string;
  vehicle: string;
  license_plate?: string;
  make_model?: string;
  odometer_reading?: number;
  fuel_level?: FuelLevel;
  customer_complaints: string;
  diagnosis_summary?: string;
  service_advisor_notes?: string;
}

/** Item shape for job_cards.request_parts. */
export interface RequestPartsItem {
  item_code: string;
  qty: number;
  uom?: string;
  warehouse?: string;
}

export type StatusCounts = Record<string, number>;

// ── service option shapes (ex_auto.api.job_cards) ──

export interface JobFilters {
  status?: JobCardStatus | JobCardStatus[];
  branch?: string;
  priority?: Priority;
}

export interface ListJobsOpts {
  filters?: JobFilters;
  search?: string;
  limit?: number;
  start?: number;
  order_by?: string;
}
