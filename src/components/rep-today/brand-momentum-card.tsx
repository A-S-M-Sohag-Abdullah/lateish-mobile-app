import { LinearGradient } from "expo-linear-gradient";
import { Flame } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";

export function BrandMomentumCard() {
  const { summary } = useRepTodaySummary();
  const m = summary?.momentum;

  const sample = m ? (m.isSample ? "Sample" : "Live") : "—";
  const trend = m?.status ?? "—";
  const note = m?.note ?? "—";

  return (
    <View className="overflow-hidden rounded-2xl">
      <LinearGradient
        colors={["#7C3A10", "#2E1B0D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="gap-2 p-4">
        <View className="flex-row items-center gap-2">
          <Flame color="#F59E0B" size={20} />
          <Text className="text-base font-bold text-white">Brand momentum</Text>
          <Text className="text-sm text-white/60">- {sample}</Text>
          <View className="flex-1" />
          <View className="rounded-md bg-orange-500/20 px-2 py-1">
            <Text className="text-xs font-medium text-orange-300">- {trend}</Text>
          </View>
        </View>
        <Text className="text-sm text-white/80">{note}</Text>
      </View>
    </View>
  );
}
