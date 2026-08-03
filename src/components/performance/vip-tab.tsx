import {
  Building2,
  CircleAlert,
  CircleCheck,
  MapPin,
  Minus,
  Package,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

import { CornerAccent } from "@/components/ui/corner-accent";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { usePerformanceDashboard } from "@/hooks/use-performance-dashboard";
import { cn } from "@/lib/utils";
import type { VipData } from "@/types/performance";

const NAVY_GRAD: GradientColors = ["#132B5C", "#0B1833"];
const TILE_GREEN = "#15803D";
const GREEN = "#22C55E";
const MUTED = "#94A3B8";
const DONUT_PALETTE = ["#22C55E", "#9CA3AF", "#EAB308", "#A855F7", "#3B82F6"];

const VIP_SUBTABS = [
  "Depletions",
  "Expected",
  "Territory",
  "Pricing",
  "Distributor",
  "Alerts",
] as const;

const SUB_HEADER: Record<string, { title: string; subtitle: string }> = {
  Pricing: {
    title: "Pricing Intelligence Overlay",
    subtitle: "VIP wholesale prices vs. pricing ladder corridors",
  },
  Alerts: {
    title: "Alerts and Recommendations",
    subtitle: "AI generated insights from VIP Data analysis",
  },
};
const DEFAULT_HEADER = {
  title: "VIP Intelligence",
  subtitle: "Realised vs Expected performance from ingested data",
};

// ── Mapping ───────────────────────────────────────────────────────────────────

const fmtNsv = (n: number, sym: string) =>
  n % 1 === 0
    ? `${sym}${n.toLocaleString("en-US")}`
    : `${sym}${n.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}`;
const kUsd = (n: number, sym: string) => `${sym}${(n / 1000).toFixed(1)}K`;

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function mapVip(vip: VipData, symbol: string) {
  const totalCases = vip.skus.reduce((s, k) => s + k.cases, 0);
  const totalNsv = vip.skus.reduce((s, k) => s + k.nsv, 0);

  const stats = [
    { label: "Total Cases", value: String(totalCases), icon: Package, color: "#22C55E" },
    { label: "Total NSV", value: fmtNsv(totalNsv, symbol), icon: TrendingUp, color: "#22C55E" },
    { label: "Markets", value: String(vip.markets.length), icon: MapPin, color: "#3B82F6" },
    { label: "Distributors", value: String(vip.distributors.length), icon: Building2, color: "#A855F7" },
  ];

  const barMax = niceMax(Math.max(1, ...vip.distributors.map((d) => d.cases)));
  const distributorBars = vip.distributors.map((d) => ({ label: d.name, value: d.cases }));
  const barTicks = [0.25, 0.5, 0.75, 1].map((f) => Math.round(barMax * f));

  const donut = vip.markets.map((mk, i) => ({
    label: mk.name,
    pct: totalCases > 0 ? Math.round((mk.cases / vip.markets.reduce((s, x) => s + x.cases, 0)) * 100) : 0,
    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));
  const skuTotal = vip.skus.reduce((s, k) => s + k.cases, 0) || 1;
  const skus = vip.skus.map((k) => ({
    name: k.name,
    cases: k.cases,
    value: fmtNsv(k.nsv, symbol),
    pct: `${Math.round((k.cases / skuTotal) * 100)}%`,
  }));

  // Expected
  const em = vip.expected.markets;
  const totalExpected = em.reduce((s, x) => s + x.expectedNsv, 0);
  const totalRealized = em.reduce((s, x) => s + x.realizedNsv, 0);
  const avgPct = totalExpected > 0 ? ((totalRealized - totalExpected) / totalExpected) * 100 : 0;
  const under = em.find((x) => x.realizedNsv < x.expectedNsv * 0.9);
  const expected = {
    avg: `${avgPct >= 0 ? "+" : ""}${avgPct.toFixed(1)}%`,
    avgNegative: avgPct < 0,
    totalExpected: fmtNsv(totalExpected, symbol),
    totalRealized: fmtNsv(totalRealized, symbol),
    underperforming: under
      ? `${under.name} is more than 10% below expected velocity.`
      : "All markets are meeting expected velocity.",
    markets: em.map((x) => ({
      name: x.name,
      distributor: x.distributor,
      expected: x.expectedNsv,
      realized: x.realizedNsv,
    })),
    barMax: niceMax(Math.max(1, ...em.flatMap((x) => [x.expectedNsv, x.realizedNsv]))),
    hasUnder: !!under,
  };

  // Territory
  const territory = {
    stats: [
      { label: "Active Markets", value: String(vip.markets.length) },
      { label: "Total Cases", value: String(totalCases) },
      { label: "Total NSV", value: kUsd(totalNsv, symbol) },
    ],
    territories: vip.markets.map((mk) => ({ name: mk.name, cases: mk.cases })),
  };

  // Pricing
  const ps = vip.pricing.skus;
  const outside = ps.filter(
    (s) => s.wholesalePrice < s.corridorMin || s.wholesalePrice > s.corridorMax,
  ).length;
  const within = ps.length - outside;
  const pricing = {
    stats: [
      { label: "Within Corridor", value: String(within), tone: "green" as const },
      { label: "Borderline", value: "0", tone: "amber" as const },
      { label: "Outside", value: String(outside), tone: "red" as const },
    ],
    alert:
      outside > 0
        ? `${outside} SKU${outside !== 1 ? "s are" : " is"} pricing outside the recommended corridor. Review distributor agreements or adjust pricing strategy`
        : "All SKUs are pricing within the recommended corridor.",
    rows: ps.map((s) => ({
      name: s.name,
      wholesale: fmtNsv(s.wholesalePrice, symbol),
      corridor: `${fmtNsv(s.corridorMin, symbol)}-${fmtNsv(s.corridorMax, symbol)}`,
    })),
    hasOutside: outside > 0,
  };

  // Distributor health
  const dh = vip.distributorPerf.distributors;
  const avgHealth = dh.length
    ? Math.round(dh.reduce((s, d) => s + d.healthScore, 0) / dh.length)
    : 0;
  const distributor = {
    avg: `${avgHealth}/100`,
    health: dh.map((d) => ({
      name: d.name,
      market: d.market,
      healthScore: d.healthScore,
      cases: String(d.cases),
      nsv: fmtNsv(d.nsv, symbol),
      pricingIssues: d.pricingIssues,
      within: d.pricingStatus === "within",
    })),
  };

  // Alerts (derived)
  const alerts: { severity: "warning" | "critical"; title: string; body: string }[] = [];
  dh.forEach((d) => {
    if (d.healthScore < 70)
      alerts.push({
        severity: d.healthScore < 60 ? "critical" : "warning",
        title: `${d.name} health score ${d.healthScore < 60 ? "critical" : "low"} in ${d.market}`,
        body: `Score: ${d.healthScore}/100. Potential fulfilment or stock issues.`,
      });
    if (d.pricingStatus === "above")
      alerts.push({
        severity: "warning",
        title: `${d.market} wholesale pricing above corridor`,
        body: `Avg wholesale ${fmtNsv(d.avgWholesale, symbol)} may be limiting velocity. Consider pricing adjustment.`,
      });
  });
  em.forEach((x) => {
    if (x.realizedNsv < x.expectedNsv * 0.9)
      alerts.push({
        severity: "warning",
        title: `${x.name} underperforming`,
        body: `${Math.round((1 - x.realizedNsv / x.expectedNsv) * 100)}% below projected velocity. Review distributor execution and stock levels.`,
      });
  });

  return { stats, barMax, distributorBars, barTicks, donut, skus, expected, territory, pricing, distributor, alerts };
}

type VipMapped = ReturnType<typeof mapVip>;

// ── Tab ───────────────────────────────────────────────────────────────────────

export function VipTab() {
  const { data, isLoading, symbol } = usePerformanceDashboard(30);
  const [sub, setSub] = useState<string>("Depletions");
  const header = SUB_HEADER[sub] ?? DEFAULT_HEADER;
  const m = data ? mapVip(data.vip, symbol) : null;

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold">{header.title}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          {header.subtitle}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {VIP_SUBTABS.map((t) => {
          const active = t === sub;
          return (
            <Pressable
              key={t}
              onPress={() => setSub(t)}
              className={cn(
                "h-9 items-center justify-center rounded-md px-3.5",
                active ? "bg-brand-maroon" : "bg-secondary",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-white" : "text-muted-foreground",
                )}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading || !m ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">
          Loading VIP intelligence…
        </Text>
      ) : sub === "Depletions" ? (
        <VipDepletions m={m} />
      ) : sub === "Expected" ? (
        <VipExpected m={m} />
      ) : sub === "Territory" ? (
        <VipTerritory m={m} />
      ) : sub === "Pricing" ? (
        <VipPricing m={m} />
      ) : sub === "Distributor" ? (
        <VipDistributor m={m} />
      ) : (
        <VipAlerts m={m} />
      )}
    </View>
  );
}

