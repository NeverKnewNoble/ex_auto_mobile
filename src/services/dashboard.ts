import { call } from "./client";
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
    return call<DashboardSnapshot>(E.snapshot, { branch });
  }
  static kpisPrimary(branch?: string) {
    return call<PrimaryKpis>(E.kpisPrimary, { branch });
  }
  static kpisSecondary(branch?: string) {
    return call<SecondaryKpis>(E.kpisSecondary, { branch });
  }
  static floorLive(limit = 6, branch?: string) {
    return call<FloorLiveJob[]>(E.workshopFloorLive, { limit, branch });
  }
  static todayPulse(branch?: string) {
    return call<TodayPulse>(E.todayPulse, { branch });
  }
  static statusMix(branch?: string) {
    return call<StatusMixEntry[]>(E.statusMix, { branch });
  }
  static attentionFeed(limit = 8) {
    return call<AttentionItem[]>(E.attentionFeed, { limit });
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
