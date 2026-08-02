import { Lightbulb, Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function WhatsHotCard() {
  const colors = useThemeColors();
  const { summary } = useRepTodaySummary();
  const c = summary?.channels;

  const insights = c
    ? [
        `On-Premise: ${c.onPremise.progressing} of ${c.onPremise.total} accounts progressing — ${c.onPremise.status}`,
        `Off-Premise: ${c.offPremise.progressing} of ${c.offPremise.total} accounts progressing — ${c.offPremise.status}`,
      ]
    : [];

  return (
    <SectionCard
      icon={Sparkles}
      title="What's Hot Right Now"
      description="Channel momentum based on your logged interactions"
    >
      {insights.map((text, i) => (
        <View
          key={i}
          className="flex-row gap-2 rounded-xl border border-border bg-background/40 p-4"
        >
          <Lightbulb color={colors.mutedForeground} size={18} />
          <Text className="flex-1 text-sm leading-5 text-muted-foreground">
            {text}
          </Text>
        </View>
      ))}
      <Text className="text-sm leading-5 text-muted-foreground">
        Log interactions to see your channel momentum here.
      </Text>
    </SectionCard>
  );
}
