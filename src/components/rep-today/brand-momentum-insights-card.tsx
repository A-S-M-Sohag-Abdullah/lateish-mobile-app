import { Lightbulb, Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function BrandMomentumInsightsCard() {
  const colors = useThemeColors();
  const { summary } = useRepTodaySummary();
  const brandPills = summary?.momentum.brandPills ?? [];

  return (
    <SectionCard
      icon={Sparkles}
      title="Brand Momentum"
      description="Aggregated from your interaction outcomes"
    >
      {brandPills.map((b, i) => (
        <View
          key={i}
          className="gap-2.5 rounded-xl border border-border bg-background/40 p-4"
        >
          <View className="flex-row items-center gap-2">
            <Lightbulb color={colors.mutedForeground} size={16} />
            <Tag label={b.name} variant="neutral" />
            <Tag
              label={b.trend}
              variant={
                b.trend === "up" ? "success" : b.trend === "down" ? "danger" : "neutral"
              }
            />
          </View>
        </View>
      ))}
      <Text className="text-sm leading-5 text-muted-foreground">
        Brand-level momentum builds as you discuss brands in interactions.
      </Text>
    </SectionCard>
  );
}
