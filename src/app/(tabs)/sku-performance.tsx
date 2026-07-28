import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { SkuPerformanceView } from "@/components/sku-performance/sku-performance-view";
import { Text } from "@/components/ui/text";

export default function SkuPerformanceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <DashboardHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-3xl font-bold">SKU Performance</Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Velocity, listings, and target attainment by product
          </Text>
        </View>

        <SkuPerformanceView />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
