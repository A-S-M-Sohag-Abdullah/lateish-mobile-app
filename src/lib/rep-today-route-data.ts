import { type LucideIcon } from "lucide-react-native";

export type StopStatus = "green" | "amber" | "red";

export interface RouteStop {
  id: string;
  index: number;
  name: string;
  location: string;
  status: StopStatus;
}

export const REP_TABS = [
  "Momentum",
  "Territory",
  "Pipeline",
  "Activity Log",
  "Debriefs",
  "Orders",
  "Brands",
  "Voice Notes",
] as const;

export const TERRITORY_COVERAGE = {
  activeVenues: 0,
  totalVenues: 0,
  coverage: 0,
};

export const TERRITORY_BRANDS = [
  "All Brands",
  "Brand 1",
  "Brand 2",
  "Brand 3",
  "Brand 4",
] as const;

export const TERRITORY_CHANNELS = [
  "All Channels",
  "On-Premise",
  "Off-Premise",
  "Independent",
  "National Chains",
] as const;

// ── Pipeline tab ──────────────────────────────────────────────────────────────

export interface PipelineItem {
  id: string;
  name: string;
  amount: string;
  stage: string;
  date: string;
  progress: number; // 0–1
  priority?: boolean; // red dot beside the name
}

export const PIPELINE_THIS_WEEK: PipelineItem[] = [
  { id: "aviary-west", name: "The Aviary West", amount: "£5,000", stage: "Proposal", date: "2026-05-31", progress: 0.7 },
  { id: "pacific", name: "Pacific Provisions", amount: "£2,200", stage: "Identified", date: "2026-06-02", progress: 0.3, priority: true },
];

export const PIPELINE_NEXT_2_WEEKS: PipelineItem[] = [];

// ── Orders tab ────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Delivered"
  | "Shipped"
  | "Processing"
  | "Delayed"
  | "Received";

export interface Order {
  id: string;
  name: string;
  orderNo: string;
  date: string;
  status: OrderStatus;
}

// ── Debriefs tab ──────────────────────────────────────────────────────────────

export interface GapAlert {
  id: string;
  name: string;
  avgPct: number;
  gaps: string[];
  analyzed: string;
  /** Left-edge accent colour. */
  accent: string;
}

export const GAP_ALERTS: GapAlert[] = [
  {
    id: "dm-1",
    name: "BDM dm-1",
    avgPct: 62,
    gaps: ["case price", "ros estimate", "next action due date"],
    analyzed: "18 debriefs analyzed",
    accent: "#3B82F6",
  },
  {
    id: "dm-2",
    name: "BDM dm-2",
    avgPct: 45,
    gaps: ["brand notes", "case price", "blocker type", "ros estimate"],
    analyzed: "12 debriefs analyzed",
    accent: "#D97706",
  },
];

export const SCORE_FILTER_OPTIONS = [
  "All Scores",
  "High (80%+)",
  "Medium (50-79%)",
  "Low (<50%)",
] as const;

export type DebriefBadge = "Exemplary" | "Revisit Account";

export interface Debrief {
  id: string;
  name: string;
  score: number;
  badge?: DebriefBadge;
  summary: string;
  tags: string[];
  comment?: string;
  revisitReason?: string;
  helperTag?: string;
  helperNote?: string;
  date: string;
  reviewRed?: boolean;
}

export const DEBRIEFS: Debrief[] = [
  {
    id: "copper-still",
    name: "The Copper Still",
    score: 42,
    summary: "Missing critical commercial data — no pricing or volume data captured.",
    tags: ["case price", "ros estimate", "brand notes"],
    date: "May 20, 6:21 PM",
  },
  {
    id: "riverside",
    name: "Riverside Cocktail Lounge",
    score: 68,
    badge: "Revisit Account",
    summary: "Good quality but missing follow-up timeline.",
    tags: ["next action due date"],
    comment: "Need to re-engage this account.",
    revisitReason:
      "Revisit reason: They were interested in a tasting event — follow up before competitor locks them in.",
    helperTag: "next action due date",
    helperNote: "Always set a concrete date here",
    date: "May 19, 6:21 PM",
    reviewRed: true,
  },
  {
    id: "market-street",
    name: "Market Street Bistro",
    score: 91,
    badge: "Exemplary",
    summary: "Excellent interaction record — all key fields captured.",
    tags: [],
    comment: "Outstanding debrief — share as a team example.",
    date: "May 18, 6:21 PM",
    reviewRed: true,
  },
];

/** green ≥ 80, amber ≥ 50, else red. */
export function scoreTone(pct: number): "green" | "amber" | "red" {
  if (pct >= 80) return "green";
  if (pct >= 50) return "amber";
  return "red";
}

// ── Activity Log tab ──────────────────────────────────────────────────────────

export type ActivityStatus = "Progressed" | "Blocked";

export interface ActivityEntry {
  id: string;
  name: string;
  icon: LucideIcon;
  date: string;
  status: ActivityStatus;
  location: string;
  tags: string[];
  description: string;
  next: string;
}

export const PIPELINE_NEEDS_ATTENTION: PipelineItem[] = [
  { id: "copper-still", name: "The Copper Still", amount: "£3,200", stage: "Proposal", date: "2026-05-24", progress: 0.6 },
  { id: "sunset-social", name: "Sunset Social", amount: "£4,500", stage: "Committed", date: "2026-05-26", progress: 1 },
  { id: "brooklyn-craft", name: "Brooklyn Craft Co", amount: "£1,800", stage: "Qualified", date: "2026-05-26", progress: 0.4 },
  { id: "elysium", name: "Elysium Lounge", amount: "£1,500", stage: "Qualified", date: "2026-05-18", progress: 0.35 },
];
