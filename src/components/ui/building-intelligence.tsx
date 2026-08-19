import { Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

// Shared "not enough data yet" holding state for insight/analytics panels.
// Port of front-end/src/components/ui/building-intelligence.tsx — keep the
// copy in sync with that file. Use whenever a panel has genuinely nothing to
// show yet because the org hasn't generated enough usage data — NOT for a
// loading state, NOT for a fetch error, and NOT for a plain empty CRUD list
// the user just hasn't added records to yet.
export const BUILDING_INTELLIGENCE_MESSAGE =
  "We're building your intelligence. The more you use the platform, the sharper this gets.";

interface BuildingIntelligenceProps {
  /** Optional panel-specific detail shown below the default copy. */
  detail?: string;
  /** Compact single-line variant for tight spaces (stat tiles, inline cards). */
  compact?: boolean;
  className?: string;
}

export function BuildingIntelligence({
  detail,
  compact,
  className,
}: BuildingIntelligenceProps) {
  const colors = useThemeColors();

  if (compact) {
    return (
      <View className={cn("flex-row items-start gap-1.5", className)}>
        <Sparkles color={colors.primary} size={14} style={{ marginTop: 1 }} />
        <Text className="flex-1 text-xs text-muted-foreground">
          {BUILDING_INTELLIGENCE_MESSAGE}
        </Text>
      </View>
    );
  }

  return (
    <View className={cn("items-center gap-3 px-6 py-10", className)}>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Sparkles color={colors.primary} size={20} />
      </View>
      <Text className="max-w-xs text-center text-sm text-foreground/90">
        {BUILDING_INTELLIGENCE_MESSAGE}
      </Text>
      {detail ? (
        <Text className="max-w-xs text-center text-xs text-muted-foreground">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}
