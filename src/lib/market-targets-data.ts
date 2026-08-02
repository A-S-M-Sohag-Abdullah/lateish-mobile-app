import type { Confidence } from "@/components/dashboard/badges";

export type TargetStatus = "Ahead" | "Behind" | "On Track";

/** Display record for a market target — mapped from the API in useMarketTargets. */
export interface TargetRecord {
  id: string;
  location: string;
  confidence: Confidence;
  status: TargetStatus;
  cases: { current: number; target: number };
  distribution: { current: number; target: number };
  // Detail fields
  dateRange: string;
  dayCurrent: number;
  dayTotal: number;
  timeElapsedPct: number;
  apSpend: number;
  apBudget: number;
  momentumNote: string;
  /** Short activity label shown in the card footer. */
  activityLabel: string;
}

/** Top-of-page aggregate tiles (computed from the API — see useMarketTargets). */
export interface TargetSummary {
  cases: string;
  distribution: string;
  apSpend: string;
  markets: string;
  momentum: string;
}

export const TARGET_FILTERS = ["Active Targets", "Ahead", "Behind"] as const;
export type TargetFilter = (typeof TARGET_FILTERS)[number];

export function filterTargets(
  records: TargetRecord[],
  filter: TargetFilter,
): TargetRecord[] {
  if (filter === "Ahead") return records.filter((t) => t.status === "Ahead");
  if (filter === "Behind") return records.filter((t) => t.status === "Behind");
  return records;
}

// ── Record Monthly Actuals — comparison card shape ────────────────────────────

export type DeltaTone = "up" | "down" | "flat";

export interface PrevMonthValue {
  month: string;
  value: string;
  delta?: string;
  deltaTone?: DeltaTone;
  note?: string;
}
