import {
  CircleCheck,
  Database,
  FileSpreadsheet,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Slider from "@react-native-community/slider";
import Svg, {
  Circle,
  Line as SvgLine,
  Polygon,
  Polyline,
  Text as SvgText,
} from "react-native-svg";

import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  AUTO_REORDER,
  CHANNELS,
  DISTRIBUTORS,
  FINANCIAL_ORDERS,
  FORECAST,
  GHOST_ORDERS,
  ORDERS,
  type AutoReorderRule,
  type FinancialImpactOrder,
  type OrderStatus,
} from "@/lib/order-fulfilment-data";

// ── Shared bits ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OrderStatus, string> = {
  Fulfilled: "bg-emerald-500/10 border-emerald-500/20",
  Partial: "bg-amber-500/10 border-amber-500/20",
  Pending: "bg-secondary border-transparent",
  Failed: "bg-red-500/10 border-red-500/20",
};
const STATUS_TEXT: Record<OrderStatus, string> = {
  Fulfilled: "text-emerald-500",
  Partial: "text-amber-500",
  Pending: "text-secondary-foreground",
  Failed: "text-red-500",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <View
      className={cn(
        "self-start rounded-md border px-2 py-0.5",
        STATUS_STYLES[status],
      )}
    >
      <Text className={cn("text-xs font-medium", STATUS_TEXT[status])}>
        {status}
      </Text>
    </View>
  );
}

/** Pill used in the card headers (Sample Data / Lateish / VIP Depletions …). */
function Pill({
  children,
  className,
  textClassName,
  icon,
}: {
  children: string;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-md border px-2.5 py-1",
        className,
      )}
    >
      {icon}
      <Text className={cn("text-xs font-medium", textClassName)}>{children}</Text>
    </View>
  );
}

/** Custom on/off toggle — RN's <Switch> ignores track colours on some platforms. */
function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      className={cn(
        "h-6 w-11 justify-center rounded-full px-0.5 active:opacity-90",
        value ? "items-end bg-white" : "items-start bg-white/20",
      )}
    >
      <View
        className={cn(
          "h-5 w-5 rounded-full",
          value ? "bg-[#0B1220]" : "bg-white",
        )}
      />
    </Pressable>
  );
}

/**
 * A panel = a header block (title, description, badges) that sits *outside* the
 * card, above a bordered card holding just the table/content.
 */
function PanelCard({
  title,
  description,
  badges,
  bare,
  children,
}: {
  title: string;
  description: string;
  badges?: React.ReactNode;
  /** Skip the bordered card wrapper and lay content straight on the page. */
  bare?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-2">
        <Text className="text-xl font-bold">{title}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          {description}
        </Text>
        {badges ? (
          <View className="mt-0.5 flex-row flex-wrap gap-2">{badges}</View>
        ) : null}
      </View>
      {bare ? (
        <View className="gap-4">{children}</View>
      ) : (
        <View className="rounded-2xl border border-border bg-card p-4">
          {children}
        </View>
      )}
    </View>
  );
}

/** Table header cell (fixed width, for horizontal-scroll tables). */
function TH({
  w,
  right,
  center,
  className,
  children,
}: {
  w: number;
  right?: boolean;
  center?: boolean;
  className?: string;
  children: string;
}) {
  return (
    <Text
      style={{ width: w }}
      className={cn(
        "text-xs font-medium text-muted-foreground",
        right && "text-right",
        center && "text-center",
        className,
      )}
    >
      {children}
    </Text>
  );
}

// ── Recent Orders ────────────────────────────────────────────────────────────

const O_COL = {
  id: 132,
  date: 62,
  account: 150,
  distributor: 120,
  expected: 72,
  actual: 66,
  status: 104,
  days: 52,
} as const;

