import { Download } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { IntentCard } from "@/components/mdi/intent-card";
import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { INTENTS, STATUS_FILTERS } from "@/lib/mdi-data";

export function IntentsTab() {
  const colors = useThemeColors();
  const [status, setStatus] = useState<string>("All Status");

  const rows = useMemo(
    () =>
      status === "All Status"
        ? INTENTS
        : INTENTS.filter((i) => i.status === status),
    [status],
  );

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Dropdown
          options={STATUS_FILTERS}
          value={status}
          onChange={setStatus}
          size="md"
          className="flex-1"
        />
        <Pressable className="h-12 flex-row items-center gap-2 rounded-lg border border-border px-4 active:opacity-70">
          <Download color={colors.foreground} size={18} />
          <Text className="text-sm font-medium">Export</Text>
        </Pressable>
      </View>

      {rows.map((intent) => (
        <IntentCard key={intent.id} intent={intent} />
      ))}

      {rows.length === 0 ? (
        <Text variant="muted" className="py-8 text-center">
          No intents with this status.
        </Text>
      ) : null}
    </View>
  );
}
