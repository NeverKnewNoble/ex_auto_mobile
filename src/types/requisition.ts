/**
 * Parts Requisition shapes — mirror the Frappe `Parts Requisition` doctype
 * (docs/job card and parts.md §2). Reserve-only: stock is relieved at invoice
 * submit, never here.
 */

export type RequisitionStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Issued"
  | "Partially Issued"
  | "Cancelled";

/** Workflow actions for parts.apply_requisition_action. */
export type RequisitionAction = "Submit" | "Approve" | "Issue" | "Partial Issue" | "Cancel";

export interface RequisitionItem {
  item_code: string;
  item_name: string;
  description?: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
  available_qty: number;
  is_issued: boolean;
  warehouse?: string;
}

/** Derived per-line state the detail renders. */
export type LineState = "issued" | "ready" | "short";

export interface RequisitionListRow {
  name: string;
  status: RequisitionStatus;
  requested_at: string;
  job_card?: string;
  branch: string;
  requested_by_name?: string;
  warehouse?: string;
  is_urgent: boolean;
  total_amount: number;
  items_count: number;
  short_count: number;
}

export interface RequisitionReadiness {
  total: number;
  issued: number;
  ready: number;
  short: number;
}

export interface RequisitionDetail {
  name: string;
  status: RequisitionStatus;
  requested_at: string;
  job_card?: string;
  branch: string;
  requested_by?: string;
  requested_by_name?: string;
  warehouse?: string;
  is_urgent: boolean;
  total_amount: number;
  notes?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  issued_by?: string;
  issued_by_name?: string;
  issued_at?: string;
  stock_entry?: string;
  items: RequisitionItem[];
  readiness: RequisitionReadiness;
}

/** Payload for the create form (frappe.client.insert). */
export interface RequisitionCreate {
  job_card: string;
  branch?: string;
  warehouse?: string;
  is_urgent: boolean;
  notes?: string;
  items: {
    item_code: string;
    item_name: string;
    qty: number;
    uom: string;
    rate: number;
    amount: number;
    available_qty: number;
    is_issued: boolean;
    warehouse?: string;
  }[];
}

export interface StoreKeeperSummary {
  open_requisitions: number;
  urgent_requisitions: number;
  awaiting_issue: number;
  short_lines: number;
  pending_returns: number;
}

export interface ItemAvailability {
  item_code: string;
  warehouse?: string;
  available_qty: number;
  reserved_qty?: number;
  uom?: string;
}

/** Derive the visible per-line state (matches desktop). */
export function lineState(item: RequisitionItem): LineState {
  if (item.is_issued) return "issued";
  return item.available_qty >= item.qty ? "ready" : "short";
}

export function shortQty(item: RequisitionItem): number {
  return Math.max(0, item.qty - item.available_qty);
}

// ── service option shapes (ex_auto.api.parts) ──

export interface RequisitionFilters {
  status?: RequisitionStatus | RequisitionStatus[];
  branch?: string;
  job_card?: string;
  warehouse?: string;
  requested_by?: string;
}

export interface ListRequisitionsOpts {
  filters?: RequisitionFilters;
  search?: string;
  urgent_only?: boolean;
  limit?: number;
  start?: number;
  order_by?: string;
}
