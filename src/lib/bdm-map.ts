/**
 * Maps the `bdm-efficiency` API payload into the exact shapes the BDM screen's
 * components already render, so the UI is unchanged while the data is live.
 * Chart axis maxima and tick labels are recomputed from the real numbers.
 */
import {
  Activity,
  ArrowRight,
  DollarSign,
  Layers,
  TrendingUp,
} from "lucide-react-native";

import type {
  AttrBar,
  AttrBreakdown,
  AttrSummary,
  ChannelBar,
  ChannelRow,
  CompareBdm,
  CompareRow,
  CostRow,
  GoalCard,
  InvestSlider,
  Maturity,
  MarketTier,
  NormRow,
  ScatterPoint,
  Territory,
  TierTone,
  WhatWorksRow,
} from "@/lib/bdm-data";
import type { BdmEfficiencyData, MarketMaturity } from "@/types/bdm-efficiency";

// ── formatting helpers ────────────────────────────────────────────────────────

const cap = (s: string): Maturity =>
  (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) as Maturity;

const fmtNum = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 1 });

const pct = (n: number) => `${Math.round(n)}%`;

const parseMoney = (s: string) => parseFloat(s.replace(/[^0-9.-]/g, "")) || 0;

const money0 = (symbol: string) => (n: number) =>
  `${symbol}${Math.round(n).toLocaleString("en-US")}`;
