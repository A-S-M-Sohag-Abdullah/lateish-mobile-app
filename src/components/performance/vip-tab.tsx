import {
  CircleAlert,
  CircleCheck,
  Minus,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

import { CornerAccent } from "@/components/ui/corner-accent";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  VIP_ALERTS,
  VIP_BAR_TICKS,
  VIP_DISTRIBUTOR_BARS,
  VIP_EXPECTED_MARKETS,
  VIP_EXPECTED_SUMMARY,
  VIP_DISTRIBUTOR_AVG,
  VIP_DISTRIBUTORS_HEALTH,
  VIP_MARKET_DONUT,
  VIP_PRICING_ALERT,
  VIP_PRICING_ROWS,
  VIP_PRICING_STATS,
  VIP_SKUS,
  VIP_STATS,
  VIP_SUBTABS,
  VIP_TERRITORIES,
  VIP_TERRITORY_STATS,
  VIP_UNDERPERFORMING,
  type DepletionStat,
  type PricingStat,
} from "@/lib/performance-data";

const usd = (n: number) => "$" + n.toLocaleString("en-US");
const NAVY_GRAD: GradientColors = ["#132B5C", "#0B1833"];
const TILE_GREEN = "#15803D";

const GREEN = "#22C55E";
const MUTED = "#94A3B8";

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

export function VipTab() {
  const [sub, setSub] = useState<string>("Depletions");
  const header = SUB_HEADER[sub] ?? DEFAULT_HEADER;

  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text className="text-2xl font-bold">{header.title}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          {header.subtitle}
        </Text>
      </View>

      {/* Sub tabs (single scrollable line) */}
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

      {sub === "Depletions" ? <VipDepletions /> : null}
      {sub === "Expected" ? <VipExpected /> : null}
      {sub === "Territory" ? <VipTerritory /> : null}
      {sub === "Pricing" ? <VipPricing /> : null}
      {sub === "Distributor" ? <VipDistributor /> : null}
      {sub === "Alerts" ? <VipAlerts /> : null}
      {sub !== "Depletions" &&
      sub !== "Expected" &&
      sub !== "Territory" &&
      sub !== "Pricing" &&
      sub !== "Distributor" &&
      sub !== "Alerts" ? (
        <VipStub name={sub} />
      ) : null}
    </View>
  );
}