function OrdersPanel() {
  return (
    <PanelCard
      title="Order Fulfilment Status"
      description="Track orders from placement to delivery with depletion matching"
      badges={
        <>
          <Pill className="border-amber-500/30 bg-amber-500/10" textClassName="text-amber-500">
            Sample Data
          </Pill>
          <Pill
            className="border-border bg-secondary"
            icon={<Database color="#FFFFFF" size={12} />}
          >
            Lateish
          </Pill>
          <Pill
            className="border-emerald-500/20 bg-emerald-500/10"
            textClassName="text-emerald-500"
            icon={<FileSpreadsheet color="#10B981" size={12} />}
          >
            VIP Depletions
          </Pill>
        </>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View className="flex-row border-b border-border pb-2">
            <TH w={O_COL.id}>Order #</TH>
            <TH w={O_COL.date}>Date</TH>
            <TH w={O_COL.account}>Account</TH>
            <TH w={O_COL.distributor}>Distributor</TH>
            <TH w={O_COL.expected} right>Expected</TH>
            <TH w={O_COL.actual} right>Actual</TH>
            <TH w={O_COL.status} className="pl-4">Status</TH>
            <TH w={O_COL.days} right>Days</TH>
          </View>
          {ORDERS.map((o) => (
            <View
              key={o.id}
              className="flex-row items-center border-b border-border/50 py-3"
            >
              <Text style={{ width: O_COL.id }} className="font-mono text-xs">
                {o.id}
              </Text>
              <Text style={{ width: O_COL.date }} className="text-sm">
                {o.date}
              </Text>
              <Text style={{ width: O_COL.account }} className="pr-2 text-sm">
                {o.account}
              </Text>
              <Text style={{ width: O_COL.distributor }} className="pr-2 text-sm">
                {o.distributor}
              </Text>
              <Text style={{ width: O_COL.expected }} className="text-right text-sm">
                {o.expected} cs
              </Text>
              <Text style={{ width: O_COL.actual }} className="text-right text-sm">
                {o.actual !== null ? `${o.actual} cs` : "-"}
              </Text>
              <View style={{ width: O_COL.status }} className="pl-4">
                <StatusBadge status={o.status} />
              </View>
              <Text
                style={{ width: O_COL.days }}
                className={cn(
                  "text-right text-sm",
                  o.daysOverdue && "text-amber-500",
                )}
              >
                {o.days !== null ? `${o.days}d` : "-"}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </PanelCard>
  );
}

// ── Distributor Performance ──────────────────────────────────────────────────

const D_COL = {
  name: 130,
  orders: 92,
  fulfilled: 80,
  rate: 140,
  avg: 78,
} as const;

function DistributorsPanel() {
  return (
    <PanelCard
      title="Distributor Fulfilment Performance"
      description="Compare fulfilment rates and delivery times across distributors"
      badges={
        <Pill
          className="border-border bg-secondary"
          icon={<Database color="#FFFFFF" size={12} />}
        >
          Lateish
        </Pill>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View className="flex-row border-b border-border pb-2">
            <TH w={D_COL.name}>Distributor</TH>
            <TH w={D_COL.orders} right>Total Orders</TH>
            <TH w={D_COL.fulfilled} right>Fulfilled</TH>
            <TH w={D_COL.rate} className="pl-4">Fulfilment Rate</TH>
            <TH w={D_COL.avg} right>Avg Days</TH>
          </View>
          {DISTRIBUTORS.map((d) => (
            <View
              key={d.name}
              className="flex-row items-center border-b border-border/50 py-3"
            >
              <Text style={{ width: D_COL.name }} className="text-sm font-medium">
                {d.name}
              </Text>
              <Text style={{ width: D_COL.orders }} className="text-right text-sm">
                {d.orders}
              </Text>
              <Text style={{ width: D_COL.fulfilled }} className="text-right text-sm">
                {d.fulfilled}
              </Text>
              <View style={{ width: D_COL.rate }} className="flex-row items-center gap-2 pl-4">
                <Progress value={d.fulfilmentRate / 100} className="w-16" />
                <Text className="text-sm font-medium">{d.fulfilmentRate}%</Text>
              </View>
              <Text style={{ width: D_COL.avg }} className="text-right text-sm">
                {d.avgDays != null ? `${d.avgDays}d` : "-"}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </PanelCard>
  );
}

// ── By Channel ───────────────────────────────────────────────────────────────

const C_COL = {
  channel: 190,
  orders: 66,
  cases: 66,
  rate: 140,
  avg: 74,
  fp: 96,
} as const;

function ChannelsPanel() {
  return (
    <PanelCard
      title="Fulfilment by Channel"
      description="Compare fulfilment performance across sales channels"
      badges={
        <Pill className="border-amber-500/30 bg-amber-500/10" textClassName="text-amber-500">
          Sample Data
        </Pill>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View className="flex-row border-b border-border pb-2">
            <TH w={C_COL.channel}>Channel</TH>
            <TH w={C_COL.orders} right>Orders</TH>
            <TH w={C_COL.cases} right>Cases</TH>
            <TH w={C_COL.rate} className="pl-4">Fulfilment Rate</TH>
            <TH w={C_COL.avg} right>Avg Days</TH>
            <TH w={C_COL.fp} right>Failed/Partial</TH>
          </View>
          {CHANNELS.map((ch) => (
            <View
              key={ch.channel}
              className="flex-row items-center border-b border-border/50 py-3"
            >
              <Text style={{ width: C_COL.channel }} className="pr-2 text-sm font-medium">
                {ch.channel}
              </Text>
              <Text style={{ width: C_COL.orders }} className="text-right text-sm">
                {ch.orders}
              </Text>
              <Text style={{ width: C_COL.cases }} className="text-right text-sm">
                {ch.cases} cs
              </Text>
              <View style={{ width: C_COL.rate }} className="flex-row items-center gap-2 pl-4">
                <Progress value={ch.fulfilmentRate / 100} className="w-16" />
                <Text className="text-sm font-medium">{ch.fulfilmentRate}%</Text>
              </View>
              <Text
                style={{ width: C_COL.avg }}
                className={cn(
                  "text-right text-sm",
                  ch.avgDaysOverdue && "text-amber-500",
                )}
              >
                {ch.avgDays}d
              </Text>
              <View style={{ width: C_COL.fp }} className="flex-row justify-end">
                {ch.failedPartial > 0 ? (
                  <View className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5">
                    <Text className="text-xs font-medium text-red-500">
                      {ch.failedPartial}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm text-muted-foreground">—</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </PanelCard>
  );
}

// ── Forecast ─────────────────────────────────────────────────────────────────

function ForecastChart({ width }: { width: number }) {
  const H = 200;
  const padL = 30;
  const padR = 10;
  const padT = 12;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = H - padT - padB;

  const yMax = 70;
  const n = FORECAST.length;
  const x = (i: number) => padL + (plotW * i) / (n - 1);
  const y = (v: number) => padT + plotH * (1 - v / yMax);

  const actualPts = FORECAST.map((d, i) => (d.actual != null ? [x(i), y(d.actual)] : null)).filter(
    Boolean,
  ) as number[][];
  const forecastPts = FORECAST.map((d, i) =>
    d.forecast != null ? [x(i), y(d.forecast)] : null,
  ).filter(Boolean) as number[][];

  // Confidence band polygon (high across, then low back).
  const bandTop = FORECAST.map((d, i) =>
    d.confidenceHigh != null ? [x(i), y(d.confidenceHigh)] : null,
  ).filter(Boolean) as number[][];
  const bandBottom = FORECAST.map((d, i) =>
    d.confidenceLow != null ? [x(i), y(d.confidenceLow)] : null,
  ).filter(Boolean) as number[][];
  const bandPoints = [...bandTop, ...bandBottom.reverse()]
    .map((p) => `${p[0]},${p[1]}`)
    .join(" ");

  const ticks = [0, 15, 30, 45, 60];

  return (
    <Svg width={width} height={H}>
      {ticks.map((t) => (
        <SvgLine
          key={t}
          x1={padL}
          x2={width - padR}
          y1={y(t)}
          y2={y(t)}
          stroke="#FFFFFF"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}
      {ticks.map((t) => (
        <SvgText key={`l${t}`} x={padL - 6} y={y(t) + 3} fontSize={10} fill="#94A3B8" textAnchor="end">
          {String(t)}
        </SvgText>
      ))}

      {bandTop.length > 1 ? (
        <Polygon points={bandPoints} fill="#3B82F6" fillOpacity={0.12} />
      ) : null}

      <Polyline
        points={forecastPts.map((p) => `${p[0]},${p[1]}`).join(" ")}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray="6 3"
      />
      <Polyline
        points={actualPts.map((p) => `${p[0]},${p[1]}`).join(" ")}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      {actualPts.map((p, i) => (
        <Circle key={`a${i}`} cx={p[0]} cy={p[1]} r={3} fill="#0B1220" stroke="#FFFFFF" strokeWidth={2} />
      ))}
      {forecastPts.map((p, i) => (
        <Circle key={`f${i}`} cx={p[0]} cy={p[1]} r={3} fill="#0B1220" stroke="#3B82F6" strokeWidth={2} />
      ))}

      {FORECAST.map((d, i) =>
        i % 2 === 0 ? (
          <SvgText key={`x${i}`} x={x(i)} y={H - 8} fontSize={10} fill="#94A3B8" textAnchor="middle">
            {d.week}
          </SvgText>
        ) : null,
      )}
    </Svg>
  );
}

function ForecastPanel() {
  const [w, setW] = useState(0);

  const forecastPoints = FORECAST.filter((d) => d.forecast != null);
  const lastActual = FORECAST.filter((d) => d.actual != null).at(-1)?.actual ?? 0;
  const avgForecast = Math.round(
    forecastPoints.reduce((s, d) => s + (d.forecast ?? 0), 0) / (forecastPoints.length || 1),
  );
  const confidenceRange =
    forecastPoints.length > 0
      ? Math.round(((forecastPoints[0].confidenceHigh ?? 0) - (forecastPoints[0].confidenceLow ?? 0)) / 2)
      : 0;

  return (
    <PanelCard
      title="Fulfilment Forecast"
      description="Weekly order volume — actuals and 8-week projection with confidence bands"
      badges={
        <Pill className="border-amber-500/30 bg-amber-500/10" textClassName="text-amber-500">
          Sample Data
        </Pill>
      }
    >
      <View className="flex-row gap-3">
        <SummaryTile label="Last Actual" value={`${lastActual} cs`} />
        <SummaryTile label="Avg Forecast" value={`${avgForecast} cs`} />
        <SummaryTile label="Confidence Range" value={`±${confidenceRange}`} />
      </View>

      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? <ForecastChart width={w} /> : <View style={{ height: 200 }} />}
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        <LegendDot color="#FFFFFF" label="Actual" />
        <LegendDot color="#3B82F6" label="Forecast" dashed />
        <LegendDot color="#3B82F6" label="Confidence band" band />
      </View>
    </PanelCard>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-lg bg-white/[0.06] p-3">
      <Text className="text-center text-xs text-muted-foreground">{label}</Text>
      <Text className="text-xl font-bold">{value}</Text>
    </View>
  );
}

function LegendDot({
  color,
  label,
  dashed,
  band,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  band?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{
          width: 14,
          height: band ? 10 : 0,
          borderRadius: 2,
          backgroundColor: band ? `${color}22` : "transparent",
          borderBottomWidth: band ? 0 : 2,
          borderColor: color,
          borderStyle: dashed ? "dashed" : "solid",
        }}
      />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

// ── Ghost Orders ─────────────────────────────────────────────────────────────

const G_COL = {
  order: 130,
  account: 150,
  sku: 200,
  shipped: 78,
  depleted: 80,
  score: 120,
  reason: 230,
} as const;

function GhostPanel() {
  return (
    <PanelCard
      title="Ghost Order Detection"
      description="Shipments without matching depletions — possible inventory sitting in distributor warehouses"
      badges={
        <>
          <Pill className="border-amber-500/30 bg-amber-500/10" textClassName="text-amber-500">
            Sample Data
          </Pill>
          <Pill
            className="border-red-500/20 bg-red-500/10"
            textClassName="text-red-500"
            icon={<TriangleAlert color="#EF4444" size={12} />}
          >
            {`${GHOST_ORDERS.length} detected`}
          </Pill>
        </>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View className="flex-row border-b border-border pb-2">
            <TH w={G_COL.order}>Order</TH>
            <TH w={G_COL.account}>Account</TH>
            <TH w={G_COL.sku}>SKU</TH>
            <TH w={G_COL.shipped} right>Shipped</TH>
            <TH w={G_COL.depleted} right>Depleted</TH>
            <TH w={G_COL.score}>Ghost Score</TH>
            <TH w={G_COL.reason}>Possible Reason</TH>
          </View>
          {GHOST_ORDERS.map((g) => (
            <View
              key={g.id}
              className="flex-row items-center border-b border-border/50 py-3"
            >
              <View style={{ width: G_COL.order }}>
                <Text className="font-mono text-xs">{g.id}</Text>
                <Text className="text-xs text-muted-foreground">{g.daysAgo}d ago</Text>
              </View>
              <View style={{ width: G_COL.account }} className="pr-2">
                <Text className="text-sm">{g.account}</Text>
                <Text className="text-xs text-muted-foreground">{g.distributor}</Text>
              </View>
              <Text style={{ width: G_COL.sku }} className="pr-2 text-sm">
                {g.sku}
              </Text>
              <Text style={{ width: G_COL.shipped }} className="text-right text-sm font-medium">
                {g.shipped} cs
              </Text>
              <Text
                style={{ width: G_COL.depleted }}
                className={cn(
                  "text-right text-sm",
                  g.depleted === 0 ? "font-medium text-red-500" : "text-amber-500",
                )}
              >
                {g.depleted} cs
              </Text>
              <View style={{ width: G_COL.score }} className="flex-row">
                <View
                  className={cn(
                    "rounded-md border px-2 py-0.5",
                    g.ghostLabel === "Ghost"
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-amber-500/20 bg-amber-500/10",
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      g.ghostLabel === "Ghost" ? "text-red-500" : "text-amber-500",
                    )}
                  >
                    {g.ghostScore}% {g.ghostLabel}
                  </Text>
                </View>
              </View>
              <Text
                style={{ width: G_COL.reason }}
                className="pr-2 text-xs text-muted-foreground"
              >
                {g.reason}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </PanelCard>
  );
}

// ── Auto-Reorder ─────────────────────────────────────────────────────────────

const R_COL = {
  sku: 200,
  velocity: 96,
  stock: 84,
  cover: 92,
  point: 82,
  status: 140,
  active: 64,
  action: 128,
} as const;

function AutoReorderPanel() {
  const [activeIds, setActiveIds] = useState<Set<string>>(
    () => new Set(AUTO_REORDER.filter((r) => r.active).map((r) => r.id)),
  );
  const toggle = (id: string) =>
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const belowCount = AUTO_REORDER.filter((r) => r.status === "Below Threshold").length;

  return (
    <PanelCard
      title="Auto-Reorder Configuration"
      description="Velocity-based reorder points. Orders trigger when stock falls below configured weeks of cover."
      badges={
        <>
          <Pill className="border-amber-500/30 bg-amber-500/10" textClassName="text-amber-500">
            Sample Data
          </Pill>
          <Pill
            className="border-red-500/20 bg-red-500/10"
            textClassName="text-red-500"
            icon={<TriangleAlert color="#EF4444" size={12} />}
          >
            {`${belowCount} below threshold`}
          </Pill>
        </>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View className="flex-row border-b border-border pb-2">
            <TH w={R_COL.sku}>SKU</TH>
            <TH w={R_COL.velocity} right>Velocity (c/w)</TH>
            <TH w={R_COL.stock} right>Est. Stock</TH>
            <TH w={R_COL.cover} right>Weeks Cover</TH>
            <TH w={R_COL.point} right>Reorder Pt</TH>
            <TH w={R_COL.status} className="pl-4">Status</TH>
            <TH w={R_COL.active} center>Active</TH>
            <TH w={R_COL.action}> </TH>
          </View>
          {AUTO_REORDER.map((r) => (
            <ReorderRow
              key={r.id}
              rule={r}
              active={activeIds.has(r.id)}
              onToggle={() => toggle(r.id)}
            />
          ))}
        </View>
      </ScrollView>
    </PanelCard>
  );
}

function ReorderRow({
  rule: r,
  active,
  onToggle,
}: {
  rule: AutoReorderRule;
  active: boolean;
  onToggle: () => void;
}) {
  const below = r.status === "Below Threshold";
  return (
    <View
      className={cn(
        "flex-row items-center border-b border-border/50 py-3",
        below && "bg-red-500/5",
      )}
    >
      <Text style={{ width: R_COL.sku }} className="pr-2 text-sm font-medium">
        {r.sku}
      </Text>
      <Text style={{ width: R_COL.velocity }} className="text-right text-sm">
        {r.velocity}
      </Text>
      <Text style={{ width: R_COL.stock }} className="text-right text-sm">
        {r.estStock} cs
      </Text>
      <Text
        style={{ width: R_COL.cover }}
        className={cn("text-right text-sm", below ? "font-medium text-red-500" : "text-emerald-500")}
      >
        {r.weeksCover}w
      </Text>
      <Text style={{ width: R_COL.point }} className="text-right text-sm">
        {r.reorderPoint}w
      </Text>
      <View style={{ width: R_COL.status }} className="flex-row pl-4">
        {below ? (
          <View className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5">
            <Text className="text-xs font-medium text-red-500">Below Threshold</Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
            <CircleCheck color="#10B981" size={12} />
            <Text className="text-xs font-medium text-emerald-500">OK</Text>
          </View>
        )}
      </View>
      <View style={{ width: R_COL.active }} className="items-center">
        <Toggle value={active} onToggle={onToggle} />
      </View>
      <View style={{ width: R_COL.action }} className="flex-row">
        {r.reorderQty !== null ? (
          <Pressable className="flex-row items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 active:opacity-80">
            <ShoppingCart color="#FFFFFF" size={12} />
            <Text className="text-xs font-medium">Reorder {r.reorderQty}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// ── Financial Impact ─────────────────────────────────────────────────────────

const FIN_STATUS: Record<FinancialImpactOrder["status"], { box: string; text: string }> = {
  Failed: { box: "bg-red-600", text: "text-white" },
  Partial: { box: "bg-amber-700", text: "text-amber-50" },
  Delayed: { box: "bg-orange-500", text: "text-white" },
};

function FinancialPanel() {
  const [marginPct, setMarginPct] = useState(30);

  const totalLost = FINANCIAL_ORDERS.reduce((s, o) => s + o.lostRevenue, 0);
  const totalMargin = Math.round((totalLost * marginPct) / 100);
  const avgDelay = (
    FINANCIAL_ORDERS.reduce((s, o) => s + o.delayDays, 0) / FINANCIAL_ORDERS.length
  ).toFixed(1);

  return (
    <PanelCard
      title="Financial Impact of Delays"
      description="Revenue and margin impact from delayed, partial, and failed orders"
      bare
      badges={
        <Pill className="border-amber-500/30 bg-amber-500/10" textClassName="text-amber-500">
          Sample Data
        </Pill>
      }
    >
      {/* Summary tiles */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <View className="flex-1 items-center gap-1 rounded-lg border border-red-500/15 bg-red-500/10 p-3">
            <Text className="text-xs text-muted-foreground">Lost Revenue</Text>
            <Text className="text-xl font-bold text-red-500">${totalLost.toLocaleString()}</Text>
          </View>
          <View className="flex-1 items-center gap-1 rounded-lg border border-amber-500/15 bg-amber-500/10 p-3">
            <Text className="text-xs text-muted-foreground">Margin Impact</Text>
            <Text className="text-xl font-bold text-amber-500">${totalMargin.toLocaleString()}</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 items-center gap-1 rounded-lg bg-white/[0.06] p-3">
            <Text className="text-xs text-muted-foreground">Avg Delay</Text>
            <Text className="text-xl font-bold">{avgDelay} days</Text>
          </View>
          <View className="flex-1 items-center gap-1 rounded-lg bg-white/[0.06] p-3">
            <Text className="text-xs text-muted-foreground">Affected Orders</Text>
            <Text className="text-xl font-bold">{FINANCIAL_ORDERS.length}</Text>
          </View>
        </View>
      </View>

      {/* Margin slider */}
      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium">Assumed Margin %</Text>
          <Text className="text-base font-bold">{marginPct}%</Text>
        </View>
        <Slider
          minimumValue={10}
          maximumValue={60}
          step={1}
          value={marginPct}
          onValueChange={setMarginPct}
          minimumTrackTintColor="#22D3EE"
          maximumTrackTintColor="rgba(255,255,255,0.15)"
          thumbTintColor="#FFFFFF"
          style={{ height: 36, marginHorizontal: -2 }}
        />
        <Text className="text-xs text-muted-foreground">
          Adjust margin assumption to recalculate impact
        </Text>
      </View>

      {/* Order cards */}
      {FINANCIAL_ORDERS.map((o) => (
        <View key={o.id} className="gap-3 rounded-xl bg-white/[0.04] p-4">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-base font-bold">{o.id}</Text>
              <Text className="text-sm text-muted-foreground">{o.account}</Text>
            </View>
            <View className={cn("rounded-md px-2.5 py-1", FIN_STATUS[o.status].box)}>
              <Text className={cn("text-xs font-semibold", FIN_STATUS[o.status].text)}>
                {o.status}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <FinMetric label="DELAY" value={`${o.delayDays}d`} />
            <FinMetric label="CASES" value={`${o.cases}`} />
            <FinMetric label="REV/CASE" value={`$${o.revPerCase}`} />
          </View>

          <View className="flex-row items-end justify-between border-t border-border/50 pt-3">
            <View>
              <Text className="text-xs text-muted-foreground">Lost Revenue</Text>
              <Text className="text-lg font-bold text-red-500">
                ${o.lostRevenue.toLocaleString()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-muted-foreground">Margin Impact</Text>
              <Text className="text-lg font-bold text-amber-500">
                ${Math.round((o.lostRevenue * marginPct) / 100).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </PanelCard>
  );
}

function FinMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-base font-semibold">{value}</Text>
    </View>
  );
}

// ── Tabs shell ───────────────────────────────────────────────────────────────

type TabKey =
  | "orders"
  | "distributors"
  | "channels"
  | "forecast"
  | "ghost"
  | "reorder"
  | "financial";

const TABS: { key: TabKey; label: string }[] = [
  { key: "orders", label: "Recent Orders" },
  { key: "distributors", label: "Distributor Performance" },
  { key: "channels", label: "By Channel" },
  { key: "forecast", label: "Forecast" },
  { key: "ghost", label: "Ghost Orders" },
  { key: "reorder", label: "Auto-Reorder" },
  { key: "financial", label: "Financial Impact" },
];

export function FulfilmentTabs() {
  const [tab, setTab] = useState<TabKey>("orders");

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        {TABS.map(({ key, label }) => {
          const active = key === tab;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              className={cn(
                "rounded-md px-3 py-2",
                active ? "bg-brand-maroon" : "bg-secondary",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-white" : "text-muted-foreground",
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "orders" ? <OrdersPanel /> : null}
      {tab === "distributors" ? <DistributorsPanel /> : null}
      {tab === "channels" ? <ChannelsPanel /> : null}
      {tab === "forecast" ? <ForecastPanel /> : null}
      {tab === "ghost" ? <GhostPanel /> : null}
      {tab === "reorder" ? <AutoReorderPanel /> : null}
      {tab === "financial" ? <FinancialPanel /> : null}
    </View>
  );
}
