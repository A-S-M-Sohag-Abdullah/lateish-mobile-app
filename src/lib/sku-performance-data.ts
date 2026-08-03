// Shared types for the SKU Performance page (a subset of the web app's
// SkuPerformanceData). Data is fetched live — see use-sku-performance.

export type SkuStatus = "On Track" | "Above Target" | "Below Target";
export type FamilyStatus = "On Track" | "Lagging" | "Ahead";

export interface SkuItem {
  name: string;
  size: string;
  skuCode: string;
  cases: number;
  listings: number;
  velocity: number; // c/a/w
  status: SkuStatus;
}

export interface ProductFamily {
  id: string;
  name: string;
  category: string;
  cases: number;
  targetPct: number;
  status: FamilyStatus;
  skus: SkuItem[];
}

export interface SkuPerformanceData {
  totalCases: number;
  activeSKUs: number;
  totalListings: number;
  laggingSKUs: number;
  avgVelocity: number;
  velocityTrend: "up" | "down" | "flat";
  unquantified: number;
  topPerformer: { name: string; cases: number; targetPct: number };
  needsAttention: { name: string; cases: number; targetPct: number };
  families: ProductFamily[];
}
