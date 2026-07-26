import { View } from "react-native";

import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { REP_STATS } from "@/lib/rep-today-data";

/**
 * Card background from the design:
 *   linear-gradient(144.81deg, #132B5C 0.22%, #0B1833 94.79%), ...white layer
 *
 * The top gradient is opaque, so it hides the white layer beneath — only it is
 * visible. 144.81° is converted to start/end unit points for expo-linear-gradient.
 */
const STAT_GRADIENT: GradientColors = ["#132B5C", "#0B1833"];
const STAT_START = { x: 0.21, y: 0.09 };
const STAT_END = { x: 0.79, y: 0.91 };

export function RepStats() {
  const rows = [REP_STATS.slice(0, 2), REP_STATS.slice(2, 4)];
  return (
    <View className="gap-3">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {row.map((stat) => (
            <StatCard
              key={stat.label}
              colors={STAT_GRADIENT}
              start={STAT_START}
              end={STAT_END}
              label={stat.label}
              value={stat.value}
              className="h-24"
              trailing={
                stat.suffix ? (
                  <Text className="text-base font-normal text-white/60">
                    {stat.suffix}
                  </Text>
                ) : undefined
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}
