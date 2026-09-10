import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import {
  AUTH_GRADIENT,
  SPLASH_GRADIENT_DIRECTION,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

export type AuthTab = "signin" | "signup";

interface AuthLayoutProps {
  mode: AuthTab;
  onModeChange: (mode: AuthTab) => void;
  children: React.ReactNode;
}

/**
 * Shared chrome for the signed-out screens: brand gradient and the
 * Sign In / Sign Up segmented control. The control stays put while the form
 * below it (the `children`, including its title block) slides between the two
 * modes — see src/app/(auth)/login.tsx.
 *
 * These screens are deliberately fixed-dark rather than theme-aware — the
 * design is a branded surface, not app chrome, so it does not follow the
 * light/dark preference.
 */
export function AuthLayout({ mode, onModeChange, children }: AuthLayoutProps) {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={[...AUTH_GRADIENT.colors]}
        locations={[...AUTH_GRADIENT.locations]}
        start={SPLASH_GRADIENT_DIRECTION.start}
        end={SPLASH_GRADIENT_DIRECTION.end}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAwareScrollView
          className="flex-1"
          // `grow` + `justify-center` centres the block when it is shorter
          // than the screen, and falls back to normal top-down scrolling
          // once the keyboard or a small display makes it overflow.
          contentContainerClassName="grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={24}
        >
          <AuthTabs mode={mode} onModeChange={onModeChange} />

          {children}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

function AuthTabs({
  mode,
  onModeChange,
}: {
  mode: AuthTab;
  onModeChange: (mode: AuthTab) => void;
}) {
  return (
    <View className="flex-row rounded-xl border border-white/10 bg-white/[0.06] p-1">
      <TabButton
        label="Sign In"
        active={mode === "signin"}
        onPress={() => onModeChange("signin")}
      />
      <TabButton
        label="Sign Up"
        active={mode === "signup"}
        onPress={() => onModeChange("signup")}
      />
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cn(
        "h-11 flex-1 items-center justify-center rounded-lg",
        active && "bg-brand-maroon",
      )}
    >
      <Text className="text-base font-bold text-white">{label}</Text>
    </Pressable>
  );
}
