import { cachedCall, TTL } from "./cache";
import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  JobAction,
  JobCardCreate,
  JobCardDetail,
  JobCardListRow,
  JobCardStatus,
  ListJobsOpts,
  RequestPartsItem,
  StatusCounts,
} from "@/types/job-card";

const E = ENDPOINTS.jobCards;

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Fill any child tables the backend may omit so the detail screen never crashes. */
function normalizeJobCard(j: JobCardDetail): JobCardDetail {
  return {
    ...j,
    technicians: arr(j.technicians),
    parts: arr(j.parts),
    labor_items: arr(j.labor_items),
    checklist: arr(j.checklist),
    time_logs: arr(j.time_logs),
    parts_requisitions: arr(j.parts_requisitions),
    parts_returns: arr(j.parts_returns),
  };
}

/** Job Card endpoints (Part 5 §1) — ex_auto.api.job_cards + generic CRUD. */
export class JobCardService {
  static list(opts: ListJobsOpts = {}) {
    return cachedCall<JobCardListRow[]>(E.list, { limit: 50, start: 0, order_by: "modified desc", ...opts }, TTL.list);
  }
  static statusCounts(branch?: string) {
    return cachedCall<StatusCounts>(E.statusCounts, { branch }, TTL.counts);
  }
  static get(name: string) {
    return cachedCall<JobCardDetail>(E.getDetail, { name }, TTL.detail).then(normalizeJobCard);
  }
  static applyAction(name: string, action: JobAction) {
    return call<JobCardDetail>(E.applyAction, { name, action });
  }
  static setStatus(name: string, new_status: JobCardStatus) {
    return call<JobCardDetail>(E.setStatus, { name, new_status });
  }
  static startWork(name: string) {
    return call<JobCardDetail>(E.startWork, { name });
  }
  static submitForQc(name: string) {
    return call<JobCardDetail>(E.submitForQc, { name });
  }
  static passQc(name: string, remarks?: string) {
    return call<JobCardDetail>(E.passQc, { name, remarks });
  }
  static failQc(name: string, remarks: string) {
    return call<JobCardDetail>(E.failQc, { name, remarks });
  }
  static createSalesInvoice(name: string) {
    return call<{ invoice: string }>(E.createSalesInvoice, { name });
  }
  static markDelivered(name: string, signature?: string, acknowledgment?: string) {
    return call<JobCardDetail>(E.markDelivered, { name, signature, acknowledgment });
  }
  static addTechnician(name: string, p: { technician: string; role?: string; is_primary?: boolean; allocated_hours?: number }) {
    return call<JobCardDetail>(E.addTechnician, { name, ...p });
  }
  static addLaborItem(name: string, p: { service_type: string; estimated_hours?: number; technician?: string; rate?: number; status?: string }) {
    return call<JobCardDetail>(E.addLaborItem, { name, ...p });
  }
  static updateLaborStatus(name: string, idx: number, status: string, actual_hours?: number) {
    return call<JobCardDetail>(E.updateLaborStatus, { name, idx, status, actual_hours });
  }
  static addChecklistItem(name: string, p: { checklist_item: string; category?: string; is_mandatory?: boolean; remarks?: string }) {
    return call<JobCardDetail>(E.addChecklistItem, { name, ...p });
  }
  static addChecklistFromTemplate(name: string, template: string) {
    return call<JobCardDetail>(E.addChecklistFromTemplate, { name, template });
  }
  static updateChecklistItem(name: string, idx: number, result: string, remarks?: string) {
    return call<JobCardDetail>(E.updateChecklistItem, { name, idx, result, remarks });
  }
  static addTimeLog(name: string, p: { operation: string; from_time: string; to_time: string; technician?: string; notes?: string; billable?: boolean }) {
    return call<JobCardDetail>(E.addTimeLog, { name, ...p });
  }
  static requestParts(name: string, items: RequestPartsItem[], notes?: string, is_urgent?: boolean) {
    return call<{ requisition: string }>(E.requestParts, { name, items, notes, is_urgent: !!is_urgent });
  }
  static create(doc: JobCardCreate) {
    return call<JobCardDetail>(ENDPOINTS.crud.insert, { doc: { doctype: "Job Card", naming_series: "JC-.YYYY.-", ...doc } });
  }
  static patch(name: string, fields: Partial<JobCardCreate>) {
    return call<JobCardDetail>(ENDPOINTS.crud.setValue, { doctype: "Job Card", name, fieldname: fields });
  }
}

// ── public API — one function per responsibility ──
export const listJobs = (opts?: ListJobsOpts) => JobCardService.list(opts);
export const jobStatusCounts = (branch?: string) => JobCardService.statusCounts(branch);
export const getJobCard = (name: string) => JobCardService.get(name);
export const applyJobAction = (name: string, action: JobAction) => JobCardService.applyAction(name, action);
export const setJobStatus = (name: string, status: JobCardStatus) => JobCardService.setStatus(name, status);
export const startJobWork = (name: string) => JobCardService.startWork(name);
export const submitJobForQc = (name: string) => JobCardService.submitForQc(name);
export const passJobQc = (name: string, remarks?: string) => JobCardService.passQc(name, remarks);
export const failJobQc = (name: string, remarks: string) => JobCardService.failQc(name, remarks);
export const createJobSalesInvoice = (name: string) => JobCardService.createSalesInvoice(name);
export const markJobDelivered = (name: string, signature?: string, acknowledgment?: string) =>
  JobCardService.markDelivered(name, signature, acknowledgment);
export const addJobTechnician = (name: string, p: Parameters<typeof JobCardService.addTechnician>[1]) => JobCardService.addTechnician(name, p);
export const addJobLaborItem = (name: string, p: Parameters<typeof JobCardService.addLaborItem>[1]) => JobCardService.addLaborItem(name, p);
export const updateJobLaborStatus = (name: string, idx: number, status: string, actual_hours?: number) =>
  JobCardService.updateLaborStatus(name, idx, status, actual_hours);
export const addJobChecklistItem = (name: string, p: Parameters<typeof JobCardService.addChecklistItem>[1]) => JobCardService.addChecklistItem(name, p);
export const loadJobChecklistTemplate = (name: string, template: string) => JobCardService.addChecklistFromTemplate(name, template);
export const updateJobChecklistItem = (name: string, idx: number, result: string, remarks?: string) =>
  JobCardService.updateChecklistItem(name, idx, result, remarks);
export const addJobTimeLog = (name: string, p: Parameters<typeof JobCardService.addTimeLog>[1]) => JobCardService.addTimeLog(name, p);
export const requestJobParts = (name: string, items: RequestPartsItem[], notes?: string, is_urgent?: boolean) =>
  JobCardService.requestParts(name, items, notes, is_urgent);
export const createJobCard = (doc: JobCardCreate) => JobCardService.create(doc);
export const patchJobCard = (name: string, fields: Partial<JobCardCreate>) => JobCardService.patch(name, fields);
