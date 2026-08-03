/**
 * Shape of `GET /organizations/{orgId}/bdm-efficiency` — the single endpoint
 * that powers the whole BDM Efficiency & ROI screen. Ported from the web app's
 * `BdmEfficiencyData` (front-end/src/components/bdm-efficiency/bdm-efficiency-tabs.tsx).
 */

export type MarketMaturity = "Mature" | "Growth" | "Emerging";

export interface ScorecardKpi {
  label: string;
  value: string;
  valueSuffix?: string;
  weightPct: number;
  icon: "dollar" | "trending-up" | "target" | "plus" | "circle-check";
}

export interface SummaryMetric {
  label: string;
  value: string;
  icon: "dollar" | "map-pin" | "utensils" | "package" | "target";
  iconColor: string;
  iconBg: string;
}

export interface TerritoryRow {
  name: string;
  maturity: MarketMaturity;
  composite: number;
  velocity: number;
  cpc: number;
  cpcGood: boolean;
  fulfilment: number;
  ordersPerWeek: number;
}

export interface TerritoryTierCard {
  maturity: MarketMaturity;
  bdmCount: number;
  tagline: string;
  avgCpc: string;
  avgEfficiency: string;
  efficiencyVariant: "success" | "warning";
  venues: number;
  cases: number;
}

export interface TerritoryNormRow {
  name: string;
  maturity: MarketMaturity;
  territoryScore: number;
  venues: number;
  menuPlacements: number;
  normalizedCpc: number;
  normalizedCpcVariant: "success" | "warning";
  efficiency: number;
  efficiencyVariant: "success" | "warning";
}

export interface TerritoryData {
  tiers: TerritoryTierCard[];
  normRows: TerritoryNormRow[];
}

export interface AttributionActivityRow {
  activity: string;
  count: number;
  orders: number;
  revenue: number;
  revPerActivity: number;
  revPerActivityVariant: "primary" | "secondary";
  avgDays: number;
  configKey: string;
}

export interface AttributionData {
  totalActivities: number;
  attributedOrders: number;
  attributedRevenue: string;
  revPerActivity: string;
  rows: AttributionActivityRow[];
}

export interface ChannelRow {
  channel: string;
  bdmCost: number;
  revenue: number;
  margin: number;
  accounts: number;
  cases: number;
  cpc: number;
  cpcVariant: "primary" | "secondary";
  cac: number;
  recommendation?: string;
}

export interface ChannelsData {
  channelsActive: number;
  totalBdmCost: string;
  totalRevenue: string;
  rows: ChannelRow[];
}

export interface BenchmarkRow {
  territory: string;
  percentile: string;
  velocityIndex: number;
  coverageIndex: number;
  costEfficiency: number;
  composite: number;
}

export interface CorrelationRow {
  activity: string;
  uplift: string;
  upliftVariant: "high" | "medium" | "low";
  daysToImpact: number;
  confidencePct: number;
  sample: string;
  recommended: string;
}

export interface GoalItem {
  label: string;
  percentileLabel: string;
  unit: string;
  current: number;
  suggestedTarget: number;
  best: number;
  note: string;
}

export interface BenchmarkingData {
  peerCount: number;
  benchmarkRows: BenchmarkRow[];
  insights: string[];
  correlations: CorrelationRow[];
  goals: GoalItem[];
}

export type RadarDimKey =
  | "costEfficiency"
  | "conversion"
  | "fulfilment"
  | "activity"
  | "coverage"
  | "ordersPerWeek";

export interface PortfolioTerritory {
  id: string;
  name: string;
  maturity: string;
  costEfficiency: number;
  conversion: number;
  fulfilment: number;
  activity: number;
  coverage: number;
  ordersPerWeek: number;
  costPerCase: string;
  efficiency: string;
  conversionPct: string;
  fulfilmentPct: string;
  ordersPerWeekLabel: string;
  venues: number;
  menuPlacements: number;
}

export interface PortfolioData {
  territories: PortfolioTerritory[];
  top25Benchmark: Record<RadarDimKey, number>;
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  base?: number;
  ambitious?: number;
  conservative?: number;
  target: number;
}

export interface ForecastingData {
  currentCpc: string;
  improvementPerMonth: string;
  convergenceDate: string;
  targetCpc: string;
  targetGap: string;
  points: ForecastPoint[];
}

export interface ActivityRow {
  name: string;
  venues: number;
  menuPlacements: number;
  ordersPerWeek: number;
  fulfilmentPct: number;
  fulfilmentGood: boolean;
}

export interface ActivityData {
  rows: ActivityRow[];
}

export interface CostAccRow {
  name: string;
  costPerCase: number;
  costPerCaseGood: boolean;
  costPerVenue: number;
  costPerMenu: number;
  totalCases: number;
}

export interface CostsData {
  rows: CostAccRow[];
}

export interface CpcTrendPoint {
  month: string;
  cpc: number;
}

export interface TeamEfficiencyPoint {
  month: string;
  cases: number;
  efficiency: number;
}

export interface TrendsData {
  currentCpc: string;
  targetCpc: string;
  monthsToTarget: number;
  efficiencyPct: number;
  efficiencyChange: string;
  improvingCount: number;
  decliningCount: number;
  stableCount: number;
  cpcTrend: CpcTrendPoint[];
  teamEfficiency: TeamEfficiencyPoint[];
}

export interface SimulatorDefaults {
  retainer: number;
  commissionPerCase: number;
  travel: number;
  startCases: number;
  growthPct: number;
  nsv: number;
}

export interface BdmEfficiencyData {
  scorecard: ScorecardKpi[];
  teamAvgScore: number;
  metrics: SummaryMetric[];
  efficiencyTable: TerritoryRow[];
  territory: TerritoryData;
  attribution: AttributionData | null;
  channels: ChannelsData | null;
  trends: TrendsData | null;
  costs: CostsData;
  activity: ActivityData;
  benchmarking: BenchmarkingData | null;
  forecasting: ForecastingData | null;
  portfolio: PortfolioData;
  simulator: SimulatorDefaults;
}
