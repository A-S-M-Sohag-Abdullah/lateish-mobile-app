import { useGoBack } from "@/hooks/use-go-back";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="gap-2">
      <Text className="text-base text-muted-foreground">{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        placeholder="••••••••••••"
        placeholderTextColor={colors.mutedForeground}
        className="h-14"
      />
    </View>
  );
}

export default function SecurityScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => goBack()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Password and Security</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 pb-16 pt-8"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PasswordField label="Current Password" value={current} onChangeText={setCurrent} />
        <PasswordField label="Create New Password" value={next} onChangeText={setNext} />
        <PasswordField label="Confirm New Password" value={confirm} onChangeText={setConfirm} />
      </ScrollView>

      <View className="px-4 pb-4 pt-2">
        <Pressable
          onPress={() => goBack()}
          className="h-14 items-center justify-center rounded-xl bg-white active:opacity-90"
        >
          <Text className="text-base font-semibold text-black">Save and Update</Text>
        </Pressable>
      </View>

      <BottomTabBar />
    </SafeAreaView>
  );
}
