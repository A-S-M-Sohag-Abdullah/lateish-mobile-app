import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Portuguese",
  "Italian",
  "Japanese",
];

export default function LanguageScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [language, setLanguage] = useState("English");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Language</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-16 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <SelectField
          label="Select preferred language"
          value={language}
          options={LANGUAGES}
          onChange={setLanguage}
        />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
