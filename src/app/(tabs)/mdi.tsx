import { ChartColumn, List, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnalyticsTab } from "@/components/mdi/analytics-tab";
import { CreateTab } from "@/components/mdi/create-tab";
import { IntentsTab } from "@/components/mdi/intents-tab";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Tab = "All Intents" | "Create" | "Analytics";

const TABS: { key: Tab; label: string; icon: typeof List }[] = [
  { key: "All Intents", label: "All Intents", icon: List },
  { key: "Create", label: "Create", icon: Plus },
  { key: "Analytics", label: "Analytics", icon: ChartColumn },
];

export default function MdiScreen() {
  const [tab, setTab] = useState<Tab>("All Intents");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <DashboardHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View className="gap-1.5">
          <Text className="text-3xl font-bold">Market Demand Intent</Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Capture, score, and track non-binding commercial intent signals
          </Text>
        </View>

        {/* Disclaimer */}
        <View className="rounded-2xl border border-border bg-white/5 p-4">
          <Text className="text-sm leading-5 text-muted-foreground">
            Non-binding intent signal. Lateish.co does not sell alcohol or
            process payments.
          </Text>
        </View>

        {/* Create Intent CTA */}
        <Pressable
          onPress={() => setTab("Create")}
          className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-white active:opacity-90"
        >
          <Plus color="#000000" size={20} />
          <Text className="text-base font-semibold text-black">
            Create Intent
          </Text>
        </Pressable>

        {/* Tab switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = key === tab;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className={cn(
                  "h-10 flex-row items-center gap-2 rounded-lg px-4",
                  active ? "bg-brand-maroon" : "bg-secondary",
                )}
              >
                <Icon color={active ? "#FFFFFF" : "#94A3B8"} size={16} />
                <Text
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-white" : "text-muted-foreground",
                  )}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Active tab */}
        {tab === "All Intents" ? <IntentsTab /> : null}
        {tab === "Create" ? <CreateTab /> : null}
        {tab === "Analytics" ? <AnalyticsTab /> : null}
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
