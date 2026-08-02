import { RefreshCw, Sparkles } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { EmptyState, SectionCard } from "@/components/dashboard/section-card";
import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { cn } from "@/lib/utils";

export function ChannelSuggestionsCard() {
  const { summary, isLoading, isFetching, refetch } = useRepTodaySummary();

  const networkInsights = summary?.networkInsights ?? [];
  const suggestedSteps = summary?.suggestedSteps ?? [];
  const hasContent = networkInsights.length > 0 || suggestedSteps.length > 0;

  return (
    <SectionCard
      icon={Sparkles}
      title="Key Channel Suggestions"
      description="AI powered insights from activity, inventory & A&P analysis."
    >
      {isLoading ? (
        <EmptyState label="Loading…" />
      ) : !hasContent ? (
        <EmptyState label="We don't have enough data on you yet" />
      ) : (
        <View className="gap-2">
          {networkInsights.map((text, i) => (
            <InsightRow
              key={`net-${i}`}
              tag="Network"
              tagClassName="border-blue-500/20 bg-blue-500/10 text-blue-400"
              text={text}
            />
          ))}
          {suggestedSteps.map((text, i) => (
            <InsightRow
              key={`step-${i}`}
              tag="Action"
              tagClassName="border-green-500/20 bg-green-500/10 text-green-400"
              text={text}
            />
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Refresh suggestions"
        onPress={() => refetch()}
        disabled={isFetching}
        className="mt-1 h-9 flex-row items-center justify-center gap-1.5 self-end rounded-lg border border-border bg-secondary px-4 active:opacity-80"
      >
        <RefreshCw color="#94A3B8" size={14} />
        <Text className="text-xs font-medium">
          {isFetching ? "Refreshing…" : "Refresh Insights"}
        </Text>
      </Pressable>
    </SectionCard>
  );
}

function InsightRow({
  tag,
  tagClassName,
  text,
}: {
  tag: string;
  tagClassName: string;
  text: string;
}) {
  return (
    <View className="flex-row items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
      <Sparkles color="#94A3B8" size={16} />
      <View className="flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
        <View className={cn("rounded-md border px-1.5 py-0.5", tagClassName)}>
          <Text className={cn("text-xs font-medium", tagClassName)}>{tag}</Text>
        </View>
        <Text className="flex-1 text-sm">{text}</Text>
      </View>
    </View>
  );
}
