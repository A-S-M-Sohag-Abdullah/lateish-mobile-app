import { Pressable, ScrollView } from "react-native";

import { Text } from "@/components/ui/text";
import { REP_TABS } from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";
import { usePagerLock } from "@/store/pager-lock.store";

interface RepTabsProps {
  value: string;
  onChange: (tab: string) => void;
}

/** Horizontal, scrollable filter tabs under the route. */
export function RepTabs({ value, onChange }: RepTabsProps) {
  const setLocked = usePagerLock((s) => s.setLocked);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      // Freeze the pager while dragging this row so it scrolls instead of the
      // whole screen swiping. Set on touch-down (before any movement) so the
      // pager never claims the gesture.
      onTouchStart={() => setLocked(true)}
      onTouchEnd={() => setLocked(false)}
      onTouchCancel={() => setLocked(false)}
      onMomentumScrollEnd={() => setLocked(false)}
    >
      {REP_TABS.map((tab) => {
        const isActive = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="button"
            onPress={() => onChange(tab)}
            className={cn(
              "h-9 items-center justify-center rounded-lg px-4",
              isActive ? "bg-brand-maroon" : "bg-secondary",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                isActive ? "text-white" : "text-muted-foreground",
              )}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
