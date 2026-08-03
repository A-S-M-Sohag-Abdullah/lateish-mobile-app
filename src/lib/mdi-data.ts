/**
 * Types + static form options for the Market Demand Intent (MDI) page.
 * Live sections are fetched from the API (see use-mdi-analytics + intents-tab);
 * only shared types, the create-form option lists, and a couple of demo-only
 * analytics sections (no API equivalent) remain here.
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
  region: string;
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

export const BUYER_ROLES = [
  "Decision Maker",
  "Influencer",
  "Gatekeeper",
  "End User",
] as const;

export const CONVERSION_WINDOWS = ["30 days", "60 days", "90 days"] as const;

export const CONFIDENCE_SCORES = ["High", "Medium", "Low"] as const;

export const QUANTITIES = ["6", "12", "18", "24", "30", "48"] as const;

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

export const SKUS = [
  "Select SKU",
  "Broken Barrier Gin 70cl",
  "Esther Rum 70cl",
  "Premium Vodka 70cl",
  "Heritage Whisky 70cl",
] as const;

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

// ── Analytics tab — shared section shapes ────────────────────────────────────

export interface StatTile {
  label: string;
  value: string;
}

export interface TargetBrand {
  name: string;
  pctOfTarget: number;
  cases: { current: number; target: number };
  value: { current: number; target: number };
}

export interface FunnelStage {
  label: string;
  value: number;
  delta?: string;
  tone: "neutral" | "muted" | "success" | "danger";
}

/** 12-week rolling series for the Seasonal Trends chart. */
export interface TrendPoint {
  label: string;
  submitted: number;
  converted: number;
  convRate: number; // %
}

export interface HeatChannel {
  channel: string;
  intents: number;
  converted: number;
  avgDays: number;
  pct: number;
}

export type FulfilStatus = "Fulfilled" | "Partial" | "Delayed";
export interface DepletionRow {
  account: string;
  brand: string;
  current: number;
  target: number;
  pct: number;
  status: FulfilStatus;
}

export interface PredictiveBuyer {
  name: string;
  email: string;
  role: string;
  predConv: number;
  intents: number;
  converted: number;
  histRate: number;
}

export type Reliability = "HIGH" | "MEDIUM" | "LOW";
export interface AccountScore {
  name: string;
  email: string;
  reliability: Reliability;
  totalIntents: number;
  convRate: number;
  avgDays: number;
}

export interface PortfolioGap {
  account: string;
  city: string;
  listed: string[];
  missing: string[];
  listedCount: number;
  total: number;
}

export interface Displacement {
  account: string;
  cases: number;
  removed: string;
  opportunity: string;
}

export interface RevenueBar {
  label: string;
  projected: number;
  actual: number;
}

export interface CapitalBucket {
  label: string;
  amount: string;
  window: string;
  cum: string;
}

export interface PriorityRow {
  account: string;
  brand: string;
  revenue: string;
  cases: number;
  winPct: number;
  margin: number;
  priority: number;
}

// ── Demo-only analytics sections (no API equivalent yet) ─────────────────────

export const TARGET_BRANDS: TargetBrand[] = [
  { name: "Mezcal Artisan", pctOfTarget: 37, cases: { current: 186, target: 500 }, value: { current: 27900, target: 75000 } },
  { name: "Craft Gin Co", pctOfTarget: 24, cases: { current: 72, target: 300 }, value: { current: 8640, target: 36000 } },
  { name: "Premium Vodka", pctOfTarget: 12, cases: { current: 48, target: 400 }, value: { current: 5760, target: 48000 } },
];

export const DEPLETION_SUMMARY = { match: "67%", cases: "11/28", avgDays: "11", fulfilled: "2" };
export const DEPLETION_ROWS: DepletionRow[] = [
  { account: "The Botanist", brand: "Broken Barrier Gin", current: 5, target: 5, pct: 100, status: "Fulfilled" },
  { account: "Hawksmoor", brand: "Esther Rum", current: 2, target: 3, pct: 67, status: "Partial" },
  { account: "Drake & Morgan", brand: "Broken Barrier Gin", current: 0, target: 8, pct: 0, status: "Delayed" },
  { account: "Chiltern Firehouse", brand: "Esther Rum", current: 2, target: 2, pct: 100, status: "Fulfilled" },
  { account: "The Ivy", brand: "Broken Barrier Gin", current: 2, target: 4, pct: 50, status: "Partial" },
];

export const DISPLACEMENTS: Displacement[] = [
  { account: "Chiltern Firehouse", cases: 4, removed: "Hendricks Gin", opportunity: "Broken Barrier Gin" },
  { account: "Gaucho", cases: 6, removed: "Bacardi Rum", opportunity: "Esther Rum" },
  { account: "Soho House", cases: 8, removed: "Absolut Vodka", opportunity: "Premium Vodka" },
];
