import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  ChartColumn,
  Check,
  CircleCheck,
  MapPin,
  Target as TargetIcon,
  TrendingDown,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import Slider from "@react-native-community/slider";

import { CustomKpisTab } from "@/components/performance/custom-kpis-tab";
import { Dropdown } from "@/components/ui/dropdown";
import { Progress } from "@/components/ui/progress";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { usePagerLock } from "@/store/pager-lock.store";
import { cn } from "@/lib/utils";
import {
  BDM_INNER_TABS,
  BDM_OUTER_TABS,
  BDM_PERIODS,
  BDM_SCORE_MAX,
  BDM_STATS,
  BDM_TERRITORIES,
  ATTR_BAR_TICKS,
  ATTR_BARS,
  ATTR_BREAKDOWN,
  ATTR_SUMMARY,
  CHANNEL_AXIS_MAX,
  CHANNEL_BARS,
  CHANNEL_SUMMARY,
  CHANNEL_TABLE,
  CHANNEL_TICKS,
  CPC_AXIS_MAX,
  CPC_TARGET,
  CPC_TRAJECTORY,
  CPC_TREND,
  CPC_X_LABELS,
  CPC_Y_TICKS,
  COSTS_TABLE,
  BDM_PERFORMANCE,
  BENCHMARKING_TABS,
  COMPARE_BDMS,
  COMPARE_TABLE,
  CONVERGENCE,
  COST_ACCT_TABS,
  CURRENT_CPC,
  RADAR_ALPHA,
  RADAR_AXES,
  RADAR_BETA,
  RADAR_TOP25,
  FORECAST_AXIS_MAX,
  FORECAST_LINE,
  FORECAST_PERIODS,
  FORECAST_TARGET,
  FORECAST_X_LABELS,
  FORECAST_Y_VALUES,
  GOAL_SETTINGS,
  INVEST_AXIS_MAX,
  INVEST_CPC,
  INVEST_MARGIN,
  INVEST_OUTPUTS,
  INVEST_SLIDERS,
  INVEST_X_LABELS,
  INVEST_Y_VALUES,
  TARGET_CPC,
  WHAT_GOOD_LOOKS_LIKE,
  WHAT_WORKS_ROWS,
  EFFICIENCY_TREND,
  SCATTER_AXIS_MAX,
  SCATTER_X_LABELS,
  SCATTER_Y_TICKS,
  TREND_SCATTER,
  MARKET_TIERS,
  NORM_ROWS,
  type AttrSummary,
  type Maturity,
  type MarketTier,
  type NormRow,
  type Territory,
  type TierTone,
  type WhatWorksRow,
} from "@/lib/bdm-data";

const NAVY: GradientColors = ["#132B5C", "#0B1833"];

const MATURITY: Record<Maturity, { bg: string; text: string }> = {
  Mature: { bg: "bg-green-500/15", text: "text-green-400" },
  Growth: { bg: "bg-secondary", text: "text-muted-foreground" },
  Emerging: { bg: "bg-amber-500/15", text: "text-amber-400" },
};

export function BdmPage() {
  const colors = useThemeColors();
  const [outer, setOuter] = useState<string>("Efficiency ROI");
  const [inner, setInner] = useState<string>("Efficiency");
  const [benchInner, setBenchInner] = useState<string>("Benchmarks");
  const [costInner, setCostInner] = useState<string>("Overview");
  const [forecastPeriod, setForecastPeriod] = useState<string>("6mo");
  const [period, setPeriod] = useState<string>("This Month");
  const [anon, setAnon] = useState(true);

  const statRows = [];
  for (let i = 0; i < BDM_STATS.length; i += 2) {
    statRows.push(BDM_STATS.slice(i, i + 2));
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-5 px-4 pb-16 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="gap-1">
          <Text className="text-2xl font-bold">BDM Efficiency and ROI</Text>
          <Text className="text-sm text-muted-foreground">
            Measurable performance without surveillance
          </Text>
        </View>

        {/* Outer tabs */}
        <TabRow tabs={BDM_OUTER_TABS} value={outer} onChange={setOuter} />

        {/* Privacy card (shared) */}
        <View className="gap-1.5 rounded-2xl border border-border bg-white/5 p-4">
          <Text className="text-base font-semibold text-info">
            Privacy Protected Analytics
          </Text>
          <Text className="text-sm leading-5 text-muted-foreground">
            BDM identities are anonymised by default. Performance is shown in
            aggregate to prevent micromanagement while maintaining ROI
          </Text>
        </View>

        {/* Controls (shared) */}
        <View className="flex-row items-center justify-between gap-3">
          <Dropdown
            options={BDM_PERIODS}
            value={period}
            onChange={setPeriod}
            size="sm"
          />
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <Bell color={colors.foreground} size={16} />
              <Text className="text-sm">Alerts</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Toggle value={anon} onToggle={() => setAnon((v) => !v)} />
              <Text className="text-sm">Anonymise</Text>
            </View>
          </View>
        </View>

        {outer === "Efficiency ROI" ? (
          <>
            {/* Stat tiles */}
            <View className="gap-3">
              {statRows.map((row, i) => (
                <View key={i} className="flex-row gap-3">
                  {row.map((s) => (
                    <StatCard
                      key={s.label}
                      label={s.label}
                      value={s.value}
                      colors={NAVY}
                      className="h-24"
                      trailing={
                        s.suffix ? (
                          <Text className="text-xs text-white/60">
                            {s.suffix}
                          </Text>
                        ) : undefined
                      }
                    />
                  ))}
                </View>
              ))}
            </View>

            {/* Inner tabs */}
            <TabRow tabs={BDM_INNER_TABS} value={inner} onChange={setInner} />

            {inner === "Efficiency" ? (
              <View className="gap-4">
                <View className="gap-1">
                  <View className="flex-row items-center gap-2">
                    <Activity color={colors.foreground} size={20} />
                    <Text className="text-xl font-bold">
                      Composite Efficiency
                    </Text>
                  </View>
                  <Text className="text-sm leading-5 text-muted-foreground">
                    Weighted composite from your scorecard configuration —
                    adjusted for market maturity
                  </Text>
                </View>
                {BDM_TERRITORIES.map((t) => (
                  <TerritoryCard key={t.name} territory={t} />
                ))}
              </View>
            ) : inner === "Territory" ? (
              <TerritoryTab />
            ) : inner === "Attribution" ? (
              <AttributionTab />
            ) : inner === "Channels" ? (
              <ChannelsTab />
            ) : inner === "Trends" ? (
              <TrendsTab />
            ) : inner === "Costs" ? (
              <CostsTab />
            ) : (
              <Stub name={inner} />
            )}
          </>
        ) : outer === "Benchmarking" ? (
          <BenchmarkingTab inner={benchInner} onChange={setBenchInner} />
        ) : outer === "Cost Accountability" ? (
          <CostAccountabilityTab inner={costInner} onChange={setCostInner} />
        ) : outer === "Forecasting" ? (
          <ForecastingTab period={forecastPeriod} onPeriod={setForecastPeriod} />
        ) : outer === "Portfolio" ? (
          <PortfolioTab />
        ) : outer === "Investment" ? (
          <InvestmentTab />
        ) : (
          <Stub name={outer} />
        )}
      </ScrollView>
    </View>
  );
}

