// Shared types for the Order Fulfilment page. Data is fetched live — see
// use-order-fulfilment. These mirror the web app's display shapes.

export type OrderStatus = "Fulfilled" | "Partial" | "Pending" | "Failed";

export interface Order {
  id: string;
  date: string;
  account: string;
  distributor: string;
  expected: number;
  actual: number | null;
  status: OrderStatus;
  days: number | null;
  daysOverdue: boolean;
}

export interface DistributorPerf {
  name: string;
  orders: number;
  fulfilled: number;
  fulfilmentRate: number;
  avgDays: number | null;
}

export interface ChannelRow {
  channel: string;
  orders: number;
  cases: number;
  fulfilmentRate: number;
  avgDays: number;
  avgDaysOverdue: boolean;
  failedPartial: number;
}

export interface ForecastPoint {
  week: string;
  actual: number | null;
  forecast: number | null;
  confidenceHigh: number | null;
  confidenceLow: number | null;
}

export interface GhostOrder {
  id: string;
  daysAgo: number;
  account: string;
  distributor: string;
  sku: string;
  shipped: number;
  depleted: number;
  ghostScore: number;
  ghostLabel: "Ghost" | "Suspect";
  reason: string;
}

export interface AutoReorderRule {
  id: string;
  sku: string;
  velocity: number;
  estStock: number;
  weeksCover: number;
  reorderPoint: number;
  status: "Below Threshold" | "OK";
  active: boolean;
  reorderQty: number | null;
}

export interface FinancialImpactOrder {
  id: string;
  account: string;
  delayDays: number;
  cases: number;
  revPerCase: number;
  lostRevenue: number;
  status: "Failed" | "Partial" | "Delayed";
}
