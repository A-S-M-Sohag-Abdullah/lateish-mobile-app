// Sample data for the Order Fulfilment page. Mirrors the web front-end
// (front-end/src/app/(dashboard)/order-fulfilment) — orders + distributor
// performance come live from the API there; here they are static so the mobile
// preview matches the design. See [[project_mobile_app]] PREVIEW_MODE.

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

// ── Summary stats (top cards) ────────────────────────────────────────────────

export const FULFILMENT_STATS = {
  fulfilmentRate: 78,
  avgDays: 4.2,
  variancePct: -3.5,
  ordersPending: 6,
  ordersPartial: 3,
  ordersFailed: 1,
};

// ── Recent orders ────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  { id: "ORD-2026-0041", date: "Feb 10", account: "The Copper Still",     distributor: "LWC",           expected: 12, actual: 12,   status: "Fulfilled", days: 3,  daysOverdue: false },
  { id: "ORD-2026-0040", date: "Feb 9",  account: "Velvet Room",          distributor: "LWC",           expected: 8,  actual: 8,    status: "Fulfilled", days: 2,  daysOverdue: false },
  { id: "ORD-2026-0039", date: "Feb 8",  account: "Market Street Bistro", distributor: "Matthew Clark", expected: 6,  actual: null, status: "Pending",   days: null, daysOverdue: false },
  { id: "ORD-2026-0038", date: "Feb 7",  account: "The Botanist",         distributor: "Enotria&Coe",   expected: 15, actual: 10,   status: "Partial",   days: 5,  daysOverdue: false },
  { id: "ORD-2026-0037", date: "Feb 6",  account: "Harbour & Hops",       distributor: "LWC",           expected: 10, actual: 10,   status: "Fulfilled", days: 4,  daysOverdue: false },
  { id: "ORD-2026-0036", date: "Feb 5",  account: "The Gilded Fox",       distributor: "Enotria&Coe",   expected: 20, actual: null, status: "Failed",    days: 12, daysOverdue: true  },
  { id: "ORD-2026-0035", date: "Feb 4",  account: "Slate & Grain",        distributor: "Matthew Clark", expected: 5,  actual: 5,    status: "Fulfilled", days: 3,  daysOverdue: false },
  { id: "ORD-2026-0034", date: "Feb 3",  account: "Rosewood Social",      distributor: "LWC",           expected: 9,  actual: null, status: "Pending",   days: null, daysOverdue: false },
  { id: "ORD-2026-0033", date: "Feb 2",  account: "The Copper Still",     distributor: "Matthew Clark", expected: 7,  actual: 7,    status: "Fulfilled", days: 2,  daysOverdue: false },
  { id: "ORD-2026-0032", date: "Feb 1",  account: "Velvet Room",          distributor: "Enotria&Coe",   expected: 14, actual: 8,    status: "Partial",   days: 6,  daysOverdue: false },
  { id: "ORD-2026-0031", date: "Jan 30", account: "Market Street Bistro", distributor: "LWC",           expected: 11, actual: 11,   status: "Fulfilled", days: 5,  daysOverdue: false },
  { id: "ORD-2026-0030", date: "Jan 28", account: "The Botanist",         distributor: "Matthew Clark", expected: 4,  actual: null, status: "Pending",   days: null, daysOverdue: false },
];

// ── Distributor performance ──────────────────────────────────────────────────

export const DISTRIBUTORS: DistributorPerf[] = [
  { name: "LWC",           orders: 42, fulfilled: 38, fulfilmentRate: 90, avgDays: 3.1 },
  { name: "Matthew Clark", orders: 35, fulfilled: 29, fulfilmentRate: 83, avgDays: 3.6 },
  { name: "Enotria&Coe",   orders: 28, fulfilled: 21, fulfilmentRate: 75, avgDays: 4.4 },
];

// ── By channel ───────────────────────────────────────────────────────────────

export const CHANNELS: ChannelRow[] = [
  { channel: "Upscale Bars & Lounges",    orders: 14, cases: 98, fulfilmentRate: 86, avgDays: 3.2, avgDaysOverdue: false, failedPartial: 1 },
  { channel: "Fine Dining Restaurants",   orders: 10, cases: 62, fulfilmentRate: 80, avgDays: 3.8, avgDaysOverdue: false, failedPartial: 1 },
  { channel: "Hotel Bars & Resorts",      orders: 8,  cases: 44, fulfilmentRate: 75, avgDays: 4.5, avgDaysOverdue: false, failedPartial: 1 },
  { channel: "Liquor Stores & Retailers", orders: 6,  cases: 35, fulfilmentRate: 83, avgDays: 2.9, avgDaysOverdue: false, failedPartial: 0 },
  { channel: "Casual Dining Chains",      orders: 5,  cases: 28, fulfilmentRate: 60, avgDays: 6.1, avgDaysOverdue: false, failedPartial: 2 },
  { channel: "Grocery & Supermarkets",    orders: 4,  cases: 30, fulfilmentRate: 25, avgDays: 9.4, avgDaysOverdue: true,  failedPartial: 2 },
];

