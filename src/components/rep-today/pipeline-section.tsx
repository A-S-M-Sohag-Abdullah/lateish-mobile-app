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
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  PIPELINE_NEEDS_ATTENTION,
  PIPELINE_NEXT_2_WEEKS,
  PIPELINE_THIS_WEEK,
  type PipelineItem,
} from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

/** Content shown under the "Pipeline" tab. */
export function PipelineSection() {
  const colors = useThemeColors();
  const [highPriority, setHighPriority] = useState(false);

  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-2xl font-bold">Pipeline Radar</Text>
        <View className="flex-row items-center gap-1.5 rounded-md border border-yellow-600/50 px-2.5 py-1">
          <Eye color="#EAB308" size={14} />
          <Text className="text-xs font-medium text-yellow-400">Sample Data</Text>
        </View>
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

      <PipelineGroup
        icon={Calendar}
        title="This Week"
        count={PIPELINE_THIS_WEEK.length}
        items={PIPELINE_THIS_WEEK}
      />

      <PipelineGroup
        icon={TrendingUp}
        title="Next 2 Weeks"
        count={PIPELINE_NEXT_2_WEEKS.length}
        items={PIPELINE_NEXT_2_WEEKS}
        emptyLabel="No pipeline items for this period."
      />

      {/* Needs Attention — the whole group is red-tinted (#F76353). */}
      <View className="gap-3 rounded-xl border border-[#F76353]/20 bg-[#F76353]/5 p-4">
        <View className="flex-row items-center gap-2">
          <CircleAlert color="#EF4444" size={20} />
          <Text className="flex-1 text-xl font-bold text-red-400">
            Needs Attention
          </Text>
          <CountBadge count={PIPELINE_NEEDS_ATTENTION.length} tone="red" />
        </View>
        {PIPELINE_NEEDS_ATTENTION.map((item) => (
          <PipelineItemCard key={item.id} item={item} needsAttention />
        ))}
      </View>
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
        <Text className="text-sm text-muted-foreground">{item.stage}</Text>
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
