import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  tab: AuthTab;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for the signed-out screens: brand gradient, the
 * Sign In / Sign Up segmented control, and the centred title block.
 *
 * These screens are deliberately fixed-dark rather than theme-aware — the
 * design is a branded surface, not app chrome, so it does not follow the
 * light/dark preference.
 */
export function AuthLayout({
  tab,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
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
          <AuthTabs tab={tab} />

          <View className="mb-8 mt-9 items-center gap-3">
            <Text className="text-4xl font-bold text-white">{title}</Text>
            <Text className="text-center text-base leading-6 text-white/70">
              {subtitle}
            </Text>
          </View>

          {children}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

function AuthTabs({ tab }: { tab: AuthTab }) {
  const router = useRouter();

  return (
    <View className="flex-row rounded-xl border border-white/10 bg-white/[0.06] p-1">
      <TabButton
        label="Sign In"
        active={tab === "signin"}
        onPress={() => router.replace("/login")}
      />
      <TabButton
        label="Sign Up"
        active={tab === "signup"}
        onPress={() => router.replace("/register")}
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
