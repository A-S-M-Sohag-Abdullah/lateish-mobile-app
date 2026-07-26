/**
 * UI-preview data for the Market Demand Intent (90-Day Plans / MDI) page.
 * Non-binding commercial intent signals — no API, mock data only.
 */

// ── All Intents tab ──────────────────────────────────────────────────────────

export type IntentStatus =
  | "Submitted"
  | "Brand Review"
  | "Distributor Review"
  | "Converted"
  | "Lost";

export type Confidence = "High" | "Medium" | "Low";

export interface IntentRecord {
  id: string;
  account: string;
  region: string; // e.g. "NY"
  premise: "On-Premise" | "Off-Premise";
  status: IntentStatus;
  buyer: string;
  cases: number;
  items: number;
  windowDays: number;
  confidence: Confidence;
  /** null = overdue */
  daysLeft: number | null;
}

export const INTENTS: IntentRecord[] = [
  {
    id: "i1",
    account: "The Blue Bar",
    region: "NY",
    premise: "On-Premise",
    status: "Submitted",
    buyer: "Sarah Mitchell",
    cases: 18,
    items: 2,
    windowDays: 30,
    confidence: "High",
    daysLeft: 15,
  },
  {
    id: "i2",
    account: "Riverside Wine & Spirits",
    region: "CA",
    premise: "Off-Premise",
    status: "Brand Review",
    buyer: "James Chen",
    cases: 24,
    items: 1,
    windowDays: 14,
    confidence: "Medium",
    daysLeft: null,
  },
  {
    id: "i3",
    account: "Grand Hotel Lounge",
    region: "FL",
    premise: "On-Premise",
    status: "Converted",
    buyer: "Maria Garcia",
    cases: 30,
    items: 2,
    windowDays: 45,
    confidence: "High",
    daysLeft: 8,
  },
  {
    id: "i4",
    account: "Harbor Point Tavern",
    region: "MA",
    premise: "On-Premise",
    status: "Distributor Review",
    buyer: "Tom Bradley",
    cases: 12,
    items: 3,
    windowDays: 21,
    confidence: "Medium",
    daysLeft: 5,
  },
  {
    id: "i5",
    account: "Metro Cellars",
    region: "IL",
    premise: "Off-Premise",
    status: "Lost",
    buyer: "Lisa Park",
    cases: 16,
    items: 1,
    windowDays: 30,
    confidence: "Low",
    daysLeft: null,
  },
];

export const STATUS_FILTERS = [
  "All Status",
  "Submitted",
  "Brand Review",
  "Distributor Review",
  "Converted",
  "Lost",
] as const;

// ── Create tab (form options) ────────────────────────────────────────────────

export const ACCOUNT_TYPES = ["On premise", "Off premise"] as const;

export const SALES_CHANNELS = [
  "Select primary channel",
  "Modern Cocktail Bar",
  "Aspiring Cocktail Bar",
  "High-Volume Cocktail Bar",
  "Hatted / Starred Restaurant",
  "Elevated Dining",
  "Traditional Pub",
  "Specialist Retailer",
  "Luxury / Prestige Retail",
] as const;

export const BUYER_ROLES = [
  "Decision Maker",
  "Influencer",
  "Gatekeeper",
  "End User",
] as const;

export const CONVERSION_WINDOWS = [
  "30 days",
  "60 days",
  "90 days",
] as const;

export const CONFIDENCE_SCORES = ["High", "Medium", "Low"] as const;

export const SKUS = [
  "Select SKU",
  "Broken Barrier Gin 70cl",
  "Esther Rum 70cl",
  "Premium Vodka 70cl",
  "Heritage Whisky 70cl",
] as const;

export const QUANTITIES = ["6", "12", "18", "24", "30", "48"] as const;

export const DISTRIBUTORS = [
  "Select distributor",
  "Metro Beverage Co.",
  "Coastal Distributors",
  "Premier Wine & Spirits",
] as const;

export const PRICE_BANDS = [
  "Select price band",
  "£ Value",
  "££ Mid",
  "£££ Premium",
] as const;

// ── Analytics tab ────────────────────────────────────────────────────────────

export interface StatTile {
  label: string;
  value: string;
}
export const ANALYTICS_STATS: StatTile[] = [
  { label: "Tracked buyers", value: "12" },
  { label: "Avg. Conversion Rate", value: "2" },
  { label: "Avg. days to convert", value: "4" },
  { label: "High reliability", value: "1" },
];

