import {
  Activity,
  ChevronRight,
  Clock,
  Filter,
  LayoutGrid,
  Package,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { RevenueChart } from "@/components/mdi/revenue-chart";
import { TrendChart } from "@/components/mdi/trend-chart";
import { Progress } from "@/components/ui/progress";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { useMdiAnalytics } from "@/hooks/use-mdi-analytics";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import {
  type AccountScore,
  type CapitalBucket,
  type FunnelStage,
  type HeatChannel,
  type PortfolioGap,
  type PredictiveBuyer,
  type PriorityRow,
  type Reliability,
  type RevenueBar,
  type StatTile,
  type TrendPoint,
} from "@/lib/mdi-data";
import type { ApiMdiAnalytics } from "@/types/mdi";

// Navy gradient for the four KPI tiles (shared StatCard look).
const STAT_GRADIENT: GradientColors = ["#132B5C", "#0B1833"];

function niceMax(v: number): number {
  if (!isFinite(v) || v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View className="gap-4 rounded-2xl border border-[#303A46]/50 bg-[#161C22] p-4">
      {children}
    </View>
  );
}

function SectionHead({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2">
          <Icon color={colors.foreground} size={18} />
          <Text className="text-lg font-bold">{title}</Text>
        </View>
        {right}
      </View>
      {subtitle ? (
        <Text className="text-sm leading-5 text-muted-foreground">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-bold">{value}</Text>
    </View>
  );
}

// ── Section components ───────────────────────────────────────────────────────

function StatTiles({ stats }: { stats: StatTile[] }) {
  const rows = [stats.slice(0, 2), stats.slice(2, 4)];
  return (
    <View className="gap-3">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {row.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              colors={STAT_GRADIENT}
              className="h-24"
            />
          ))}
        </View>
      ))}
    </View>
  );
}

interface BrandPipelineRow {
  id: string;
  name: string;
  activeIntents: number;
  uniqueAccounts: number;
  totalCases: number;
  pipelineValue: string;
  conversionRate: number;
}

function BrandPipeline({ data }: { data: BrandPipelineRow[] }) {
  return (
    <View className="gap-4">
      <SectionHead
        icon={Package}
        title="Brand Pipeline"
        subtitle="Active intent pipeline by brand"
      />
      {data.map((b) => (
        <View
          key={b.id}
          className="gap-3 rounded-xl border border-[#303A46]/50 bg-[#161C22] p-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold">{b.name}</Text>
            <View className="rounded-full bg-secondary px-2.5 py-1">
              <Text className="text-xs font-medium text-muted-foreground">
                {b.conversionRate}% conversion
              </Text>
            </View>
          </View>

          <Progress value={b.conversionRate / 100} indicatorClassName="bg-white" />

          <View className="flex-row justify-between border-t border-border/60 pt-3">
            <MiniStat label="Active" value={String(b.activeIntents)} />
            <MiniStat label="Accounts" value={String(b.uniqueAccounts)} />
            <MiniStat label="Cases" value={String(b.totalCases)} />
            <MiniStat label="Pipeline" value={b.pipelineValue} />
          </View>
        </View>
      ))}
      {data.length === 0 ? (
        <Text className="py-4 text-center text-sm text-muted-foreground">
          No brand pipeline yet.
        </Text>
      ) : null}
    </View>
  );
}

const FUNNEL_COLOR: Record<string, string> = {
  neutral: "#FFFFFF",
  muted: "rgba(255,255,255,0.35)",
  success: "#22C55E",
  danger: "#EF4444",
};

function FunnelBar({
  ratio,
  color,
  progress,
}: {
  ratio: number;
  color: string;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    width: `${ratio * progress.value * 100}%`,
  }));
  return (
    <View className="h-6 flex-1 justify-center">
      <Animated.View
        style={[{ backgroundColor: color, height: 24, borderRadius: 6 }, style]}
      />
    </View>
  );
}

