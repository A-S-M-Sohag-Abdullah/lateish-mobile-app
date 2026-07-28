import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";

const TIME_ZONES = [
  "London (UTC+00:00)",
  "Paris (UTC+01:00)",
  "New York (UTC-05:00)",
  "Los Angeles (UTC-08:00)",
  "Asia/Kolkata (UTC+05:30)",
  "Dubai (UTC+04:00)",
  "Tokyo (UTC+09:00)",
  "Sydney (UTC+10:00)",
];

export default function TimeZoneScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [zone, setZone] = useState("Paris (UTC+01:00)");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Time Zone</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-16 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <SelectField
          label="Select your preferred time zone"
          value={zone}
          options={TIME_ZONES}
          onChange={setZone}
        />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
