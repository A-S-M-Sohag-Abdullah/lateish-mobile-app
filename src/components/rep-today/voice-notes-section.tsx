import { Search } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

const SUB_TABS = ["Notes (0)", "AI Insights"] as const;
const REACTIONS = ["👍", "😐", "👎"] as const;

/** Content shown under the "Voice Notes" tab. */
export function VoiceNotesSection() {
  const colors = useThemeColors();
  const [subTab, setSubTab] = useState<string>(SUB_TABS[0]);
  const [reaction, setReaction] = useState<string>(REACTIONS[0]);
  const [query, setQuery] = useState("");

  return (
    <View className="gap-4 rounded-2xl border border-border p-4">
      <View className="flex-row items-center justify-between gap-3">
        {/* Sub-tabs */}
        <View className="flex-row rounded-lg bg-secondary p-1">
          {SUB_TABS.map((tab) => {
            const active = tab === subTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setSubTab(tab)}
                className={cn(
                  "rounded-md px-3 py-1.5",
                  active && "bg-white/15",
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Reaction filter */}
        <View className="flex-row gap-2">
          {REACTIONS.map((emoji) => {
            const active = emoji === reaction;
            return (
              <Pressable
                key={emoji}
                onPress={() => setReaction(emoji)}
                className={cn(
                  "h-9 w-9 items-center justify-center rounded-md",
                  active ? "bg-white" : "bg-secondary",
                )}
              >
                <Text className="text-lg">{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="h-12 flex-row items-center gap-2.5 rounded-xl bg-muted px-4">
        <View className="shrink-0">
          <Search color={colors.mutedForeground} size={20} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search transcriptions, tags, accounts..."
          placeholderTextColor={colors.mutedForeground}
          className="flex-1 text-base text-foreground"
        />
      </View>
    </View>
  );
}
