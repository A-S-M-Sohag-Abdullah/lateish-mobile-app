import { LinearGradient } from "expo-linear-gradient";
import {
  Building2,
  ChartColumn,
  DollarSign,
  MapPin,
  Package,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { CornerAccent } from "@/components/ui/corner-accent";
import { Text } from "@/components/ui/text";
import { usePerformanceDashboard } from "@/hooks/use-performance-dashboard";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UPCOMING_INTEGRATIONS } from "@/lib/performance-data";
import type { DepletionsData } from "@/types/performance";

const NAVY = ["#132B5C", "#0B1833"] as const;
const SUBTABS = ["Overview", "Distributors", "Markets", "SKU Trends", "Data Table"] as const;

export function DepletionsTab() {
  const colors = useThemeColors();
  const { data, isLoading, symbol } = usePerformanceDashboard(30);
  const [sub, setSub] = useState<string>("Overview");

  const dep = data?.depletions;
  const nsvK = (n: number) =>
    n >= 1000 ? `${symbol}${Math.round(n / 1000)}K` : `${symbol}${Math.round(n)}`;

  const stats: { label: string; value: string; icon: LucideIcon; color: string }[] =
    dep
      ? [
          { label: "Realised NSV", value: nsvK(dep.summary.realisedNsv), icon: DollarSign, color: "#22C55E" },
          { label: "Expected NSV", value: nsvK(dep.summary.expectedNsv), icon: TrendingUp, color: "#3B82F6" },
          { label: "Total Cases", value: String(dep.summary.totalCases), icon: Package, color: "#A855F7" },
          { label: "Distributors", value: String(dep.summary.distributors), icon: Building2, color: "#F97316" },
          { label: "Markets", value: String(dep.summary.markets), icon: MapPin, color: "#14B8A6" },
          { label: "SKUS", value: String(dep.summary.skus), icon: ChartColumn, color: "#EC4899" },
        ]
      : [];

  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text className="text-2xl font-bold">Depletions Intelligence</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          Realised vs Expected performance from ingested data
        </Text>
      </View>

      {isLoading || !dep ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">
          Loading depletions…
        </Text>
      ) : (
        <>
          {/* 6 stat cards */}
          <View className="gap-3">
            {[stats.slice(0, 2), stats.slice(2, 4), stats.slice(4, 6)].map((row, i) => (
              <View key={i} className="flex-row gap-3">
                {row.map((s) => (
                  <DepletionCard key={s.label} stat={s} />
                ))}
              </View>
            ))}
          </View>

          {/* Sub tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {SUBTABS.map((t) => {
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

          {sub === "Overview" ? (
            <View className="gap-3">
              <Text className="text-lg font-bold">Monthly Trend</Text>
              <TrendChart data={dep.monthlyTrend} symbol={symbol} />
            </View>
          ) : sub === "Distributors" ? (
            <BarList
              title="Distributor Performance"
              rows={dep.distributors.map((d) => ({
                label: d.name,
                value: d.cases,
                right: `${d.healthScore}/100`,
              }))}
              emptyLabel="No distributor data."
            />
          ) : sub === "Markets" ? (
            <BarList
              title="Market Heatmap"
              rows={dep.markets.map((m) => ({
                label: m.name,
                value: m.cases,
                right: nsvK(m.nsv),
              }))}
              emptyLabel="No market data."
            />
          ) : sub === "SKU Trends" ? (
            <BarList
              title="SKU Trends"
              rows={dep.skus.map((s) => ({
                label: s.name,
                value: s.cases,
                right: nsvK(s.nsv),
              }))}
              emptyLabel="No SKU data."
            />
          ) : (
            <DataTable rows={dep.records} symbol={symbol} />
          )}

          {/* Upcoming Integrations (roadmap placeholders) */}
          <View className="gap-3">
            <Text className="text-xl font-bold">Upcoming Integrations</Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              Future automation capabilities (placeholders - wont affect workflows)
            </Text>
            {UPCOMING_INTEGRATIONS.map((item) => (
              <View
                key={item.title}
                className="flex-row items-start gap-3 rounded-2xl border border-border/60 bg-white/5 p-4"
              >
                <View className="rounded-lg bg-muted p-2">
                  <item.icon color={colors.mutedForeground} size={20} />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-medium">{item.title}</Text>
                  <Text className="text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ── Monthly trend line chart (cases, animated draw) ──────────────────────────

const TH = 190;
const T_PAD_T = 12;
const T_PAD_B = 24;
const T_PAD_L = 34;
const T_PAD_R = 40;
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

function DrawLine({
  pts,
  color,
  progress,
}: {
  pts: { x: number; y: number }[];
  color: string;
  progress: SharedValue<number>;
}) {
  let len = 0;
  for (let i = 1; i < pts.length; i++)
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - progress.value),
  }));
  return (
    <AnimatedPolyline
      points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={`${len}`}
      animatedProps={animatedProps}
    />
  );
}

function TrendChart({
  data,
  symbol,
}: {
  data: DepletionsData["monthlyTrend"];
  symbol: string;
}) {
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 900 });
  }, [data, w, progress]);

  const n = data.length;
  const casesMax = Math.max(1, ...data.map((d) => d.cases));
  const nsvMax = Math.max(1, ...data.map((d) => d.nsv));
  const plotH = TH - T_PAD_T - T_PAD_B;
  const plotW = Math.max(0, w - T_PAD_L - T_PAD_R);
  const x = (i: number) => T_PAD_L + (n <= 1 ? 0 : (i * plotW) / (n - 1));
  const yC = (v: number) => T_PAD_T + (1 - v / casesMax) * plotH;
  const yN = (v: number) => T_PAD_T + (1 - v / nsvMax) * plotH;

  const casesPts = data.map((d, i) => ({ x: x(i), y: yC(d.cases) }));
  const nsvPts = data.map((d, i) => ({ x: x(i), y: yN(d.nsv) }));

  return (
    <View className="gap-2 rounded-2xl border border-border bg-card p-4">
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && n > 0 ? (
          <Svg width={w} height={TH}>
            {[0, 0.5, 1].map((g) => (
              <Line
                key={g}
                x1={T_PAD_L}
                x2={w - T_PAD_R}
                y1={T_PAD_T + g * plotH}
                y2={T_PAD_T + g * plotH}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
            ))}
            <DrawLine pts={casesPts} color="#3B82F6" progress={progress} />
            <DrawLine pts={nsvPts} color="#22C55E" progress={progress} />
            {casesPts.map((p, i) => (
              <Circle key={`c${i}`} cx={p.x} cy={p.y} r={2.5} fill="#3B82F6" />
            ))}
          </Svg>
        ) : (
          <View style={{ height: TH }} />
        )}
      </View>
      <View className="flex-row justify-between px-1">
        {data.map((d, i) => (
          <Text key={`${d.month}-${i}`} className="text-[9px] text-muted-foreground">
            {d.month}
          </Text>
        ))}
      </View>
      <View className="flex-row gap-4">
        <Legend color="#3B82F6" label="Cases" />
        <Legend color="#22C55E" label={`NSV (${symbol})`} />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: color }} />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

