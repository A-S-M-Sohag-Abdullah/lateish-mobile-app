import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CircleAlert,
  Eye,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Switch, View } from "react-native";

import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { type PipelineItem } from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

interface ApiIntent {
  id: string;
  account_name: string | null;
  confidence: string;
  status: string;
  expires_at: string | null;
  line_items: { qty_cases: number; indicative_price: number | null }[];
}

const STATUS_TO_STAGE: Record<string, string> = {
  draft: "identified",
  submitted: "qualified",
  brand_review: "proposal",
  distributor_review: "committed",
};
const CONFIDENCE_TO_PCT: Record<string, number> = { high: 90, medium: 50, low: 25 };
const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
};

/** Content shown under the "Pipeline" tab. */
export function PipelineSection() {
  const colors = useThemeColors();
  const [highPriority, setHighPriority] = useState(false);
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const symbol = CURRENCY_SYMBOL[currentOrg?.currency ?? ""] ?? "£";

  const { data: intents, isLoading } = useQuery({
    queryKey: ["mdi-intents", "pipeline", orgId],
    queryFn: () =>
      api
        .getPaginated<ApiIntent>(`/organizations/${orgId}/mdi/intents?limit=50&page=1`)
        .then((r) => r.data),
    enabled: !!orgId,
  });

  const today = new Date();
  const in7 = new Date(today.getTime() + 7 * 86400000);
  const in21 = new Date(today.getTime() + 21 * 86400000);

  const allOpps: (PipelineItem & { confidence: number; alert: boolean })[] = (
    intents ?? []
  ).map((i) => {
    const value = (i.line_items ?? []).reduce(
      (s, l) => s + l.qty_cases * (l.indicative_price ?? 0),
      0,
    );
    const closeDate = i.expires_at
      ? new Date(i.expires_at).toISOString().split("T")[0]
      : "TBD";
    const confidence = CONFIDENCE_TO_PCT[i.confidence] ?? 50;
    const alert = i.expires_at ? new Date(i.expires_at) < today : false;
    return {
      id: i.id,
      name: i.account_name ?? "Unknown Account",
      amount: `${symbol}${value.toLocaleString()}`,
      stage: STATUS_TO_STAGE[i.status] ?? i.status,
      date: closeDate,
      progress: confidence / 100,
      priority: confidence >= 75,
      confidence,
      alert,
    };
  });

  const inWindow = (o: (typeof allOpps)[number], from: Date, to: Date) =>
    o.date !== "TBD" && new Date(o.date) >= from && new Date(o.date) <= to;

  const filter = (items: typeof allOpps) =>
    highPriority ? items.filter((o) => o.confidence >= 75) : items;

  const thisWeek = filter(allOpps.filter((o) => inWindow(o, today, in7)));
  const nextTwoWeeks = filter(allOpps.filter((o) => inWindow(o, in7, in21)));
  const needsAttention = filter(
    allOpps.filter((o) => o.alert || (o.date !== "TBD" && new Date(o.date) < today)),
  );

  const isLive = intents !== undefined;

  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-2xl font-bold">Pipeline Radar</Text>
        {!isLive ? (
          <View className="flex-row items-center gap-1.5 rounded-md border border-yellow-600/50 px-2.5 py-1">
            <Eye color="#EAB308" size={14} />
            <Text className="text-xs font-medium text-yellow-400">No Data Yet</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center gap-3">
        <Switch
          value={highPriority}
          onValueChange={setHighPriority}
          trackColor={{ false: colors.input, true: colors.accent }}
          thumbColor="#FFFFFF"
        />
        <Text className="text-base text-muted-foreground">
          Show High Priority Only (75%+ confidence)
        </Text>
      </View>

      {isLoading ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">
          Loading pipeline…
        </Text>
      ) : (
        <>
          <PipelineGroup
            icon={Calendar}
            title="This Week"
            count={thisWeek.length}
            items={thisWeek}
            emptyLabel="No opportunities this week"
          />

          <PipelineGroup
            icon={TrendingUp}
            title="Next 2 Weeks"
            count={nextTwoWeeks.length}
            items={nextTwoWeeks}
            emptyLabel="No pipeline items for this period."
          />

          {/* Needs Attention — the whole group is red-tinted (#F76353). */}
          <View className="gap-3 rounded-xl border border-[#F76353]/20 bg-[#F76353]/5 p-4">
            <View className="flex-row items-center gap-2">
              <CircleAlert color="#EF4444" size={20} />
              <Text className="flex-1 text-xl font-bold text-red-400">
                Needs Attention
              </Text>
              <CountBadge count={needsAttention.length} tone="red" />
            </View>
            {needsAttention.length === 0 ? (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                Nothing needs attention.
              </Text>
            ) : (
              needsAttention.map((item) => (
                <PipelineItemCard key={item.id} item={item} needsAttention />
              ))
            )}
          </View>
        </>
      )}
    </View>
  );
}

function PipelineGroup({
  icon: Icon,
  title,
  count,
  items,
  emptyLabel,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  items: PipelineItem[];
  emptyLabel?: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Icon color={colors.foreground} size={18} />
        <Text className="flex-1 text-xl font-bold">{title}</Text>
        <CountBadge count={count} tone="neutral" />
      </View>
      {items.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-border py-6">
          <Text className="text-sm text-muted-foreground">
            {emptyLabel ?? "Nothing here yet."}
          </Text>
        </View>
      ) : (
        items.map((item) => <PipelineItemCard key={item.id} item={item} />)
      )}
    </View>
  );
}

function PipelineItemCard({
  item,
  needsAttention,
}: {
  item: PipelineItem;
  needsAttention?: boolean;
}) {
  return (
    <View className="gap-2 rounded-xl border border-[#303B46] bg-[#161C22] p-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {item.name}
          </Text>
          {item.priority ? (
            <View className="h-2 w-2 rounded-full bg-red-500" />
          ) : null}
          {needsAttention ? <CircleAlert color="#EF4444" size={16} /> : null}
        </View>
        <Text className="text-base font-bold">{item.amount}</Text>
      </View>
      <Progress value={item.progress} />
      <View className="flex-row items-center justify-between">
        <Text className="text-sm capitalize text-muted-foreground">{item.stage}</Text>
        <Text className="text-sm text-muted-foreground">{item.date}</Text>
      </View>
    </View>
  );
}

function CountBadge({
  count,
  tone,
}: {
  count: number;
  tone: "neutral" | "red";
}) {
  return (
    <View
      className={cn(
        "h-6 min-w-6 items-center justify-center rounded-full px-1.5",
        tone === "red" ? "bg-red-900" : "bg-secondary",
      )}
    >
      <Text
        className={cn(
          "text-xs font-bold",
          tone === "red" ? "text-red-300" : "text-muted-foreground",
        )}
      >
        {count}
      </Text>
    </View>
  );
}
