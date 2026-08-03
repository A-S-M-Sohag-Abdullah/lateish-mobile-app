/**
 * Performance Dashboard API shapes — ported from
 * front-end/src/components/performance/performance-tabs.tsx.
 * Only the pieces the mobile currently consumes are typed strictly; the rest
 * (depletions / vip / integrations) are left open until those tabs are wired.
 */

export interface ApiPerfMember {
  id: string;
  name: string;
  initials: string;
  revenue: number;
  visits: number;
  orders: number;
  score: number;
  targetPct: number;
  trend: "up" | "down" | "flat";
}

export interface ApiPerfAchievement {
  id: string;
  title: string;
  emoji: string;
  bgColor: string;
  member: string;
}

export interface ApiBonusTracker {
  casesSold: number;
  totalCost: number;
  costPerCase: number;
  targetPerCase: number;
  nsvPct: number;
  period: string;
}

export interface ApiPerfKpi {
  id: string;
  emoji: string;
  name: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: "up" | "down" | "flat";
  trendData: { month: string; value: number }[];
}

export interface DepletionsData {
  summary: {
    realisedNsv: number;
    realisedNsvChangePct: number;
    expectedNsv: number;
    totalCases: number;
    distributors: number;
    markets: number;
    skus: number;
  };
  monthlyTrend: { month: string; cases: number; nsv: number }[];
  distributors: {
    id: string;
    name: string;
    cases: number;
    healthScore: number;
    lastIngestion: string;
    records: number;
    status: string;
  }[];
  markets: { id: string; name: string; cases: number; nsv: number }[];
  skus: { id: string; sku: string; name: string; cases: number; nsv: number }[];
  records: {
    id: string;
    date: string;
    distributor: string;
    market: string;
    sku: string;
    cases: number;
    nsv: number;
    corridor: string;
  }[];
}

export interface ApiPerformanceData {
  members: ApiPerfMember[];
  achievements: ApiPerfAchievement[];
  bonus: ApiBonusTracker;
  kpis: ApiPerfKpi[];
  depletions: DepletionsData;
  vip?: unknown;
  integrations?: unknown;
}
