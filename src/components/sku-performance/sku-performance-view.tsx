import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Map as MapIcon,
  Package,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { useSkuPerformance } from "@/hooks/use-sku-performance";
import { cn } from "@/lib/utils";
import {
  type FamilyStatus,
  type ProductFamily,
  type SkuItem,
  type SkuStatus,
} from "@/lib/sku-performance-data";

const NAVY: GradientColors = ["#1C3A69", "#132A4F"];
const GREEN: GradientColors = ["#1C6B39", "#0C2E1A"];
const AMBER: GradientColors = ["#7A5C16", "#33260A"];

// ── Status badges ─────────────────────────────────────────────────────────────

const FAMILY_BADGE: Record<FamilyStatus, string> = {
  "On Track": "border-blue-500/30 bg-blue-500/10 text-blue-500",
  Lagging: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  Ahead: "border-green-500/30 bg-green-500/10 text-green-500",
};

function FamilyStatusBadge({ status }: { status: FamilyStatus }) {
  return (
    <View className={cn("rounded-md border px-2 py-0.5", FAMILY_BADGE[status])}>
      <Text className={cn("text-xs font-medium", FAMILY_BADGE[status])}>
        {status}
      </Text>
    </View>
  );
}

function SkuStatusBadge({ status }: { status: SkuStatus }) {
  if (status === "Above Target") {
    return (
      <View className="flex-row items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5">
        <TrendingUp color="#22C55E" size={12} />
        <Text className="text-xs font-medium text-green-500">Above Target</Text>
      </View>
    );
  }
  if (status === "Below Target") {
    return (
      <View className="flex-row items-center gap-1 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5">
        <TriangleAlert color="#EAB308" size={12} />
        <Text className="text-xs font-medium text-yellow-500">Below Target</Text>
      </View>
    );
  }
  return (
    <View className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5">
      <Text className="text-xs font-medium text-blue-500">On Track</Text>
    </View>
  );
}

// ── SKU row (inside an open family) ───────────────────────────────────────────

