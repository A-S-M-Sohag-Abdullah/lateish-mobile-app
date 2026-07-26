import { Lightbulb, Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { BRAND_MOMENTUM_INSIGHTS } from "@/lib/rep-today-route-data";

export function BrandMomentumInsightsCard() {
  const colors = useThemeColors();
  return (
    <SectionCard
      icon={Sparkles}
      title="Brand Momentum"
      description={BRAND_MOMENTUM_INSIGHTS.note}
    >
      {BRAND_MOMENTUM_INSIGHTS.items.map((text, i) => (
        <View
          key={i}
          className="gap-2.5 rounded-xl border border-border bg-background/40 p-4"
        >
          <View className="flex-row items-center gap-2">
            <Lightbulb color={colors.mutedForeground} size={16} />
            <Tag label="Your brand" variant="neutral" />
            <Tag label="Example" variant="neutral" />
          </View>
          <Text className="text-sm leading-5 text-muted-foreground">{text}</Text>
        </View>
      ))}
      <Text className="text-sm leading-5 text-muted-foreground">
        {BRAND_MOMENTUM_INSIGHTS.footer}
      </Text>
    </SectionCard>
  );
}
