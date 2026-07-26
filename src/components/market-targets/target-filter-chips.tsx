import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { TARGET_FILTERS, type TargetFilter } from "@/lib/market-targets-data";
import { cn } from "@/lib/utils";

interface TargetFilterChipsProps {
  value: TargetFilter;
  onChange: (filter: TargetFilter) => void;
}

export function TargetFilterChips({ value, onChange }: TargetFilterChipsProps) {
  return (
    <View className="flex-row gap-2.5">
      {TARGET_FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter)}
            className={cn(
              "h-10 items-center justify-center rounded-lg px-4",
              active ? "bg-brand-maroon" : "bg-secondary",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                active ? "text-white" : "text-muted-foreground",
              )}
            >
              {filter}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
