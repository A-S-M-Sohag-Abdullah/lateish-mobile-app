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

export interface ApiPerformanceData {
  members: ApiPerfMember[];
  achievements: ApiPerfAchievement[];
  bonus: ApiBonusTracker;
  kpis: ApiPerfKpi[];
  depletions?: unknown;
  vip?: unknown;
  integrations?: unknown;
}
