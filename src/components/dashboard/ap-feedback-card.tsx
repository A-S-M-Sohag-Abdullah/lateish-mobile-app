import { MapPin } from "lucide-react-native";
import { View } from "react-native";

import { ConfidenceBadge, GapBadge } from "@/components/dashboard/badges";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { AP_FEEDBACK } from "@/lib/mock-data";

export function ApFeedbackCard() {
  const colors = useThemeColors();
  const data = AP_FEEDBACK;

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <MapPin color={colors.foreground} size={20} />
        <Text className="text-xl font-bold">A&amp;P Feedback</Text>
      </View>

      <Text className="text-base italic leading-6 text-muted-foreground">
        &quot;{data.question}&quot;
      </Text>

      <View className="flex-row flex-wrap items-center gap-2.5">
        <GapBadge value={data.gap} />
        <ConfidenceBadge level={data.confidence} />
      </View>

      <View className="gap-2">
        <View className="flex-row items-baseline justify-between gap-3">
          <Text className="text-lg">A&amp;P Used</Text>
          <Text className="text-lg font-bold">
            {data.usedLabel}
            <Text className="text-lg font-normal text-muted-foreground">
              {" "}
              / {data.totalLabel}
            </Text>
          </Text>
        </View>

        <Progress value={data.usedPct} />

        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-sm text-muted-foreground">
            {data.guardrailCaption}
          </Text>
          <Text className="text-sm font-medium text-success">
            {data.timeCaption}
          </Text>
        </View>
      </View>
    </View>
  );
}
