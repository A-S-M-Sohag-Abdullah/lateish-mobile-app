import { DollarSign } from "lucide-react-native";
import { View } from "react-native";

import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useMarketTargets } from "@/hooks/use-market-targets";
import { useThemeColors } from "@/hooks/use-theme-colors";

/**
 * A&P Feedback — aggregate advertising-and-promotion spend vs guardrail across
 * all market targets, with time progress. Mirrors the web DashboardLiveAP; all
 * values are derived from the (shared, cached) market-targets query.
 */
export function ApFeedbackCard() {
  const colors = useThemeColors();
  const { records, symbol } = useMarketTargets();

  const apUsed = records.reduce((s, r) => s + r.apSpend, 0);
  const apGuardrail = records.reduce((s, r) => s + r.apBudget, 0);
  const first = records[0];
  const timePct = first ? Math.round(first.timeElapsedPct * 100) : 0;
  const usedFraction = apGuardrail > 0 ? apUsed / apGuardrail : 0;
  const usedPct = Math.round(usedFraction * 100);

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <DollarSign color={colors.foreground} size={20} />
        <Text className="text-xl font-bold">A&amp;P Feedback</Text>
      </View>

      {apGuardrail === 0 ? (
        <Text className="text-sm text-muted-foreground">No A&amp;P targets set</Text>
      ) : (
        <>
          <Text className="text-base italic leading-6 text-muted-foreground">
            &quot;Is spend aligned with how fast we need to move to hit the
            plan?&quot;
          </Text>

          <View className="gap-2">
            <View className="flex-row items-baseline justify-between gap-3">
              <Text className="text-lg">A&amp;P Used</Text>
              <Text className="text-lg font-bold">
                {symbol}
                {apUsed.toLocaleString("en-US")}
                <Text className="text-lg font-normal text-muted-foreground">
                  {" "}
                  / {symbol}
                  {apGuardrail.toLocaleString("en-US")} (guardrail)
                </Text>
              </Text>
            </View>

            <Progress value={usedFraction} />

            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm text-muted-foreground">
                {usedPct}% of guardrail used
              </Text>
              <Text className="text-sm text-muted-foreground">
                {timePct}% of time elapsed
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