// ── Bar list (distributors / markets / skus) ─────────────────────────────────

function BarList({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: { label: string; value: number; right: string }[];
  emptyLabel: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 700 });
  }, [rows, progress]);

  return (
    <View className="gap-3">
      <Text className="text-lg font-bold">{title}</Text>
      {rows.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </Text>
      ) : (
        <View className="gap-3 rounded-2xl border border-border bg-card p-4">
          {rows.map((r) => (
            <View key={r.label} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm font-medium" numberOfLines={1}>
                  {r.label}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {r.value} · {r.right}
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-secondary">
                <GrowBar ratio={r.value / max} progress={progress} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function GrowBar({
  ratio,
  progress,
}: {
  ratio: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    width: `${ratio * progress.value * 100}%`,
  }));
  return (
    <Animated.View
      style={[{ height: "100%", backgroundColor: "#22C55E", borderRadius: 999 }, style]}
    />
  );
}

// ── Data table ───────────────────────────────────────────────────────────────

function DataTable({
  rows,
  symbol,
}: {
  rows: DepletionsData["records"];
  symbol: string;
}) {
  if (rows.length === 0) {
    return (
      <Text className="py-6 text-center text-sm text-muted-foreground">
        No records yet.
      </Text>
    );
  }
  return (
    <View className="overflow-hidden rounded-xl border border-[#2F2F2F] bg-white/5">
      {rows.map((r, i) => (
        <View
          key={r.id}
          className={cn("gap-3 p-4", i < rows.length - 1 && "border-b border-border")}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {r.date}
            </Text>
            <View className="rounded-full border border-border px-2.5 py-0.5">
              <Text className="text-[11px] text-muted-foreground">{r.corridor}</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Package color="#22C55E" size={16} style={{ marginTop: 2 }} />
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-semibold">{r.sku}</Text>
              <Text className="text-sm text-muted-foreground">
                {r.distributor} • {r.market}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center rounded-lg bg-[#262A33]/30 p-3">
            <View className="flex-1 gap-0.5">
              <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Cases
              </Text>
              <Text className="text-base font-bold">{r.cases}</Text>
            </View>
            <View className="mx-3 h-8 w-px bg-border" />
            <View className="flex-1 items-end gap-0.5">
              <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
                NSV
              </Text>
              <Text className="text-base font-bold text-green-500">
                {symbol}
                {r.nsv.toLocaleString("en-US")}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function DepletionCard({
  stat,
}: {
  stat: { label: string; value: string; icon: LucideIcon; color: string };
}) {
  const Icon = stat.icon;
  return (
    <View className="h-24 flex-1 overflow-hidden rounded-2xl">
      <LinearGradient
        colors={NAVY}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <CornerAccent />
      <View className="flex-1 flex-row items-center justify-between p-4">
        <View className="flex-1 gap-1">
          <Text className="text-sm text-white/70" numberOfLines={1}>
            {stat.label}
          </Text>
          <Text className="text-2xl font-bold text-white">{stat.value}</Text>
        </View>
        <Icon color={stat.color} size={22} />
      </View>
    </View>
  );
}
