import { Lightbulb, Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { WHATS_HOT } from "@/lib/rep-today-route-data";

export function WhatsHotCard() {
  const colors = useThemeColors();
  return (
    <SectionCard
      icon={Sparkles}
      title="What's Hot Right Now"
      description={WHATS_HOT.note}
    >
      {WHATS_HOT.insights.map((text, i) => (
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
        {WHATS_HOT.footer}
      </Text>
    </SectionCard>
  );
}
