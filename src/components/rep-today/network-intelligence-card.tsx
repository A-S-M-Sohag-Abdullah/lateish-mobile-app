import { LinearGradient } from "expo-linear-gradient";
import { Lightbulb, Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { type NetworkInsight } from "@/lib/rep-today-data";

// Inner-card gradient border: #4A597E (100%) → #FFFFFF (0%), left to right.
const BORDER_GRADIENT = ["#4A597E", "rgba(255,255,255,0)"] as const;
// Opaque equivalent of the specced rgba(18,39,84,0.3) inner fill, composited
// over the white/5 card — needed so the gradient shows only as the border.
const INNER_FILL = "#131B2F";

export function NetworkIntelligenceCard() {
  const { summary } = useRepTodaySummary();
  const insights: NetworkInsight[] = (summary?.networkInsights ?? []).map(
    (text) => ({ text, subtext: "", tags: [] }),
  );

  return (
    <SectionCard
      icon={Sparkles}
      title="Network Intelligence"
      description="Insights based on your network activity"
      className="border-0 bg-white/5"
      style={{ borderRadius: 12 }}
      titleStyle={{
        fontFamily: "Inter_500Medium",
        fontSize: 15,
        lineHeight: 20,
        color: "#FFFFFF",
      }}
      descriptionStyle={{
        fontFamily: "Inter_400Regular",
        fontSize: 14,
        lineHeight: 20,
        color: "#BDC1CA",
      }}
    >
      {insights.map((insight, i) => (
        <InsightItem key={i} insight={insight} />
      ))}
    </SectionCard>
  );
}

function InsightItem({ insight }: { insight: NetworkInsight }) {
  const colors = useThemeColors();
  return (
    <LinearGradient
      colors={BORDER_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ borderRadius: 12, padding: 1 }}
    >
      <View
        className="gap-2.5 p-4"
        style={{ backgroundColor: INNER_FILL, borderRadius: 11 }}
      >
        <View className="flex-row gap-2">
          <Lightbulb color={colors.mutedForeground} size={18} />
          <Text
            className="flex-1 font-medium text-foreground"
            style={{ fontSize: 13, lineHeight: 20 }}
          >
            {insight.text}
          </Text>
        </View>
        {insight.subtext ? (
          <Text
            className="font-normal"
            style={{ fontSize: 13, lineHeight: 20, color: "#BDC1CA" }}
          >
            {insight.subtext}
          </Text>
        ) : null}
        {insight.tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {insight.tags.map((tag) => (
              <Tag key={tag.label} label={tag.label} variant={tag.variant} />
            ))}
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}
