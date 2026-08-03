import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
  Activity,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trophy,
  Utensils,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { usePresence } from "@/components/providers/presence-provider";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

type ActivityType =
  | "win"
  | "order"
  | "visit"
  | "milestone"
  | "menu"
  | "call"
  | "tasting";

interface ApiActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  userInitials: string;
  userName: string;
  tags: [string, string];
  isHighlighted?: boolean;
}
interface ApiTeamMember {
  userId: string;
  initials: string;
  name: string;
  status: string;
  isOnline: boolean;
  avatarUrl: string | null;
}
interface ActivityHubData {
  onlineCount: number;
  totalCount: number;
  activities: ApiActivityItem[];
  teamMembers: ApiTeamMember[];
  summary: { visits: number; orders: number; newListings: number; revenue: string };
}

type Filter = "all" | "wins" | "orders" | "visits" | "goals";

const FILTERS: { key: Filter; label: string; icon?: LucideIcon }[] = [
  { key: "all", label: "All" },
  { key: "wins", label: "Wins", icon: Trophy },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "visits", label: "Visits", icon: MapPin },
  { key: "goals", label: "Goals", icon: TrendingUp },
];

const TYPE_ICON: Record<ActivityType, LucideIcon> = {
  win: Trophy,
  order: ShoppingCart,
  visit: MapPin,
  milestone: TrendingUp,
  menu: Utensils,
  call: Phone,
  tasting: Sparkles,
};

function tabMatches(tab: Filter, type: ActivityType): boolean {
  if (tab === "all") return true;
  if (tab === "wins") return type === "win" || type === "milestone";
  if (tab === "orders") return type === "order";
  if (tab === "visits") return type === "visit" || type === "call" || type === "tasting";
  if (tab === "goals") return type === "milestone";
  return false;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = 20,
  dot,
  uri,
}: {
  initials: string;
  size?: number;
  dot?: "online" | "offline";
  uri?: string | null;
}) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center overflow-hidden rounded-full bg-white/10"
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text className="font-semibold text-white" style={{ fontSize: size * 0.4 }}>
          {initials}
        </Text>
      )}
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

function FeedEntry({ item }: { item: ApiActivityItem }) {
  const Icon = TYPE_ICON[item.type] ?? MapPin;
  return (
    <View
      className={cn(
        "gap-3 rounded-2xl p-4",
        item.isHighlighted
          ? "border border-primary/20 bg-primary/5"
          : "bg-white/[0.03]",
      )}
    >
      <View className="flex-row items-start gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
          <Icon color="#E5E7EB" size={18} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className={cn(
                "flex-1 text-base font-semibold",
                item.isHighlighted && "text-primary",
              )}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-muted-foreground">{item.time}</Text>
          </View>
          <Text className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {item.description}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Avatar initials={item.userInitials} size={20} />
        <Text className="text-sm text-muted-foreground">{item.userName}</Text>
        <View className="ml-auto flex-row items-center gap-1.5">
          {(item.tags ?? []).map((tag) => (
            <View
              key={tag}
              className="rounded-md border border-border bg-white/5 px-2 py-1"
            >
              <Text className="text-xs text-foreground">{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function MemberRow({ member }: { member: ApiTeamMember }) {
  return (
    <View className="flex-row items-center gap-3">
      <Avatar
        initials={member.initials}
        size={36}
        dot={member.isOnline ? "online" : "offline"}
        uri={member.avatarUrl}
      />
      <View className="flex-1">
        <Text className="text-sm font-medium">{member.name}</Text>
        <Text className="text-xs text-muted-foreground">{member.status}</Text>
      </View>
    </View>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ActivityHubView() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const { onlineUserIds } = usePresence();
  const myUserId = useAuthStore((s) => s.session?.user?.id);
  const myAvatar = useAuthStore((s) => s.profile?.avatar_url ?? null);
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["activity-hub", orgId],
    queryFn: () => api.get<ActivityHubData>(`/organizations/${orgId}/activity-hub`),
    enabled: !!orgId,
  });

  const activities = data?.activities ?? [];
  // Override isOnline / status from live Supabase Realtime presence, and fall
  // back to my own auth avatar (e.g. Google picture) for my row.
  const teamMembers = (data?.teamMembers ?? []).map((m) => {
    const isOnline = onlineUserIds.has(m.userId);
    return {
      ...m,
      isOnline,
      status: isOnline ? "Online now" : m.status,
      avatarUrl: m.avatarUrl ?? (m.userId === myUserId ? myAvatar : null),
    };
  });
  const summary = data?.summary ?? { visits: 0, orders: 0, newListings: 0, revenue: "" };
  const onlineCount = teamMembers.filter((m) => m.isOnline).length;
  const totalCount = data?.totalCount ?? teamMembers.length;
  const headerAvatars = teamMembers.filter((m) => m.isOnline).slice(0, 3);

  const items = activities.filter((a) => tabMatches(filter, a.type));

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
          <View className="flex-row">
            {headerAvatars.map((m, idx) => (
              <View
                key={m.userId}
                style={{ marginLeft: idx === 0 ? 0 : -8 }}
                className="rounded-full border-2 border-background"
              >
                <Avatar initials={m.initials} size={28} uri={m.avatarUrl} />
              </View>
            ))}
          </View>
        </View>

        {/* Filter pills */}
        <View className="flex-row flex-wrap gap-2">
          {FILTERS.map(({ key, label, icon: Icon }) => {
            const active = key === filter;
            const isAll = key === "all";
            const tint = active ? (isAll ? "#000000" : "#FFFFFF") : "#94A3B8";
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
            onPress={() => refetch()}
            className="h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary active:opacity-80"
          >
            <RefreshCw color={isFetching ? "#22D3EE" : "#94A3B8"} size={16} />
          </Pressable>
        </View>

        {isLoading ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">
            Loading activity…
          </Text>
        ) : items.length > 0 ? (
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
            <Text className="text-xs font-medium">
              {onlineCount}/{totalCount}
            </Text>
          </View>
        </View>
        <View className="gap-4">
          {teamMembers.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No team members.</Text>
          ) : (
            teamMembers.map((m) => <MemberRow key={m.userId} member={m} />)
          )}
        </View>
      </View>

      {/* Today's Summary */}
      <View className="gap-3">
        <Text className="text-xl font-bold">Today&apos;s Summary</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-white/[0.02] py-6">
            <Text className="text-3xl font-bold">{summary.visits}</Text>
            <Text className="text-xs tracking-wide text-muted-foreground">VISITS</Text>
          </View>
          <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-white/[0.02] py-6">
            <Text className="text-3xl font-bold">{summary.orders}</Text>
            <Text className="text-xs tracking-wide text-muted-foreground">ORDERS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
