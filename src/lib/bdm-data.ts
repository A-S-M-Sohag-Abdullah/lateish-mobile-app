/**
 * UI-preview data for the BDM Efficiency & ROI page (the BDM pager tab).
 * Mock data only — no API.
 */

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
