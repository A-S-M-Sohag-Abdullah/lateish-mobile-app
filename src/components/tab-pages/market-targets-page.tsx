import { Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { RecordActualsForm } from "@/components/market-targets/record-actuals-form";
import { TargetDetailPanel } from "@/components/market-targets/target-detail-panel";
import { TargetFilterChips } from "@/components/market-targets/target-filter-chips";
import { TargetListCard } from "@/components/market-targets/target-list-card";
import { TargetStatTiles } from "@/components/market-targets/target-stat-tiles";
import { CreateTargetWizard } from "@/components/target-wizard/create-target-wizard";
import { RightSheet } from "@/components/ui/right-sheet";
import { Text } from "@/components/ui/text";
import { useMarketTargets } from "@/hooks/use-market-targets";
import { filterTargets, type TargetFilter } from "@/lib/market-targets-data";

export function MarketTargetsPage() {
  const [filter, setFilter] = useState<TargetFilter>("Active Targets");
  const [createOpen, setCreateOpen] = useState(false);
  const [actualsOpen, setActualsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { records, summary, isLoading } = useMarketTargets();

  const targets = useMemo(
    () => filterTargets(records, filter),
    [records, filter],
  );
  const selectedTarget = selectedId
    ? records.find((t) => t.id === selectedId)
    : undefined;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-5 px-4 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="text-3xl font-bold">Market Targets</Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Tier 1 — Cases, distribution, A&P, and BDM accountability by market
          </Text>
        </View>

        <TargetStatTiles summary={summary} />

        <View className="flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => setActualsOpen(true)}
            className="h-12 flex-1 items-center justify-center rounded-xl bg-secondary active:opacity-80"
          >
            <Text className="text-base font-semibold">Record Actuals</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCreateOpen(true)}
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-white active:opacity-90"
          >
            <Plus color="#000000" size={20} />
            <Text className="text-base font-semibold text-black">
              New Target
            </Text>
          </Pressable>
        </View>

        <View className="h-px bg-border" />

        <TargetFilterChips value={filter} onChange={setFilter} />

        <View className="gap-4">
          {isLoading ? (
            <Text className="py-8 text-center text-sm text-muted-foreground">
              Loading…
            </Text>
          ) : targets.length === 0 ? (
            <Text className="py-8 text-center text-sm text-muted-foreground">
              No market targets yet.
            </Text>
          ) : (
            targets.map((target) => (
              <TargetListCard
                key={target.id}
                target={target}
                onPress={() => setSelectedId(target.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CreateTargetWizard
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <RecordActualsForm
        visible={actualsOpen}
        onClose={() => setActualsOpen(false)}
      />

      <RightSheet
        visible={selectedTarget != null}
        onClose={() => setSelectedId(null)}
      >
        {selectedTarget ? (
          <TargetDetailPanel
            target={selectedTarget}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </RightSheet>
    </View>
  );
}
