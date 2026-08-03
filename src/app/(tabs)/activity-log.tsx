import { LinearGradient } from "expo-linear-gradient";
import { Award, Crown, Medal, Star } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { CustomKpisTab } from "@/components/performance/custom-kpis-tab";
import { DepletionsTab } from "@/components/performance/depletions-tab";
import { IntegrationsTab } from "@/components/performance/integrations-tab";
import { VipTab } from "@/components/performance/vip-tab";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { usePerformanceDashboard } from "@/hooks/use-performance-dashboard";
import { cn } from "@/lib/utils";
import {
  PERF_TABS,
  PERIODS,
  TIER_STYLE,
  type StatTile,
  type Tier,
  type TeamMember,
} from "@/lib/performance-data";
import type { ApiPerformanceData } from "@/types/performance";

const NAVY: GradientColors = ["#132B5C", "#0B1833"];
const GREEN: GradientColors = ["#15532B", "#0B2A16"];

const BG_HEX: Record<string, string> = {
  "bg-yellow-500": "#EAB308",
  "bg-amber-500": "#F59E0B",
  "bg-green-500": "#22C55E",
  "bg-blue-500": "#3B82F6",
  "bg-purple-500": "#A855F7",
  "bg-orange-500": "#F97316",
  "bg-pink-500": "#EC4899",
  "bg-red-500": "#EF4444",
  "bg-teal-500": "#14B8A6",
};

interface Achievement {
  title: string;
  member: string;
  emoji: string;
  color: string;
}
interface BonusTile {
  label: string;
  value: string;
  tone: "navy" | "green";
}

const tierByRank = (rank: number): Tier =>
  rank === 0 ? "gold" : rank === 1 ? "silver" : "bronze";

function mapPerformance(d: ApiPerformanceData, symbol: string) {
  const money0 = (n: number) => `${symbol}${Math.round(n).toLocaleString("en-US")}`;
  const money2 = (n: number) => `${symbol}${n.toFixed(2)}`;

  const sorted = [...d.members].sort((a, b) => b.score - a.score);
  const members: TeamMember[] = sorted.map((m, i) => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
    score: m.score,
    revenue: m.revenue,
    visits: m.visits,
    orders: m.orders,
    targetPct: m.targetPct,
    tier: tierByRank(i),
  }));

  const achievements: Achievement[] = d.achievements.map((a) => ({
    title: a.title,
    member: a.member,
    emoji: a.emoji,
    color: BG_HEX[a.bgColor] ?? "#F59E0B",
  }));

  const onTrack = d.kpis.filter(
    (k) => k.targetValue > 0 && k.currentValue >= k.targetValue,
  ).length;
  const totalRevenue = d.members.reduce((s, m) => s + m.revenue, 0);
  const stats: StatTile[] = [
    { label: "Top Performer", value: sorted[0]?.name ?? "—" },
    { label: "KPIs on Track", value: String(onTrack), suffix: `/${d.kpis.length}` },
    { label: "Total Revenue", value: money0(totalRevenue) },
    { label: "Active Members", value: String(d.members.length), suffix: "All Online" },
  ];

  const bonus: BonusTile[] = [
    { label: "Cases Sold", value: String(d.bonus.casesSold), tone: "navy" },
    { label: "Total Cost", value: money0(d.bonus.totalCost), tone: "navy" },
    { label: "Cost/Case", value: money2(d.bonus.costPerCase), tone: "green" },
    { label: "Target", value: money2(d.bonus.targetPerCase), tone: "green" },
  ];

  return { members, achievements, stats, bonus };
}

