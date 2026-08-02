import { TrendingDown } from "lucide-react-native";
import { View } from "react-native";

import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { type TargetSummary } from "@/lib/market-targets-data";

type Tone = "blue" | "purple" | "teal" | "maroon";

const TONES: Record<Tone, GradientColors> = {
  blue: ["#1C3A69", "#152A4D"],
  purple: ["#3B2B73", "#2A1E52"],
  teal: ["#0F3E3B", "#0A2A28"],
  maroon: ["#4A2023", "#2E1416"],
};

export function TargetStatTiles({ summary }: { summary: TargetSummary }) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCard
          colors={TONES.blue}
          label="Cases"
          value={summary.cases}
          className="h-28"
        />
        <StatCard
          colors={TONES.purple}
          label="Distribution"
          value={summary.distribution}
          className="h-28"
        />
      </View>
      <View className="flex-row gap-3">
        <StatCard
          colors={TONES.purple}
          label="A&P Spend"
          value={summary.apSpend}
          className="h-24"
        />
        <StatCard
          colors={TONES.teal}
          label="Markets"
          value={summary.markets}
          className="h-24"
        />
        <StatCard
          colors={TONES.maroon}
          label="Momentum"
          value={summary.momentum}
          className="h-24"
          trailing={<TrendingDown color="#F87171" size={18} />}
        />
      </View>
    </View>
  );
}
