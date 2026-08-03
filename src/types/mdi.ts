/**
 * MDI (Market Demand Intent) API shapes — ported from
 * front-end/src/lib/api-endpoints.ts.
 */

export type MdiIntentStatus =
  | "draft"
  | "submitted"
  | "brand_review"
  | "distributor_review"
  | "converted"
  | "rejected"
  | "expired";

export type MdiConfidence = "high" | "medium" | "low";

export interface ApiMdiLineItem {
  id: string;
  brand_id: string | null;
  brand_name: string | null;
  sku_id: string | null;
  sku_name: string | null;
  qty_cases: number;
  distributor_name: string | null;
  indicative_price: number | null;
  ap_intent: string | null;
  delivery_start: string | null;
  delivery_end: string | null;
}

export interface ApiMdiIntent {
  id: string;
  account_id: string | null;
  account_name: string | null;
  account_type: string | null;
  primary_channel: string | null;
  city: string | null;
  state: string | null;
  buyer_name: string | null;
  buyer_role: string | null;
  conversion_window_days: number;
  confidence: MdiConfidence;
  status: MdiIntentStatus;
  expires_at: string | null;
  created_at: string;
  line_items?: ApiMdiLineItem[];
}

export interface ApiMdiAnalytics {
  kpis: {
    totalIntents: number;
    conversionRate: number;
    avgDaysToConvert: number | null;
    pipelineValue: number;
  };
  funnel: { label: string; value: number; dropPct: number | null }[];
  weeklyTrend: {
    week: string;
    submitted: number;
    converted: number;
    rate: number;
  }[];
  channels: {
    channel: string;
    intents: number;
    converted: number;
    rate: number;
    avgDays: number | null;
  }[];
  buyerScoring: {
    name: string | null;
    email: string | null;
    totalIntents: number;
    converted: number;
    convRate: number;
    avgDays: number | null;
    reliability: "High" | "Medium" | "Low";
  }[];
  correlations: {
    brand1: string;
    brand2: string;
    correlation: number;
    shared: number;
  }[];
  portfolioGaps: {
    account: string;
    location: string | null;
    covered: string[];
    missing: string[];
    totalBrands: number;
  }[];
  revenueForecast: { month: string; projected: number; actual: number }[];
  workingCapital: {
    label: string;
    period: string;
    amount: number;
    cumulative: number;
  }[];
  priorityRanked: {
    intentId: string;
    account: string | null;
    brand: string | null;
    cases: number;
    winPct: number;
    unitPrice: number | null;
    estRevenue: number;
    priority: number;
  }[];
  brandBreakdown: {
    brand_id: string | null;
    brand_name: string;
    active_intents: number;
    unique_accounts: number;
    total_cases: number;
    pipeline_value: number;
    conversion_rate: number;
  }[];
}