function ConversionFunnel({
  stages,
  overall,
}: {
  stages: FunnelStage[];
  overall: string;
}) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 700 });
  }, [stages, progress]);

  return (
    <Panel>
      <SectionHead
        icon={Filter}
        title="Conversion Funnel"
        subtitle="Intent progression from submission to conversion"
        right={
          <Text className="text-xs font-medium text-muted-foreground">
            {overall}
          </Text>
        }
      />
      <View className="gap-2.5">
        {stages.map((s) => (
          <View key={s.label} className="flex-row items-center gap-3">
            <Text
              className="w-28 text-right text-sm text-muted-foreground"
              numberOfLines={1}
            >
              {s.label}
            </Text>
            <FunnelBar
              ratio={s.value / max}
              color={FUNNEL_COLOR[s.tone]}
              progress={progress}
            />
            <View className="w-16 flex-row items-center justify-end gap-1">
              <Text className="text-sm font-bold">{s.value}</Text>
              {s.delta ? (
                <Text className="text-[10px] text-muted-foreground">
                  ({s.delta})
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function SeasonalTrends({ data }: { data: TrendPoint[] }) {
  return (
    <Panel>
      <SectionHead
        icon={Activity}
        title="Seasonal Trends"
        subtitle="12-week rolling volume & conversion"
      />
      <TrendChart data={data} />
    </Panel>
  );
}

function ChannelHeatmap({ data }: { data: HeatChannel[] }) {
  return (
    <Panel>
      <SectionHead
        icon={LayoutGrid}
        title="Channel Heatmap"
        subtitle="Performance by sales channel"
      />
      <View className="gap-3">
        {data.map((c) => (
          <View key={c.channel} className="flex-row items-center gap-3">
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-medium">{c.channel}</Text>
              <Text className="text-xs text-muted-foreground">
                {c.intents} Intents {c.converted} Converted
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground">{c.avgDays}d avg</Text>
            <View className="w-14 items-end gap-1">
              <Text
                className={cn(
                  "text-sm font-bold",
                  c.pct < 40 ? "text-red-500" : "text-foreground",
                )}
              >
                {c.pct}%
              </Text>
              <Progress value={c.pct / 100} className="h-1.5 w-14" />
            </View>
          </View>
        ))}
        {data.length === 0 ? (
          <Text className="py-4 text-center text-sm text-muted-foreground">
            No channel data yet.
          </Text>
        ) : null}
      </View>
    </Panel>
  );
}

function PredictiveScoring({ data }: { data: PredictiveBuyer[] }) {
  return (
    <View className="gap-4">
      <SectionHead
        icon={Target}
        title="Predictive Buyer Scoring"
        subtitle="Heuristic-based conversion predictions combining history, role, confidence, and urgency"
      />
      {data.map((b) => (
        <View
          key={b.email}
          className="gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold">{b.name}</Text>
              <Text className="text-xs text-muted-foreground">{b.email}</Text>
              <View className="mt-1 self-start rounded-full bg-secondary px-2 py-0.5">
                <Text className="text-[10px] text-muted-foreground">{b.role}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[10px] uppercase text-muted-foreground">
                Pred. Conv.
              </Text>
              <Text
                className={cn(
                  "text-2xl font-bold",
                  b.predConv >= 70
                    ? "text-green-500"
                    : b.predConv < 50
                      ? "text-red-500"
                      : "text-foreground",
                )}
              >
                {b.predConv}%
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between border-t border-border/60 pt-3">
            <MiniStat label="Intents" value={String(b.intents)} />
            <MiniStat label="Converted" value={String(b.converted)} />
            <MiniStat label="Hist. Rate" value={`${b.histRate}%`} />
          </View>
        </View>
      ))}
      {data.length === 0 ? (
        <Text className="py-4 text-center text-sm text-muted-foreground">
          No buyer data yet.
        </Text>
      ) : null}
    </View>
  );
}

const RELIABILITY_STYLE: Record<Reliability, string> = {
  HIGH: "text-green-500",
  MEDIUM: "text-foreground",
  LOW: "text-red-500",
};

function AccountScoring({ data }: { data: AccountScore[] }) {
  return (
    <View className="gap-4">
      <SectionHead
        icon={Users}
        title="Buyer & Account Scoring"
        subtitle="Track buyer reliability based on intent-to-conversion patterns"
      />
      {data.map((a) => (
        <View
          key={a.email}
          className="gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold">{a.name}</Text>
              <Text className="text-xs text-muted-foreground">{a.email}</Text>
            </View>
            <View className="items-end gap-0.5">
              <Text className="text-[10px] uppercase text-muted-foreground">
                Reliability
              </Text>
              <Text className={cn("text-xs font-bold", RELIABILITY_STYLE[a.reliability])}>
                {a.reliability}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between border-t border-border/60 pt-3">
            <MiniStat label="Total Intents" value={String(a.totalIntents)} />
            <MiniStat label="Conv. Rate" value={`${a.convRate}%`} />
            <MiniStat label="Avg Days" value={String(a.avgDays)} />
          </View>
        </View>
      ))}
    </View>
  );
}

function PortfolioGaps({ data }: { data: PortfolioGap[] }) {
  return (
    <View className="gap-4">
      <SectionHead
        icon={LayoutGrid}
        title="Portfolio Gap Detection"
        subtitle="Accounts with partial brand coverage — upsell opportunities"
      />
      {data.map((g) => (
        <View
          key={g.account}
          className="gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <View>
            <Text className="text-base font-semibold">{g.account}</Text>
            <Text className="text-xs text-muted-foreground">{g.city}</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {g.listed.map((b) => (
              <View key={b} className="rounded-md border border-border px-2 py-1">
                <Text className="text-xs">{b}</Text>
              </View>
            ))}
            {g.missing.map((b) => (
              <View
                key={b}
                className="flex-row items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1"
              >
                <Text className="text-xs text-red-400">{b}</Text>
                <X color="#F87171" size={12} />
              </View>
            ))}
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">
              {g.listedCount} of {g.total} brands listed
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-green-500">
                Capture Intent
              </Text>
              <ChevronRight color="#22C55E" size={16} />
            </View>
          </View>
        </View>
      ))}
      {data.length === 0 ? (
        <Text className="py-4 text-center text-sm text-muted-foreground">
          Need intents across multiple brands and accounts to detect gaps.
        </Text>
      ) : null}
    </View>
  );
}

function IntentToRevenue({
  data,
  total,
  axisMax,
  symbol,
}: {
  data: RevenueBar[];
  total: string;
  axisMax: number;
  symbol: string;
}) {
  return (
    <Panel>
      <SectionHead
        icon={TrendingUp}
        title="Intent-to-Revenue"
        subtitle="Projected revenue from current pipeline"
        right={
          <View className="items-end gap-1">
            <Text className="text-xl font-bold">{total}</Text>
          </View>
        }
      />
      <RevenueChart data={data} axisMax={axisMax} symbol={symbol} />
    </Panel>
  );
}

function CapitalTimeline({ data }: { data: CapitalBucket[] }) {
  const rows = [data.slice(0, 2), data.slice(2, 4)];
  return (
    <View className="gap-4">
      <SectionHead icon={Clock} title="Capital Impact Timeline" />
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {row.map((b) => (
            <View
              key={b.label}
              className="flex-1 gap-1 rounded-sm border border-[#323743] bg-[#171A1F] p-4"
            >
              <Text className="text-xs text-muted-foreground">{b.label}</Text>
              <Text className="text-2xl font-bold">{b.amount}</Text>
              <Text className="text-[11px] text-muted-foreground">{b.window}</Text>
              <View className="mt-1 self-start rounded-md bg-secondary px-2 py-0.5">
                <Text className="text-[10px] text-muted-foreground">{b.cum}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function MarginPriority({ data }: { data: PriorityRow[] }) {
  return (
    <View className="gap-4">
      <SectionHead icon={Star} title="Margin-Weighted Priority" />
      <View className="rounded-sm border border-[#323743] bg-[#171A1F] p-4">
        {data.map((r, i) => (
          <View
            key={`${r.account}-${i}`}
            className={cn(
              "gap-2 py-3",
              i < data.length - 1 && "border-b border-border/50",
            )}
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1 flex-row items-center gap-2">
                <Star color="#F59E0B" fill="#F59E0B" size={14} />
                <View>
                  <Text className="text-sm font-semibold">{r.account}</Text>
                  <Text className="text-xs text-muted-foreground">{r.brand}</Text>
                </View>
              </View>
              <Text className="text-sm font-bold">{r.revenue}</Text>
            </View>
            <View className="flex-row justify-between pl-6">
              <MiniStat label="Cases" value={String(r.cases)} />
              <MiniStat label="Win %" value={`${r.winPct}%`} />
              <MiniStat label="Margin" value={r.margin < 0 ? "—" : `${r.margin}%`} />
              <MiniStat label="Priority" value={String(r.priority)} />
            </View>
          </View>
        ))}
        {data.length === 0 ? (
          <Text className="py-4 text-center text-sm text-muted-foreground">
            No priority data yet.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Mapping (API → the section shapes) ───────────────────────────────────────

const funnelTone = (label: string): FunnelStage["tone"] =>
  label === "Submitted"
    ? "neutral"
    : label === "Converted"
      ? "success"
      : label === "Lost"
        ? "danger"
        : "muted";

function mapAnalytics(d: ApiMdiAnalytics, symbol: string) {
  const money = (n: number) => `${symbol}${Math.round(n).toLocaleString("en-US")}`;
  const compact = (n: number) =>
    Math.abs(n) >= 1000
      ? `${symbol}${(n / 1000).toFixed(1)}k`
      : `${symbol}${Math.round(n)}`;

  const stats: StatTile[] = [
    { label: "Total Intents", value: String(d.kpis.totalIntents) },
    { label: "Conversion Rate", value: `${d.kpis.conversionRate}%` },
    {
      label: "Avg Days to Convert",
      value: d.kpis.avgDaysToConvert != null ? String(d.kpis.avgDaysToConvert) : "—",
    },
    { label: "Pipeline Value", value: compact(d.kpis.pipelineValue) },
  ];

  const funnel: FunnelStage[] = d.funnel.map((f) => ({
    label: f.label,
    value: f.value,
    delta: f.dropPct != null ? `${f.dropPct}%` : undefined,
    tone: funnelTone(f.label),
  }));
  const submitted = d.funnel.find((f) => f.label === "Submitted")?.value ?? 0;
  const converted = d.funnel.find((f) => f.label === "Converted")?.value ?? 0;
  const overall = submitted
    ? `${Math.round((converted / submitted) * 100)}% overall`
    : "—";

  const trend: TrendPoint[] = d.weeklyTrend.map((t) => ({
    label: t.week,
    submitted: t.submitted,
    converted: t.converted,
    convRate: t.rate,
  }));

  const channels: HeatChannel[] = d.channels.map((c) => ({
    channel: c.channel,
    intents: c.intents,
    converted: c.converted,
    avgDays: c.avgDays ?? 0,
    pct: c.rate,
  }));

  const predictive: PredictiveBuyer[] = d.buyerScoring.map((b) => ({
    name: b.name ?? b.email ?? "Unknown",
    email: b.email ?? "",
    role: `${b.reliability} reliability`,
    predConv: Math.min(99, Math.round(b.convRate * 1.1)),
    intents: b.totalIntents,
    converted: b.converted,
    histRate: Math.round(b.convRate * 10) / 10,
  }));

  const accounts: AccountScore[] = d.buyerScoring.map((b) => ({
    name: b.name ?? b.email ?? "Unknown",
    email: b.email ?? "",
    reliability: b.reliability.toUpperCase() as Reliability,
    totalIntents: b.totalIntents,
    convRate: Math.round(b.convRate * 10) / 10,
    avgDays: b.avgDays ?? 0,
  }));

  const gaps: PortfolioGap[] = d.portfolioGaps.map((g) => ({
    account: g.account,
    city: g.location ?? "",
    listed: g.covered,
    missing: g.missing,
    listedCount: g.covered.length,
    total: g.totalBrands,
  }));

  const revenue: RevenueBar[] = d.revenueForecast.map((r) => ({
    label: r.month,
    projected: r.projected / 1000,
    actual: r.actual / 1000,
  }));
  const revenueAxisMax = niceMax(
    Math.max(1, ...revenue.map((r) => Math.max(r.projected, r.actual))),
  );

  const capital: CapitalBucket[] = d.workingCapital.map((c) => ({
    label: c.label,
    amount: compact(c.amount),
    window: c.period,
    cum: `Cum: ${compact(c.cumulative)}`,
  }));

  const priority: PriorityRow[] = d.priorityRanked.map((p) => ({
    account: p.account ?? "—",
    brand: p.brand ?? "—",
    revenue: money(p.estRevenue),
    cases: p.cases,
    winPct: p.winPct,
    margin: -1, // API has no margin field
    priority: Math.round(p.priority * 10) / 10,
  }));

  const brands: BrandPipelineRow[] = d.brandBreakdown.map((b) => ({
    id: b.brand_id ?? b.brand_name,
    name: b.brand_name,
    activeIntents: b.active_intents,
    uniqueAccounts: b.unique_accounts,
    totalCases: b.total_cases,
    pipelineValue: compact(b.pipeline_value),
    conversionRate: Math.round(b.conversion_rate),
  }));

  return {
    brands,
    stats,
    funnel,
    overall,
    trend,
    channels,
    predictive,
    accounts,
    gaps,
    revenue,
    revenueAxisMax,
    revenueTotal: compact(d.kpis.pipelineValue),
    capital,
    priority,
  };
}

// ── Tab ──────────────────────────────────────────────────────────────────────

export function AnalyticsTab() {
  const { data, isLoading, symbol } = useMdiAnalytics(90);

  if (isLoading) {
    return (
      <Text className="py-16 text-center text-sm text-muted-foreground">
        Loading analytics…
      </Text>
    );
  }
  if (!data) {
    return (
      <Text className="py-16 text-center text-sm text-muted-foreground">
        No analytics available yet.
      </Text>
    );
  }

  const m = mapAnalytics(data, symbol);

  return (
    <View className="gap-6">
      <StatTiles stats={m.stats} />
      <BrandPipeline data={m.brands} />
      <ConversionFunnel stages={m.funnel} overall={m.overall} />
      <SeasonalTrends data={m.trend} />
      <ChannelHeatmap data={m.channels} />
      <PredictiveScoring data={m.predictive} />
      <AccountScoring data={m.accounts} />
      <PortfolioGaps data={m.gaps} />
      <IntentToRevenue
        data={m.revenue}
        total={m.revenueTotal}
        axisMax={m.revenueAxisMax}
        symbol={symbol}
      />
      <CapitalTimeline data={m.capital} />
      <MarginPriority data={m.priority} />
    </View>
  );
}
