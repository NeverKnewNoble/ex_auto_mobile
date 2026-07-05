import { cachedCall, TTL } from "./cache";
import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import { getSession } from "./session";
import type { NotificationLog } from "@/types/notification";

const C = ENDPOINTS.crud;
const DOCTYPE = "Notification Log";

/**
 * The ex_auto document types whose notifications belong on the shop-floor bell.
 * Notification Log is owner-scoped by Frappe, but this filter keeps out any
 * unrelated ERP notifications the same user might also receive.
 */
export const EX_AUTO_DOCTYPES = [
  "Job Card",
  "Appointment",
  "Service Estimate",
  "Service Reminder",
  "Service Feedback",
  "Service Coupon",
  "Service Package",
  "Inspection Report",
  "Warranty Claim",
  "AMC Contract",
  "Parts Requisition",
  "Parts Return",
  "Workshop Branch",
  "Technician",
  "Service Type",
  "Customer",
  "Vehicle",
] as const;

const FIELDS = ["name", "subject", "type", "for_user", "document_type", "document_name", "read", "creation"];

/** Logged-in user id (email) — `for_user` on Notification Log. */
function currentUser(): string | undefined {
  const u = getSession()?.user;
  return u?.email || u?.name;
}

/**
 * Filters shared by list + count: this user, ex_auto doctypes only. `call()`
 * JSON-encodes the nested object per Frappe's contract, so we pass a plain
 * object here (no manual stringify).
 */
function scopeFilters(extra: Record<string, unknown> = {}): Record<string, unknown> {
  const user = currentUser();
  return {
    ...(user ? { for_user: user } : {}),
    document_type: ["in", EX_AUTO_DOCTYPES],
    ...extra,
  };
}

/** Notification Log via Frappe's generic client endpoints. */
export class NotificationService {
  static list(limit = 20): Promise<NotificationLog[]> {
    return cachedCall<NotificationLog[]>(
      C.getList,
      {
        doctype: DOCTYPE,
        fields: FIELDS,
        filters: scopeFilters(),
        order_by: "creation desc",
        limit_page_length: limit,
      },
      TTL.counts
    );
  }

  static unreadCount(): Promise<number> {
    return cachedCall<number>(
      C.getCount,
      {
        doctype: DOCTYPE,
        filters: scopeFilters({ read: 0 }),
      },
      TTL.counts
    );
  }

  static markRead(name: string): Promise<unknown> {
    return call(C.setValue, { doctype: DOCTYPE, name, fieldname: "read", value: 1 });
  }
}

// ── public API ──
export const listNotifications = (limit?: number) => NotificationService.list(limit);
export const unreadNotificationCount = () => NotificationService.unreadCount();
export const markNotificationRead = (name: string) => NotificationService.markRead(name);
