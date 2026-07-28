import {
  Activity,
  Bell,
  MapPin,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  ACTIVITIES,
  TEAM_MEMBERS,
  TEAM_ONLINE_LABEL,
  TODAY_SUMMARY,
  type ActivityCategory,
  type ActivityItem,
  type TeamMember,
} from "@/lib/activity-hub-data";

type Filter = "all" | ActivityCategory;

const FILTERS: { key: Filter; label: string; icon?: LucideIcon }[] = [
  { key: "all", label: "All" },
  { key: "wins", label: "Wins", icon: Trophy },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "visits", label: "Visits", icon: MapPin },
  { key: "goals", label: "Goals", icon: TrendingUp },
];

const CATEGORY_ICON: Record<ActivityCategory, LucideIcon> = {
  wins: Trophy,
  orders: ShoppingCart,
  visits: MapPin,
  goals: TrendingUp,
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = 20,
  dot,
}: {
  initials: string;
  size?: number;
  dot?: "online" | "offline";
}) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center rounded-full bg-white/10"
    >
      <Text className="font-semibold text-white" style={{ fontSize: size * 0.4 }}>
        {initials}
      </Text>
      {dot ? (
        <View
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            dot === "online" ? "bg-green-500" : "bg-muted",
          )}
        />
      ) : null}
    </View>
  );
}

// ── Feed entry ────────────────────────────────────────────────────────────────

function FeedEntry({ item }: { item: ActivityItem }) {
  const Icon = CATEGORY_ICON[item.category];
  return (
    <View className="gap-3 rounded-2xl bg-white/[0.03] p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
          <Icon color="#E5E7EB" size={18} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-base font-semibold">{item.title}</Text>
            <Text className="text-xs text-muted-foreground">{item.time}</Text>
          </View>
          <Text className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {item.description}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Avatar initials={item.user.initials} size={20} />
        <Text className="text-sm text-muted-foreground">{item.user.name}</Text>
        <View className="ml-auto flex-row items-center gap-1.5">
          {item.highlight ? (
            <View className="rounded-md bg-cyan-500/15 px-2 py-1">
              <Text className="text-xs font-semibold text-cyan-400">
                {item.highlight}
              </Text>
            </View>
          ) : (
            item.tags?.map((tag) => (
              <View
                key={tag}
                className="rounded-md border border-border bg-white/5 px-2 py-1"
              >
                <Text className="text-xs text-foreground">{tag}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

// ── Team member row ───────────────────────────────────────────────────────────

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <View className="flex-row items-center gap-3">
      <Avatar initials={member.initials} size={36} dot={member.online ? "online" : "offline"} />
      <View className="flex-1">
        <Text className="text-sm font-medium">{member.name}</Text>
        <Text className="text-xs text-muted-foreground">{member.status}</Text>
      </View>
    </View>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ActivityHubView() {
  const [filter, setFilter] = useState<Filter>("all");
  const [spinning, setSpinning] = useState(false);

  const items =
    filter === "all" ? ACTIVITIES : ACTIVITIES.filter((a) => a.category === filter);

  return (
    <View className="gap-6">
      {/* Header */}
      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <Activity color="#FFFFFF" size={24} />
              <Text className="text-2xl font-bold">Activity Hub</Text>
            </View>
            <Text className="text-sm leading-5 text-muted-foreground">
              Real-time team activity, wins, and collaboration
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row">
              {["SJ", "MC", "JR"].map((i, idx) => (
                <View key={i} style={{ marginLeft: idx === 0 ? 0 : -8 }} className="rounded-full border-2 border-background">
                  <Avatar initials={i} size={28} />
                </View>
              ))}
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary">
              <Bell color="#FFFFFF" size={18} />
            </View>
          </View>
        </View>

        {/* Filter pills */}
        <View className="flex-row flex-wrap gap-2">
          {FILTERS.map(({ key, label, icon: Icon }) => {
            const active = key === filter;
            const isAll = key === "all";
            const tint = active
              ? isAll
                ? "#000000"
                : "#FFFFFF"
              : "#94A3B8";
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                className={cn(
                  "h-10 flex-row items-center gap-1.5 rounded-full px-4 active:opacity-80",
                  active ? (isAll ? "bg-white" : "bg-brand-maroon") : "bg-secondary",
                )}
              >
                {Icon ? <Icon color={tint} size={15} /> : null}
                <Text
                  className={cn(
                    "text-sm font-medium",
                    active
                      ? isAll
                        ? "text-black"
                        : "text-white"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Activity Feed */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Activity color="#FFFFFF" size={18} />
            <Text className="text-lg font-bold">Activity Feed</Text>
            <View className="flex-row items-center gap-1.5 rounded-md bg-cyan-500/15 px-2 py-0.5">
              <View className="h-2 w-2 rounded-full bg-cyan-400" />
              <Text className="text-xs font-medium text-cyan-400">Live</Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              setSpinning(true);
              setTimeout(() => setSpinning(false), 600);
            }}
            className="h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary active:opacity-80"
          >
            <RefreshCw color={spinning ? "#22D3EE" : "#94A3B8"} size={16} />
          </Pressable>
        </View>

        {items.length > 0 ? (
          items.map((item) => <FeedEntry key={item.id} item={item} />)
        ) : (
          <Text className="py-8 text-center text-sm text-muted-foreground">
            No activity in this category yet.
          </Text>
        )}
      </View>

      {/* Team Online */}
      <View className="gap-4 rounded-2xl border border-border bg-white/[0.02] p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold">Team Online</Text>
          <View className="rounded-md bg-secondary px-2 py-0.5">
            <Text className="text-xs font-medium">{TEAM_ONLINE_LABEL}</Text>
          </View>
        </View>
        <View className="gap-4">
          {TEAM_MEMBERS.map((m) => (
            <MemberRow key={m.name} member={m} />
          ))}
        </View>
      </View>

      {/* Today's Summary */}
      <View className="gap-3">
        <Text className="text-xl font-bold">Today&apos;s Summary</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-white/[0.02] py-6">
            <Text className="text-3xl font-bold">{TODAY_SUMMARY.visits}</Text>
            <Text className="text-xs tracking-wide text-muted-foreground">VISITS</Text>
          </View>
          <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-white/[0.02] py-6">
            <Text className="text-3xl font-bold">{TODAY_SUMMARY.orders}</Text>
            <Text className="text-xs tracking-wide text-muted-foreground">ORDERS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
