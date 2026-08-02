import { useMemo } from "react";
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
import { useMarketTargets } from "@/hooks/use-market-targets";
import { type MarketTarget, QUICK_ACCESS } from "@/lib/mock-data";

/** "5 min ago" style relative time from an ISO timestamp. */
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const min = Math.floor((Date.now() - t) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? "s" : ""} ago`;
}

export function DashboardPage() {
  // Two per row, as in the design.
  const rows = [QUICK_ACCESS.slice(0, 2), QUICK_ACCESS.slice(2, 4)];

  const { records, symbol, isLoading } = useMarketTargets();
  const targets = useMemo<MarketTarget[]>(
    () =>
      records.map((r) => ({
        id: r.id,
        location: r.location,
        updatedAgo: relativeTime(r.createdAt),
        gap: `${symbol}${Math.max(0, (r.cases.target - r.cases.current) * 100).toLocaleString("en-US")}`,
        confidence: r.confidence,
        cases: r.cases,
        distribution: r.distribution,
      })),
    [records, symbol],
  );

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

          {isLoading ? (
            <Text className="py-6 text-center text-sm text-muted-foreground">
              Loading…
            </Text>
          ) : targets.length === 0 ? (
            <Text className="py-6 text-center text-sm text-muted-foreground">
              No market targets yet.
            </Text>
          ) : (
            targets.map((target) => (
              <MarketTargetCard key={target.id} target={target} />
            ))
          )}

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
