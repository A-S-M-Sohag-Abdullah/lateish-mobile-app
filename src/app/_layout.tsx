import "../global.css";

import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { LogBox, Platform, Pressable, ScrollView, Text as RNText, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BrandSplash } from "@/components/brand/splash";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthStore } from "@/store/auth.store";

// Benign react-native-web responder warning fired when an interactive control
// (e.g. a Slider) competes with a parent ScrollView on the web preview only.
// Native LogBox suppression handles device builds; on web the warning is
// emitted via console.error (intercepted by @expo/log-box before LogBox sees
// it), so filter that one message out there too.
LogBox.ignoreLogs(["ScrollView doesn't take rejection well"]);
if (Platform.OS === "web") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("ScrollView doesn't take rejection well")
    ) {
      return;
    }
    originalError(...args);
  };
}

// The native splash stays up until <BrandSplash> has painted over it.
void SplashScreen.preventAutoHideAsync();

/**
 * Shows render errors on the device instead of Expo Go's generic
 * "Something went wrong" screen, which carries no information.
 *
 * Deliberately built from raw React Native primitives and inline styles: it has
 * to keep working when the thing that broke is NativeWind, the theme provider,
 * or a font — so it must not depend on any of them.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B1220", paddingTop: 64 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <RNText
          style={{ color: "#F87171", fontSize: 20, fontWeight: "700", marginBottom: 12 }}
        >
          Startup error
        </RNText>
        <RNText style={{ color: "#FFFFFF", fontSize: 15, marginBottom: 16 }}>
          {error?.message ?? "Unknown error"}
        </RNText>
        <RNText style={{ color: "#94A3B8", fontSize: 11, lineHeight: 16 }}>
          {error?.stack ?? "(no stack)"}
        </RNText>
      </ScrollView>
      <Pressable
        onPress={retry}
        style={{
          margin: 20,
          padding: 14,
          borderRadius: 10,
          backgroundColor: "#8B2226",
          alignItems: "center",
        }}
      >
        <RNText style={{ color: "#FFFFFF", fontWeight: "700" }}>Retry</RNText>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryProvider>
            <AppShell />
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Holds the splash until fonts, the persisted theme and the first Supabase auth
 * event have all resolved — otherwise the app flashes light chrome and a
 * logged-out screen before settling.
 */
function AppShell() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const { hydrated, resolvedTheme } = useTheme();
  const authLoading = useAuthStore((s) => s.loading);
  const colors = useThemeColors();

  const [splashHidden, setSplashHidden] = useState(false);
  const handleSplashHidden = useCallback(() => setSplashHidden(true), []);

  const ready = (fontsLoaded || !!fontError) && hydrated && !authLoading;

  return (
    <>
      <StatusBar
        style={
          // The splash is dark whatever the theme, so the icons must be light
          // until it has gone.
          !splashHidden || resolvedTheme === "dark" ? "light" : "dark"
        }
      />

      {/* Mounted underneath the splash so the first screen is laid out and
          painted before the fade begins. */}
      {ready ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      ) : null}

      {/* Hosted here (above the navigator) so the drawer overlays every route,
          including full-screen pushed screens like the Sales Map. */}
      {ready ? <Sidebar /> : null}
      {ready ? <NotificationsPanel /> : null}

      {splashHidden ? null : (
        <BrandSplash visible={!ready} onHidden={handleSplashHidden} />
      )}
    </>
  );
}
