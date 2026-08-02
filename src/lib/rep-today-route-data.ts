import { Droplet, Menu, Tag, type LucideIcon } from "lucide-react-native";

export const ROUTE = {
  title: "Lower Manhattan Run",
  conversion: "Conversion",
  sampleData: "Sample Data",
  stopsLabel: "5 stops",
};

export type StopStatus = "green" | "amber" | "red";

export interface RouteStop {
  id: string;
  index: number;
  name: string;
  location: string;
  status: StopStatus;
}

export const ROUTE_STOPS: RouteStop[] = [
  { id: "copper-still", index: 1, name: "The Copper Still", location: "SoHo, NYC", status: "green" },
  { id: "velvet-room", index: 2, name: "Velvet Room", location: "NoLita, NYC", status: "green" },
  { id: "spirit-vine", index: 3, name: "Spirit & Vine", location: "SoHo, NYC", status: "amber" },
  { id: "blind-pig", index: 4, name: "The Blind Pig", location: "East Village, NYC", status: "green" },
  { id: "les-wines", index: 5, name: "LES Wines & Spirits", location: "Lower East Side, NYC", status: "red" },
];

export const ROUTE_PROGRESS = {
  completed: 0,
  total: 5,
  green: 3,
  amber: 1,
  red: 1,
};

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

export const ORDER_STATUS_COUNTS = {
  received: 1,
  processing: 2,
  shipped: 4,
  delayed: 1,
};

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

export const RECENT_ORDERS: Order[] = [
  { id: "0041", name: "The Copper Still", orderNo: "#ORD-2026-0041", date: "Feb 10", status: "Delivered" },
  { id: "0040", name: "Velvet Room", orderNo: "#ORD-2026-0040", date: "Feb 9", status: "Shipped" },
  { id: "0039", name: "Market Street Bistro", orderNo: "#ORD-2026-0039", date: "Feb 8", status: "Processing" },
  { id: "0038", name: "The Botanist", orderNo: "#ORD-2026-0038", date: "Feb 7", status: "Delayed" },
  { id: "0037", name: "Harbour & Hops", orderNo: "#ORD-2026-0037", date: "Feb 6", status: "Delivered" },
  { id: "0036", name: "The Gilded Fox", orderNo: "#ORD-2026-0036", date: "Feb 5", status: "Received" },
  { id: "0035", name: "Slate & Grain", orderNo: "#ORD-2026-0035", date: "Feb 4", status: "Shipped" },
];

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

export const ACTIVITY_NOTE = {
  title: "These are example entries",
  body: "They demonstrate what effective activity logging looks like. Your real activities will replace these after you start logging interactions.",
};

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

export const ACTIVITY_ENTRIES: ActivityEntry[] = [
  {
    id: "copper-room",
    name: "The Copper Room",
    icon: Droplet,
    date: "May 21",
    status: "Progressed",
    location: "SoHo • Sampling",
    tags: ["Broken Barrier Tequila", "On Premise"],
    description:
      "Bartender loved the blanco expression. Interested in signature serve for summer menu.",
    next: "Follow up with cocktail menu proposal",
  },
  {
    id: "agave-dreams",
    name: "Agave Dreams",
    icon: Menu,
    date: "May 20",
    status: "Blocked",
    location: "East Village • Menu Discussion",
    tags: ["Good Intentions Mezcal", "On Premise"],
    description:
      "Buyer interested but current distributor relationship blocking. Need to address channel conflict.",
    next: "Reconnect after distributor alignment",
  },
  {
    id: "borough-wines",
    name: "Borough Wines",
    icon: Tag,
    date: "May 19",
    status: "Progressed",
    location: "Brooklyn • Intro",
    tags: ["Broken Barrier Tequila", "Good Intentions Mezcal", "Off Premise"],
    description:
      "Independent retailer actively looking for premium agave. Strong fit for emerging brands.",
    next: "Send pricing and tasting samples",
  },
];

export const PIPELINE_NEEDS_ATTENTION: PipelineItem[] = [
  { id: "copper-still", name: "The Copper Still", amount: "£3,200", stage: "Proposal", date: "2026-05-24", progress: 0.6 },
  { id: "sunset-social", name: "Sunset Social", amount: "£4,500", stage: "Committed", date: "2026-05-26", progress: 1 },
  { id: "brooklyn-craft", name: "Brooklyn Craft Co", amount: "£1,800", stage: "Qualified", date: "2026-05-26", progress: 0.4 },
  { id: "elysium", name: "Elysium Lounge", amount: "£1,500", stage: "Qualified", date: "2026-05-18", progress: 0.35 },
];
