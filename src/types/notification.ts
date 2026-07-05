/**
 * Notification Log — Frappe's per-user notification bell. The mobile app reads
 * it through the generic `frappe.client.*` endpoints (see services/notifications).
 * We scope to ex_auto-related document types so the shop-floor bell never shows
 * unrelated ERP noise.
 */
export interface NotificationLog {
  name: string;
  subject: string;
  type?: string;
  for_user?: string;
  document_type?: string;
  document_name?: string;
  /** Frappe stores this as 0/1. */
  read: 0 | 1;
  creation: string;
}
