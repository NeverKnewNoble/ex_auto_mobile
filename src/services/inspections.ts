import { cachedCall, TTL } from "./cache";
import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  FindForJobCardResult,
  InspectionAction,
  InspectionCreate,
  InspectionDetail,
  InspectionListRow,
  InspectionType,
  ListInspectionsOpts,
  StatusCounts,
  SubmitReportResult,
  UpdateInspectionItemInput,
} from "@/types/inspection";

const E = ENDPOINTS.inspections;

/** Fill missing items/photos/progress so the detail screen never crashes. */
function normalizeInspection(i: InspectionDetail): InspectionDetail {
  const items = Array.isArray(i.items) ? i.items : [];
  return {
    ...i,
    items,
    photos: Array.isArray(i.photos) ? i.photos : [],
    progress: i.progress ?? { total: items.length, completed: 0 },
    items_pass: i.items_pass ?? 0,
    items_fail: i.items_fail ?? 0,
    items_attention: i.items_attention ?? 0,
  };
}

/** Inspection Report endpoints (Part 5 §3) — ex_auto.api.inspections + generic CRUD. */
export class InspectionService {
  static list(opts: ListInspectionsOpts = {}) {
    return cachedCall<InspectionListRow[]>(
      E.list,
      { limit: 50, start: 0, order_by: "inspection_date desc, modified desc", ...opts },
      TTL.list
    );
  }
  static statusCounts(branch?: string) {
    return cachedCall<StatusCounts>(E.statusCounts, { branch }, TTL.counts);
  }
  static get(name: string) {
    return cachedCall<InspectionDetail>(E.getDetail, { name }, TTL.detail).then(normalizeInspection);
  }
  static applyAction(name: string, action: InspectionAction) {
    return call<InspectionDetail>(E.applyAction, { name, action });
  }
  static updateItem(name: string, idx: number, p: UpdateInspectionItemInput) {
    return call<InspectionDetail>(E.updateItem, { name, idx, ...p });
  }
  static loadTemplate(name: string, template: string) {
    return call<InspectionDetail>(E.loadTemplate, { name, template });
  }
  static submitReport(name: string) {
    return call<SubmitReportResult>(E.submitReport, { name });
  }
  static createForJobCard(p: { job_card: string; inspection_type?: InspectionType; template?: string }) {
    return call<string>(E.createForJobCard, p);
  }
  static findForJobCard(p: { job_card: string; inspection_type?: InspectionType }) {
    return cachedCall<FindForJobCardResult>(E.findForJobCard, p, TTL.counts);
  }
  static createJobCardFromInspection(name: string) {
    return call<string>(E.createJobCardFromInspection, { name });
  }
  static create(doc: InspectionCreate) {
    return call<InspectionDetail>(ENDPOINTS.crud.insert, { doc: { doctype: "Inspection Report", naming_series: "INS-.YYYY.-", ...doc } });
  }
  static patch(name: string, fields: Partial<InspectionCreate>) {
    return call<InspectionDetail>(ENDPOINTS.crud.setValue, { doctype: "Inspection Report", name, fieldname: fields });
  }
}

// ── public API ──
export const listInspections = (opts?: ListInspectionsOpts) => InspectionService.list(opts);
export const inspectionStatusCounts = (branch?: string) => InspectionService.statusCounts(branch);
export const getInspection = (name: string) => InspectionService.get(name);
export const applyInspectionAction = (name: string, action: InspectionAction) => InspectionService.applyAction(name, action);
export const updateInspectionItem = (name: string, idx: number, p: UpdateInspectionItemInput) => InspectionService.updateItem(name, idx, p);
export const loadInspectionTemplate = (name: string, template: string) => InspectionService.loadTemplate(name, template);
export const submitInspection = (name: string) => InspectionService.submitReport(name);
export const createInspectionForJobCard = (p: { job_card: string; inspection_type?: InspectionType; template?: string }) =>
  InspectionService.createForJobCard(p);
export const findInspectionForJobCard = (p: { job_card: string; inspection_type?: InspectionType }) => InspectionService.findForJobCard(p);
export const createJobCardFromInspection = (name: string) => InspectionService.createJobCardFromInspection(name);
export const createInspection = (doc: InspectionCreate) => InspectionService.create(doc);
export const patchInspection = (name: string, fields: Partial<InspectionCreate>) => InspectionService.patch(name, fields);
