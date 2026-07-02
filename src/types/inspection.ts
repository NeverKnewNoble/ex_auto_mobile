/**
 * Inspection Report shapes (docs/job card and parts.md Part 3).
 * naming_series INS-.YYYY.-. Hangs off a Job Card or stands alone.
 */

export type InspectionStatus = "Draft" | "In Progress" | "Completed" | "Failed" | "Cancelled";

export type InspectionType =
  | "Pre-service"
  | "Quality Control"
  | "Pre-delivery"
  | "Insurance"
  | "Safety"
  | "General";

export type ItemResult = "Pending" | "OK" | "Attention" | "Failed" | "Not Applicable";
export type Severity = "Low" | "Medium" | "High" | "Critical";
export type OverallResult = "Pass" | "Pass with notes" | "Fail";

/** Workflow actions for inspections.apply_action. */
export type InspectionAction = "Start Inspection" | "Mark Pass" | "Mark Fail" | "Cancel";

export const INSPECTION_TYPES: InspectionType[] = [
  "Pre-service",
  "Quality Control",
  "Pre-delivery",
  "Insurance",
  "Safety",
  "General",
];

export interface InspectionItem {
  checklist_item: string;
  category: string;
  is_mandatory: 0 | 1 | boolean;
  result: ItemResult;
  severity?: Severity;
  remarks?: string;
  photo?: string; // File URL
}

export interface InspectionPhoto {
  caption: string;
  thumb_color: string;
}

export interface InspectionProgress {
  total: number;
  completed: number;
}

export interface InspectionListRow {
  name: string;
  status: InspectionStatus;
  inspection_type: InspectionType;
  inspection_date: string;
  job_card?: string;
  vehicle: string;
  license_plate: string;
  make_model: string;
  inspector_name: string;
  branch: string;
  overall_result?: OverallResult;
  items_pass: number;
  items_fail: number;
  items_attention: number;
}

export interface InspectionDetail {
  name: string;
  status: InspectionStatus;
  inspection_type: InspectionType;
  inspection_date: string;
  job_card?: string;
  vehicle: string;
  license_plate: string;
  make_model: string;
  inspector?: string;
  inspector_name: string;
  branch: string;
  odometer_reading?: number;
  checklist_template?: string;
  // rollup
  overall_result?: OverallResult;
  items_pass: number;
  items_fail: number;
  items_attention: number;
  summary?: string;
  completed_at?: string;
  // children
  items: InspectionItem[];
  photos: InspectionPhoto[];
  progress: InspectionProgress;
  // sign-off
  customer_signature?: string;
  inspector_signature?: string;
  docstatus?: 0 | 1 | 2;
}

/** Payload for the create form (frappe.client.insert). */
export interface InspectionCreate {
  inspection_type: InspectionType;
  inspection_date: string;
  branch?: string;
  job_card?: string;
  inspector?: string;
  checklist_template?: string;
  vehicle: string;
  license_plate?: string;
  odometer_reading?: number;
  summary?: string;
}

export type StatusCounts = Record<string, number>;

/** Tone for an item result — OK→go, Attention→warn, Failed→stop. */
export function itemResultStatus(result: ItemResult): string {
  switch (result) {
    case "OK":
      return "OK";
    case "Attention":
      return "Attention";
    case "Failed":
      return "Failed";
    case "Not Applicable":
      return "Draft";
    default:
      return "Pending";
  }
}

// ── service option / result shapes (ex_auto.api.inspections) ──

export interface InspectionFilters {
  status?: string | string[];
  branch?: string;
  inspection_type?: InspectionType;
}

export interface ListInspectionsOpts {
  filters?: InspectionFilters;
  search?: string;
  limit?: number;
  start?: number;
}

export interface UpdateInspectionItemInput {
  result: ItemResult;
  remarks?: string;
  severity?: Severity;
  photo?: string;
}

export interface SubmitReportResult {
  name: string;
  status: string;
  docstatus: number;
  already_submitted?: boolean;
}

export type FindForJobCardResult = { name: string; status: string; inspection_type: string; docstatus: number } | null;