// ── Forecast (weekly volume, actuals + 8-week projection) ────────────────────

export interface ForecastPoint {
  week: string;
  actual: number | null;
  forecast: number | null;
  confidenceHigh: number | null;
  confidenceLow: number | null;
}

export const FORECAST: ForecastPoint[] = [
  { week: "W1",  actual: 32, forecast: null, confidenceHigh: null, confidenceLow: null },
  { week: "W2",  actual: 38, forecast: null, confidenceHigh: null, confidenceLow: null },
  { week: "W3",  actual: 35, forecast: null, confidenceHigh: null, confidenceLow: null },
  { week: "W4",  actual: 41, forecast: null, confidenceHigh: null, confidenceLow: null },
  { week: "W5",  actual: 44, forecast: 44,   confidenceHigh: 44,   confidenceLow: 44   },
  { week: "W6",  actual: null, forecast: 46, confidenceHigh: 54,   confidenceLow: 38   },
  { week: "W7",  actual: null, forecast: 47, confidenceHigh: 57,   confidenceLow: 37   },
  { week: "W8",  actual: null, forecast: 49, confidenceHigh: 61,   confidenceLow: 37   },
  { week: "W9",  actual: null, forecast: 50, confidenceHigh: 64,   confidenceLow: 36   },
  { week: "W10", actual: null, forecast: 52, confidenceHigh: 68,   confidenceLow: 36   },
];

// ── Ghost orders ─────────────────────────────────────────────────────────────

export const GHOST_ORDERS: GhostOrder[] = [
  { id: "ORD-2026-0028", daysAgo: 30, account: "The Gilded Fox",       distributor: "Enotria&Coe",   sku: "Good Intentions Pinot Noir 75cl", shipped: 12, depleted: 0, ghostScore: 92, ghostLabel: "Ghost",   reason: "Inventory sitting at distributor warehouse — no sell-through detected" },
  { id: "ORD-2026-0025", daysAgo: 35, account: "Market Street Bistro", distributor: "Matthew Clark", sku: "Broken Barrier Reposado 70cl",    shipped: 8,  depleted: 1, ghostScore: 78, ghostLabel: "Suspect", reason: "Minimal sell-through; product may be listed but not actively promoted" },
  { id: "ORD-2026-0022", daysAgo: 40, account: "Harbour & Hops",       distributor: "LWC",           sku: "Esther Spiced Rum 70cl",          shipped: 6,  depleted: 2, ghostScore: 65, ghostLabel: "Suspect", reason: "Low sell-through rate; may need menu activation or staff sampling" },
];

// ── Auto-reorder rules ───────────────────────────────────────────────────────

export const AUTO_REORDER: AutoReorderRule[] = [
  { id: "AR-001", sku: "Broken Barrier Blanco 70cl",     velocity: 4.2, estStock: 18, weeksCover: 1.4, reorderPoint: 2, status: "Below Threshold", active: true,  reorderQty: 36   },
  { id: "AR-002", sku: "Esther White Rum 70cl",          velocity: 3.1, estStock: 24, weeksCover: 2.6, reorderPoint: 2, status: "OK",              active: true,  reorderQty: null },
  { id: "AR-003", sku: "Good Intentions Sauvignon 75cl", velocity: 2.8, estStock: 12, weeksCover: 1.4, reorderPoint: 3, status: "Below Threshold", active: true,  reorderQty: 24   },
  { id: "AR-004", sku: "Broken Barrier Reposado 70cl",   velocity: 1.5, estStock: 30, weeksCover: 6.7, reorderPoint: 2, status: "OK",              active: false, reorderQty: null },
];

// ── Financial impact ─────────────────────────────────────────────────────────

export const FINANCIAL_ORDERS: FinancialImpactOrder[] = [
  { id: "ORD-2026-0036", account: "The Gilded Fox",       delayDays: 12, cases: 20, revPerCase: 145, lostRevenue: 2900, status: "Failed"  },
  { id: "ORD-2026-0038", account: "The Botanist",         delayDays: 5,  cases: 15, revPerCase: 128, lostRevenue: 640,  status: "Partial" },
  { id: "ORD-2026-0032", account: "Velvet Room",          delayDays: 6,  cases: 14, revPerCase: 135, lostRevenue: 810,  status: "Partial" },
  { id: "ORD-2026-0039", account: "Market Street Bistro", delayDays: 8,  cases: 6,  revPerCase: 98,  lostRevenue: 588,  status: "Delayed" },
];