function VipDepletions({ m }: { m: VipMapped }) {
  return (
    <View className="gap-4">
      {m.stats.map((s) => (
        <StatRow key={s.label} stat={s} />
      ))}

      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <Text className="text-base font-semibold">Cases by Distributor</Text>
        <DistributorBarChart bars={m.distributorBars} max={m.barMax} ticks={m.barTicks} />
      </View>

      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <Text className="text-base font-semibold">Cases by Market</Text>
        <DonutChart slices={m.donut} />
      </View>

      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <View className="gap-0.5">
          <Text className="text-base font-semibold">SKU Performance</Text>
          <Text className="text-sm text-muted-foreground">
            Depletion breakdown by product
          </Text>
        </View>
        {m.skus.map((s, i) => (
          <View
            key={s.name}
            className={cn(
              "flex-row items-center justify-between",
              i > 0 && "border-t border-border/50 pt-3",
            )}
          >
            <View className="gap-0.5">
              <Text className="text-sm font-medium">{s.name}</Text>
              <Text className="text-xs text-muted-foreground">{s.cases} Cases</Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-sm font-bold">{s.value}</Text>
              <View className="rounded bg-secondary px-1.5 py-0.5">
                <Text className="text-[10px] text-muted-foreground">{s.pct}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatRow({
  stat,
}: {
  stat: { label: string; value: string; icon: LucideIcon; color: string };
}) {
  const Icon = stat.icon;
  return (
    <View className="gap-2 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <Icon color={stat.color} size={18} />
        <Text className="text-sm text-muted-foreground">{stat.label}</Text>
      </View>
      <Text className="text-2xl font-bold">{stat.value}</Text>
    </View>
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────

const ALERT_STYLE = {
  warning: {
    card: "border-amber-500/40 bg-amber-500/5",
    badge: "border-amber-500/40 bg-amber-500/20",
    text: "text-amber-500",
    label: "Warning",
  },
  critical: {
    card: "border-red-500/40 bg-red-500/5",
    badge: "border-red-500/40 bg-red-500/20",
    text: "text-red-500",
    label: "Critical",
  },
} as const;

function VipAlerts({ m }: { m: VipMapped }) {
  if (m.alerts.length === 0) {
    return (
      <View className="items-center gap-2 rounded-2xl border border-border bg-card p-8">
        <CircleCheck color="#22C55E" size={36} />
        <Text className="text-center text-sm text-muted-foreground">
          No alerts — all VIP metrics look healthy.
        </Text>
      </View>
    );
  }
  return (
    <View className="gap-4">
      {m.alerts.map((a, i) => {
        const s = ALERT_STYLE[a.severity];
        return (
          <View key={i} className={cn("gap-2 rounded-2xl border p-4", s.card)}>
            <View className="flex-row items-center gap-2">
              <View className={cn("rounded-md border px-2 py-0.5", s.badge)}>
                <Text className={cn("text-xs font-medium", s.text)}>{s.label}</Text>
              </View>
              <Text className="flex-1 text-base font-medium">{a.title}</Text>
            </View>
            <Text className="text-sm leading-5 text-muted-foreground">{a.body}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Distributor ───────────────────────────────────────────────────────────────

function healthColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F97316";
  return "#EF4444";
}
function healthBadge(score: number) {
  if (score >= 80)
    return { label: "Healthy", cls: "border-green-600/30 bg-green-600/20", text: "text-green-500" };
  if (score >= 60)
    return { label: "At Risk", cls: "border-amber-600/30 bg-amber-600/20", text: "text-amber-500" };
  return { label: "Critical", cls: "border-red-600/30 bg-red-600/20", text: "text-red-500" };
}

function HealthBar({ score }: { score: number }) {
  return (
    <View className="h-2.5 flex-row overflow-hidden rounded-full">
      <View style={{ width: `${score}%`, backgroundColor: "#FFFFFF" }} />
      <View style={{ flex: 1, backgroundColor: healthColor(score) }} />
    </View>
  );
}

function VipDistributor({ m }: { m: VipMapped }) {
  return (
    <View className="gap-4">
      <View className="gap-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <Text className="text-sm text-muted-foreground">
          Average Distributor Health Score
        </Text>
        <Text className="text-3xl font-bold text-white">{m.distributor.avg}</Text>
      </View>

      {m.distributor.health.map((d) => {
        const badge = healthBadge(d.healthScore);
        return (
          <View key={d.name} className="gap-3 rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-base font-semibold">{d.name}</Text>
                <Text className="text-sm text-muted-foreground">{d.market}</Text>
              </View>
              <View className={cn("rounded-md border px-2 py-0.5", badge.cls)}>
                <Text className={cn("text-xs font-medium", badge.text)}>
                  {badge.label}
                </Text>
              </View>
            </View>

            <View className="gap-1.5">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Health Score</Text>
                <Text className="text-sm font-medium">{d.healthScore}/100</Text>
              </View>
              <HealthBar score={d.healthScore} />
            </View>

            <View className="flex-row">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm text-muted-foreground">Cases</Text>
                <Text className="text-sm font-medium">{d.cases}</Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm text-muted-foreground">NSV</Text>
                <Text className="text-sm font-medium">{d.nsv}</Text>
              </View>
            </View>

            {d.pricingIssues > 0 ? (
              <View className="border-t border-border pt-3">
                <Text className="text-xs font-medium text-amber-500">
                  {d.pricingIssues} pricing issue{d.pricingIssues !== 1 ? "s" : ""}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}

      <View className="gap-3 rounded-lg bg-white/5 p-4">
        <View className="gap-0.5">
          <Text className="text-base font-semibold">
            Market Level Distributor Performance
          </Text>
          <Text className="text-sm text-muted-foreground">
            Health scores and pricing corridor status by market
          </Text>
        </View>
        <View className="flex-row border-b border-border pb-2">
          <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground">
            Market
          </Text>
          <Text style={{ flex: 1.4 }} className="text-xs font-medium text-muted-foreground">
            Distributor
          </Text>
          <Text
            style={{ flex: 1.3 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Health score
          </Text>
        </View>
        {m.distributor.health.map((d) => (
          <View
            key={d.name}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text style={{ flex: 1 }} className="text-sm font-medium">
              {d.market}
            </Text>
            <Text style={{ flex: 1.4 }} className="text-sm" numberOfLines={1}>
              {d.name}
            </Text>
            <View style={{ flex: 1.3 }} className="flex-row items-center justify-end gap-1.5">
              {d.healthScore >= 80 ? (
                <CircleCheck color="#22C55E" size={16} />
              ) : (
                <CircleAlert color="#F97316" size={16} />
              )}
              <Text className="text-sm font-medium">{d.healthScore}</Text>
              {d.within ? (
                <View className="rounded border border-green-600/30 bg-green-600/20 px-1.5 py-0.5">
                  <Text className="text-[10px] text-green-500">Within</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

const PRICING_TONE: Record<"green" | "amber" | "red", string> = {
  green: "border-emerald-500/20 bg-emerald-500/10",
  amber: "border-amber-500/20 bg-amber-500/10",
  red: "border-red-500/20 bg-red-500/10",
};

function VipPricing({ m }: { m: VipMapped }) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        {m.pricing.stats.map((s) => (
          <View
            key={s.label}
            className={cn("flex-1 gap-1 rounded-xl border p-4", PRICING_TONE[s.tone])}
          >
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {s.label}
            </Text>
            <Text className="text-2xl font-bold text-white">{s.value}</Text>
          </View>
        ))}
      </View>

      {m.pricing.hasOutside ? (
        <View className="flex-row items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <TriangleAlert color="#F87171" size={20} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-sm leading-5 text-red-300">
            {m.pricing.alert}
          </Text>
        </View>
      ) : null}

      <View className="gap-3 rounded-lg bg-white/5 p-4">
        <Text className="text-base font-semibold">Market Performance Detail</Text>
        <View className="flex-row border-b border-border pb-2">
          <Text style={{ flex: 1.9 }} className="text-xs font-medium text-muted-foreground">
            Market
          </Text>
          <Text
            style={{ flex: 1.1 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            VIP Wholesale
          </Text>
          <Text
            style={{ flex: 1.2 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Corridor
          </Text>
        </View>
        {m.pricing.rows.map((r) => (
          <View
            key={r.name}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text style={{ flex: 1.9 }} className="text-sm font-medium" numberOfLines={1}>
              {r.name}
            </Text>
            <Text style={{ flex: 1.1 }} className="text-right text-sm">
              {r.wholesale}
            </Text>
            <Text style={{ flex: 1.2 }} className="text-right text-sm">
              {r.corridor}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Territory ─────────────────────────────────────────────────────────────────

function VipTerritory({ m }: { m: VipMapped }) {
  const maxCases = Math.max(1, ...m.territory.territories.map((t) => t.cases));
  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        {m.territory.stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            colors={NAVY_GRAD}
            className="h-24"
            valueClassName="text-xl"
          />
        ))}
      </View>

      <View className="flex-row gap-3">
        {m.territory.territories.map((t) => (
          <View
            key={t.name}
            className="h-24 flex-1 overflow-hidden rounded-2xl"
            style={{ backgroundColor: TILE_GREEN }}
          >
            <CornerAccent />
            <View className="flex-1 justify-between p-4">
              <Text className="text-sm text-white/80" numberOfLines={1}>
                {t.name}
              </Text>
              <Text className="text-2xl font-bold text-white">{t.cases}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: "rgba(0,0,0,0.25)" }}>
              <View
                style={{
                  height: 6,
                  width: `${(t.cases / maxCases) * 100}%`,
                  backgroundColor: "#FFFFFF",
                }}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row justify-center gap-4">
        <LegendDot color="#10B981" label="High Volume" />
        <LegendDot color="#F59E0B" label="Medium" />
        <LegendDot color="#6B7280" label="Low" />
      </View>
    </View>
  );
}

// ── Expected ──────────────────────────────────────────────────────────────────

function ExpectedStat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1 rounded-2xl border border-border bg-card p-4">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}

function VipExpected({ m }: { m: VipMapped }) {
  const e = m.expected;
  return (
    <View className="gap-4">
      <ExpectedStat label="Avg Performance vs Expected">
        <View className="flex-row items-center gap-2">
          <Minus color={MUTED} size={18} />
          <Text
            className={cn(
              "text-2xl font-bold",
              e.avgNegative ? "text-red-500" : "text-green-500",
            )}
          >
            {e.avg}
          </Text>
        </View>
      </ExpectedStat>
      <ExpectedStat label="Total Expected NSV">
        <Text className="text-2xl font-bold">{e.totalExpected}</Text>
      </ExpectedStat>
      <ExpectedStat label="Total Realized NSV">
        <Text className="text-2xl font-bold">{e.totalRealized}</Text>
      </ExpectedStat>

      {e.hasUnder ? (
        <View className="flex-row items-start gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/5 p-4">
          <TriangleAlert color="#F59E0B" size={20} style={{ marginTop: 2 }} />
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-amber-500">
              Underperforming Markets
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              {e.underperforming}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <Text className="text-base font-semibold">
          Expected vs Realized NSV by Market
        </Text>
        <GroupedBarChart markets={e.markets} max={e.barMax} symbol="" />
        <View className="flex-row justify-center gap-4">
          <LegendDot color="#6B7280" label="Expected" />
          <LegendDot color="#FFFFFF" label="Realized" />
        </View>
      </View>

      <View className="gap-3 rounded-lg bg-white/5 p-4">
        <Text className="text-base font-semibold">Market Performance Detail</Text>
        <View className="flex-row border-b border-border pb-2">
          <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground">
            Market
          </Text>
          <Text style={{ flex: 1.9 }} className="text-xs font-medium text-muted-foreground">
            Distributor
          </Text>
          <Text
            style={{ flex: 1.2 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Expected
          </Text>
          <Text
            style={{ flex: 1.2 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Realized
          </Text>
        </View>
        {e.markets.map((mk) => (
          <View
            key={mk.name}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text style={{ flex: 1 }} className="text-sm font-medium" numberOfLines={1}>
              {mk.name}
            </Text>
            <Text style={{ flex: 1.9 }} className="text-sm" numberOfLines={1}>
              {mk.distributor}
            </Text>
            <Text style={{ flex: 1.2 }} className="text-right text-sm">
              {mk.expected.toLocaleString("en-US")}
            </Text>
            <Text style={{ flex: 1.2 }} className="text-right text-sm">
              {mk.realized.toLocaleString("en-US")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

// ── Grouped bar chart (expected vs realized) ─────────────────────────────────

const GBAR_H = 200;
const GPAD_T = 10;
const GPAD_B = 26;
const GPAD_L = 40;
const AXIS = "rgba(255,255,255,0.3)";
const GBAR_W = 22;
const GBAR_GAP = 6;
const GBAR_TICKS = [0, 0.25, 0.5, 0.75, 1];

function GroupedBarChart({
  markets,
  max,
  symbol,
}: {
  markets: { name: string; expected: number; realized: number }[];
  max: number;
  symbol: string;
}) {
  const [w, setW] = useState(0);
  const plotH = GBAR_H - GPAD_T - GPAD_B;
  const y0 = GPAD_T + plotH;
  const y = (v: number) => GPAD_T + (1 - v / max) * plotH;
  const groupW = (w - GPAD_L) / Math.max(1, markets.length);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && markets.length > 0 ? (
        <Svg width={w} height={GBAR_H}>
          {GBAR_TICKS.map((g) => (
            <Line
              key={`g${g}`}
              x1={GPAD_L}
              x2={w}
              y1={GPAD_T + g * plotH}
              y2={GPAD_T + g * plotH}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          <Line x1={GPAD_L} x2={GPAD_L} y1={GPAD_T} y2={y0} stroke={AXIS} strokeWidth={1.5} />
          {GBAR_TICKS.map((g) => (
            <SvgText
              key={`yl${g}`}
              x={GPAD_L - 9}
              y={GPAD_T + g * plotH + 3}
              fontSize={10}
              fill={MUTED}
              textAnchor="end"
            >
              {`${symbol}${Math.round(((1 - g) * max) / 1000)}k`}
            </SvgText>
          ))}
          {markets.map((mk, i) => {
            const cx = GPAD_L + groupW * i + groupW / 2;
            return (
              <Rect
                key={`e${i}`}
                x={cx - GBAR_W - GBAR_GAP / 2}
                y={y(mk.expected)}
                width={GBAR_W}
                height={y0 - y(mk.expected)}
                rx={3}
                fill="#6B7280"
              />
            );
          })}
          {markets.map((mk, i) => {
            const cx = GPAD_L + groupW * i + groupW / 2;
            return (
              <Rect
                key={`r${i}`}
                x={cx + GBAR_GAP / 2}
                y={y(mk.realized)}
                width={GBAR_W}
                height={y0 - y(mk.realized)}
                rx={3}
                fill="#FFFFFF"
              />
            );
          })}
          {markets.map((mk, i) => (
            <SvgText
              key={`l${i}`}
              x={GPAD_L + groupW * i + groupW / 2}
              y={GBAR_H - 8}
              fontSize={10}
              fill={MUTED}
              textAnchor="middle"
            >
              {mk.name}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: GBAR_H }} />
      )}
    </View>
  );
}

// ── Distributor bar chart (cases) ─────────────────────────────────────────────

const BAR_LABEL_W = 68;
const BAR_H = 22;
const BAR_GAP = 20;
const BAR_PAD_T = 6;

function DistributorBarChart({
  bars,
  max,
  ticks,
}: {
  bars: { label: string; value: number }[];
  max: number;
  ticks: number[];
}) {
  const [w, setW] = useState(0);
  const rows = Math.max(1, bars.length);
  const plotX0 = BAR_LABEL_W;
  const plotW = Math.max(0, w - plotX0 - 10);
  const x = (v: number) => plotX0 + (v / max) * plotW;
  const axisY = BAR_PAD_T + (rows - 1) * (BAR_H + BAR_GAP) + BAR_H + 12;
  const height = axisY + 22;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && bars.length > 0 ? (
        <Svg width={w} height={height}>
          {bars.map((b, i) => {
            const y = BAR_PAD_T + i * (BAR_H + BAR_GAP);
            return (
              <SvgText key={`l${i}`} x={0} y={y + BAR_H / 2 + 3} fontSize={9} fill={MUTED}>
                {b.label.length > 12 ? `${b.label.slice(0, 11)}…` : b.label}
              </SvgText>
            );
          })}
          {bars.map((b, i) => {
            const y = BAR_PAD_T + i * (BAR_H + BAR_GAP);
            return (
              <Rect
                key={`b${i}`}
                x={plotX0}
                y={y}
                width={Math.max(0, x(b.value) - plotX0)}
                height={BAR_H}
                rx={3}
                fill={GREEN}
              />
            );
          })}
          <Line
            x1={plotX0}
            x2={w - 10}
            y1={axisY}
            y2={axisY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
          {ticks.map((t) => (
            <SvgText
              key={`t${t}`}
              x={x(t)}
              y={axisY + 14}
              fontSize={10}
              fill={MUTED}
              textAnchor="middle"
            >
              {String(t)}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}

// ── Donut (cases by market) ───────────────────────────────────────────────────

const DONUT_SIZE = 150;
const DONUT_R = 52;
const DONUT_SW = 20;

function DonutChart({
  slices,
}: {
  slices: { label: string; pct: number; color: string }[];
}) {
  const cx = DONUT_SIZE / 2;
  const cy = DONUT_SIZE / 2;
  const C = 2 * Math.PI * DONUT_R;

  let offset = 0;
  const arcs = slices.map((s) => {
    const dash = (s.pct / 100) * C;
    const el = (
      <Circle
        key={s.label}
        cx={cx}
        cy={cy}
        r={DONUT_R}
        stroke={s.color}
        strokeWidth={DONUT_SW}
        fill="none"
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <View className="items-center gap-3">
      <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
        {arcs}
      </Svg>
      <View className="flex-row flex-wrap justify-center gap-4">
        {slices.map((s) => (
          <View key={s.label} className="flex-row items-center gap-1.5">
            <View
              style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }}
            />
            <Text className="text-xs text-muted-foreground">
              {s.label} {s.pct}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
