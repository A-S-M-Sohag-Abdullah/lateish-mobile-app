import { ScrollView, View } from "react-native";

import { ApFeedbackCard } from "@/components/dashboard/ap-feedback-card";
import { ChannelSuggestionsCard } from "@/components/dashboard/channel-suggestions-card";
import { CreateTargetBlock } from "@/components/dashboard/create-target-block";
import {
  AlertsCard,
  NextBestActionsCard,
} from "@/components/dashboard/insight-cards";
import { IntegrationHealthCard } from "@/components/dashboard/integration-health-card";
import { MarketTargetCard } from "@/components/dashboard/market-target-card";
import { QuickAccessCard } from "@/components/dashboard/quick-access-card";
import { NitaButton } from "@/components/layout/nita-button";
import { Text } from "@/components/ui/text";
import { MARKET_TARGETS, QUICK_ACCESS } from "@/lib/mock-data";

export function DashboardPage() {
  // Two per row, as in the design.
  const rows = [QUICK_ACCESS.slice(0, 2), QUICK_ACCESS.slice(2, 4)];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        // Bottom padding clears the floating NITA button.
        contentContainerClassName="px-4 pb-28 pt-3 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Text className="text-xl font-bold">Quick Access</Text>
          {rows.map((row, i) => (
            <View key={i} className="flex-row gap-3">
              {row.map((item) => (
                <QuickAccessCard key={item.key} item={item} />
              ))}
            </View>
          ))}
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-3xl font-bold">Market Targets</Text>
            <Text className="text-base leading-6 text-muted-foreground">
              Where are you trying to win, through which channels?
            </Text>
          </View>

          {MARKET_TARGETS.map((target) => (
            <MarketTargetCard key={target.id} target={target} />
          ))}

          <ApFeedbackCard />

          {/* Closes the Market Targets section, directly before the next one. */}
          <CreateTargetBlock />
        </View>

        <View className="gap-4">
          <ChannelSuggestionsCard />
          <AlertsCard />
          <NextBestActionsCard />
          <IntegrationHealthCard />
        </View>
      </ScrollView>

      <NitaButton />
    </View>
  );
}
