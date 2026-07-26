import { LinearGradient } from "expo-linear-gradient";
import { Activity, MapPin } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { Confidence } from "@/components/dashboard/badges";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCount } from "@/lib/mock-data";
import type { TargetRecord, TargetStatus } from "@/lib/market-targets-data";
import { cn } from "@/lib/utils";

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  "High Confidence": "border-success/50 text-success",
  "Medium Confidence": "border-warning/60 text-warning",
  "Low Confidence": "border-destructive/50 text-destructive",
};

const STATUS_BADGE: Record<TargetStatus, string> = {
  Ahead: "bg-green-700",
  Behind: "bg-red-800",
  "On Track": "bg-secondary",
};

/**
 * Behind-card background (from the design):
 *   linear-gradient(143.48deg,
 *     rgba(34,6,7,0.7) 62.09%, rgba(78,14,14,0.7) 142.56%),
 *   rgba(255,255,255,0.05)
 *
 * The flat rgba(255,255,255,0.05) layer is `bg-white/5`; the gradient itself
 * can't be a Tailwind class in React Native, so it is an expo-linear-gradient.
 * 143.48° is converted to start/end unit points (CSS measures clockwise from
 * up); the 62.09% / 142.56% stops become locations, clamped to [0, 1].
 */
const BEHIND_GRADIENT = {
  colors: ["rgba(34, 6, 7, 0.7)", "rgba(78, 14, 14, 0.7)"] as const,
  locations: [0.6209, 1] as const,
  start: { x: 0.2, y: 0.1 },
  end: { x: 0.8, y: 0.9 },
};

export function TargetListCard({
  target,
  onPress,
}: {
  target: TargetRecord;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const casesPct = target.cases.current / target.cases.target;
  const confidenceStyle = CONFIDENCE_STYLE[target.confidence];
  const isBehind = target.status === "Behind";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "overflow-hidden rounded-2xl border border-border active:opacity-90",
        isBehind ? "bg-white/5" : "bg-card",
      )}
    >
      {isBehind ? (
        <LinearGradient
          colors={[...BEHIND_GRADIENT.colors]}
          locations={[...BEHIND_GRADIENT.locations]}
          start={BEHIND_GRADIENT.start}
          end={BEHIND_GRADIENT.end}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View className="gap-4 p-4">
        <View className="flex-row items-center gap-2">
          <MapPin color={colors.foreground} size={20} />
          <Text className="text-xl font-bold">{target.location}</Text>
        </View>

        <View className="flex-row flex-wrap items-center gap-2.5">
          <View className={cn("rounded-lg border px-3 py-2", confidenceStyle)}>
            <Text className={cn("text-sm font-medium", confidenceStyle)}>
              {target.confidence}
            </Text>
          </View>
          <View className={cn("rounded-lg px-3 py-2", STATUS_BADGE[target.status])}>
            <Text className="text-sm font-medium text-white">
              {target.status}
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text className="text-lg">Cases</Text>
            <Text className="text-lg font-bold">
              {formatCount(target.cases.current)}
              <Text className="text-lg font-normal text-muted-foreground">
                {" "}
                / {formatCount(target.cases.target)}
              </Text>
            </Text>
          </View>
          <Progress value={casesPct} />
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-sm text-muted-foreground">
              {Math.round(casesPct * 100)}% of target
            </Text>
            <Text className="text-sm text-muted-foreground">
              {target.status === "Behind" ? "Behind plan" : "Ahead of plan"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-baseline justify-between gap-3">
          <Text className="text-lg">Distribution</Text>
          <Text className="text-lg font-bold">
            {formatCount(target.distribution.current)}
            <Text className="text-lg font-normal text-muted-foreground">
              {" "}
              / {formatCount(target.distribution.target)} accounts
            </Text>
          </Text>
        </View>

        {isBehind ? (
          <View className="flex-row items-center gap-1.5 border-t border-white/10 pt-3">
            <Activity color="#F87171" size={16} />
            <Text className="text-sm font-medium text-red-400">
              {target.activityLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
