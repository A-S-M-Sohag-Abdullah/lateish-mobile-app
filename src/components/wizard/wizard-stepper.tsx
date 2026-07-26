import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface WizardStepperProps {
  total: number;
  current: number;
  /** Tap a completed circle to jump back. Forward steps are disabled. */
  onStepPress?: (index: number) => void;
}

/** The numbered progress circles. Steps up to and including current are filled. */
export function WizardStepper({
  total,
  current,
  onStepPress,
}: WizardStepperProps) {
  return (
    <View className="flex-row justify-between">
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= current;
        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Step ${index + 1}`}
            disabled={!onStepPress || index > current}
            onPress={() => onStepPress?.(index)}
            className={cn(
              "h-12 w-12 items-center justify-center rounded-full",
              active ? "bg-brand-maroon" : "bg-secondary",
            )}
          >
            <Text
              className={cn(
                "text-base font-bold",
                active ? "text-white" : "text-muted-foreground",
              )}
            >
              {index + 1}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
