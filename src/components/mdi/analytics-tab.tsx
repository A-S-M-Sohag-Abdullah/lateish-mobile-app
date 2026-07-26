import {
  Activity,
  ChevronRight,
  Clock,
  Filter,
  LayoutGrid,
  Link2,
  Package,
  Star,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { View } from "react-native";

import { RevenueChart } from "@/components/mdi/revenue-chart";
import { TrendChart } from "@/components/mdi/trend-chart";
import { Progress } from "@/components/ui/progress";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_SCORES,
  ANALYTICS_STATS,
  CAPITAL_TIMELINE,
  CHANNEL_HEATMAP,
  DEPLETION_ROWS,
  DEPLETION_SUMMARY,
  DISPLACEMENTS,
  FUNNEL_OVERALL,
  FUNNEL_STAGES,
  PORTFOLIO_GAPS,
  PREDICTIVE_BUYERS,
  PRIORITY_ROWS,
  REVENUE_TOTAL,
  TARGET_BRANDS,
  type FulfilStatus,
  type Reliability,
} from "@/lib/mdi-data";

const usd = (n: number) => "$" + n.toLocaleString("en-US");

// Navy gradient for the four KPI tiles (shared StatCard look).
const STAT_GRADIENT: GradientColors = ["#132B5C", "#0B1833"];

// ── Shared bits ──────────────────────────────────────────────────────────────

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <View className="gap-4 rounded-2xl border border-[#303A46]/50 bg-[#161C22] p-4">
      {children}
    </View>
  );
}

