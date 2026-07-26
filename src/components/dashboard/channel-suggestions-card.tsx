import { RefreshCw, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { CHANNEL_OPTIONS, CHANNEL_TYPE_OPTIONS } from "@/lib/mock-data";

export function ChannelSuggestionsCard() {
  const [type, setType] = useState<string>(CHANNEL_TYPE_OPTIONS[0]);
  const [channel, setChannel] = useState<string>(CHANNEL_OPTIONS[0]);

  return (
    <SectionCard
      icon={Sparkles}
      title="Key Channel Suggestions"
      description="AI powered insights from activity, inventory & A&P analysis."
    >
      {/* The list is empty until the API is wired up; the mock shows a tall
          blank body above the filter row. */}
      <View className="h-24" />

      {/* Three equal columns: each control gets flex-1 so they grow together
          with the card width. text-xs keeps them fitting on narrow screens. */}
      <View className="flex-row items-center gap-2">
        <Dropdown
          className="flex-1"
          options={CHANNEL_TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />
        <Dropdown
          className="flex-1"
          options={CHANNEL_OPTIONS}
          value={channel}
          onChange={setChannel}
        />
        <RefreshButton />
      </View>
    </SectionCard>
  );
}

function RefreshButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Refresh suggestions"
      className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-brand-maroon px-3 active:bg-brand-maroon-pressed"
    >
      <RefreshCw color="#FFFFFF" size={14} />
      <Text className="text-xs font-medium text-white">Refresh</Text>
    </Pressable>
  );
}
