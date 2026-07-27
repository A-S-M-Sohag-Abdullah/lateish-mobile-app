/**
 * UI-preview data for the BDM Efficiency & ROI page (the BDM pager tab).
 * Mock data only — no API.
 */
import {
  Activity,
  ArrowRight,
  DollarSign,
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
  "Activity",
] as const;

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
