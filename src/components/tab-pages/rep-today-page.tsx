import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ActivityLogSection } from "@/components/rep-today/activity-log-section";
import {
  AiInsightCard,
  InsightNoteCard,
  PremiseRow,
} from "@/components/rep-today/ai-insight-card";
import { BrandMomentumCard } from "@/components/rep-today/brand-momentum-card";
import { BrandMomentumInsightsCard } from "@/components/rep-today/brand-momentum-insights-card";
import { BrandsSection } from "@/components/rep-today/brands-section";
import { LogInteractionForm } from "@/components/rep-today/log-interaction-form";
import { NetworkIntelligenceCard } from "@/components/rep-today/network-intelligence-card";
import { OrdersSection } from "@/components/rep-today/orders-section";
import { PerformanceSection } from "@/components/rep-today/performance-section";
import { PipelineSection } from "@/components/rep-today/pipeline-section";
import { RepStats } from "@/components/rep-today/rep-stats";
import { RepTabs } from "@/components/rep-today/rep-tabs";
import { RouteCard } from "@/components/rep-today/route-card";
import { SuggestedNextStepsCard } from "@/components/rep-today/suggested-next-steps-card";
import { TerritorySection } from "@/components/rep-today/territory-section";
import { VoiceNotesSection } from "@/components/rep-today/voice-notes-section";
import { WhatsHotCard } from "@/components/rep-today/whats-hot-card";
import { Text } from "@/components/ui/text";
import { REP_TODAY_HEADER } from "@/lib/rep-today-data";

export function RepTodayPage() {
  const [logOpen, setLogOpen] = useState(false);
  const [tab, setTab] = useState<string>("Momentum");

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-5 px-4 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">
            {REP_TODAY_HEADER.date}
          </Text>
          <Text className="text-3xl font-bold">{REP_TODAY_HEADER.title}</Text>
          <Text className="text-base text-muted-foreground">
            {REP_TODAY_HEADER.subtitle}
          </Text>
        </View>

        <LogInteractionsButton onPress={() => setLogOpen(true)} />
        <BrandMomentumCard />
        <RepStats />
        <AiInsightCard />
        <PremiseRow />
        <InsightNoteCard />
        <NetworkIntelligenceCard />
        <SuggestedNextStepsCard />
        <RouteCard />
        <RepTabs value={tab} onChange={setTab} />

        {tab === "Momentum" ? (
          <>
            <WhatsHotCard />
            <BrandMomentumInsightsCard />
          </>
        ) : null}

        {tab === "Territory" ? <TerritorySection /> : null}
        {tab === "Pipeline" ? <PipelineSection /> : null}
        {tab === "Activity Log" ? <ActivityLogSection /> : null}
        {tab === "Orders" ? <OrdersSection /> : null}
        {tab === "Brands" ? <BrandsSection /> : null}
        {tab === "Voice Notes" ? <VoiceNotesSection /> : null}

        <PerformanceSection />
      </ScrollView>

      <LogInteractionForm visible={logOpen} onClose={() => setLogOpen(false)} />
    </View>
  );
}

function LogInteractionsButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log interactions"
      onPress={onPress}
      className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-white active:opacity-90"
    >
      <Plus color="#000000" size={20} />
      <Text className="text-base font-semibold text-black">
        Log Interactions
      </Text>
    </Pressable>
  );
}