// ── Investment (simulator) outer tab ─────────────────────────────────────────

function InvestmentTab() {
  const outRows = [INVEST_OUTPUTS.slice(0, 2), INVEST_OUTPUTS.slice(2, 4)];
  const [values, setValues] = useState(() =>
    INVEST_SLIDERS.map((s) => s.value),
  );
  // Freeze the pager while dragging a slider so the screen doesn't swipe.
  const setLocked = usePagerLock((s) => s.setLocked);

  return (
    <View className="gap-5">
      {/* Header (leftover label in the mockup) */}
      <Text className="text-xl font-bold">Multi-Dimensional Comparison</Text>

      {/* Sliders */}
      <View className="gap-5">
        {INVEST_SLIDERS.map((s, idx) => (
          <View
            key={s.label}
            className="gap-1"
            onTouchStart={() => setLocked(true)}
            onTouchEnd={() => setLocked(false)}
            onTouchCancel={() => setLocked(false)}
          >
            <Text className="text-sm text-muted-foreground">{s.label}</Text>
            <Slider
              minimumValue={s.min}
              maximumValue={s.max}
              step={s.step}
              value={values[idx]}
              onSlidingStart={() => setLocked(true)}
              onValueChange={(v) =>
                setValues((arr) => arr.map((x, i) => (i === idx ? v : x)))
              }
              onSlidingComplete={() => setLocked(false)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255,255,255,0.15)"
              thumbTintColor="#FFFFFF"
              style={{ height: 32, marginHorizontal: -4 }}
            />
            <Text className="text-sm font-medium">
              {s.prefix}
              {values[idx].toLocaleString("en-US")}
              {s.suffix}
            </Text>
          </View>
        ))}
      </View>

      {/* Output tiles */}
      <View className="gap-3">
        {outRows.map((row, i) => (
          <View key={i} className="flex-row gap-3">
            {row.map((o) => (
              <StatCard
                key={o.label}
                label={o.label}
                value={o.value}
                colors={NAVY}
                className="h-24"
                valueClassName={o.green ? "text-green-400" : undefined}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Projection */}
      <Text className="text-xl font-bold">12-Month CPC & Margin Projection</Text>
      <InvestmentChart />
    </View>
  );
}

const IC_H = 230;
const IC_PAD_T = 10;
const IC_PAD_B = 26;
const IC_PAD_L = 34;

function InvestmentChart() {
  const [w, setW] = useState(0);
  const plotH = IC_H - IC_PAD_T - IC_PAD_B;
  const n = INVEST_CPC.length;
  const innerW = Math.max(0, w - IC_PAD_L - 8);
  const x = (i: number) => IC_PAD_L + (n <= 1 ? 0 : (i * innerW) / (n - 1));
  const y = (v: number) => IC_PAD_T + (1 - v / INVEST_AXIS_MAX) * plotH;
  const y0 = IC_PAD_T + plotH;

  const cpcPts = INVEST_CPC.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const marginPts = INVEST_MARGIN.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={IC_H}>
          {INVEST_Y_VALUES.map((v) => (
            <Line
              key={`g${v}`}
              x1={IC_PAD_L}
              x2={w}
              y1={y(v)}
              y2={y(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {INVEST_Y_VALUES.map((v) => (
            <SvgText
              key={`yl${v}`}
              x={IC_PAD_L - 6}
              y={y(v) + 3}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="end"
            >
              {`$${v}`}
            </SvgText>
          ))}
          {INVEST_X_LABELS.map((_, i) => (
            <Line
              key={`v${i}`}
              x1={x(i)}
              x2={x(i)}
              y1={IC_PAD_T}
              y2={y0}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          {/* red baseline at 0 */}
          <Line
            x1={IC_PAD_L}
            x2={w}
            y1={y(0)}
            y2={y(0)}
            stroke="#EF4444"
            strokeWidth={1}
            strokeDasharray="5 4"
          />
          {/* CPC (white) */}
          <Polyline points={cpcPts} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
          {INVEST_CPC.map((v, i) => (
            <Circle key={`c${i}`} cx={x(i)} cy={y(v)} r={3.5} fill="#FFFFFF" />
          ))}
          {/* Margin (green) */}
          <Polyline points={marginPts} fill="none" stroke="#22C55E" strokeWidth={2.5} />
          {INVEST_MARGIN.map((v, i) => (
            <Circle key={`m${i}`} cx={x(i)} cy={y(v)} r={3.5} fill="#22C55E" />
          ))}
          {INVEST_X_LABELS.map((lbl, i) => (
            <SvgText
              key={lbl}
              x={x(i)}
              y={IC_H - 6}
              fontSize={10}
              fill="#94A3B8"
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            >
              {lbl}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: IC_H }} />
      )}
    </View>
  );
}

// ── Portfolio outer tab ──────────────────────────────────────────────────────

function PortfolioTab() {
  const [selected, setSelected] = useState(() =>
    COMPARE_BDMS.map((b) => b.checked),
  );

  return (
    <View className="gap-5">
      <Text className="text-xl font-bold">Select BDMs to compare (max4)</Text>
      <View className="gap-3">
        {[
          COMPARE_BDMS.slice(0, 2),
          COMPARE_BDMS.slice(2, 4),
        ].map((row, ri) => (
          <View key={ri} className="flex-row gap-3">
            {row.map((b, ci) => {
              const idx = ri * 2 + ci;
              const on = selected[idx];
              const m = MATURITY[b.maturity];
              return (
                <Pressable
                  key={b.name}
                  onPress={() =>
                    setSelected((s) =>
                      s.map((v, i) => (i === idx ? !v : v)),
                    )
                  }
                  className="flex-1 flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-3"
                >
                  <View
                    className={cn(
                      "h-5 w-5 items-center justify-center rounded border",
                      on ? "border-brand-maroon bg-brand-maroon" : "border-border",
                    )}
                  >
                    {on ? <Check color="#FFFFFF" size={14} /> : null}
                  </View>
                  <Text className="flex-shrink text-sm font-medium" numberOfLines={1}>
                    {b.name}
                  </Text>
                  <View className={cn("rounded px-1.5 py-0.5", m.bg)}>
                    <Text className={cn("text-[10px] font-medium", m.text)}>
                      {b.maturity.toLowerCase()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Text className="text-xl font-bold">Multi-Dimensional Comparison</Text>
      <RadarChart />
      <View className="flex-row items-center justify-center gap-4">
        <Text className="text-sm">Territory Alpha</Text>
        <Text className="text-sm">Territory Beta</Text>
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: "#22C55E" }} />
          <Text className="text-sm text-green-500">Top 25%</Text>
        </View>
      </View>

      {/* Comparison table */}
      <View className="pt-2">
        <View className="flex-row border-b border-border pb-2">
          <Text style={{ flex: 1.4 }} className="text-xs font-medium text-muted-foreground">
            Metric
          </Text>
          <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
            Territory Alpha
          </Text>
          <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
            Territory Beta
          </Text>
        </View>
        {COMPARE_TABLE.map((r) => (
          <View
            key={r.metric}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text style={{ flex: 1.4 }} className="text-sm font-medium">
              {r.metric}
            </Text>
            <Text style={{ flex: 1 }} className="text-right text-sm">
              {r.a}
            </Text>
            <Text style={{ flex: 1 }} className="text-right text-sm">
              {r.b}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const RADAR_RINGS = [0.25, 0.5, 0.75, 1];

function RadarChart() {
  const [w, setW] = useState(0);
  const size = w;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 46;
  const n = RADAR_AXES.length;

  const ang = (i: number) => ((-90 + i * (360 / n)) * Math.PI) / 180;
  const pt = (r: number, i: number) => ({
    x: cx + r * Math.cos(ang(i)),
    y: cy + r * Math.sin(ang(i)),
  });
  const poly = (vals: number[]) =>
    vals
      .map((v, i) => {
        const p = pt((v / 100) * R, i);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  const ringPoly = (level: number) =>
    RADAR_AXES.map((_, i) => {
      const p = pt(level * R, i);
      return `${p.x},${p.y}`;
    }).join(" ");

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={size} height={size}>
          {/* rings */}
          {RADAR_RINGS.map((L) => (
            <Polygon
              key={`ring${L}`}
              points={ringPoly(L)}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          ))}
          {/* axis lines */}
          {RADAR_AXES.map((_, i) => {
            const p = pt(R, i);
            return (
              <Line
                key={`ax${i}`}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1}
              />
            );
          })}
          {/* scale numbers on axis 1 */}
          {RADAR_RINGS.map((L) => {
            const p = pt(L * R, 1);
            return (
              <SvgText
                key={`sc${L}`}
                x={p.x + 4}
                y={p.y}
                fontSize={9}
                fill="#64748B"
              >
                {String(L * 100)}
              </SvgText>
            );
          })}
          {/* Top 25% (green dashed) */}
          <Polygon
            points={poly(RADAR_TOP25)}
            fill="none"
            stroke="#22C55E"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          {/* Beta */}
          <Polygon
            points={poly(RADAR_BETA)}
            fill="rgba(56,189,248,0.08)"
            stroke="#38BDF8"
            strokeWidth={1.5}
          />
          {/* Alpha */}
          <Polygon
            points={poly(RADAR_ALPHA)}
            fill="rgba(255,255,255,0.06)"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          {/* axis labels */}
          {RADAR_AXES.map((label, i) => {
            const p = pt(R + 16, i);
            const c = Math.cos(ang(i));
            const anchor =
              Math.abs(c) < 0.3 ? "middle" : c > 0 ? "start" : "end";
            return (
              <SvgText
                key={label}
                x={p.x}
                y={p.y + 3}
                fontSize={10}
                fill="#94A3B8"
                textAnchor={anchor}
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height: 300 }} />
      )}
    </View>
  );
}

// ── Forecasting outer tab ────────────────────────────────────────────────────

function ForecastingTab({
  period,
  onPeriod,
}: {
  period: string;
  onPeriod: (p: string) => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="gap-5">
      {/* period selector */}
      <View className="flex-row gap-2">
        {FORECAST_PERIODS.map((p) => {
          const active = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => onPeriod(p)}
              className={cn(
                "rounded-md px-3.5 py-1.5",
                active ? "bg-white" : "bg-secondary",
              )}
            >
              <Text
                className={cn(
                  "text-xs font-medium",
                  active ? "text-black" : "text-foreground",
                )}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* header */}
      <View className="gap-1">
        <Text className="text-xl font-bold">CPC Forecast — 3 Scenarios</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          Weighted moving average with seasonal decomposition
        </Text>
      </View>

      <ForecastChart />

      {/* summary cards */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1 rounded-2xl border border-border bg-card p-4">
            <Text className="text-sm text-muted-foreground">Current CPC</Text>
            <Text className="text-2xl font-bold">{CURRENT_CPC.value}</Text>
            <Text className="text-xs text-muted-foreground">
              {CURRENT_CPC.note}
            </Text>
          </View>
          <View className="flex-1 gap-1 rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-1.5">
              <Calendar color={colors.mutedForeground} size={14} />
              <Text className="text-sm text-muted-foreground">Convergence</Text>
            </View>
            <Text className="text-base font-bold">{CONVERGENCE}</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1 rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-1.5">
              <TargetIcon color={colors.mutedForeground} size={14} />
              <Text className="text-sm text-muted-foreground">Target CPC</Text>
            </View>
            <Text className="text-2xl font-bold text-green-500">
              {TARGET_CPC.value}
            </Text>
            <View className="self-start rounded-md bg-secondary px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">
                {TARGET_CPC.gap}
              </Text>
            </View>
          </View>
          <View className="flex-1" />
        </View>
      </View>
    </View>
  );
}

const FC_H = 250;
const FC_PAD_T = 10;
const FC_PAD_B = 30;
const FC_PAD_L = 34;

function ForecastChart() {
  const [w, setW] = useState(0);
  const plotH = FC_H - FC_PAD_T - FC_PAD_B;
  const n = FORECAST_LINE.length;
  const innerW = Math.max(0, w - FC_PAD_L - 8);
  const x = (i: number) => FC_PAD_L + (n <= 1 ? 0 : (i * innerW) / (n - 1));
  const y = (v: number) => FC_PAD_T + (1 - v / FORECAST_AXIS_MAX) * plotH;
  const y0 = FC_PAD_T + plotH;
  const months = FORECAST_X_LABELS.length;
  const mx = (m: number) =>
    FC_PAD_L + (months <= 1 ? 0 : (m * innerW) / (months - 1));

  const linePts = FORECAST_LINE.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${y0} ${linePts} ${x(n - 1)},${y0}`;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={FC_H}>
          {/* horizontal gridlines + y labels */}
          {FORECAST_Y_VALUES.map((v) => (
            <Line
              key={`g${v}`}
              x1={FC_PAD_L}
              x2={w}
              y1={y(v)}
              y2={y(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {FORECAST_Y_VALUES.map((v) => (
            <SvgText
              key={`yl${v}`}
              x={FC_PAD_L - 6}
              y={y(v) + 3}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="end"
            >
              {`$${v}`}
            </SvgText>
          ))}
          {/* vertical dashed gridlines */}
          {FORECAST_X_LABELS.map((_, m) => (
            <Line
              key={`v${m}`}
              x1={mx(m)}
              x2={mx(m)}
              y1={FC_PAD_T}
              y2={y0}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          {/* area + line */}
          <Polygon points={areaPts} fill="rgba(255,255,255,0.08)" />
          <Polyline points={linePts} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
          {/* target */}
          <Line
            x1={FC_PAD_L}
            x2={w}
            y1={y(FORECAST_TARGET)}
            y2={y(FORECAST_TARGET)}
            stroke="#22C55E"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          {/* x month labels */}
          {FORECAST_X_LABELS.map((lbl, m) => (
            <SvgText
              key={lbl}
              x={mx(m)}
              y={FC_H - 6}
              fontSize={9}
              fill="#94A3B8"
              textAnchor={m === 0 ? "start" : m === months - 1 ? "end" : "middle"}
            >
              {lbl}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: FC_H }} />
      )}
    </View>
  );
}

// ── Cost Accountability outer tab ────────────────────────────────────────────

function CostAccountabilityTab({
  inner,
  onChange,
}: {
  inner: string;
  onChange: (t: string) => void;
}) {
  return (
    <View className="gap-5">
      <TabRow tabs={COST_ACCT_TABS} value={inner} onChange={onChange} />

      {inner === "Overview" ? (
        <View className="gap-4">
          {/* Reuses the Custom KPI Tracker from the Activity Log page. */}
          <CustomKpisTab />
          <View className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
            <CircleCheck color="#22C55E" size={40} />
            <Text className="text-sm text-muted-foreground">
              No alerts - all BDM costs are on track!
            </Text>
          </View>
        </View>
      ) : (
        <CostEmptyState name={inner} />
      )}
    </View>
  );
}

const COST_EMPTY: Record<
  string,
  { lines: string[]; emphasis?: boolean }
> = {
  "Log Cost": { lines: ["Select a specific BDM to log costs"], emphasis: true },
  Trends: {
    lines: [
      "No historical data available yet",
      "Start tracking BDM costs to see trends",
    ],
  },
  Compare: { lines: ["Select a specific BDM to compare"] },
  Milestone: { lines: ["Select a specific BDM to manage milestones"] },
  Reports: { lines: ["Select a specific BDM to manage reports"] },
};

function CostEmptyState({ name }: { name: string }) {
  const cfg = COST_EMPTY[name] ?? { lines: [`No ${name} data yet`] };
  return (
    <View className="items-center gap-1 py-32">
      {cfg.lines.map((line, i) => (
        <Text
          key={i}
          className={cn(
            "text-center",
            cfg.emphasis
              ? "text-2xl font-bold"
              : "text-base text-muted-foreground",
          )}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

// ── Benchmarking outer tab ───────────────────────────────────────────────────

function BenchmarkingTab({
  inner,
  onChange,
}: {
  inner: string;
  onChange: (t: string) => void;
}) {
  return (
    <View className="gap-5">
      <TabRow tabs={BENCHMARKING_TABS} value={inner} onChange={onChange} />

      {inner === "Benchmarks" ? (
        <View className="gap-4 rounded-2xl border border-border bg-card p-4">
          <Text className="text-lg font-bold text-amber-400">
            What Good Looks Like
          </Text>
          {WHAT_GOOD_LOOKS_LIKE.map((p, i) => (
            <Text key={i} className="text-base leading-6">
              {p}
            </Text>
          ))}
        </View>
      ) : inner === "What Works" ? (
        <WhatWorks />
      ) : inner === "Goal Settings" ? (
        <GoalSettingsView />
      ) : (
        <Stub name={inner} />
      )}
    </View>
  );
}

function GoalSettingsView() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Activity color="#38BDF8" size={20} />
          <Text className="text-xl font-bold">
            Activity → Velocity Correlation
          </Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          Which BDM activities drive the highest velocity improvements? Based on
          platform-wide analysis.
        </Text>
      </View>

      {GOAL_SETTINGS.map((g, i) => (
        <View
          key={i}
          className="gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <Text className="text-sm font-bold">{g.label}</Text>
          <View className="flex-row items-center">
            <GoalMetric label="Current" value={g.current} unit={g.unit} align="items-start" />
            <ArrowRight color={colors.mutedForeground} size={16} />
            <GoalMetric label="Suggested Target" value={g.target} unit={g.unit} align="items-center" />
            <GoalMetric label="Best" value={g.best} unit={g.unit} align="items-end" dim />
          </View>
          <Text className="text-xs leading-5 text-muted-foreground">
            {g.note}
          </Text>
        </View>
      ))}
    </View>
  );
}

function GoalMetric({
  label,
  value,
  unit,
  align,
  dim,
}: {
  label: string;
  value: string;
  unit: string;
  align: string;
  dim?: boolean;
}) {
  return (
    <View className={cn("flex-1 gap-0.5", align)}>
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
      <Text className={cn("text-lg font-bold", dim && "text-muted-foreground")}>
        {value}
      </Text>
      <Text className="text-[10px] text-muted-foreground">{unit}</Text>
    </View>
  );
}

const UPLIFT_TONE: Record<
  WhatWorksRow["tone"],
  { box: string; text: string }
> = {
  green: { box: "border border-green-500/30 bg-green-500/15", text: "text-green-400" },
  amber: { box: "border border-amber-500/30 bg-amber-500/15", text: "text-amber-400" },
  grey: { box: "border border-border bg-secondary", text: "text-muted-foreground" },
};

function WhatWorks() {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Activity color="#38BDF8" size={20} />
          <Text className="text-xl font-bold">
            Activity → Velocity Correlation
          </Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          Which BDM activities drive the highest velocity improvements? Based on
          platform-wide analysis.
        </Text>
      </View>

      <View>
        <View className="flex-row border-b border-border pb-2">
          <Text style={{ flex: 1.5 }} className="text-xs font-medium text-muted-foreground">
            Activity
          </Text>
          <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground">
            Velocity Uplift
          </Text>
          <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
            Days to Impact
          </Text>
        </View>
        {WHAT_WORKS_ROWS.map((r) => {
          const t = UPLIFT_TONE[r.tone];
          return (
            <View
              key={r.activity}
              className="flex-row items-center border-b border-border/50 py-3.5"
            >
              <Text style={{ flex: 1.5 }} className="text-sm font-medium">
                {r.activity}
              </Text>
              <View style={{ flex: 1 }}>
                <View className={cn("self-start rounded-md px-2 py-0.5", t.box)}>
                  <Text className={cn("text-xs font-medium", t.text)}>
                    {r.uplift}
                  </Text>
                </View>
              </View>
              <Text style={{ flex: 1 }} className="text-right text-sm">
                {r.days}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TabRow({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly string[];
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
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
    </View>
  );
}

function Metric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      {children}
    </View>
  );
}

function TerritoryCard({ territory: t }: { territory: Territory }) {
  const m = MATURITY[t.maturity];
  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold">{t.name}</Text>
        <View className={cn("rounded-full px-2.5 py-1", m.bg)}>
          <Text className={cn("text-xs font-medium", m.text)}>
            {t.maturity}
          </Text>
        </View>
      </View>

      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Composite Score
          </Text>
          <Text className="text-lg font-bold">{t.score}</Text>
        </View>
        <Progress value={t.score / BDM_SCORE_MAX} indicatorClassName="bg-white" />
      </View>

      <View className="gap-3">
        <View className="flex-row">
          <Metric label="Velocity">
            <View className="flex-row items-center gap-1">
              <TrendingDown color="#EF4444" size={14} />
              <Text className="text-sm font-medium text-red-500">
                {t.velocity} c/a/w
              </Text>
            </View>
          </Metric>
          <Metric label="CPC">
            <Text
              className={cn(
                "text-sm font-medium",
                t.cpcHigh ? "text-red-500" : "text-green-500",
              )}
            >
              {t.cpc}
            </Text>
          </Metric>
        </View>
        <View className="flex-row">
          <Metric label="Fulfillment">
            <Text className="text-sm font-medium">{t.fulfillment}</Text>
          </Metric>
          <Metric label="Orders/WK">
            <Text className="text-sm font-medium">{t.ordersWk}</Text>
          </Metric>
        </View>
      </View>
    </View>
  );
}

// ── Costs inner tab ──────────────────────────────────────────────────────────

function CostsTab() {
  return (
    <View>
      <View className="flex-row border-b border-border pb-2">
        <Text style={{ flex: 1.3 }} className="text-xs font-medium text-muted-foreground">
          BDM
        </Text>
        <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
          Cost/Case
        </Text>
        <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
          Cost/Venue
        </Text>
        <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
          Cost/Menu
        </Text>
      </View>
      {COSTS_TABLE.map((r) => (
        <View
          key={r.bdm}
          className="flex-row items-center border-b border-border/50 py-3"
        >
          <Text style={{ flex: 1.3 }} className="text-sm font-medium" numberOfLines={1}>
            {r.bdm}
          </Text>
          <Text
            style={{ flex: 1 }}
            className={cn(
              "text-right text-sm font-medium",
              r.cpcTone === "green" ? "text-green-500" : "text-red-500",
            )}
          >
            {r.cpc}
          </Text>
          <Text style={{ flex: 1 }} className="text-right text-sm">
            {r.venue}
          </Text>
          <Text style={{ flex: 1 }} className="text-right text-sm">
            {r.menu}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Trends inner tab ─────────────────────────────────────────────────────────

function TrendsTab() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      {/* CPC Trend */}
      <View className="gap-2 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-start justify-between">
          <Text className="text-sm text-muted-foreground">CPC Trend</Text>
          <ArrowUpRight color="#22C55E" size={18} />
        </View>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold">{CPC_TREND.value}</Text>
          <Text className="text-sm text-muted-foreground">
            → {CPC_TREND.target} target
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {CPC_TREND.subtitle}
        </Text>
      </View>

      {/* Efficiency Trend */}
      <View className="gap-2 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-start justify-between">
          <Text className="text-sm text-muted-foreground">Efficiency Trend</Text>
          <ArrowUpRight color="#22C55E" size={18} />
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold">{EFFICIENCY_TREND.value}</Text>
          <View className="rounded-md bg-green-500/15 px-2 py-0.5">
            <Text className="text-xs font-medium text-green-400">
              {EFFICIENCY_TREND.change}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-muted-foreground">
          {EFFICIENCY_TREND.subtitle}
        </Text>
      </View>

      {/* BDM Performance */}
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">BDM Performance</Text>
          <ChartColumn color={colors.mutedForeground} size={18} />
        </View>
        <View className="flex-row">
          <PerfStat value={BDM_PERFORMANCE.improving} label="Improving" color="text-green-400" />
          <PerfStat value={BDM_PERFORMANCE.declining} label="Declining" color="text-red-400" />
          <PerfStat value={BDM_PERFORMANCE.stable} label="Stable" color="text-muted-foreground" />
        </View>
      </View>

      {/* Cost Per Case Trajectory */}
      <View className="gap-1 pt-1">
        <View className="flex-row items-center gap-2">
          <Activity color={colors.foreground} size={20} />
          <Text className="text-xl font-bold">Cost Per Case Trajectory</Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          Historical trend with 3-month projection
        </Text>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <TrajectoryChart />
      </View>
      <View className="rounded-2xl border border-border bg-card p-4">
        <ScatterChart />
      </View>
    </View>
  );
}

function PerfStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1 gap-0.5">
      <Text className={cn("text-2xl font-bold", color)}>{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

const LC_H = 200;
const LC_PAD_T = 10;
const LC_PAD_B = 22;
const LC_PAD_L = 36;

function TrajectoryChart() {
  const [w, setW] = useState(0);
  const plotH = LC_H - LC_PAD_T - LC_PAD_B;
  const n = CPC_TRAJECTORY.length;
  const innerW = Math.max(0, w - LC_PAD_L - 8);
  const x = (i: number) => LC_PAD_L + (n <= 1 ? 0 : (i * innerW) / (n - 1));
  const y = (v: number) => LC_PAD_T + (1 - v / CPC_AXIS_MAX) * plotH;
  const y0 = LC_PAD_T + plotH;
  const fractions = [0, 0.25, 0.5, 0.75, 1];

  const linePts = CPC_TRAJECTORY.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${y0} ${linePts} ${x(n - 1)},${y0}`;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={LC_H}>
          {fractions.map((g, i) => (
            <Line
              key={`g${g}`}
              x1={LC_PAD_L}
              x2={w}
              y1={LC_PAD_T + g * plotH}
              y2={LC_PAD_T + g * plotH}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
            />
          ))}
          {fractions.map((g, i) => (
            <SvgText
              key={`yl${g}`}
              x={LC_PAD_L - 6}
              y={LC_PAD_T + g * plotH + 3}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="end"
            >
              {CPC_Y_TICKS[i]}
            </SvgText>
          ))}
          {/* area + line */}
          <Polygon points={areaPts} fill="rgba(255,255,255,0.05)" />
          <Polyline points={linePts} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
          {/* green dashed target */}
          <Line
            x1={LC_PAD_L}
            x2={w}
            y1={y(CPC_TARGET)}
            y2={y(CPC_TARGET)}
            stroke="#22C55E"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          {/* x labels */}
          {CPC_X_LABELS.map((lbl, i) => (
            <SvgText
              key={lbl}
              x={LC_PAD_L + (i / (CPC_X_LABELS.length - 1)) * innerW}
              y={LC_H - 6}
              fontSize={10}
              fill="#94A3B8"
              textAnchor={i === 0 ? "start" : i === CPC_X_LABELS.length - 1 ? "end" : "middle"}
            >
              {lbl}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: LC_H }} />
      )}
    </View>
  );
}

const SC_H = 180;
const SC_PAD_T = 10;
const SC_PAD_B = 22;
const SC_PAD_L = 32;

function ScatterChart() {
  const [w, setW] = useState(0);
  const plotH = SC_H - SC_PAD_T - SC_PAD_B;
  const months = SCATTER_X_LABELS.length;
  const innerW = Math.max(0, w - SC_PAD_L - 8);
  const x = (m: number) => SC_PAD_L + ((m + 0.5) / months) * innerW;
  const y = (v: number) => SC_PAD_T + (1 - v / SCATTER_AXIS_MAX) * plotH;
  const fractions = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={SC_H}>
          {fractions.map((g, i) => (
            <Line
              key={`g${g}`}
              x1={SC_PAD_L}
              x2={w}
              y1={SC_PAD_T + g * plotH}
              y2={SC_PAD_T + g * plotH}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
            />
          ))}
          {fractions.map((g, i) => (
            <SvgText
              key={`yl${g}`}
              x={SC_PAD_L - 6}
              y={SC_PAD_T + g * plotH + 3}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="end"
            >
              {SCATTER_Y_TICKS[i]}
            </SvgText>
          ))}
          {TREND_SCATTER.map((p, i) => (
            <Circle key={i} cx={x(p.m)} cy={y(p.y)} r={4} fill="#FFFFFF" />
          ))}
          {SCATTER_X_LABELS.map((lbl, m) => (
            <SvgText
              key={lbl}
              x={x(m)}
              y={SC_H - 6}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="middle"
            >
              {lbl}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: SC_H }} />
      )}
    </View>
  );
}

// ── Channels inner tab ───────────────────────────────────────────────────────

function ChannelsTab() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      {CHANNEL_SUMMARY.map((s) => (
        <SummaryCard key={s.label} item={s} />
      ))}

      <View className="gap-1 pt-1">
        <View className="flex-row items-center gap-2">
          <Activity color={colors.foreground} size={20} />
          <Text className="text-xl font-bold">Cost vs Revenue by Channel</Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          BDM cost allocated proportionally by activity volume
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-sm font-semibold">
          Expected vs Realized NSV by Market
        </Text>
        <ChannelChart />
      </View>

      <ChannelTable />
    </View>
  );
}

const CH_H = 200;
const CH_PAD_T = 10;
const CH_PAD_B = 26;
const CH_PAD_L = 40;
const CH_BAR_W = 20;
const CH_BAR_GAP = 6;
const CH_AXIS = "rgba(255,255,255,0.3)";

function ChannelChart() {
  const [w, setW] = useState(0);
  const plotH = CH_H - CH_PAD_T - CH_PAD_B;
  const y0 = CH_PAD_T + plotH;
  const y = (v: number) => CH_PAD_T + (1 - v / CHANNEL_AXIS_MAX) * plotH;
  const groupW = (w - CH_PAD_L) / CHANNEL_BARS.length;
  const fractions = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={CH_H}>
          {fractions.map((g) => (
            <Line
              key={`g${g}`}
              x1={CH_PAD_L}
              x2={w}
              y1={CH_PAD_T + g * plotH}
              y2={CH_PAD_T + g * plotH}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          <Line x1={CH_PAD_L} x2={CH_PAD_L} y1={CH_PAD_T} y2={y0} stroke={CH_AXIS} strokeWidth={1.5} />
          {fractions.map((g, i) => (
            <SvgText
              key={`yl${g}`}
              x={CH_PAD_L - 6}
              y={CH_PAD_T + g * plotH + 3}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="end"
            >
              {CHANNEL_TICKS[i]}
            </SvgText>
          ))}

          {CHANNEL_BARS.map((b, i) => {
            const cx = CH_PAD_L + groupW * i + groupW / 2;
            return (
              <Rect
                key={`c${i}`}
                x={cx - CH_BAR_W - CH_BAR_GAP / 2}
                y={y(b.cost)}
                width={CH_BAR_W}
                height={y0 - y(b.cost)}
                rx={3}
                fill="#22C55E"
              />
            );
          })}
          {CHANNEL_BARS.map((b, i) => {
            const cx = CH_PAD_L + groupW * i + groupW / 2;
            return (
              <Rect
                key={`r${i}`}
                x={cx + CH_BAR_GAP / 2}
                y={y(b.revenue)}
                width={CH_BAR_W}
                height={y0 - y(b.revenue)}
                rx={3}
                fill="#FFFFFF"
              />
            );
          })}
          {CHANNEL_BARS.map((b, i) => (
            <SvgText
              key={`l${i}`}
              x={CH_PAD_L + groupW * i + groupW / 2}
              y={CH_H - 8}
              fontSize={10}
              fill="#94A3B8"
              textAnchor="middle"
            >
              {b.label}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: CH_H }} />
      )}
    </View>
  );
}

const CH_COL = {
  channel: 100,
  accounts: 70,
  cases: 60,
  volume: 60,
  cpc: 80,
  cac: 60,
} as const;

function ChannelTable() {
  const setLocked = usePagerLock((s) => s.setLocked);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="rounded-2xl border border-border bg-card"
      contentContainerStyle={{ padding: 16 }}
      onTouchStart={() => setLocked(true)}
      onTouchEnd={() => setLocked(false)}
      onTouchCancel={() => setLocked(false)}
      onMomentumScrollEnd={() => setLocked(false)}
    >
      <View>
        <View className="flex-row border-b border-border pb-2">
          <BrHead w={CH_COL.channel}>Channel</BrHead>
          <BrHead w={CH_COL.accounts} right>Accounts</BrHead>
          <BrHead w={CH_COL.cases} right>Cases</BrHead>
          <BrHead w={CH_COL.volume} right>Cases</BrHead>
          <BrHead w={CH_COL.cpc} right>CPC</BrHead>
          <BrHead w={CH_COL.cac} right>CAC</BrHead>
        </View>
        {CHANNEL_TABLE.map((r) => (
          <View
            key={r.channel}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text style={{ width: CH_COL.channel }} className="text-sm font-medium">
              {r.channel}
            </Text>
            <Text style={{ width: CH_COL.accounts }} className="text-right text-sm">
              {r.accounts}
            </Text>
            <Text style={{ width: CH_COL.cases }} className="text-right text-sm">
              {r.cases}
            </Text>
            <Text style={{ width: CH_COL.volume }} className="text-right text-sm">
              {r.volume}
            </Text>
            <View style={{ width: CH_COL.cpc }} className="flex-row justify-end">
              <View
                className={cn(
                  "rounded-md px-2 py-0.5",
                  r.cpcHighlight ? "bg-white" : "bg-secondary",
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-medium",
                    r.cpcHighlight && "text-black",
                  )}
                >
                  {r.cpc}
                </Text>
              </View>
            </View>
            <Text style={{ width: CH_COL.cac }} className="text-right text-sm">
              {r.cac}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Attribution inner tab ────────────────────────────────────────────────────

function AttributionTab() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      {/* Summary cards */}
      {ATTR_SUMMARY.map((s) => (
        <SummaryCard key={s.label} item={s} />
      ))}

      {/* Activity → Revenue Flow */}
      <View className="gap-1 pt-1">
        <View className="flex-row items-center gap-2">
          <Activity color={colors.foreground} size={20} />
          <Text className="text-xl font-bold">Activity → Revenue Flow</Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          Revenue attributed to each activity type (Time-Decay (Recommended))
        </Text>
      </View>

      <View className="gap-3 rounded-lg bg-white/[0.08] p-4">
        <Text className="text-base font-semibold">Cases by Distributor</Text>
        <AttributionBarChart />
      </View>

      {/* Detailed breakdown */}
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <Text className="text-base font-semibold">
          Detailed Attribution Breakdown
        </Text>
        <BreakdownTable />
      </View>
    </View>
  );
}

const BR_COL = {
  activity: 130,
  count: 60,
  orders: 60,
  revenue: 90,
  revAct: 95,
  avgDays: 70,
} as const;

function BreakdownTable() {
  const setLocked = usePagerLock((s) => s.setLocked);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Freeze the pager while dragging so this scrolls instead of the screen.
      onTouchStart={() => setLocked(true)}
      onTouchEnd={() => setLocked(false)}
      onTouchCancel={() => setLocked(false)}
      onMomentumScrollEnd={() => setLocked(false)}
    >
      <View>
        {/* header */}
        <View className="flex-row border-b border-border pb-2">
          <BrHead w={BR_COL.activity}>Activity</BrHead>
          <BrHead w={BR_COL.count} right>Count</BrHead>
          <BrHead w={BR_COL.orders} right>Orders</BrHead>
          <BrHead w={BR_COL.revenue} right>Revenue</BrHead>
          <BrHead w={BR_COL.revAct} right>Rev/Activity</BrHead>
          <BrHead w={BR_COL.avgDays} right>Avg Days</BrHead>
        </View>
        {ATTR_BREAKDOWN.map((r) => (
          <View
            key={r.activity}
            className="flex-row items-center border-b border-border/50 py-3"
          >
            <Text style={{ width: BR_COL.activity }} className="text-sm font-medium">
              {r.activity}
            </Text>
            <Text style={{ width: BR_COL.count }} className="text-right text-sm">
              {r.count}
            </Text>
            <Text style={{ width: BR_COL.orders }} className="text-right text-sm">
              {r.orders}
            </Text>
            <Text style={{ width: BR_COL.revenue }} className="text-right text-sm">
              {r.revenue}
            </Text>
            <View
              style={{ width: BR_COL.revAct }}
              className="flex-row justify-end"
            >
              <View className="rounded-md bg-secondary px-2 py-0.5">
                <Text className="text-xs font-medium">{r.revActivity}</Text>
              </View>
            </View>
            <Text style={{ width: BR_COL.avgDays }} className="text-right text-sm">
              {r.avgDays}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function BrHead({
  w,
  right,
  children,
}: {
  w: number;
  right?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{ width: w }}
      className={cn(
        "text-xs font-medium text-muted-foreground",
        right && "text-right",
      )}
    >
      {children}
    </Text>
  );
}

function SummaryCard({ item }: { item: AttrSummary }) {
  const colors = useThemeColors();
  const Icon = item.icon;
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Icon color={item.green ? "#22C55E" : colors.foreground} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-muted-foreground">{item.label}</Text>
        <Text className="text-2xl font-bold">{item.value}</Text>
      </View>
    </View>
  );
}

const ABAR_LABEL_W = 68;
const ABAR_H = 22;
const ABAR_GAP = 20;
const ABAR_AXIS_MAX = 230;
const ABAR_PAD_T = 6;

function AttributionBarChart() {
  const [w, setW] = useState(0);
  const rows = ATTR_BARS.length;
  const plotX0 = ABAR_LABEL_W;
  const plotW = Math.max(0, w - plotX0 - 10);
  const x = (v: number) => plotX0 + (v / ABAR_AXIS_MAX) * plotW;
  // Axis sits below the last bar; the SVG must be tall enough for the tick
  // labels underneath it (they were being clipped before).
  const axisY = ABAR_PAD_T + (rows - 1) * (ABAR_H + ABAR_GAP) + ABAR_H + 12;
  const height = axisY + 22;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          {ATTR_BARS.map((b, i) => {
            const y = ABAR_PAD_T + i * (ABAR_H + ABAR_GAP);
            return (
              <SvgText key={`l${i}`} x={0} y={y + ABAR_H / 2 + 3} fontSize={9} fill="#94A3B8">
                {b.label}
              </SvgText>
            );
          })}
          {ATTR_BARS.map((b, i) => {
            const y = ABAR_PAD_T + i * (ABAR_H + ABAR_GAP);
            return (
              <Rect
                key={`b${i}`}
                x={plotX0}
                y={y}
                width={Math.max(0, x(b.value) - plotX0)}
                height={ABAR_H}
                rx={3}
                fill={b.highlight ? "#FFFFFF" : "#22C55E"}
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
          {ATTR_BAR_TICKS.map((t) => (
            <SvgText
              key={`t${t}`}
              x={x(t)}
              y={axisY + 14}
              fontSize={10}
              fill="#94A3B8"
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

// ── Territory inner tab ──────────────────────────────────────────────────────

const TIER: Record<
  TierTone,
  { card: string; head: string; icon: string; metric: string; count: string }
> = {
  green: {
    card: "border-green-500/30 bg-green-500/10",
    head: "text-green-400",
    icon: "#4ADE80",
    metric: "text-green-400",
    count: "text-green-400",
  },
  neutral: {
    card: "border-border bg-white/5",
    head: "text-foreground",
    icon: "#94A3B8",
    metric: "text-amber-400",
    count: "text-foreground",
  },
  amber: {
    card: "border-amber-500/30 bg-amber-500/10",
    head: "text-amber-400",
    icon: "#FBBF24",
    metric: "text-amber-400",
    count: "text-amber-400",
  },
};

const CPC_TONE: Record<NormRow["cpcTone"], string> = {
  green: "text-green-500",
  muted: "text-muted-foreground",
  red: "text-red-500",
};

function TerritoryTab() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      {/* Market maturity tiers */}
      {MARKET_TIERS.map((tier) => (
        <TierCard key={tier.name} tier={tier} />
      ))}

      {/* Territory-Normalized Performance */}
      <View className="gap-1 pt-1">
        <View className="flex-row items-center gap-2">
          <Activity color={colors.foreground} size={20} />
          <Text className="text-xl font-bold">
            Territory-Normalized Performance
          </Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          Scores adjusted for market maturity — emerging markets get higher
          multipliers
        </Text>
      </View>

      <View className="gap-5 rounded-2xl border border-border bg-card p-4">
        {/* BDM / Market / Territory Score */}
        <View>
          <View className="flex-row border-b border-border pb-2">
            <Text style={{ flex: 1.5 }} className="text-xs font-medium text-muted-foreground">
              BDM
            </Text>
            <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground">
              Market
            </Text>
            <Text style={{ flex: 1.4 }} className="text-right text-xs font-medium text-muted-foreground">
              Territory Score
            </Text>
          </View>
          {NORM_ROWS.map((r) => (
            <View
              key={r.name}
              className="flex-row items-center border-b border-border/50 py-3"
            >
              <Text style={{ flex: 1.5 }} className="text-sm font-medium" numberOfLines={1}>
                {r.name}
              </Text>
              <View style={{ flex: 1 }}>
                <MarketBadge market={r.market} />
              </View>
              <View
                style={{ flex: 1.4 }}
                className="flex-row items-center justify-end gap-2"
              >
                <Progress value={r.score / 100} className="h-2 w-14" />
                <Text className="w-6 text-right text-sm font-bold">
                  {r.score}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Velocity / CPC / Fulfilment */}
        <View>
          <View className="flex-row border-b border-border pb-2">
            <Text style={{ flex: 1.7 }} className="text-xs font-medium text-muted-foreground">
              Velocity
            </Text>
            <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
              CPC
            </Text>
            <Text style={{ flex: 1 }} className="text-right text-xs font-medium text-muted-foreground">
              Fulfilment
            </Text>
          </View>
          {NORM_ROWS.map((r) => (
            <View
              key={r.name}
              className="flex-row items-center border-b border-border/50 py-3"
            >
              <View style={{ flex: 1.7 }} className="flex-row items-center gap-1.5">
                <TrendingDown color="#EF4444" size={12} />
                <Text className="text-xs font-medium text-red-500">
                  {r.velocity} c/a/w
                </Text>
                <Sparkline />
              </View>
              <Text
                style={{ flex: 1 }}
                className={cn("text-right text-sm font-medium", CPC_TONE[r.cpcTone])}
              >
                {r.cpc}
              </Text>
              <Text style={{ flex: 1 }} className="text-right text-sm">
                {r.fulfilment}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function TierCard({ tier }: { tier: MarketTier }) {
  const s = TIER[tier.tone];
  return (
    <View className={cn("gap-3 rounded-2xl border p-4", s.card)}>
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-1.5">
          <MapPin color={s.icon} size={16} />
          <Text className={cn("text-base font-semibold", s.head)}>
            {tier.name}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">{tier.bdms}</Text>
      </View>
      <Text className="text-sm text-muted-foreground">{tier.desc}</Text>
      <View className="gap-3">
        <View className="flex-row">
          <TierMetric label="Avg CPC" value={tier.avgCpc} color={s.metric} />
          <TierMetric label="Avg Efficiency" value={tier.avgEff} color={s.metric} />
        </View>
        <View className="flex-row">
          <TierMetric label="Venues" value={tier.venues} color={s.count} />
          <TierMetric label="Cases" value={tier.cases} color={s.count} />
        </View>
      </View>
    </View>
  );
}

function TierMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 gap-0.5">
      <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <Text className={cn("text-base font-semibold", color)}>{value}</Text>
    </View>
  );
}

function MarketBadge({ market }: { market: Maturity }) {
  const m = MATURITY[market];
  return (
    <View className={cn("self-start rounded px-2 py-0.5", m.bg)}>
      <Text className={cn("text-[11px] font-medium", m.text)}>
        {market.toLowerCase()}
      </Text>
    </View>
  );
}

function Sparkline() {
  return (
    <Svg width={30} height={14}>
      <Polyline
        points="0,10 6,4 12,8 18,3 24,9 30,5"
        fill="none"
        stroke="#EF4444"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        padding: 3,
        backgroundColor: value ? "#FFFFFF" : "#3A3F47",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: value ? "#0B1220" : "#9CA3AF",
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );
}

function Stub({ name }: { name: string }) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-border bg-card p-8">
      <Text className="text-base font-semibold">{name}</Text>
      <Text variant="muted" className="text-center text-sm">
        {name} view coming soon.
      </Text>
    </View>
  );
}
