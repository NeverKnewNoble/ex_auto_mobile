import { cachedCall, TTL } from "./cache";
import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { StatusCounts } from "@/types/job-card";
import type {
  ItemAvailability,
  ListRequisitionsOpts,
  RequisitionAction,
  RequisitionCreate,
  RequisitionDetail,
  RequisitionListRow,
  StoreKeeperSummary,
} from "@/types/requisition";

const E = ENDPOINTS.parts;

/** Fill missing items/readiness so the detail screen never crashes. */
function normalizeRequisition(r: RequisitionDetail): RequisitionDetail {
  return {
    ...r,
    items: Array.isArray(r.items) ? r.items : [],
    readiness: r.readiness ?? { total: 0, issued: 0, ready: 0, short: 0 },
  };
}

/** Parts Requisition endpoints (Part 5 §2) — ex_auto.api.parts + generic CRUD. */
export class PartsService {
  static list(opts: ListRequisitionsOpts = {}) {
    return cachedCall<RequisitionListRow[]>(
      E.list,
      { limit: 50, start: 0, order_by: "requested_at desc", urgent_only: false, ...opts },
      TTL.list
    );
  }
  static statusCounts() {
    return cachedCall<StatusCounts>(E.statusCounts, {}, TTL.counts);
  }
  static storeKeeperSummary() {
    return cachedCall<StoreKeeperSummary>(E.storeKeeperSummary, {}, TTL.summary);
  }
  static get(name: string) {
    return cachedCall<RequisitionDetail>(E.getRequisition, { name }, TTL.detail).then(normalizeRequisition);
  }
  static availability(items: { item_code: string; warehouse?: string }[], warehouse?: string) {
    return cachedCall<ItemAvailability[]>(E.itemAvailability, { items, warehouse }, TTL.counts);
  }
  static applyAction(name: string, action: RequisitionAction) {
    return call<RequisitionDetail>(E.applyAction, { name, action });
  }
  static approve(name: string) {
    return call<RequisitionDetail>(E.approve, { name });
  }
  static issue(name: string, stock_entry?: string) {
    return call<RequisitionDetail>(E.markIssued, { name, stock_entry });
  }
  static cancel(name: string) {
    return call<RequisitionDetail>(E.cancel, { name });
  }
  static create(doc: RequisitionCreate) {
    return call<RequisitionDetail>(ENDPOINTS.crud.insert, { doc: { doctype: "Parts Requisition", naming_series: "PR-.YYYY.-", ...doc } });
  }
  static save(doc: RequisitionDetail) {
    return call<RequisitionDetail>(ENDPOINTS.crud.save, { doc: { doctype: "Parts Requisition", ...doc } });
  }
  static remove(name: string) {
    return call<null>(ENDPOINTS.crud.delete, { doctype: "Parts Requisition", name });
  }
}

// ── public API ──
export const listRequisitions = (opts?: ListRequisitionsOpts) => PartsService.list(opts);
export const requisitionStatusCounts = () => PartsService.statusCounts();
export const getStoreKeeperSummary = () => PartsService.storeKeeperSummary();
export const getRequisition = (name: string) => PartsService.get(name);
export const checkItemAvailability = (items: { item_code: string; warehouse?: string }[], warehouse?: string) =>
  PartsService.availability(items, warehouse);
export const applyRequisitionAction = (name: string, action: RequisitionAction) => PartsService.applyAction(name, action);
export const approveRequisition = (name: string) => PartsService.approve(name);
export const issueRequisition = (name: string, stock_entry?: string) => PartsService.issue(name, stock_entry);
export const cancelRequisition = (name: string) => PartsService.cancel(name);
export const createRequisition = (doc: RequisitionCreate) => PartsService.create(doc);
export const saveRequisition = (doc: RequisitionDetail) => PartsService.save(doc);
export const deleteRequisition = (name: string) => PartsService.remove(name);
