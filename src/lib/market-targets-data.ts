import type { Confidence } from "@/components/dashboard/badges";

export type TargetStatus = "Ahead" | "Behind" | "On Track";

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

export const TARGET_RECORDS: TargetRecord[] = [
  {
    id: "chicago-il",
    location: "Chicago, IL",
    confidence: "Medium Confidence",
    status: "Behind",
    cases: { current: 4250, target: 5000 },
    distribution: { current: 98, target: 120 },
    dateRange: "1 Jan 2025 - 31 Mar 2025",
    dayCurrent: 60,
    dayTotal: 90,
    timeElapsedPct: 0.67,
    apSpend: 12000,
    apBudget: 25000,
    momentumNote: "Strong Active in primary channels",
    activityLabel: "Low Activity",
  },
  {
    id: "austin-tx",
    location: "Austin, TX",
    confidence: "High Confidence",
    status: "Ahead",
    cases: { current: 3600, target: 4000 },
    distribution: { current: 74, target: 80 },
    dateRange: "1 Jan 2025 - 31 Mar 2025",
    dayCurrent: 60,
    dayTotal: 90,
    timeElapsedPct: 0.67,
    apSpend: 9000,
    apBudget: 15000,
    momentumNote: "Momentum building across on-premise",
    activityLabel: "Strong Activity",
  },
  {
    id: "denver-co",
    location: "Denver, CO",
    confidence: "Low Confidence",
    status: "Behind",
    cases: { current: 1240, target: 3000 },
    distribution: { current: 34, target: 80 },
    dateRange: "1 Jan 2025 - 31 Mar 2025",
    dayCurrent: 60,
    dayTotal: 90,
    timeElapsedPct: 0.67,
    apSpend: 4000,
    apBudget: 20000,
    momentumNote: "Coverage gaps in off-premise",
    activityLabel: "Low Activity",
  },
  {
    id: "miami-fl",
    location: "Miami, FL",
    confidence: "Medium Confidence",
    status: "Ahead",
    cases: { current: 2800, target: 3200 },
    distribution: { current: 52, target: 60 },
    dateRange: "1 Jan 2025 - 31 Mar 2025",
    dayCurrent: 60,
    dayTotal: 90,
    timeElapsedPct: 0.67,
    apSpend: 7000,
    apBudget: 12000,
    momentumNote: "Ahead across key channels",
    activityLabel: "Strong Activity",
  },
];

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

// ── Record Monthly Actuals — prior-month comparison cards ─────────────────────

export type DeltaTone = "up" | "down" | "flat";

export interface PrevMonthValue {
  month: string;
  value: string;
  delta?: string;
  deltaTone?: DeltaTone;
  note?: string;
}

export const RECORD_ACTUALS_PREV: Record<
  "target" | "month" | "cases" | "distribution" | "apSpend" | "notes",
  PrevMonthValue
> = {
  target: { month: "May 2025", value: "—", note: "No data" },
  month: { month: "May 2025", value: "May 2025" },
  cases: { month: "May 2025", value: "1,250", delta: "+12%", deltaTone: "up" },
  distribution: { month: "May 2025", value: "15", delta: "0%", deltaTone: "flat" },
  apSpend: { month: "May 2025", value: "$1,200", delta: "-8%", deltaTone: "down" },
  notes: { month: "May 2025", value: "No notes" },
};
