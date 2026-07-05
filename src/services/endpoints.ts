/**
 * Part 5 — Complete field → API URL map (docs/job card and parts.md).
 *
 * Single source of truth for every backend method path. Each value is the
 * dotted `<module>.<fn>` passed to `call()`, which POSTs to
 * `${API_BASE}/api/method/<path>` per "How API calls work". Use `apiUrl()` for
 * the full URL (e.g. for multipart uploads that bypass `call()`).
 *
 * Mirrors the appendix exactly — including endpoints not yet wired to a screen
 * (branch_load, top_technicians, search_service_types, frappe.client.get) so the
 * map is complete.
 */
import { getApiBase } from "./config";

export const ENDPOINTS = {
  // Auth — custom login that returns the user's API key/secret (+ user details),
  // generating them server-side if the user doesn't have a key yet.
  auth: {
    login: "ex_auto.api.auth.login",
    logout: "ex_auto.api.auth.logout",
    me: "ex_auto.api.auth.me",
  },

  // Part 1 — Job Cards (ex_auto.api.job_cards)
  jobCards: {
    list: "ex_auto.api.job_cards.list_jobs",
    statusCounts: "ex_auto.api.job_cards.status_counts",
    getDetail: "ex_auto.api.job_cards.get_detail",
    applyAction: "ex_auto.api.job_cards.apply_action",
    setStatus: "ex_auto.api.job_cards.set_status",
    startWork: "ex_auto.api.job_cards.start_work",
    submitForQc: "ex_auto.api.job_cards.submit_for_qc",
    passQc: "ex_auto.api.job_cards.pass_qc",
    failQc: "ex_auto.api.job_cards.fail_qc",
    createSalesInvoice: "ex_auto.api.job_cards.create_sales_invoice",
    markDelivered: "ex_auto.api.job_cards.mark_delivered",
    addTechnician: "ex_auto.api.job_cards.add_technician",
    addLaborItem: "ex_auto.api.job_cards.add_labor_item",
    updateLaborStatus: "ex_auto.api.job_cards.update_labor_status",
    addChecklistItem: "ex_auto.api.job_cards.add_checklist_item",
    addChecklistFromTemplate: "ex_auto.api.job_cards.add_checklist_from_template",
    updateChecklistItem: "ex_auto.api.job_cards.update_checklist_item",
    addTimeLog: "ex_auto.api.job_cards.add_time_log",
    requestParts: "ex_auto.api.job_cards.request_parts",
  },

  // Part 2 — Parts Requisition (ex_auto.api.parts)
  parts: {
    list: "ex_auto.api.parts.list_requisitions",
    statusCounts: "ex_auto.api.parts.requisition_status_counts",
    storeKeeperSummary: "ex_auto.api.parts.store_keeper_summary",
    getRequisition: "ex_auto.api.parts.get_requisition",
    itemAvailability: "ex_auto.api.parts.get_item_availability",
    applyAction: "ex_auto.api.parts.apply_requisition_action",
    approve: "ex_auto.api.parts.approve_requisition",
    markIssued: "ex_auto.api.parts.mark_issued",
    cancel: "ex_auto.api.parts.cancel_requisition",
  },

  // Part 3 — Inspections (ex_auto.api.inspections)
  inspections: {
    list: "ex_auto.api.inspections.list_inspections",
    statusCounts: "ex_auto.api.inspections.status_counts",
    getDetail: "ex_auto.api.inspections.get_detail",
    applyAction: "ex_auto.api.inspections.apply_action",
    updateItem: "ex_auto.api.inspections.update_item",
    loadTemplate: "ex_auto.api.inspections.load_template",
    submitReport: "ex_auto.api.inspections.submit_report",
    createForJobCard: "ex_auto.api.inspections.create_for_job_card",
    findForJobCard: "ex_auto.api.inspections.find_for_job_card",
    createJobCardFromInspection: "ex_auto.api.inspections.create_job_card_from_inspection",
  },

  // Part 4 — Dashboard (ex_auto.api.dashboard)
  dashboard: {
    snapshot: "ex_auto.api.dashboard.snapshot",
    kpisPrimary: "ex_auto.api.dashboard.kpis_primary",
    kpisSecondary: "ex_auto.api.dashboard.kpis_secondary",
    workshopFloorLive: "ex_auto.api.dashboard.workshop_floor_live",
    todayPulse: "ex_auto.api.dashboard.today_pulse",
    statusMix: "ex_auto.api.dashboard.status_mix",
    branchLoad: "ex_auto.api.dashboard.branch_load",
    topTechnicians: "ex_auto.api.dashboard.top_technicians",
    attentionFeed: "ex_auto.api.dashboard.attention_feed",
  },

  // Part 4 — Appointments (ex_auto.api.appointments)
  appointments: {
    list: "ex_auto.api.appointments.list_appointments",
    getDetail: "ex_auto.api.appointments.get_detail",
    todaySummary: "ex_auto.api.appointments.today_summary",
    statusCounts: "ex_auto.api.appointments.status_counts",
    confirm: "ex_auto.api.appointments.confirm",
    startVisit: "ex_auto.api.appointments.start_visit",
    complete: "ex_auto.api.appointments.complete",
    cancel: "ex_auto.api.appointments.cancel",
    markNoShow: "ex_auto.api.appointments.mark_no_show",
  },

  // Shared picker / typeahead URLs (ex_auto.api.search + module list endpoints)
  pickers: {
    searchCustomers: "ex_auto.api.search.search_customers",
    listCustomerVehicles: "ex_auto.api.search.list_customer_vehicles",
    listVehicles: "ex_auto.api.vehicles.list_vehicles",
    searchItems: "ex_auto.api.search.search_items",
    searchServiceTypes: "ex_auto.api.search.search_service_types",
    listBranches: "ex_auto.api.branches.list_branches",
    listTechnicians: "ex_auto.api.technicians.list_technicians",
    listJobs: "ex_auto.api.job_cards.list_jobs",
    listEstimates: "ex_auto.api.estimates.list_estimates",
  },

  // Shared generic CRUD URLs (frappe.client) + file upload
  crud: {
    insert: "frappe.client.insert",
    setValue: "frappe.client.set_value",
    save: "frappe.client.save",
    delete: "frappe.client.delete",
    get: "frappe.client.get",
    getList: "frappe.client.get_list",
    getCount: "frappe.client.get_count",
    uploadFile: "upload_file",
  },
} as const;

/** Full method URL for a dotted path — `${getApiBase()}/api/method/<path>`. */
export function apiUrl(method: string): string {
  return `${getApiBase()}/api/method/${method}`;
}
