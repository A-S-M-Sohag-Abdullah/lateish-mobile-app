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

// ── Analytics tab — shared section shapes ────────────────────────────────────

export interface StatTile {
  label: string;
  value: string;
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