export interface TargetBrand {
  name: string;
  pctOfTarget: number;
  cases: { current: number; target: number };
  value: { current: number; target: number };
}
export const TARGET_BRANDS: TargetBrand[] = [
  { name: "Mezcal Artisan", pctOfTarget: 37, cases: { current: 186, target: 500 }, value: { current: 27900, target: 75000 } },
  { name: "Craft Gin Co", pctOfTarget: 24, cases: { current: 72, target: 300 }, value: { current: 8640, target: 36000 } },
  { name: "Premium Vodka", pctOfTarget: 12, cases: { current: 48, target: 400 }, value: { current: 5760, target: 48000 } },
];

export interface FunnelStage {
  label: string;
  value: number;
  delta?: string;
  tone: "neutral" | "muted" | "success" | "danger";
}
export const FUNNEL_STAGES: FunnelStage[] = [
  { label: "Submitted", value: 25, tone: "neutral" },
  { label: "Brand Review", value: 20, delta: "-20%", tone: "muted" },
  { label: "Distributor Review", value: 16, delta: "-20%", tone: "muted" },
  { label: "Converted", value: 12, delta: "-25%", tone: "success" },
  { label: "Lost", value: 8, tone: "danger" },
];
export const FUNNEL_OVERALL = "48% overall";

/** 12-week rolling series for the Seasonal Trends chart. */
export interface TrendPoint {
  label: string;
  submitted: number;
  converted: number;
  convRate: number; // %
}
export const SEASONAL_TRENDS: TrendPoint[] = [
  { label: "W1 Dec", submitted: 4, converted: 2, convRate: 50 },
  { label: "", submitted: 6, converted: 3, convRate: 50 },
  { label: "", submitted: 3, converted: 2, convRate: 66 },
  { label: "W4 Dec", submitted: 7, converted: 4, convRate: 57 },
  { label: "", submitted: 5, converted: 3, convRate: 60 },
  { label: "", submitted: 8, converted: 5, convRate: 62 },
  { label: "W3 Jan", submitted: 6, converted: 4, convRate: 66 },
  { label: "", submitted: 9, converted: 6, convRate: 66 },
  { label: "", submitted: 7, converted: 5, convRate: 71 },
  { label: "", submitted: 10, converted: 7, convRate: 70 },
  { label: "", submitted: 8, converted: 6, convRate: 75 },
  { label: "W4 Feb", submitted: 9, converted: 7, convRate: 77 },
];

export interface HeatChannel {
  channel: string;
  intents: number;
  converted: number;
  avgDays: number;
  pct: number;
}
export const CHANNEL_HEATMAP: HeatChannel[] = [
  { channel: "Hotel Bar", intents: 5, converted: 4, avgDays: 14, pct: 80 },
  { channel: "Modern Cocktail Bar", intents: 8, converted: 6, avgDays: 18, pct: 75 },
  { channel: "Restaurant", intents: 6, converted: 4, avgDays: 22, pct: 67 },
  { channel: "Wine Bar", intents: 4, converted: 2, avgDays: 28, pct: 50 },
  { channel: "Off-Licence", intents: 2, converted: 1, avgDays: 30, pct: 50 },
  { channel: "Independent Retailer", intents: 3, converted: 1, avgDays: 35, pct: 33 },
];

export type FulfilStatus = "Fulfilled" | "Partial" | "Delayed";
export interface DepletionRow {
  account: string;
  brand: string;
  current: number;
  target: number;
  pct: number;
  status: FulfilStatus;
}
export const DEPLETION_SUMMARY = { match: "67%", cases: "11/28", avgDays: "11", fulfilled: "2" };
export const DEPLETION_ROWS: DepletionRow[] = [
  { account: "The Botanist", brand: "Broken Barrier Gin", current: 5, target: 5, pct: 100, status: "Fulfilled" },
  { account: "Hawksmoor", brand: "Esther Rum", current: 2, target: 3, pct: 67, status: "Partial" },
  { account: "Drake & Morgan", brand: "Broken Barrier Gin", current: 0, target: 8, pct: 0, status: "Delayed" },
  { account: "Chiltern Firehouse", brand: "Esther Rum", current: 2, target: 2, pct: 100, status: "Fulfilled" },
  { account: "The Ivy", brand: "Broken Barrier Gin", current: 2, target: 4, pct: 50, status: "Partial" },
];

export interface PredictiveBuyer {
  name: string;
  email: string;
  role: string;
  predConv: number;
  intents: number;
  converted: number;
  histRate: number;
}
export const PREDICTIVE_BUYERS: PredictiveBuyer[] = [
  { name: "Sarah Mitchell", email: "sarah@example.com", role: "Decision Maker", predConv: 92, intents: 12, converted: 10, histRate: 83.3 },
  { name: "James Chen", email: "james@example.com", role: "Decision Maker", predConv: 68, intents: 8, converted: 5, histRate: 62.5 },
  { name: "Maria Garcia", email: "maria@example.com", role: "Influencer", predConv: 35, intents: 5, converted: 2, histRate: 40.0 },
  { name: "Tom Bradley", email: "tom@example.com", role: "Decision Maker", predConv: 95, intents: 3, converted: 3, histRate: 100.0 },
  { name: "Lisa Park", email: "lisa@example.com", role: "Influencer", predConv: 48, intents: 6, converted: 3, histRate: 50.0 },
];