function VipDepletions() {
  return (
    <View className="gap-4">
      {/* Stat cards */}
      {VIP_STATS.map((s) => (
        <StatRow key={s.label} stat={s} />
      ))}

      {/* Cases by Distributor */}
      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <Text className="text-base font-semibold">Cases by Distributor</Text>
        <DistributorBarChart />
      </View>

      {/* Cases by Market */}
      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <Text className="text-base font-semibold">Cases by Market</Text>
        <DonutChart />
      </View>

      {/* SKU Performance */}
      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <View className="gap-0.5">
          <Text className="text-base font-semibold">SKU Performance</Text>
          <Text className="text-sm text-muted-foreground">
            Depletion breakdown by product
          </Text>
        </View>
        {VIP_SKUS.map((s, i) => (
          <View
            key={s.name}
            className={cn(
              "flex-row items-center justify-between",
              i > 0 && "border-t border-border/50 pt-3",
            )}
          >
            <View className="gap-0.5">
              <Text className="text-sm font-medium">{s.name}</Text>
              <Text className="text-xs text-muted-foreground">
                {s.cases} Cases
              </Text>
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

function StatRow({ stat }: { stat: DepletionStat }) {
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

// ── Alerts panel ─────────────────────────────────────────────────────────────

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

function VipAlerts() {
  return (
    <View className="gap-4">
      {VIP_ALERTS.map((a, i) => {
        const s = ALERT_STYLE[a.severity];
        return (
          <View
            key={i}
            className={cn("gap-2 rounded-2xl border p-4", s.card)}
          >
            <View className="flex-row items-center gap-2">
              <View className={cn("rounded-md border px-2 py-0.5", s.badge)}>
                <Text className={cn("text-xs font-medium", s.text)}>
                  {s.label}
                </Text>
              </View>
              <Text className="flex-1 text-base font-medium">{a.title}</Text>
            </View>
            <Text className="text-sm leading-5 text-muted-foreground">
              {a.body}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Distributor panel ────────────────────────────────────────────────────────

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

function VipDistributor() {
  return (
    <View className="gap-4">
      {/* Average health */}
      <View className="gap-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <Text className="text-sm text-muted-foreground">
          Average Distributor Health Score
        </Text>
        <Text className="text-3xl font-bold text-white">
          {VIP_DISTRIBUTOR_AVG}
        </Text>
      </View>

      {/* Distributor cards */}
      {VIP_DISTRIBUTORS_HEALTH.map((d) => {
        const badge = healthBadge(d.healthScore);
        return (
          <View
            key={d.name}
            className="gap-3 rounded-2xl border border-border bg-card p-4"
          >
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
                <Text className="text-sm text-muted-foreground">
                  Health Score
                </Text>
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
                  {d.pricingIssues} pricing issue
                  {d.pricingIssues !== 1 ? "s" : ""}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}

      {/* Market-level table */}
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
          <Text
            style={{ flex: 1 }}
            className="text-xs font-medium text-muted-foreground"
          >
            Market
          </Text>
          <Text
            style={{ flex: 1.4 }}
            className="text-xs font-medium text-muted-foreground"
          >
            Distributor
          </Text>
          <Text
            style={{ flex: 1.3 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Health score
          </Text>
        </View>
        {VIP_DISTRIBUTORS_HEALTH.map((d) => (
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
            <View
              style={{ flex: 1.3 }}
              className="flex-row items-center justify-end gap-1.5"
            >
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

// ── Pricing panel ────────────────────────────────────────────────────────────

const PRICING_TONE: Record<PricingStat["tone"], string> = {
  green: "border-emerald-500/20 bg-emerald-500/10",
  amber: "border-amber-500/20 bg-amber-500/10",
  red: "border-red-500/20 bg-red-500/10",
};

function VipPricing() {
  return (
    <View className="gap-4">
      {/* Corridor tiles */}
      <View className="flex-row gap-3">
        {VIP_PRICING_STATS.map((s) => (
          <View
            key={s.label}
            className={cn(
              "flex-1 gap-1 rounded-xl border p-4",
              PRICING_TONE[s.tone],
            )}
          >
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {s.label}
            </Text>
            <Text className="text-2xl font-bold text-white">{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Alert */}
      <View className="flex-row items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <TriangleAlert color="#F87171" size={20} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-sm leading-5 text-red-300">
          {VIP_PRICING_ALERT}
        </Text>
      </View>

      {/* Market Performance Detail */}
      <View className="gap-3 rounded-lg bg-white/5 p-4">
        <Text className="text-base font-semibold">Market Performance Detail</Text>
        <View className="flex-row border-b border-border pb-2">
          <Text
            style={{ flex: 1.9 }}
            className="text-xs font-medium text-muted-foreground"
          >
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
        {VIP_PRICING_ROWS.map((r) => (
          <View
            key={r.name}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text
              style={{ flex: 1.9 }}
              className="text-sm font-medium"
              numberOfLines={1}
            >
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

// ── Territory panel ──────────────────────────────────────────────────────────

function VipTerritory() {
  const maxCases = Math.max(...VIP_TERRITORIES.map((t) => t.cases));
  return (
    <View className="gap-4">
      {/* Summary tiles */}
      <View className="flex-row gap-3">
        {VIP_TERRITORY_STATS.map((s) => (
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

      {/* Market tiles */}
      <View className="flex-row gap-3">
        {VIP_TERRITORIES.map((t) => (
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

      {/* Legend */}
      <View className="flex-row justify-center gap-4">
        <LegendDot color="#10B981" label="High Volume" />
        <LegendDot color="#F59E0B" label="Medium" />
        <LegendDot color="#6B7280" label="Low" />
      </View>
    </View>
  );
}

// ── Expected panel ───────────────────────────────────────────────────────────

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

function VipExpected() {
  return (
    <View className="gap-4">
      <ExpectedStat label="Avg Performance vs Expected">
        <View className="flex-row items-center gap-2">
          <Minus color={MUTED} size={18} />
          <Text
            className={cn(
              "text-2xl font-bold",
              VIP_EXPECTED_SUMMARY.avgNegative
                ? "text-red-500"
                : "text-green-500",
            )}
          >
            {VIP_EXPECTED_SUMMARY.avg}
          </Text>
        </View>
      </ExpectedStat>
      <ExpectedStat label="Total Expected NSV">
        <Text className="text-2xl font-bold">
          {VIP_EXPECTED_SUMMARY.totalExpected}
        </Text>
      </ExpectedStat>
      <ExpectedStat label="Total Realized NSV">
        <Text className="text-2xl font-bold">
          {VIP_EXPECTED_SUMMARY.totalRealized}
        </Text>
      </ExpectedStat>

      {/* Underperforming alert */}
      <View className="flex-row items-start gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/5 p-4">
        <TriangleAlert color="#F59E0B" size={20} style={{ marginTop: 2 }} />
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-amber-500">
            Underperforming Markets
          </Text>
          <Text className="text-sm leading-5 text-muted-foreground">
            {VIP_UNDERPERFORMING}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View className="gap-3">
        <Text className="text-base font-semibold">
          Expected vs Realized NSV by Market
        </Text>
        <GroupedBarChart />
        <View className="flex-row justify-center gap-4">
          <LegendDot color="#6B7280" label="Expected" />
          <LegendDot color="#FFFFFF" label="Realized" />
        </View>
      </View>

      {/* Market Performance Detail */}
      <View className="gap-3 rounded-lg bg-white/5 p-4">
        <Text className="text-base font-semibold">Market Performance Detail</Text>
        {/* header */}
        <View className="flex-row border-b border-border pb-2">
          <Text
            style={{ flex: 1 }}
            className="text-xs font-medium text-muted-foreground"
          >
            Market
          </Text>
          <Text
            style={{ flex: 1.9 }}
            className="text-xs font-medium text-muted-foreground"
          >
            Distributor
          </Text>
          <Text
            style={{ flex: 1.2 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Expected NSV
          </Text>
          <Text
            style={{ flex: 1.2 }}
            className="text-right text-xs font-medium text-muted-foreground"
          >
            Realized NSV
          </Text>
        </View>
        {VIP_EXPECTED_MARKETS.map((m) => (
          <View
            key={m.name}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text
              style={{ flex: 1 }}
              className="text-sm font-medium"
              numberOfLines={1}
            >
              {m.name}
            </Text>
            <Text style={{ flex: 1.9 }} className="text-sm" numberOfLines={1}>
              {m.distributor}
            </Text>
            <Text style={{ flex: 1.2 }} className="text-right text-sm">
              {usd(m.expected)}
            </Text>
            <Text style={{ flex: 1.2 }} className="text-right text-sm">
              {usd(m.realized)}
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
      <View
        style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }}
      />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

const GBAR_H = 200;
const GPAD_T = 10;
const GPAD_B = 26;
const GPAD_L = 40;
const AXIS = "rgba(255,255,255,0.3)";
const GBAR_MAX = 12000;
const GBAR_W = 22;
const GBAR_GAP = 6;
const GBAR_TICKS = [0, 0.25, 0.5, 0.75, 1]; // top → bottom fractions

function GroupedBarChart() {
  const [w, setW] = useState(0);
  const plotH = GBAR_H - GPAD_T - GPAD_B;
  const y0 = GPAD_T + plotH;
  const y = (v: number) => GPAD_T + (1 - v / GBAR_MAX) * plotH;
  const groupW = (w - GPAD_L) / VIP_EXPECTED_MARKETS.length;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={GBAR_H}>
          {/* dashed gridlines */}
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
          {/* solid vertical axis */}
          <Line
            x1={GPAD_L}
            x2={GPAD_L}
            y1={GPAD_T}
            y2={y0}
            stroke={AXIS}
            strokeWidth={1.5}
          />
          {/* left tick marks + labels */}
          {GBAR_TICKS.map((g) => (
            <Line
              key={`tk${g}`}
              x1={GPAD_L - 5}
              x2={GPAD_L}
              y1={GPAD_T + g * plotH}
              y2={GPAD_T + g * plotH}
              stroke={AXIS}
              strokeWidth={1.5}
            />
          ))}
          {GBAR_TICKS.map((g) => (
            <SvgText
              key={`yl${g}`}
              x={GPAD_L - 9}
              y={GPAD_T + g * plotH + 3}
              fontSize={10}
              fill={MUTED}
              textAnchor="end"
            >
              {`$${Math.round(((1 - g) * GBAR_MAX) / 1000)}k`}
            </SvgText>
          ))}

          {VIP_EXPECTED_MARKETS.map((m, i) => {
            const cx = GPAD_L + groupW * i + groupW / 2;
            return (
              <Rect
                key={`e${i}`}
                x={cx - GBAR_W - GBAR_GAP / 2}
                y={y(m.expected)}
                width={GBAR_W}
                height={y0 - y(m.expected)}
                rx={3}
                fill="#6B7280"
              />
            );
          })}
          {VIP_EXPECTED_MARKETS.map((m, i) => {
            const cx = GPAD_L + groupW * i + groupW / 2;
            return (
              <Rect
                key={`r${i}`}
                x={cx + GBAR_GAP / 2}
                y={y(m.realized)}
                width={GBAR_W}
                height={y0 - y(m.realized)}
                rx={3}
                fill="#FFFFFF"
              />
            );
          })}
          {VIP_EXPECTED_MARKETS.map((m, i) => (
            <SvgText
              key={`l${i}`}
              x={GPAD_L + groupW * i + groupW / 2}
              y={GBAR_H - 8}
              fontSize={10}
              fill={MUTED}
              textAnchor="middle"
            >
              {m.name}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: GBAR_H }} />
      )}
    </View>
  );
}

// ── Charts ───────────────────────────────────────────────────────────────────

const BAR_LABEL_W = 68;
const BAR_H = 22;
const BAR_GAP = 20;
const BAR_AXIS_MAX = 230;
const BAR_PAD_T = 6;

function DistributorBarChart() {
  const [w, setW] = useState(0);
  const rows = VIP_DISTRIBUTOR_BARS.length;
  const plotX0 = BAR_LABEL_W;
  const plotW = Math.max(0, w - plotX0 - 10);
  const x = (v: number) => plotX0 + (v / BAR_AXIS_MAX) * plotW;
  // Tall enough for the axis tick labels below the baseline.
  const axisY = BAR_PAD_T + (rows - 1) * (BAR_H + BAR_GAP) + BAR_H + 12;
  const height = axisY + 22;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          {/* bars + labels */}
          {VIP_DISTRIBUTOR_BARS.map((b, i) => {
            const y = BAR_PAD_T + i * (BAR_H + BAR_GAP);
            return (
              <SvgText
                key={`l${i}`}
                x={0}
                y={y + BAR_H / 2 + 3}
                fontSize={9}
                fill={MUTED}
              >
                {b.label}
              </SvgText>
            );
          })}
          {VIP_DISTRIBUTOR_BARS.map((b, i) => {
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
          {/* axis line + ticks */}
          <Line
            x1={plotX0}
            x2={w - 10}
            y1={axisY}
            y2={axisY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
          {VIP_BAR_TICKS.map((t) => (
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

const DONUT_SIZE = 150;
const DONUT_R = 52;
const DONUT_SW = 20;

function DonutChart() {
  const cx = DONUT_SIZE / 2;
  const cy = DONUT_SIZE / 2;
  const C = 2 * Math.PI * DONUT_R;

  let offset = 0;
  const arcs = VIP_MARKET_DONUT.map((s) => {
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
        {VIP_MARKET_DONUT.map((s) => (
          <View key={s.label} className="flex-row items-center gap-1.5">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: s.color,
              }}
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

function VipStub({ name }: { name: string }) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-border bg-card p-8">
      <Text className="text-base font-semibold">{name}</Text>
      <Text variant="muted" className="text-center text-sm">
        {name} view coming soon.
      </Text>
    </View>
  );
}
