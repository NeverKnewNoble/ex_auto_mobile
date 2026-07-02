import type { InspectionDetail, OverallResult } from "@/types/inspection";

/** Pass → OK, Pass with notes → Attention, Fail → Failed. */
export function overallStatus(r: OverallResult): string {
  return r === "Pass" ? "OK" : r === "Pass with notes" ? "Attention" : "Failed";
}

export function patchItem(prev: InspectionDetail, idx: number, patch: Partial<InspectionDetail["items"][number]>): InspectionDetail {
  const items = prev.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
  const completed = items.filter((i) => i.result !== "Pending").length;
  return { ...prev, items, progress: { ...prev.progress, completed } };
}
