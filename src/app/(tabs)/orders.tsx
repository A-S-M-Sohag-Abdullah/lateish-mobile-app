import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { FulfilmentStats } from "@/components/order-fulfilment/fulfilment-stats";
import { FulfilmentTabs } from "@/components/order-fulfilment/fulfilment-tabs";
import { Text } from "@/components/ui/text";

export default function OrdersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <DashboardHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-3xl font-bold">Order Fulfilment</Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Track order-to-outcome loop with distributor performance
          </Text>
        </View>

        <FulfilmentStats />
        <FulfilmentTabs />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