export type Reliability = "HIGH" | "MEDIUM" | "LOW";
export interface AccountScore {
  name: string;
  email: string;
  reliability: Reliability;
  totalIntents: number;
  convRate: number;
  avgDays: number;
}
export const ACCOUNT_SCORES: AccountScore[] = [
  { name: "Sarah Mitchell", email: "sarah@example.com", reliability: "HIGH", totalIntents: 12, convRate: 83.3, avgDays: 18 },
  { name: "James Chen", email: "james@example.com", reliability: "MEDIUM", totalIntents: 8, convRate: 62.5, avgDays: 25 },
  { name: "Maria Garcia", email: "maria@example.com", reliability: "LOW", totalIntents: 5, convRate: 40.0, avgDays: 42 },
];

export interface PortfolioGap {
  account: string;
  city: string;
  listed: string[];
  missing: string[];
  listedCount: number;
  total: number;
}
export const PORTFOLIO_GAPS: PortfolioGap[] = [
  { account: "The Botanist", city: "London", listed: ["Broken Barrier Gin", "Esther Rum"], missing: ["Premium Vodka", "Heritage Whisky"], listedCount: 2, total: 4 },
  { account: "Hawksmoor", city: "London", listed: ["Esther Rum"], missing: ["Broken Barrier Gin", "Premium Vodka", "Heritage Whisky"], listedCount: 1, total: 4 },
  { account: "Drake & Morgan", city: "Manchester", listed: ["Broken Barrier Gin", "Premium Vodka"], missing: ["Esther Rum", "Heritage Whisky"], listedCount: 2, total: 4 },
];

export interface Displacement {
  account: string;
  cases: number;
  removed: string;
  opportunity: string;
}
export const DISPLACEMENTS: Displacement[] = [
  { account: "Chiltern Firehouse", cases: 4, removed: "Hendricks Gin", opportunity: "Broken Barrier Gin" },
  { account: "Gaucho", cases: 6, removed: "Bacardi Rum", opportunity: "Esther Rum" },
  { account: "Soho House", cases: 8, removed: "Absolut Vodka", opportunity: "Premium Vodka" },
];

/** Intent-to-Revenue forecast bars (£k): projected pipeline vs actual. */
export const REVENUE_TOTAL = "£104.5k";
export const REVENUE_AXIS_MAX = 60;
export interface RevenueBar {
  label: string;
  projected: number; // £k
  actual: number; // £k
}
export const REVENUE_BARS: RevenueBar[] = [
  { label: "Dec '25", projected: 32, actual: 28 },
  { label: "Jan '26", projected: 48, actual: 44 },
  { label: "Feb '26", projected: 24, actual: 18 },
];

export interface CapitalBucket {
  label: string;
  amount: string;
  window: string;
  cum: string;
}
export const CAPITAL_TIMELINE: CapitalBucket[] = [
  { label: "Imminent", amount: "£12.4k", window: "0–2 weeks", cum: "Cum: £12.4k" },
  { label: "Near-term", amount: "£18.6k", window: "2–4 weeks", cum: "Cum: £31.0k" },
  { label: "Medium-term", amount: "£24.2k", window: "4–8 weeks", cum: "Cum: £55.2k" },
  { label: "Longer-term", amount: "£8.8k", window: "8–12 weeks", cum: "Cum: £64.0k" },
];

export interface PriorityRow {
  account: string;
  brand: string;
  revenue: string;
  cases: number;
  winPct: number;
  margin: number;
  priority: number;
}
export const PRIORITY_ROWS: PriorityRow[] = [
  { account: "Hawksmoor", brand: "Esther Rum", revenue: "£2,100", cases: 5, winPct: 85, margin: 52, priority: 44.2 },
  { account: "The Botanist", brand: "Broken Barrier Gin", revenue: "£3,200", cases: 8, winPct: 92, margin: 45, priority: 41.4 },
  { account: "The Ivy", brand: "Esther Rum", revenue: "£1,260", cases: 3, winPct: 78, margin: 52, priority: 40.6 },
  { account: "Chiltern Firehouse", brand: "Broken Barrier Gin", revenue: "£4,800", cases: 12, winPct: 68, margin: 45, priority: 30.6 },
  { account: "Gaucho", brand: "Heritage Whisky", revenue: "£2,400", cases: 4, winPct: 42, margin: 60, priority: 25.2 },
];
