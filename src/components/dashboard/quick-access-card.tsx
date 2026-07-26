import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import type { QuickAccessItem, QuickAccessTone } from "@/lib/mock-data";
import { useTabsStore } from "@/store/tabs.store";

/**
 * Gradient pairs for the four tiles, sampled from the design. These are
 * decorative brand surfaces rather than theme tokens, so they stay fixed.
 */
const TONES: Record<QuickAccessTone, readonly [string, string]> = {
  blue: ["#1C3A69", "#152A4D"],
  purple: ["#3B2B73", "#2A1E52"],
  maroon: ["#4A2023", "#2E1416"],
  teal: ["#0F3E3B", "#0A2A28"],
};

export function QuickAccessCard({ item }: { item: QuickAccessItem }) {
  const router = useRouter();
  const setPage = useTabsStore((s) => s.setPage);
  const Icon = item.icon;

  function open() {
    if (item.page != null) {
      setPage(item.page);
      router.navigate("/");
    } else if (item.href) {
      router.push(item.href);
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={open}
      className="flex-1 overflow-hidden rounded-2xl active:opacity-80"
    >
      <LinearGradient
        colors={TONES[item.tone]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View className="h-[132px] justify-between p-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Icon color="#FFFFFF" size={20} />
        </View>

        <View className="gap-1">
          <Text className="text-lg font-bold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-sm text-white/60" numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
