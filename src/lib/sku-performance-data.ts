// Sample data for the SKU Performance page. Mirrors the web front-end
// (front-end/src/components/sku-performance) — live from the API there, static
// here for the mobile preview. See [[project_mobile_app]] PREVIEW_MODE.

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

export const SKU_PERFORMANCE: SkuPerformanceData = {
  totalCases: 781,
  activeSKUs: 6,
  totalListings: 78,
  laggingSKUs: 1,
  avgVelocity: 32.5,
  velocityTrend: "up",
  unquantified: 117,
  topPerformer: { name: "Esther Rum Spiced 700ml", cases: 176, targetPct: 117 },
  needsAttention: { name: "Esther Rum White 700ml", cases: 63, targetPct: 79 },
  families: [
    {
      id: "broken-barrier",
      name: "Broken Barrier Tequila",
      category: "Tequila",
      cases: 240,
      targetPct: 85,
      status: "On Track",
      skus: [
        { name: "Broken Barrier Blanco", size: "750ml", skuCode: "BB-BLA-750", cases: 142, listings: 14, velocity: 7.2, status: "On Track" },
        { name: "Broken Barrier Reposado", size: "750ml", skuCode: "BB-REP-750", cases: 98, listings: 9, velocity: 5.8, status: "On Track" },
      ],
    },
    {
      id: "good-intentions",
      name: "Good Intentions Wine",
      category: "Wine",
      cases: 302,
      targetPct: 97,
      status: "On Track",
      skus: [
        { name: "Good Intentions Pinot Noir", size: "750ml", skuCode: "GI-PIN-750", cases: 160, listings: 16, velocity: 6.5, status: "On Track" },
        { name: "Good Intentions Sauvignon", size: "750ml", skuCode: "GI-SAU-750", cases: 142, listings: 12, velocity: 5.4, status: "On Track" },
      ],
    },
    {
      id: "esther-rum",
      name: "Esther Rum",
      category: "Rum",
      cases: 239,
      targetPct: 98,
      status: "On Track",
      skus: [
        { name: "Esther Rum Spiced", size: "700ml", skuCode: "ER-SPI-700", cases: 176, listings: 18, velocity: 8.1, status: "Above Target" },
        { name: "Esther Rum White", size: "700ml", skuCode: "ER-WHI-700", cases: 63, listings: 9, velocity: 3.2, status: "Below Target" },
      ],
    },
  ],
};