const money2 = (symbol: string) => (n: number) =>
  `${symbol}${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const tierTone = (m: MarketMaturity): TierTone =>
  m === "Mature" ? "green" : m === "Growth" ? "neutral" : "amber";

function niceMax(v: number): number {
  if (!isFinite(v) || v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

const FRACTIONS = [0, 0.25, 0.5, 0.75, 1];
const ticksFor = (max: number, fmt: (n: number) => string) =>
  FRACTIONS.map((f) => fmt(max * (1 - f)));

// ── mapped shape ──────────────────────────────────────────────────────────────

export interface MappedBdm {
  hasData: boolean;
  stats: { label: string; value: string; suffix?: string }[];
  teamAvgScore: number;
  territories: Territory[];
  marketTiers: MarketTier[];
  normRows: NormRow[];
  attrSummary: AttrSummary[];
  attrBars: AttrBar[];
  attrBarMax: number;
  attrBarTicks: number[];
  attrBreakdown: AttrBreakdown[];
  channelSummary: AttrSummary[];
  channelBars: ChannelBar[];
  channelAxisMax: number;
  channelTicks: string[];
  channelTable: ChannelRow[];
  cpcTrend: { value: string; target: string; subtitle: string };
  efficiencyTrend: { value: string; change: string; subtitle: string };
  bdmPerformance: { improving: number; declining: number; stable: number };
  cpcTrajectory: number[];
  cpcTarget: number;
  cpcAxisMax: number;
  cpcYTicks: string[];
  cpcXLabels: string[];
  trendScatter: ScatterPoint[];
  scatterAxisMax: number;
  scatterYTicks: string[];
  scatterXLabels: string[];
  costsTable: CostRow[];
  compareBdms: CompareBdm[];
  radarAlpha: number[];
  radarBeta: number[];
  radarTop25: number[];
  portfolioNames: [string, string];
  compareTable: CompareRow[];
  forecastLine: number[];
  forecastTarget: number;
  forecastAxisMax: number;
  forecastYValues: number[];
  forecastXLabels: string[];
  currentCpc: { value: string; note: string };
  convergence: string;
  targetCpc: { value: string; gap: string };
  investSliders: InvestSlider[];
  whatGoodLooksLike: string[];
  goalSettings: GoalCard[];
  whatWorksRows: WhatWorksRow[];
}

export const EMPTY_BDM: MappedBdm = {
  hasData: false,
  stats: [],
  teamAvgScore: 0,
  territories: [],
  marketTiers: [],
  normRows: [],
  attrSummary: [],
  attrBars: [],
  attrBarMax: 1,
  attrBarTicks: [],
  attrBreakdown: [],
  channelSummary: [],
  channelBars: [],
  channelAxisMax: 1,
  channelTicks: [],
  channelTable: [],
  cpcTrend: { value: "—", target: "—", subtitle: "" },
  efficiencyTrend: { value: "—", change: "", subtitle: "" },
  bdmPerformance: { improving: 0, declining: 0, stable: 0 },
  cpcTrajectory: [],
  cpcTarget: 0,
  cpcAxisMax: 1,
  cpcYTicks: [],
  cpcXLabels: [],
  trendScatter: [],
  scatterAxisMax: 1,
  scatterYTicks: [],
  scatterXLabels: [],
  costsTable: [],
  compareBdms: [],
  radarAlpha: [],
  radarBeta: [],
  radarTop25: [],
  portfolioNames: ["Territory A", "Territory B"],
  compareTable: [],
  forecastLine: [],
  forecastTarget: 0,
  forecastAxisMax: 1,
  forecastYValues: [],
  forecastXLabels: [],
  currentCpc: { value: "—", note: "" },
  convergence: "—",
  targetCpc: { value: "—", gap: "" },
  investSliders: [],
  whatGoodLooksLike: [],
  goalSettings: [],
  whatWorksRows: [],
};

export function mapBdmData(d: BdmEfficiencyData, symbol: string): MappedBdm {
  const m0 = money0(symbol);
  const m2 = money2(symbol);

  // Efficiency ROI — top tiles (KPI scorecard + summary metrics)
  const stats = [
    ...d.scorecard.map((k) => ({
      label: k.label,
      value: k.valueSuffix ? `${k.value} ${k.valueSuffix}` : k.value,
      suffix: k.weightPct ? `${k.weightPct}% weight` : undefined,
    })),
    ...d.metrics.map((mt) => ({ label: mt.label, value: mt.value })),
  ];

  const territories: Territory[] = d.efficiencyTable.map((t) => ({
    name: t.name,
    maturity: t.maturity as Maturity,
    score: Math.round(t.composite),
    velocity: fmtNum(t.velocity),
    cpc: m2(t.cpc),
    cpcHigh: !t.cpcGood,
    fulfillment: pct(t.fulfilment),
    ordersWk: fmtNum(t.ordersPerWeek),
  }));

  // Territory tab
  const marketTiers: MarketTier[] = d.territory.tiers.map((t) => ({
    name: `${t.maturity} Markets`,
    bdms: `${t.bdmCount} BDM${t.bdmCount === 1 ? "" : "s"}`,
    desc: t.tagline,
    avgCpc: t.avgCpc,
    avgEff: t.avgEfficiency,
    venues: String(t.venues),
    cases: String(t.cases),
    tone: tierTone(t.maturity),
  }));

  const normRows: NormRow[] = d.territory.normRows.map((r) => {
    const et = d.efficiencyTable.find((e) => e.name === r.name);
    return {
      name: r.name,
      market: r.maturity as Maturity,
      score: Math.round(r.territoryScore),
      velocity: et ? fmtNum(et.velocity) : "0",
      cpc: m2(r.normalizedCpc),
      cpcTone: r.normalizedCpcVariant === "success" ? "green" : "red",
      fulfilment: et ? pct(et.fulfilment) : "—",
    };
  });

  // Attribution tab
  const attr = d.attribution;
  const attrBars: AttrBar[] = (attr?.rows ?? []).map((r) => ({
    label: r.activity,
    value: r.count,
    highlight: false,
  }));
  const maxCount = Math.max(1, ...attrBars.map((b) => b.value));
  const topIdx = attrBars.findIndex((b) => b.value === maxCount);
  if (topIdx >= 0) attrBars[topIdx].highlight = true;
  const attrBarMax = niceMax(maxCount);

  const attrSummary: AttrSummary[] = attr
    ? [
        { label: "Total Activities", value: String(attr.totalActivities), icon: Activity, green: false },
        { label: "Attributed Orders", value: String(attr.attributedOrders), icon: ArrowRight, green: true },
        { label: "Attributed Revenue", value: attr.attributedRevenue, icon: DollarSign, green: false },
      ]
    : [];
  const attrBreakdown: AttrBreakdown[] = (attr?.rows ?? []).map((r) => ({
    activity: r.activity,
    count: r.count,
    orders: fmtNum(r.orders),
    revenue: m0(r.revenue),
    revActivity: m0(r.revPerActivity),
    avgDays: `${Math.round(r.avgDays)}d`,
  }));

  // Channels tab
  const ch = d.channels;
  const channelBars: ChannelBar[] = (ch?.rows ?? []).map((r) => ({
    label: r.channel,
    cost: r.bdmCost / 1000,
    revenue: r.revenue / 1000,
  }));
  const channelAxisMax = niceMax(
    Math.max(1, ...channelBars.map((b) => Math.max(b.cost, b.revenue))),
  );
  const channelTicks = ticksFor(channelAxisMax, (n) => `${symbol}${Math.round(n)}k`);
  const channelSummary: AttrSummary[] = ch
    ? [
        { label: "Channels Active", value: String(ch.channelsActive), icon: Layers, green: false },
        { label: "Total BDM Cost", value: ch.totalBdmCost, icon: DollarSign, green: false },
        { label: "Total Revenue", value: ch.totalRevenue, icon: TrendingUp, green: false },
      ]
    : [];
  const channelTable: ChannelRow[] = (ch?.rows ?? []).map((r) => ({
    channel: r.channel,
    accounts: r.accounts,
    cases: r.cases,
    volume: r.cases,
    cpc: m2(r.cpc),
    cpcHighlight: r.cpcVariant === "primary",
    cac: m0(r.cac),
  }));

  // Trends tab
  const tr = d.trends;
  const cpcTrajectory = (tr?.cpcTrend ?? []).map((p) => p.cpc);
  const cpcTarget = tr ? parseMoney(tr.targetCpc) : 0;
  const cpcAxisMax = niceMax(Math.max(1, ...cpcTrajectory, cpcTarget));
  const trendScatter: ScatterPoint[] = (tr?.teamEfficiency ?? []).map((p, i) => ({
    m: i,
    y: p.cases,
  }));
  const scatterAxisMax = niceMax(Math.max(1, ...trendScatter.map((p) => p.y)));

  // Costs tab
  const costsTable: CostRow[] = d.costs.rows.map((r) => ({
    bdm: r.name,
    cpc: m2(r.costPerCase),
    cpcTone: r.costPerCaseGood ? "green" : "red",
    venue: m0(r.costPerVenue),
    menu: m0(r.costPerMenu),
  }));

  // Portfolio tab
  const terrs = d.portfolio.territories;
  const compareBdms: CompareBdm[] = terrs.map((t, i) => ({
    name: t.name,
    maturity: cap(t.maturity),
    checked: i < 2,
  }));
  const dims = (t: (typeof terrs)[number]) => [
    t.costEfficiency,
    t.conversion,
    t.fulfilment,
    t.activity,
    t.coverage,
    t.ordersPerWeek,
  ];
  const t25 = d.portfolio.top25Benchmark;
  const A = terrs[0];
  const B = terrs[1];
  const compareTable: CompareRow[] =
    A && B
      ? [
          { metric: "Cost/Case", a: A.costPerCase, b: B.costPerCase },
          { metric: "Efficiency", a: A.efficiency, b: B.efficiency },
          { metric: "Conversion", a: A.conversionPct, b: B.conversionPct },
          { metric: "Fulfilment", a: A.fulfilmentPct, b: B.fulfilmentPct },
          { metric: "Orders/Week", a: A.ordersPerWeekLabel, b: B.ordersPerWeekLabel },
          { metric: "Venues", a: String(A.venues), b: String(B.venues) },
          { metric: "Menu Placements", a: String(A.menuPlacements), b: String(B.menuPlacements) },
          { metric: "Market", a: A.maturity, b: B.maturity },
        ]
      : [];

  // Forecasting tab
  const fc = d.forecasting;
  const forecastLine = (fc?.points ?? []).map(
    (p) => p.base ?? p.actual ?? p.conservative ?? 0,
  );
  const forecastTarget = fc?.points[0]?.target ?? 0;
  const forecastAxisMax = niceMax(Math.max(1, ...forecastLine, forecastTarget));
  const forecastYValues = [0.75, 0.5, 0.25, 0].map((f) =>
    Math.round(forecastAxisMax * f),
  );

  // Investment (simulator) defaults
  const s = d.simulator;
  const investSliders: InvestSlider[] = [
    { label: "Monthly Retainer ($)", min: 0, max: 10000, step: 100, value: s.retainer, prefix: symbol, suffix: "" },
    { label: "Starting Cases/Month", min: 0, max: 500, step: 5, value: s.startCases, prefix: "", suffix: " cases" },
    { label: "Commission per Case ($)", min: 0, max: 30, step: 1, value: s.commissionPerCase, prefix: symbol, suffix: "" },
    { label: "Monthly Case Growth (%)", min: 0, max: 25, step: 1, value: s.growthPct, prefix: "", suffix: "%" },
    { label: "Travel Allocation ($)", min: 0, max: 2500, step: 50, value: s.travel, prefix: symbol, suffix: "" },
    { label: "Case NSV ($)", min: 0, max: 600, step: 10, value: s.nsv, prefix: symbol, suffix: "" },
  ];

  // Benchmarking tab
  const bm = d.benchmarking;
  const goalSettings: GoalCard[] = (bm?.goals ?? []).map((g) => ({
    label: g.label,
    current: String(g.current),
    target: String(g.suggestedTarget),
    best: String(g.best),
    unit: g.unit,
    note: g.note,
  }));
  const whatWorksRows: WhatWorksRow[] = (bm?.correlations ?? []).map((c) => ({
    activity: c.activity,
    uplift: c.uplift,
    tone: c.upliftVariant === "high" ? "green" : c.upliftVariant === "medium" ? "amber" : "grey",
    days: `${c.daysToImpact}d`,
  }));

  return {
    hasData: true,
    stats,
    teamAvgScore: d.teamAvgScore,
    territories,
    marketTiers,
    normRows,
    attrSummary,
    attrBars,
    attrBarMax,
    attrBarTicks: [0.25, 0.5, 0.75, 1].map((f) => Math.round(attrBarMax * f)),
    attrBreakdown,
    channelSummary,
    channelBars,
    channelAxisMax,
    channelTicks,
    channelTable,
    cpcTrend: {
      value: tr?.currentCpc ?? "—",
      target: tr?.targetCpc ?? "—",
      subtitle: tr ? `~${tr.monthsToTarget} months to target` : "",
    },
    efficiencyTrend: {
      value: tr ? pct(tr.efficiencyPct) : "—",
      change: tr?.efficiencyChange ?? "",
      subtitle: "Team-wide normalized score",
    },
    bdmPerformance: {
      improving: tr?.improvingCount ?? 0,
      declining: tr?.decliningCount ?? 0,
      stable: tr?.stableCount ?? 0,
    },
    cpcTrajectory,
    cpcTarget,
    cpcAxisMax,
    cpcYTicks: ticksFor(cpcAxisMax, (n) => m0(n)),
    cpcXLabels: (tr?.cpcTrend ?? []).map((p) => p.month),
    trendScatter,
    scatterAxisMax,
    scatterYTicks: ticksFor(scatterAxisMax, (n) => String(Math.round(n))),
    scatterXLabels: (tr?.teamEfficiency ?? []).map((p) => p.month),
    costsTable,
    compareBdms,
    radarAlpha: A ? dims(A) : [],
    radarBeta: B ? dims(B) : [],
    radarTop25: [
      t25.costEfficiency,
      t25.conversion,
      t25.fulfilment,
      t25.activity,
      t25.coverage,
      t25.ordersPerWeek,
    ],
    portfolioNames: [A?.name ?? "Territory A", B?.name ?? "Territory B"],
    compareTable,
    forecastLine,
    forecastTarget,
    forecastAxisMax,
    forecastYValues,
    forecastXLabels: (fc?.points ?? []).map((p) => p.month),
    currentCpc: {
      value: fc?.currentCpc ?? "—",
      note: fc ? `Improvement: ${fc.improvementPerMonth}/mo` : "",
    },
    convergence: fc?.convergenceDate ?? "—",
    targetCpc: { value: fc?.targetCpc ?? "—", gap: fc?.targetGap ?? "" },
    investSliders,
    whatGoodLooksLike: bm?.insights ?? [],
    goalSettings,
    whatWorksRows,
  };
}
