/**
 * Static layout config + shared types for the BDM Efficiency & ROI page.
 * The data itself is fetched live (see use-bdm-efficiency + bdm-map); only tab
 * lists, chart axis labels and TypeScript shapes live here.
 */
import { type LucideIcon } from "lucide-react-native";

export const BDM_OUTER_TABS = [
  "Efficiency ROI",
  "Benchmarking",
  "Cost Accountability",
  "Forecasting",
  "Portfolio",
  "Investment",
] as const;

export const BDM_INNER_TABS = [
  "Efficiency",
  "Territory",
  "Attribution",
  "Channels",
  "Trends",
  "Costs",
] as const;

export const BDM_PERIODS = [
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
] as const;

export const COST_ACCT_TABS = [
  "Overview",
  "Log Cost",
  "Trends",
  "Compare",
  "Milestone",
  "Reports",
] as const;

export const BENCHMARKING_TABS = [
  "Benchmarks",
  "What Works",
  "Goal Settings",
] as const;

export const FORECAST_PERIODS = ["3mo", "6mo", "12mo"] as const;

export const RADAR_AXES = [
  "Cost Efficiency",
  "Conversion",
  "Fulfilment",
  "Activity",
  "Coverage",
  "Orders/Week",
];

/** Composite score cards are rendered out of 60. */
export const BDM_SCORE_MAX = 60;

// ── Shared types ──────────────────────────────────────────────────────────────

export type Maturity = "Mature" | "Growth" | "Emerging";

export interface InvestSlider {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  prefix: string;
  suffix: string;
}

export interface InvestOutput {
  label: string;
  value: string;
  green?: boolean;
}

export interface CompareBdm {
  name: string;
  maturity: Maturity;
  checked: boolean;
}

export interface CompareRow {
  metric: string;
  a: string;
  b: string;
}

export interface CostRow {
  bdm: string;
  cpc: string;
  cpcTone: "green" | "red";
  venue: string;
  menu: string;
}

export interface GoalCard {
  label: string;
  current: string;
  target: string;
  best: string;
  unit: string;
  note: string;
}

export interface WhatWorksRow {
  activity: string;
  uplift: string;
  tone: "green" | "amber" | "grey";
  days: string;
}

export interface AttrSummary {
  label: string;
  value: string;
  icon: LucideIcon;
  green: boolean;
}

export interface AttrBar {
  label: string;
  value: number;
  highlight: boolean;
}

export interface AttrBreakdown {
  activity: string;
  count: number;
  orders: string;
  revenue: string;
  revActivity: string;
  avgDays: string;
}

export interface ChannelBar {
  label: string;
  cost: number; // green
  revenue: number; // white
}

export interface ChannelRow {
  channel: string;
  accounts: number;
  cases: number;
  volume: number;
  cpc: string;
  cpcHighlight: boolean;
  cac: string;
}

export interface ScatterPoint {
  m: number; // month index
  y: number;
}

export interface BdmStat {
  label: string;
  value: string;
  suffix?: string;
}

export interface Territory {
  name: string;
  maturity: Maturity;
  score: number; // out of 60
  velocity: string;
  cpc: string;
  cpcHigh: boolean;
  fulfillment: string;
  ordersWk: string;
}

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

export interface NormRow {
  name: string;
  market: Maturity;
  score: number; // out of 100
  velocity: string;
  cpc: string;
  cpcTone: "green" | "muted" | "red";
  fulfilment: string;
}
