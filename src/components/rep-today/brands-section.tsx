import { Package } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

/** Content shown under the "Brands" tab. */
export function BrandsSection() {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Package color="#A78BFA" size={22} />
          <Text className="text-2xl font-bold">
            Brand Momentum (Last 30 days)
          </Text>
        </View>
        <Text className="text-base leading-6 text-muted-foreground">
          Aggregated from interaction outcomes - single source of truth
        </Text>
      </View>

      <View className="items-center rounded-2xl border border-border bg-card px-6 py-12">
        <Text className="text-center text-base leading-6 text-muted-foreground">
          No brand interactions logged yet. Start logging interactions to see
          brand momentum
        </Text>
      </View>
    </View>
  );
}
