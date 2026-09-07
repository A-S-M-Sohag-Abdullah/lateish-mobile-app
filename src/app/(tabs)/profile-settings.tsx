import { useGoBack } from "@/hooks/use-go-back";
import { Camera, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileSettingsScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();
  const profile = useAuthStore((s) => s.profile);

  const [name, setName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(
    "@" +
      (profile?.full_name || profile?.email?.split("@")[0] || "user")
        .toLowerCase()
        .replace(/\s+/g, ""),
  );
  const email = profile?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable
          onPress={() => goBack()}
          hitSlop={8}
          className="active:opacity-70"
        >
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Profile Settings</Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {/* Avatar */}
        <View className="items-center gap-3">
          <Pressable className="h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-white/[0.03] active:opacity-80">
            <Camera color={colors.foreground} size={34} />
          </Pressable>
          <Text className="text-base font-semibold">Update Profile Picture</Text>
        </View>

        {/* Name */}
        <View className="gap-2">
          <Text className="text-base text-muted-foreground">Name</Text>
          <Input
            value={name}
            onChangeText={setName}
            className="h-14"
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Username */}
        <View className="gap-2">
          <Text className="text-base text-muted-foreground">Username</Text>
          <Input
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            className="h-14"
            placeholder="@username"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Email — read only (cannot be changed) */}
        <View className="gap-2">
          <Text className="text-base text-muted-foreground">Email Address</Text>
          <Input value={email} editable={false} className="h-14" />
          <Text className="text-xs text-muted-foreground">
            Your email address can’t be changed.
          </Text>
        </View>

        {/* Save */}
        <Pressable
          onPress={() => goBack()}
          className="mt-2 h-14 items-center justify-center rounded-xl bg-white active:opacity-90"
        >
          <Text className="text-base font-semibold text-black">Save and Update</Text>
        </Pressable>
      </KeyboardAwareScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
