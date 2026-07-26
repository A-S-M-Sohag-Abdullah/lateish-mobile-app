import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { CornerAccent } from "@/components/ui/corner-accent";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** Gradient stops — two or more colours. */
export type GradientColors = readonly [string, string, ...string[]];

interface StatCardProps {
  label: string;
  value: string;
  /** Gradient background colours. */
  colors: GradientColors;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  /** Rendered to the right of the value, e.g. a trend icon. */
  trailing?: React.ReactNode;
  /** Height/width utilities for the card. */
  className?: string;
  valueClassName?: string;
}

/**
 * Gradient stat card with the decorative tilted-rectangle corner accent.
 *
 * Reusable across pages — every card shares the look and the accent; only the
 * gradient `colors` (and content) change per card.
 */
export function StatCard({
  label,
  value,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  trailing,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <View className={cn("flex-1 overflow-hidden rounded-2xl", className)}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />

      <CornerAccent />

      <View className="flex-1 justify-between p-4">
        <Text className="text-sm text-white/70" numberOfLines={1}>
          {label}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text
            className={cn("text-2xl font-bold text-white", valueClassName)}
            numberOfLines={1}
          >
            {value}
          </Text>
          {trailing}
        </View>
      </View>
    </View>
  );
}
