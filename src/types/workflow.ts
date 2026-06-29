import type { SignalTone } from "@/theme";

/**
 * Mirrors `portal/src/types/workflow.ts` (`statusTone()`). Keep mobile and web
 * in lockstep — do not re-invent the mapping. Traffic-light semantics:
 *   go (green) · warn (amber) · stop (red) · info (blue, in-flight)
 */
const TONE_MAP: Record<string, SignalTone> = {
  // go — done / good
  Approved: "go",
  Active: "go",
  Completed: "go",
  Delivered: "go",
  Invoiced: "go",
  Paid: "go",
  Passed: "go",
  OK: "go",
  Available: "go",
  // warn — needs attention
  Pending: "warn",
  Scheduled: "warn",
  "Quality Check": "warn",
  "Expiring Soon": "warn",
  Draft: "warn",
  "On Hold": "warn",
  Attention: "warn",
  "Awaiting Parts": "warn",
  // stop — blocked / failed
  Cancelled: "stop",
  Rejected: "stop",
  Failed: "stop",
  "No Show": "stop",
  Overdue: "stop",
  // info — in flight
  Sent: "info",
  "In Progress": "info",
  Confirmed: "info",
  "Under Review": "info",
  "Checked In": "info",
  Requested: "info",
};

export function statusTone(status: string): SignalTone {
  return TONE_MAP[status] ?? "info";
}

/** Inspection checklist result → tone. OK→go, Attention→warn, Failed→stop. */
export type ChecklistResult = "OK" | "Attention" | "Failed" | null;

export function resultTone(result: ChecklistResult): SignalTone {
  if (result === "OK") return "go";
  if (result === "Attention") return "warn";
  if (result === "Failed") return "stop";
  return "info";
}