function DemoBadge({ label = "Demo" }: { label?: string }) {
  return (
    <View className="self-start rounded-full border border-border px-2 py-0.5">
      <Text className="text-[10px] font-medium uppercase text-muted-foreground">
        {label}
      </Text>
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

function StatTiles() {
  const rows = [ANALYTICS_STATS.slice(0, 2), ANALYTICS_STATS.slice(2, 4)];
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

function ExpectedVsTarget() {
  return (
    <View className="gap-4">
      <SectionHead
        icon={TrendingUp}
        title="Expected vs Annual Target"
        subtitle="Cumulative intent volume against annual brand targets — never start at zero"
      />
      {TARGET_BRANDS.map((b) => (
        <View
          key={b.name}
          className="gap-3 rounded-xl border border-[#303A46]/50 bg-[#161C22] p-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold">{b.name}</Text>
            <View className="rounded-full bg-secondary px-2.5 py-1">
              <Text className="text-xs font-medium text-muted-foreground">
                {b.pctOfTarget}% of target
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                Cases: {b.cases.current} / {b.cases.target}
              </Text>
              <Text className="text-sm font-medium">{b.pctOfTarget}%</Text>
            </View>
            <Progress
              value={b.pctOfTarget / 100}
              indicatorClassName="bg-white"
            />
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                Value: {usd(b.value.current)} / {usd(b.value.target)}
              </Text>
              <Text className="text-sm font-medium">{b.pctOfTarget}%</Text>
            </View>
            <Progress
              value={b.pctOfTarget / 100}
              indicatorClassName="bg-white"
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const FUNNEL_COLOR: Record<string, string> = {
  neutral: "#FFFFFF",
  muted: "rgba(255,255,255,0.35)",
  success: "#22C55E",
  danger: "#EF4444",
};

function ConversionFunnel() {
  const max = Math.max(...FUNNEL_STAGES.map((s) => s.value));
  return (
    <Panel>
      <SectionHead
        icon={Filter}
        title="Conversion Funnel"
        subtitle="Intent progression from submission to conversion"
        right={
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-medium text-muted-foreground">
              {FUNNEL_OVERALL}
            </Text>
            <DemoBadge />
          </View>
        }
      />
      <View className="gap-2.5">
        {FUNNEL_STAGES.map((s) => (
          <View key={s.label} className="flex-row items-center gap-3">
            <Text
              className="w-28 text-right text-sm text-muted-foreground"
              numberOfLines={1}
            >
              {s.label}
            </Text>
            <View className="h-6 flex-1 justify-center">
              <View
                style={{
                  width: `${(s.value / max) * 100}%`,
                  backgroundColor: FUNNEL_COLOR[s.tone],
                  height: 24,
                  borderRadius: 6,
                }}
              />
            </View>
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

function SeasonalTrends() {
  return (
    <Panel>
      <SectionHead
        icon={Activity}
        title="Seasonal Trends"
        subtitle="12-week rolling volume & conversion"
        right={<DemoBadge />}
      />
      <TrendChart />
    </Panel>
  );
}

function ChannelHeatmap() {
  return (
    <Panel>
      <SectionHead
        icon={LayoutGrid}
        title="Channel Heatmap"
        subtitle="Performance by sales channel"
      />
      <View className="gap-3">
        {CHANNEL_HEATMAP.map((c) => (
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
      </View>
      <ViewAll label="View All Channels" />
    </Panel>
  );
}

const FULFIL_STYLE: Record<FulfilStatus, string> = {
  Fulfilled: "text-green-500",
  Partial: "text-foreground",
  Delayed: "text-red-500",
};

function IntentToDepletion() {
  return (
    <Panel>
      <SectionHead
        icon={Link2}
        title="Intent-to-Depletion"
        subtitle="Converted intents to actual depletions"
        right={<DemoBadge />}
      />
      <View className="flex-row justify-between rounded-xl bg-white/5 p-3">
        <DepStat value={DEPLETION_SUMMARY.match} label="Match" />
        <DepStat value={DEPLETION_SUMMARY.cases} label="Cases" />
        <DepStat value={DEPLETION_SUMMARY.avgDays} label="Avg Days" />
        <DepStat value={DEPLETION_SUMMARY.fulfilled} label="Fulfilled" />
      </View>
      <View className="gap-3">
        {DEPLETION_ROWS.map((r) => (
          <View key={r.account} className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-semibold">{r.account}</Text>
                <Text className="text-xs text-muted-foreground">{r.brand}</Text>
              </View>
              <Text className={cn("text-xs font-medium", FULFIL_STYLE[r.status])}>
                {r.status}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="w-16 text-xs text-muted-foreground">
                VOL {r.current}cs / {r.target}cs
              </Text>
              <Progress value={r.pct / 100} className="h-1.5 flex-1" />
              <Text className="w-10 text-right text-xs font-medium">{r.pct}%</Text>
            </View>
          </View>
        ))}
      </View>
      <ViewAll label="View Detailed Report" />
    </Panel>
  );
}

function DepStat({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center gap-0.5">
      <Text className="text-base font-bold">{value}</Text>
      <Text className="text-[10px] uppercase text-muted-foreground">{label}</Text>
    </View>
  );
}

function PredictiveScoring() {
  return (
    <View className="gap-4">
      <SectionHead
        icon={Target}
        title="Predictive Buyer Scoring"
        subtitle="Heuristic-based conversion predictions combining history, role, confidence, and urgency"
      />
      {PREDICTIVE_BUYERS.map((b) => (
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
    </View>
  );
}

const RELIABILITY_STYLE: Record<Reliability, string> = {
  HIGH: "text-green-500",
  MEDIUM: "text-foreground",
  LOW: "text-red-500",
};

function AccountScoring() {
  return (
    <View className="gap-4">
      <SectionHead
        icon={Users}
        title="Buyer & Account Scoring"
        subtitle="Track buyer reliability based on intent-to-conversion patterns"
      />
      {ACCOUNT_SCORES.map((a) => (
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

function PortfolioGaps() {
  return (
    <View className="gap-4">
      <SectionHead
        icon={LayoutGrid}
        title="Portfolio Gap Detection"
        subtitle="Accounts with partial brand coverage — upsell opportunities"
        right={<DemoBadge label="Demo" />}
      />
      {PORTFOLIO_GAPS.map((g) => (
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
    </View>
  );
}

function CompetitorDisplacement() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      <SectionHead
        icon={TriangleAlert}
        title="Competitor Displacement"
        subtitle="Recent competitor removals — immediate opportunities"
        right={<DemoBadge label="Demo" />}
      />
      {DISPLACEMENTS.map((d) => (
        <View
          key={d.account}
          className="gap-3 rounded-2xl border border-[#303A46]/50 bg-[#161C22] p-4"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">{d.account}</Text>
            <View className="flex-row items-center gap-1.5 rounded-md border border-[#303A46]/70 px-2.5 py-1">
              <Package color={colors.mutedForeground} size={14} />
              <Text className="text-xs text-muted-foreground">
                {d.cases} Cases
              </Text>
            </View>
          </View>

          {/* Removed / Opportunity */}
          <View className="gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Removed</Text>
              <Text className="text-sm font-medium text-red-500 line-through">
                {d.removed}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Opportunity</Text>
              <Text className="text-sm font-semibold">{d.opportunity}</Text>
            </View>
          </View>

          {/* Action */}
          <View className="h-11 flex-row items-center justify-center gap-2 rounded-lg bg-white">
            <Text className="text-sm font-semibold text-black">
              Capture Opportunity
            </Text>
            <Activity color="#000000" size={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

function IntentToRevenue() {
  return (
    <Panel>
      <SectionHead
        icon={TrendingUp}
        title="Intent-to-Revenue"
        subtitle="Projected revenue from current pipeline"
        right={
          <View className="items-end gap-1">
            <Text className="text-xl font-bold">{REVENUE_TOTAL}</Text>
            <DemoBadge />
          </View>
        }
      />
      <RevenueChart />
    </Panel>
  );
}

function CapitalTimeline() {
  const rows = [CAPITAL_TIMELINE.slice(0, 2), CAPITAL_TIMELINE.slice(2, 4)];
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

function MarginPriority() {
  return (
    <View className="gap-4">
      <SectionHead icon={Star} title="Margin-Weighted Priority" />
      <View className="rounded-sm border border-[#323743] bg-[#171A1F] p-4">
        {PRIORITY_ROWS.map((r, i) => (
          <View
            key={r.account}
            className={cn(
              "gap-2 py-3",
              i < PRIORITY_ROWS.length - 1 && "border-b border-border/50",
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
              <MiniStat label="Margin" value={`${r.margin}%`} />
              <MiniStat label="Priority" value={String(r.priority)} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ViewAll({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center justify-center gap-1 border-t border-border/60 pt-3">
      <Text className="text-sm font-medium">{label}</Text>
      <ChevronRight color={colors.foreground} size={16} />
    </View>
  );
}

// ── Tab ──────────────────────────────────────────────────────────────────────

export function AnalyticsTab() {
  return (
    <View className="gap-6">
      <StatTiles />
      <ExpectedVsTarget />
      <ConversionFunnel />
      <SeasonalTrends />
      <ChannelHeatmap />
      <IntentToDepletion />
      <PredictiveScoring />
      <AccountScoring />
      <PortfolioGaps />
      <CompetitorDisplacement />
      <IntentToRevenue />
      <CapitalTimeline />
      <MarginPriority />
    </View>
  );
}
