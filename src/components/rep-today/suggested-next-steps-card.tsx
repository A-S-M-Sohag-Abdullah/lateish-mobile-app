import { Lightbulb, Target } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { type NextStep } from "@/lib/rep-today-data";

/**
 * Unlike the other insight sections this has no outer card — the header and
 * items sit directly on the page.
 */
export function SuggestedNextStepsCard() {
  const colors = useThemeColors();
  const { summary } = useRepTodaySummary();
  const steps: NextStep[] = (summary?.suggestedSteps ?? []).map((text) => ({
    title: text,
    description: "",
    accent: "#824343",
  }));

  return (
    <View className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Target color={colors.foreground} size={22} />
          <Text className="text-xl font-bold">Suggested Next Steps</Text>
        </View>
        <Text className="text-base leading-6 text-muted-foreground">
          Priorities from your activity, inventory &amp; A&amp;P data
        </Text>
      </View>

      {steps.length === 0 ? (
        <View className="flex-row items-start gap-2 rounded-xl bg-secondary p-3">
          <Lightbulb color={colors.mutedForeground} size={18} />
          <Text className="flex-1 text-sm text-muted-foreground">
            Log interactions and visits — your first priorities will appear as
            your data builds up.
          </Text>
        </View>
      ) : (
        steps.map((step, i) => (
          <StepItem key={i} index={i + 1} step={step} />
        ))
      )}
    </View>
  );
}

function StepItem({ index, step }: { index: number; step: NextStep }) {
  const colors = useThemeColors();
  return (
    <View
      className="flex-row items-start gap-2.5 p-4"
      style={{
        backgroundColor: "#101D36",
        borderWidth: 1,
        borderColor: "#323749",
        borderRadius: 14,
        borderLeftWidth: 3,
        borderLeftColor: step.accent,
      }}
    >
      {/* Number and lightbulb are a fixed prefix on the first line only. */}
      <Text className="text-base font-bold text-muted-foreground">{index}</Text>
      <View style={{ marginTop: 3 }}>
        <Lightbulb color={colors.mutedForeground} size={16} />
      </View>

      {/* Title and description stack to the right. */}
      <View className="flex-1 gap-1.5">
        <Text className="text-base font-semibold text-foreground">
          {step.title}
        </Text>
        {step.description ? (
          <Text className="text-sm text-muted-foreground">{step.description}</Text>
        ) : null}
      </View>
    </View>
  );
}
