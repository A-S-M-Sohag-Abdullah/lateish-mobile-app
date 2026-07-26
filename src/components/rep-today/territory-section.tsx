import { Search } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  TERRITORY_BRANDS,
  TERRITORY_CHANNELS,
} from "@/lib/rep-today-route-data";

/** Content shown under the "Territory" tab. */
export function TerritorySection() {
  const colors = useThemeColors();
  const [brand, setBrand] = useState<string>(TERRITORY_BRANDS[0]);
  const [channel, setChannel] = useState<string>(TERRITORY_CHANNELS[0]);
  const [query, setQuery] = useState("");

  return (
    <View className="gap-4">
      <Dropdown
        size="md"
        options={TERRITORY_BRANDS}
        value={brand}
        onChange={setBrand}
      />

      <Text className="text-2xl font-bold">Territory &amp; Venues</Text>

      <View className="flex-row items-center gap-3">
        <View className="h-12 flex-1 flex-row items-center gap-2.5 rounded-2xl bg-muted px-4">
          <View className="shrink-0">
            <Search color={colors.mutedForeground} size={20} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search venues"
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 text-base text-foreground"
          />
        </View>
        <Dropdown
          size="md"
          options={TERRITORY_CHANNELS}
          value={channel}
          onChange={setChannel}
        />
      </View>
    </View>
  );
}
