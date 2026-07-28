import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityHubView } from "@/components/activity-hub/activity-hub-view";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";

export default function ActivityHubScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <DashboardHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <ActivityHubView />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
