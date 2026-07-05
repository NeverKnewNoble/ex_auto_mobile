import { cachedCall, TTL } from "./cache";
import { ENDPOINTS } from "./endpoints";
import type {
  AttentionItem,
  DashboardSnapshot,
  FloorLiveJob,
  PrimaryKpis,
  SecondaryKpis,
  StatusMixEntry,
  TodayPulse,
} from "@/types/dashboard";

const E = ENDPOINTS.dashboard;

/** Dashboard endpoints (Part 5 §4) — silent reads, optional branch. */
export class DashboardService {
  static snapshot(branch?: string) {
    return cachedCall<DashboardSnapshot>(E.snapshot, { branch }, TTL.summary);
  }
  static kpisPrimary(branch?: string) {
    return cachedCall<PrimaryKpis>(E.kpisPrimary, { branch }, TTL.summary);
  }
  static kpisSecondary(branch?: string) {
    return cachedCall<SecondaryKpis>(E.kpisSecondary, { branch }, TTL.summary);
  }
  static floorLive(limit = 6, branch?: string) {
    return cachedCall<FloorLiveJob[]>(E.workshopFloorLive, { limit, branch }, TTL.list);
  }
  static todayPulse(branch?: string) {
    return cachedCall<TodayPulse>(E.todayPulse, { branch }, TTL.summary);
  }
  static statusMix(branch?: string) {
    return cachedCall<StatusMixEntry[]>(E.statusMix, { branch }, TTL.summary);
  }
  static attentionFeed(limit = 8) {
    return cachedCall<AttentionItem[]>(E.attentionFeed, { limit }, TTL.list);
  }
}

// ── public API ──
export const getDashboardSnapshot = (branch?: string) => DashboardService.snapshot(branch);
export const getPrimaryKpis = (branch?: string) => DashboardService.kpisPrimary(branch);
export const getSecondaryKpis = (branch?: string) => DashboardService.kpisSecondary(branch);
export const getWorkshopFloorLive = (limit?: number, branch?: string) => DashboardService.floorLive(limit, branch);
export const getTodayPulse = (branch?: string) => DashboardService.todayPulse(branch);
export const getStatusMix = (branch?: string) => DashboardService.statusMix(branch);
export const getAttentionFeed = (limit?: number) => DashboardService.attentionFeed(limit);
