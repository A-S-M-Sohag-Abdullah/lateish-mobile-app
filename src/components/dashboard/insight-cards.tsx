import { Clock, Lightbulb, Sparkles, TrendingUp } from "lucide-react-native";
import { View } from "react-native";

import { EmptyState, SectionCard } from "@/components/dashboard/section-card";
import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";

export function AlertsCard() {
  const { summary, isLoading, symbol } = useRepTodaySummary();

  const alerts: { type: "opportunity" | "follow-up"; text: string }[] = [];
  const opp = summary?.dayStats.opportunities;
  if ((opp?.count ?? 0) > 0) {
    alerts.push({
      type: "opportunity",
      text: `${opp!.count} open opportunities — est. value ${symbol}${opp!.value.toLocaleString("en-US")}`,
    });
  }
  if ((summary?.dayStats.followUpsDue ?? 0) > 0) {
    alerts.push({
      type: "follow-up",
      text: `${summary!.dayStats.followUpsDue} follow-ups due today`,
    });
  }

  return (
    <SectionCard
      icon={Sparkles}
      title="Alerts and Opportunities"
      description="Cross platform intelligence from all modules"
      status={isLoading ? "…" : `${alerts.length} active`}
      statusClassName="text-red-500"
    >
      {isLoading ? (
        <EmptyState label="Loading…" />
      ) : alerts.length === 0 ? (
        <EmptyState label="No active alerts" />
      ) : (
        <View className="gap-3">
          {alerts.map((a, i) => (
            <View
              key={i}
              className="flex-row items-start gap-3 rounded-xl border border-border bg-background/40 p-3"
            >
              {a.type === "opportunity" ? (
                <TrendingUp color="#22C55E" size={16} />
              ) : (
                <Clock color="#F59E0B" size={16} />
              )}
              <Text className="flex-1 text-sm">{a.text}</Text>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}

export function NextBestActionsCard() {
  const { summary, isLoading } = useRepTodaySummary();
  const steps = summary?.suggestedSteps ?? [];

  return (
    <SectionCard
      icon={Sparkles}
      title="Next best actions"
      description="AI-powered priorities from activity, inventory & A&P correlations"
      status={isLoading ? "…" : `${steps.length} active`}
      statusClassName="text-red-500"
    >
      {isLoading ? (
        <EmptyState label="Loading…" />
      ) : steps.length === 0 ? (
        <EmptyState label="No suggestions yet" />
      ) : (
        <View className="gap-3">
          {steps.map((step, i) => (
            <View key={i} className="flex-row items-start gap-2">
              <Lightbulb color="#EAB308" size={16} />
              <Text className="flex-1 text-sm">{step}</Text>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}