function SkuRow({ sku }: { sku: SkuItem }) {
  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-[#14213F] p-3">
      <View className="h-8 w-8 items-center justify-center rounded bg-white/10">
        <Package color="#94A3B8" size={16} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {sku.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {sku.size} • {sku.skuCode}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-sm font-medium">{sku.cases} cases</Text>
        <Text className="text-xs text-muted-foreground">{sku.listings} listings</Text>
      </View>

      <View className="flex-row items-center gap-0.5 rounded-md border border-green-500/30 bg-green-500/10 px-1.5 py-0.5">
        <TrendingUp color="#22C55E" size={12} />
        <Text className="text-xs font-medium text-green-500">{sku.velocity}</Text>
        <Text className="text-xs text-green-500/70">c/a/w</Text>
      </View>

      <SkuStatusBadge status={sku.status} />
    </View>
  );
}

// ── Family accordion row ──────────────────────────────────────────────────────

function FamilyRow({
  family,
  isOpen,
  onToggle,
}: {
  family: ProductFamily;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Chevron = isOpen ? ChevronDown : ChevronRight;
  return (
    <View className="gap-3 rounded-xl border border-border bg-white/[0.03] p-3">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between gap-2 active:opacity-80"
      >
        <View className="flex-1 flex-row items-center gap-2">
          <Chevron color="#94A3B8" size={18} />
          <View className="flex-1">
            <Text className="text-base font-semibold" numberOfLines={2}>
              {family.name}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {family.skus.length} SKUs • {family.category}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="items-end">
            <Text className="text-sm font-semibold">{family.cases} cases</Text>
            <Text className="text-xs text-muted-foreground">
              {family.targetPct}% of target
            </Text>
          </View>
          <FamilyStatusBadge status={family.status} />
        </View>
      </Pressable>

      {isOpen ? (
        <View className="gap-2">
          {family.skus.map((sku) => (
            <SkuRow key={sku.skuCode} sku={sku} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ── Group-by dropdown ─────────────────────────────────────────────────────────

type GroupBy = "family" | "sku";

function GroupDropdown({
  value,
  onChange,
}: {
  value: GroupBy;
  onChange: (v: GroupBy) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = value === "family" ? "By Family" : "By SKU";
  return (
    <View className="relative" style={{ zIndex: 50 }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="h-10 flex-row items-center gap-1 rounded-md border border-border bg-secondary px-3 active:opacity-80"
      >
        <Text className="text-sm font-medium">{label}</Text>
        <ChevronDown color="#94A3B8" size={16} />
      </Pressable>
      {open ? (
        <View
          className="absolute right-0 top-11 w-36 overflow-hidden rounded-md border border-border bg-popover"
          style={{ zIndex: 50 }}
        >
          {(["family", "sku"] as GroupBy[]).map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "px-3 py-2.5 active:bg-white/5",
                opt === value && "bg-white/5",
              )}
            >
              <Text className="text-sm">
                {opt === "family" ? "By Family" : "By SKU"}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function SkuPerformanceView() {
  const router = useRouter();
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [laggingOnly, setLaggingOnly] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("family");
  const { data, isLoading } = useSkuPerformance(30);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (isLoading || !data) {
    return (
      <Text className="py-16 text-center text-sm text-muted-foreground">
        {isLoading ? "Loading SKU performance…" : "No SKU performance yet."}
      </Text>
    );
  }

  const isLagging = (f: ProductFamily) =>
    f.status === "Lagging" || f.skus.some((s) => s.status === "Below Target");
  const families = laggingOnly ? data.families.filter(isLagging) : data.families;
  const flatSkus = families.flatMap((f) => f.skus);

  return (
    <View className="gap-6">
      {/* Stat cards */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <StatCard label="Total Cases" value={data.totalCases.toLocaleString()} colors={NAVY} className="h-28" />
          <StatCard label="Active SKUs" value={`${data.activeSKUs}`} colors={NAVY} className="h-28" />
        </View>
        <View className="flex-row gap-3">
          <StatCard label="Total Listings" value={`${data.totalListings}`} colors={NAVY} className="h-28" />
          <StatCard label="Lagging SKUs" value={`${data.laggingSKUs}`} colors={AMBER} className="h-28" />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            label="Average Velocity"
            value={`${data.avgVelocity}% c/a/w`}
            valueClassName="text-xl"
            colors={GREEN}
            className="h-28"
          />
          <StatCard label="Unquantified" value={`${data.unquantified}`} colors={NAVY} className="h-28" />
        </View>
      </View>

      {/* Top Performer / Needs Attention */}
      <View className="gap-2">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1 rounded-xl border border-green-500/25 bg-green-500/[0.06] p-3">
            <View className="flex-row items-center gap-1.5">
              <TrendingUp color="#22C55E" size={16} />
              <Text className="text-sm font-medium text-green-500">Top Performer</Text>
            </View>
            <Text className="text-sm font-semibold" numberOfLines={2}>
              {data.topPerformer.name}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {data.topPerformer.cases} cases • {data.topPerformer.targetPct}% of target
            </Text>
          </View>

          <View className="flex-1 gap-1 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
            <View className="flex-row items-center gap-1.5">
              <TrendingDown color="#EF4444" size={16} />
              <Text className="text-sm font-medium text-red-500">Needs Attention</Text>
            </View>
            <Text className="text-sm font-semibold" numberOfLines={2}>
              {data.needsAttention.name}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {data.needsAttention.cases} cases • {data.needsAttention.targetPct}% of target
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/sales-map")}
          className="flex-row items-center justify-center gap-1 self-end px-2 py-1 active:opacity-70"
        >
          <MapIcon color="#94A3B8" size={13} />
          <Text className="text-sm text-foreground underline">View on map</Text>
        </Pressable>
      </View>

      {/* SKU Performance by Product Family */}
      <View className="gap-4" style={{ zIndex: 20 }}>
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-2xl font-bold">
            SKU Performance by Product Family
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setLaggingOnly((v) => !v)}
              className={cn(
                "h-10 w-10 items-center justify-center rounded-md border",
                laggingOnly
                  ? "border-yellow-500/40 bg-yellow-500/15"
                  : "border-border bg-secondary",
              )}
            >
              <Filter color={laggingOnly ? "#EAB308" : "#94A3B8"} size={18} />
            </Pressable>
            <GroupDropdown value={groupBy} onChange={setGroupBy} />
          </View>
        </View>

        {groupBy === "family" ? (
          families.length > 0 ? (
            <View className="gap-3">
              {families.map((family) => (
                <FamilyRow
                  key={family.id}
                  family={family}
                  isOpen={open.has(family.id)}
                  onToggle={() => toggle(family.id)}
                />
              ))}
            </View>
          ) : (
            <Text className="py-8 text-center text-sm text-muted-foreground">
              No lagging SKUs — all families are on track.
            </Text>
          )
        ) : (
          <View className="gap-2">
            {flatSkus.map((sku) => (
              <SkuRow key={sku.skuCode} sku={sku} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
