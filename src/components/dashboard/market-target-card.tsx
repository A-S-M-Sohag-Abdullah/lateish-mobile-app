import { MapPin } from "lucide-react-native";
import { View } from "react-native";

import { ConfidenceBadge, GapBadge } from "@/components/dashboard/badges";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCount, type MarketTarget } from "@/lib/mock-data";

export function MarketTargetCard({ target }: { target: MarketTarget }) {
  const colors = useThemeColors();
  const casesPct = target.cases.current / target.cases.target;

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <MapPin color={colors.foreground} size={20} />
          <Text className="text-xl font-bold" numberOfLines={1}>
            {target.location}
          </Text>
        </View>
        <Text className="text-sm text-muted-foreground">
          Last updated: {target.updatedAgo}
        </Text>
      </View>

      <View className="flex-row flex-wrap items-center gap-2.5">
        <GapBadge value={target.gap} />
        <ConfidenceBadge level={target.confidence} />
      </View>

      <View className="gap-2">
        <MetricRow
          label="Cases"
          current={formatCount(target.cases.current)}
          total={formatCount(target.cases.target)}
        />
        <Progress value={casesPct} />
        <Text className="text-sm text-muted-foreground">
          {Math.round(casesPct * 100)}% of target
        </Text>
      </View>

      <MetricRow
        label="Distribution"
        current={formatCount(target.distribution.current)}
        total={`${formatCount(target.distribution.target)} accounts`}
      />
    </View>
  );
}

function MetricRow({
  label,
  current,
  total,
}: {
  label: string;
  current: string;
  total: string;
}) {
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <Text className="text-lg">{label}</Text>
      <Text className="text-lg font-bold">
        {current}
        <Text className="text-lg font-normal text-muted-foreground">
          {" "}
          / {total}
        </Text>
      </Text>
    </View>
  );
}
