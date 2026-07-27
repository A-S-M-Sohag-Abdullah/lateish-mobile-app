/**
 * UI-preview data for the BDM Efficiency & ROI page (the BDM pager tab).
 * Mock data only — no API.
 */
import {
  Activity,
  ArrowRight,
  DollarSign,
  Layers,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";

export const BDM_OUTER_TABS = [
  "Efficiency ROI",
  "Benchmarking",
  "Cost Accountability",
  "Investment",
  "Cohorts",
] as const;

export const BDM_INNER_TABS = [
  "Efficiency",
  "Territory",
  "Attribution",
  "Channels",
  "Trends",
  "Costs",
] as const;

export interface CostRow {
  bdm: string;
  cpc: string;
  cpcTone: "green" | "red";
  venue: string;
  menu: string;
}
export const COSTS_TABLE: CostRow[] = [
  { bdm: "Territory Alpha", cpc: "$14.20", cpcTone: "green", venue: "$420", menu: "$680" },
  { bdm: "Territory Beta", cpc: "$18.50", cpcTone: "red", venue: "$510", menu: "$750" },
  { bdm: "Territory Gamma", cpc: "$22.40", cpcTone: "red", venue: "$620", menu: "$920" },
  { bdm: "Territory Delta", cpc: "$16.80", cpcTone: "green", venue: "$480", menu: "$710" },
];

export const BENCHMARKING_TABS = [
  "Benchmarks",
  "What Works",
  "Goal Settings",
] as const;

export const WHAT_GOOD_LOOKS_LIKE = [
  "Territory A is in the 92nd percentile with a composite index of 128. Key differentiator: superior cost efficiency — 35% above company average with the lowest CPC in the network.",
  "Territory B is in the 78th percentile with a composite index of 109. Key differentiator: consistent velocity growth — reorder intervals declining 12% month-over-month.",
];

export interface WhatWorksRow {
  activity: string;
  uplift: string;
  tone: "green" | "amber" | "grey";
  days: string;
}
export const WHAT_WORKS_ROWS: WhatWorksRow[] = [
  { activity: "Tasting Events", uplift: "+42%", tone: "green", days: "5d" },
  { activity: "Menu Placements", uplift: "+38%", tone: "green", days: "6d" },
  { activity: "Venue Visits", uplift: "+28%", tone: "green", days: "8d" },
  { activity: "Staff Sampling", uplift: "+35%", tone: "green", days: "9d" },
  { activity: "Staff Sampling / Training", uplift: "+22%", tone: "amber", days: "12d" },
  { activity: "Calls", uplift: "+12%", tone: "grey", days: "3d" },
];

export const BDM_PERIODS = [
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
] as const;

// ── Attribution inner tab ────────────────────────────────────────────────────

export interface AttrSummary {
  label: string;
  value: string;
  icon: LucideIcon;
  green: boolean;
}
export const ATTR_SUMMARY: AttrSummary[] = [
  { label: "Total Activities", value: "456", icon: Activity, green: false },
  { label: "Attributed Orders", value: "48", icon: ArrowRight, green: true },
  { label: "Attributed Revenue", value: "$77,440", icon: DollarSign, green: false },
];

export interface AttrBar {
  label: string;
  value: number;
  highlight: boolean;
}
export const ATTR_BARS: AttrBar[] = [
  { label: "Venue Visits", value: 145, highlight: false },
  { label: "Tastings", value: 90, highlight: false },
  { label: "Calls", value: 215, highlight: true },
  { label: "Training", value: 85, highlight: false },
  { label: "Menu Placement", value: 200, highlight: false },
];
export const ATTR_BAR_TICKS = [80, 120, 160, 200];

export interface AttrBreakdown {
  activity: string;
  count: number;
  orders: string;
  revenue: string;
  revActivity: string;
  avgDays: string;
}
export const ATTR_BREAKDOWN: AttrBreakdown[] = [
  { activity: "Venue Visits", count: 142, orders: "15.4", revenue: "$24,640", revActivity: "$174", avgDays: "8d" },
  { activity: "Tastings", count: 38, orders: "11.2", revenue: "$17,920", revActivity: "$472", avgDays: "5d" },
  { activity: "Calls", count: 210, orders: "7.1", revenue: "$11,360", revActivity: "$54", avgDays: "3d" },
  { activity: "Training", count: 22, orders: "4.3", revenue: "$6,880", revActivity: "$313", avgDays: "12d" },
  { activity: "Menu Placements", count: 16, orders: "4.8", revenue: "$7,680", revActivity: "$480", avgDays: "6d" },
  { activity: "Staff Sampling", count: 28, orders: "5.6", revenue: "$8,960", revActivity: "$320", avgDays: "9d" },
];

// ── Channels inner tab ───────────────────────────────────────────────────────

export const CHANNEL_SUMMARY: AttrSummary[] = [
  { label: "Channels Active", value: "4", icon: Layers, green: false },
  { label: "Total BDM Cost", value: "$8,000", icon: DollarSign, green: false },
  { label: "Total Revenue", value: "$59,520", icon: TrendingUp, green: false },
];

export interface ChannelBar {
  label: string;
  cost: number; // green
  revenue: number; // white
}
export const CHANNEL_BARS: ChannelBar[] = [
  { label: "On trade", cost: 18, revenue: 18 },
  { label: "Off trade", cost: 27, revenue: 27 },
  { label: "Distributor", cost: 13, revenue: 11 },
];
export const CHANNEL_AXIS_MAX = 30;
export const CHANNEL_TICKS = ["$30k", "$23k", "$15k", "$8k", "$0k"];

export interface ChannelRow {
  channel: string;
  accounts: number;
  cases: number;
  volume: number;
  cpc: string;
  cpcHighlight: boolean;
  cac: string;
}
export const CHANNEL_TABLE: ChannelRow[] = [
  { channel: "On-Trade", accounts: 12, cases: 185, volume: 185, cpc: "$22.70", cpcHighlight: false, cac: "$350" },
  { channel: "Off-Trade", accounts: 4, cases: 120, volume: 120, cpc: "$15.00", cpcHighlight: true, cac: "$450" },
  { channel: "Distributor", accounts: 2, cases: 45, volume: 45, cpc: "$26.67", cpcHighlight: false, cac: "$600" },
  { channel: "Hospitality", accounts: 3, cases: 22, volume: 22, cpc: "$36.36", cpcHighlight: false, cac: "$267" },
];

// ── Trends inner tab ─────────────────────────────────────────────────────────

export const CPC_TREND = {
  value: "$17.98",
  target: "$12",
  subtitle: "~4 months to target",
};
export const EFFICIENCY_TREND = {
  value: "78%",
  change: "+5% this period",
  subtitle: "Team-wide normalized score",
};
export const BDM_PERFORMANCE = { improving: 4, declining: 0, stable: 0 };

export const CPC_TRAJECTORY = [18, 18, 17.6, 16, 14.4, 14, 14, 14];
export const CPC_TARGET = 15;
export const CPC_AXIS_MAX = 20;
export const CPC_Y_TICKS = ["$20", "$15", "$10", "$5", "$0"];
export const CPC_X_LABELS = ["Jan", "Feb", "Mar", "Apr"];

export interface ScatterPoint {
  m: number; // month index
  y: number;
}
export const TREND_SCATTER: ScatterPoint[] = [
  { m: 0, y: 155 },
  { m: 0, y: 120 },
  { m: 1, y: 110 },
  { m: 2, y: 150 },
  { m: 2, y: 125 },
];
export const SCATTER_AXIS_MAX = 200;
export const SCATTER_Y_TICKS = ["200", "150", "100", "50", "0"];
export const SCATTER_X_LABELS = ["Jan", "Feb", "Mar"];

export interface BdmStat {
  label: string;
  value: string;
  /** Small trailing note next to the value (unit or weight). */
  suffix?: string;
}
export const BDM_STATS: BdmStat[] = [
  { label: "Cost per Case", value: "$18.5" },
  { label: "Velocity", value: "2.4", suffix: "caw" },
  { label: "Conversion rate", value: "34%" },
  { label: "New Listings", value: "6", suffix: "20% weight" },
  { label: "Fulfillment Rate", value: "92%" },
  { label: "Cost per venue", value: "$420" },
  { label: "Reorder rate", value: "68%", suffix: "10% weight" },
  { label: "Avg Cost / Case", value: "$17.9" },
  { label: "Avg cost / venue", value: "$508" },
  { label: "Cost per menu", value: "$765" },
  { label: "Orders per week", value: "2.4" },
  { label: "Fulfillment Rate", value: "89%" },
];

export type Maturity = "Mature" | "Growth" | "Emerging";

export interface Territory {
  name: string;
  maturity: Maturity;
  score: number; // out of 60
  velocity: string; // c/a/w, always shown declining (red) in the design
  cpc: string;
  cpcHigh: boolean; // red when the cost per case is too high
  fulfillment: string;
  ordersWk: string;
}
export const BDM_SCORE_MAX = 60;
export const BDM_TERRITORIES: Territory[] = [
  { name: "Territory Alpha", maturity: "Mature", score: 48, velocity: "3.7", cpc: "$14.20", cpcHigh: false, fulfillment: "94%", ordersWk: "3.2" },
  { name: "Territory Delta", maturity: "Growth", score: 45, velocity: "1.0", cpc: "$16.80", cpcHigh: false, fulfillment: "91%", ordersWk: "2.6" },
  { name: "Territory Beta", maturity: "Growth", score: 42, velocity: "3.8", cpc: "$18.50", cpcHigh: false, fulfillment: "88%", ordersWk: "2.1" },
  { name: "Territory Gamma", maturity: "Emerging", score: 38, velocity: "3.9", cpc: "$22.40", cpcHigh: true, fulfillment: "82%", ordersWk: "1.7" },
];

// ── Territory inner tab ──────────────────────────────────────────────────────

export type TierTone = "green" | "neutral" | "amber";
export interface MarketTier {
  name: string;
  bdms: string;
  desc: string;
  avgCpc: string;
  avgEff: string;
  venues: string;
  cases: string;
  tone: TierTone;
}
export const MARKET_TIERS: MarketTier[] = [
  {
    name: "Mature Markets",
    bdms: "1 BDM",
    desc: "Established presence, focus on optimization",
    avgCpc: "$14.20",
    avgEff: "88%",
    venues: "12",
    cases: "355",
    tone: "green",
  },
  {
    name: "Growth Markets",
    bdms: "2 BDMs",
    desc: "Expanding footprint, balance acquisition & retention",
    avgCpc: "$17.85",
    avgEff: "77%",
    venues: "19",
    cases: "531",
    tone: "neutral",
  },
  {
    name: "Emerging Markets",
    bdms: "1 BDM",
    desc: "Early stage, higher acquisition costs expected",
    avgCpc: "$22.40",
    avgEff: "68%",
    venues: "7",
    cases: "194",
    tone: "amber",
  },
];

export interface NormRow {
  name: string;
  market: Maturity;
  score: number; // out of 100
  velocity: string;
  cpc: string;
  cpcTone: "green" | "muted" | "red";
  fulfilment: string;
}
export const NORM_ROWS: NormRow[] = [
  { name: "Territory Alpha", market: "Mature", score: 82, velocity: "3.7", cpc: "$14.20", cpcTone: "green", fulfilment: "94%" },
  { name: "Territory Beta", market: "Growth", score: 70, velocity: "1.0", cpc: "$16.80", cpcTone: "green", fulfilment: "91%" },
  { name: "Territory Gamma", market: "Emerging", score: 62, velocity: "3.8", cpc: "$18.50", cpcTone: "muted", fulfilment: "88%" },
  { name: "Territory Delta", market: "Growth", score: 76, velocity: "3.9", cpc: "$22.40", cpcTone: "red", fulfilment: "82%" },
];
