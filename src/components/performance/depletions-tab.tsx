import { LinearGradient } from "expo-linear-gradient";
import { Package } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { CornerAccent } from "@/components/ui/corner-accent";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import {
  DATA_TABLE_RECORDS,
  DEPLETION_STATS,
  DEPLETION_SUBTABS,
  UPCOMING_INTEGRATIONS,
  type DepletionStat,
} from "@/lib/performance-data";

const NAVY = ["#132B5C", "#0B1833"] as const;
const CHART_H = 170;
const TICKS = ["£60k", "£45k", "£30k", "£15k", "£0k"];

// Each sub-tab shows the same (empty) chart under its own heading.
const SUBTAB_TITLE: Record<string, string> = {
  Overview: "Monthly Trend",
  Distributors: "Distributor Performance",
  Markets: "Market Heatmap",
  "SKU Trends": "SKU Trends",
};

export function DepletionsTab() {
  const [sub, setSub] = useState<string>("Overview");
  const colors = useThemeColors();

  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text className="text-2xl font-bold">Depletions Intelligence</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          Realised vs Expected performance from ingested data
        </Text>
      </View>

      {/* 6 stat cards */}
      <View className="gap-3">
        {[
          DEPLETION_STATS.slice(0, 2),
          DEPLETION_STATS.slice(2, 4),
          DEPLETION_STATS.slice(4, 6),
        ].map((row, i) => (
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
        {DEPLETION_SUBTABS.map((t) => {
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

      {/* Sub-tab chart (same empty placeholder, per-tab title) */}
      {sub === "Data Table" ? (
        <DataTable />
      ) : (
        <View className="gap-3">
          <Text className="text-lg font-bold">{SUBTAB_TITLE[sub]}</Text>
          <ChartPlaceholder />
        </View>
      )}

      {/* Upcoming Integrations */}
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
    </View>
  );
}

function DataTable() {
  return (
    <View className="overflow-hidden rounded-xl border border-[#2F2F2F] bg-white/5">
      {DATA_TABLE_RECORDS.map((r, i) => (
        <View
          key={r.date}
          className={cn(
            "gap-3 p-4",
            i < DATA_TABLE_RECORDS.length - 1 && "border-b border-border",
          )}
        >
          {/* Date + premise */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {r.date}
            </Text>
            <View className="rounded-full border border-border px-2.5 py-0.5">
              <Text className="text-[11px] text-muted-foreground">
                {r.premise}
              </Text>
            </View>
          </View>

          {/* Product + distributor */}
          <View className="flex-row gap-2">
            <Package color="#22C55E" size={16} style={{ marginTop: 2 }} />
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-semibold">{r.product}</Text>
              <Text className="text-sm text-muted-foreground">
                {r.distributor} • {r.location}
              </Text>
            </View>
          </View>

          {/* Cases / NSV */}
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
              <Text className="text-base font-bold text-green-500">{r.nsv}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ChartPlaceholder() {
  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row gap-2">
        <View style={{ height: CHART_H, justifyContent: "space-between" }}>
          {TICKS.map((t) => (
            <Text key={t} className="text-[10px] text-muted-foreground">
              {t}
            </Text>
          ))}
        </View>
        <View className="flex-1">
          <View style={{ height: CHART_H, justifyContent: "space-between" }}>
            {TICKS.map((t) => (
              <View
                key={t}
                style={{
                  borderTopWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  borderStyle: "dashed",
                }}
              />
            ))}
          </View>
          <View className="flex-row justify-around pt-2">
            <Text className="text-xs text-muted-foreground">Cases</Text>
            <Text className="text-xs text-muted-foreground">NSV($)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function DepletionCard({ stat }: { stat: DepletionStat }) {
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