export default function ActivityLogScreen() {
  const [tab, setTab] = useState<string>("Leaderboard");
  const { data, symbol } = usePerformanceDashboard(30);
  const m = data ? mapPerformance(data, symbol) : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <DashboardHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="gap-1.5">
          <Text className="text-3xl font-bold">Performance Dashboard</Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Advanced analytics. KPI tracking and team performance
          </Text>
        </View>

        {/* Stat tiles */}
        <StatTiles stats={m?.stats ?? []} />

        {/* Tab row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {PERF_TABS.map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className={cn(
                  "h-10 items-center justify-center rounded-lg px-4",
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

        {tab === "Leaderboard" ? (
          m ? (
            <Leaderboard
              members={m.members}
              achievements={m.achievements}
              bonus={m.bonus}
            />
          ) : (
            <Text className="py-16 text-center text-sm text-muted-foreground">
              Loading leaderboard…
            </Text>
          )
        ) : null}
        {tab === "Depletions" ? <DepletionsTab /> : null}
        {tab === "VIP Intelligence" ? <VipTab /> : null}
        {tab === "Custom KPIs" ? <CustomKpisTab /> : null}
        {tab === "Integrations" ? <IntegrationsTab /> : null}
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

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
              colors={NAVY}
              className="h-24"
              valueClassName={s.label === "Top Performer" ? "text-lg" : undefined}
              trailing={
                s.suffix ? (
                  <Text className="text-xs font-medium text-white/70">
                    {s.suffix}
                  </Text>
                ) : undefined
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Leaderboard({
  members,
  achievements,
  bonus,
}: {
  members: TeamMember[];
  achievements: Achievement[];
  bonus: BonusTile[];
}) {
  const [period, setPeriod] = useState<string>("Daily");
  const sorted = members;

  return (
    <View className="gap-5">
      {/* Section header */}
      <View className="gap-1">
        <Text className="text-xl font-bold">Performance Dashboard</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          Gamified performance tracking with achievements and team rankings
        </Text>
      </View>

      {/* Period toggle */}
      <View className="flex-row gap-1 rounded-lg bg-secondary p-1">
        {PERIODS.map((p) => {
          const active = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              className={cn(
                "h-9 flex-1 items-center justify-center rounded-md",
                active && "bg-brand-maroon",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-white" : "text-muted-foreground",
                )}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Podium */}
      {sorted.length > 0 ? (
        <View className="flex-row items-start justify-center gap-5 py-2">
          {sorted[1] ? (
            <View className="mt-6">
              <PodiumSlot member={sorted[1]} place={2} />
            </View>
          ) : null}
          <PodiumSlot member={sorted[0]} place={1} />
          {sorted[2] ? (
            <View className="mt-6">
              <PodiumSlot member={sorted[2]} place={3} />
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Member cards */}
      <View className="gap-3">
        {sorted.length === 0 ? (
          <Text className="py-6 text-center text-sm text-muted-foreground">
            No team members yet.
          </Text>
        ) : (
          sorted.map((m) => <MemberCard key={m.id} member={m} />)
        )}
      </View>

      {/* Achievements */}
      {achievements.length > 0 ? (
        <View className="gap-3">
          {achievements.map((a) => (
            <View
              key={a.title}
              className="items-center gap-2 rounded-2xl border border-border bg-card p-4"
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: a.color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
              </View>
              <Text className="text-sm font-semibold">{a.title}</Text>
              <Text className="text-xs text-muted-foreground">{a.member}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Bonus tracker */}
      <View className="gap-3">
        <Text className="text-xl font-bold">Your Bonus Tracker</Text>
        {[bonus.slice(0, 2), bonus.slice(2, 4)].map((row, i) => (
          <View key={i} className="flex-row gap-3">
            {row.map((tile) => (
              <StatCard
                key={tile.label}
                label={tile.label}
                value={tile.value}
                colors={tile.tone === "green" ? GREEN : NAVY}
                className="h-24"
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function PodiumSlot({
  member,
  place,
}: {
  member: TeamMember;
  place: 1 | 2 | 3;
}) {
  const big = place === 1;
  const size = big ? 84 : 64;
  const inner = size - 14;
  const style = TIER_STYLE[member.tier];
  const Icon = place === 1 ? Crown : place === 2 ? Medal : Award;
  const iconColor = place === 1 ? "#F59E0B" : place === 2 ? "#9CA3AF" : "#F59E0B";

  return (
    <View className="items-center gap-1">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: style.ring,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: "#2A3038",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            className="font-semibold text-white"
            style={{ fontSize: big ? 20 : 16 }}
          >
            {member.initials}
          </Text>
        </View>
      </View>
      <Text className="text-sm font-medium" numberOfLines={1}>
        {member.name}
      </Text>
      <Text className="font-bold" style={{ fontSize: big ? 24 : 18 }}>
        {member.score}
      </Text>
      <Icon color={iconColor} size={big ? 28 : 22} fill={iconColor} />
    </View>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const style = TIER_STYLE[member.tier];
  return (
    <View className="overflow-hidden rounded-2xl">
      <LinearGradient
        colors={style.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-row justify-between p-4">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Crown color={style.crown} fill={style.crown} size={18} />
            <Text className="text-lg font-bold text-white">{member.name}</Text>
          </View>
          <Text className="text-sm text-white/60">
            Revenue: £{member.revenue.toLocaleString()}
          </Text>
          <Text className="text-sm text-white/60">Visits: {member.visits}</Text>
          <Text className="text-sm text-white/60">Orders: {member.orders}</Text>
        </View>

        <View className="items-end gap-2">
          <Text className="text-xs text-white/60">TARGET</Text>
          <View className="flex-row items-center gap-1">
            <Star color="#F59E0B" fill="#F59E0B" size={16} />
            <Text className="text-base font-bold text-white">
              {member.targetPct}%
            </Text>
          </View>
          <View className="h-2 w-24 overflow-hidden rounded-full bg-white/20">
            <View
              className="h-full rounded-full bg-white"
              style={{ width: `${member.targetPct}%` }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
