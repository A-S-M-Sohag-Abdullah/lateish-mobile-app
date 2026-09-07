import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { Building2, LogOut, Users } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CreateOrganizationForm } from "@/components/setup/create-organization-form";
import { JoinOrganizationFlow } from "@/components/setup/join-organization-flow";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { LOGO_ASPECT_RATIO } from "@/lib/brand";
import { useAuthStore } from "@/store/auth.store";

const logo = require("../../assets/logo.png");

type SetupView = "choice" | "create" | "invite";

export default function SetupScreen() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const colors = useThemeColors();
  const [view, setView] = useState<SetupView>("choice");

  // Setup is a post-auth, pre-organization screen.
  if (!loading && !session) return <Redirect href="/login" />;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-border/60 px-5 py-4">
        <Image
          source={logo}
          style={{ height: 34, width: 34 * LOGO_ASPECT_RATIO }}
          contentFit="contain"
        />
        <Pressable
          onPress={() => void logout()}
          hitSlop={8}
          className="flex-row items-center gap-1.5 active:opacity-70"
        >
          <LogOut color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Log out</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center px-5 py-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {view === "choice" ? (
          <View className="gap-6">
            <View className="items-center gap-2">
              <Text className="text-center text-3xl font-bold">
                Welcome to Lateish
              </Text>
              <Text className="text-center text-base leading-6 text-muted-foreground">
                Get started by creating a new organization or joining one you were
                invited to.
              </Text>
            </View>

            <View className="gap-4">
              <ChoiceCard
                icon={<Building2 color={colors.primary} size={22} />}
                title="Create an organization"
                subtitle="Set up a new workspace for your brand or team."
                onPress={() => setView("create")}
              />
              <ChoiceCard
                icon={<Users color={colors.primary} size={22} />}
                title="Join an organization"
                subtitle="Enter an invite link to join an existing team."
                onPress={() => setView("invite")}
              />
            </View>
          </View>
        ) : view === "create" ? (
          <CreateOrganizationForm onBack={() => setView("choice")} />
        ) : (
          <JoinOrganizationFlow onBack={() => setView("choice")} />
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChoiceCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-start gap-4 rounded-2xl border-2 border-border p-5 active:border-primary active:bg-primary/5"
    >
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold">{title}</Text>
        <Text className="mt-0.5 text-sm text-muted-foreground">{subtitle}</Text>
      </View>
    </Pressable>
  );
}
