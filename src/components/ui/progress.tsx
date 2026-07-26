import { View } from "react-native";

import { cn } from "@/lib/utils";

interface ProgressProps {
  /** 0–1. Values outside the range are clamped. */
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({
  value,
  className,
  indicatorClassName,
}: ProgressProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/15", className)}
    >
      <View
        className={cn("h-full rounded-full bg-foreground", indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </View>
  );
}
