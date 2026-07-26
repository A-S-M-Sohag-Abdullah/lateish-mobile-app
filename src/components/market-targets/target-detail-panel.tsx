import { ArrowLeft, MapPin } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { TargetRecord } from "@/lib/market-targets-data";
import { formatCount } from "@/lib/mock-data";

interface TargetDetailPanelProps {
  target: TargetRecord;
  onClose: () => void;
}

/** Body of the slide-in target detail. Rendered inside a RightSheet. */
export function TargetDetailPanel({ target, onClose }: TargetDetailPanelProps) {
  const colors = useThemeColors();
  const casesPct = target.cases.current / target.cases.target;
  const distPct = target.distribution.current / target.distribution.target;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          className="h-11 w-11 items-center justify-center self-start rounded-lg active:bg-muted"
        >
          <ArrowLeft color={colors.foreground} size={24} />
        </Pressable>

        <View className="gap-2">
          <Text className="text-4xl font-semibold">{target.location}</Text>
          <Text className="text-base text-muted-foreground">
            {target.dateRange} Day {target.dayCurrent} of {target.dayTotal}
          </Text>
          <View className="mt-1 self-start rounded-full bg-warning/15 px-4 py-1.5">
            <Text className="text-base font-medium text-warning">
              {target.confidence}
            </Text>
          </View>
        </View>

        <View className="gap-5">
          <View className="flex-row items-center gap-2">
            <MapPin color={colors.foreground} size={20} />
            <Text className="text-xl font-bold">Execution Progress</Text>
          </View>

          <ProgressRow
            label="Time elapsed"
            value={target.timeElapsedPct}
            caption={`${Math.round(target.timeElapsedPct * 100)}% of time elapsed`}
          />
          <ProgressRow
            label="Cases"
            value={casesPct}
            caption={`${Math.round(casesPct * 100)}% of target`}
          />
          <ProgressRow
            label="Distribution"
            value={distPct}
            caption={`${formatCount(target.distribution.current)}/${formatCount(
              target.distribution.target,
            )}`}
          />
        </View>

        {/* A&P Pacing — Inter Medium, 18px, line-height 16 (per spec). */}
        <View className="gap-2">
          <Text className="font-medium" style={{ fontSize: 18, lineHeight: 16 }}>
            A&P Pacing
          </Text>
          <Text className="font-medium" style={{ fontSize: 18, lineHeight: 16 }}>
            £{formatCount(target.apSpend)}{" "}
            <Text className="font-normal text-muted-foreground">
              / {target.apBudget}
            </Text>
          </Text>
        </View>

        <Text className="text-lg font-medium">{target.momentumNote}</Text>
      </ScrollView>

      <View className="px-6 pb-2 pt-3">
        <Button variant="brand" size="lg" onPress={onClose}>
          <Text>Delete Target</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

function ProgressRow({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <View className="gap-2">
      <Text className="text-base text-muted-foreground">{label}</Text>
      <Progress value={value} />
      <Text className="text-sm font-medium text-success">{caption}</Text>
    </View>
  );
}
