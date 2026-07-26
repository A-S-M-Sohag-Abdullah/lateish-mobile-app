import { View } from "react-native";

import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

/**
 * The LATE(ish) wordmark, matching the weight contrast used on the web sign-in
 * screen: "LATE" bold, "(ish)" light.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <View className={cn("flex-row items-baseline", className)}>
      <Text className="text-3xl font-bold tracking-tight">LATE</Text>
      <Text className="text-3xl font-light tracking-tight">(ish)</Text>
    </View>
  );
}
