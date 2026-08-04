import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MapPin } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useLocationGate } from "@/store/location-gate.store";

/**
 * Shown once after sign-in / sign-up when location isn't granted, so the sales
 * map can centre on the user. A fixed dark brand surface (ignores the theme).
 */
export default function LocationPermissionScreen() {
  const router = useRouter();
  const setNeedsPrompt = useLocationGate((s) => s.setNeedsPrompt);
  const [busy, setBusy] = useState(false);

  function finish() {
    setNeedsPrompt(false);
    router.replace("/");
  }

  async function allow() {
    setBusy(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // ignore — proceed regardless of the outcome
    }
    finish();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0F1C" }}>
      <StatusBar style="light" />
      <View className="flex-1 px-6 pb-6">
        {/* Wordmark */}
        <View className="items-center pt-4">
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold tracking-tight text-white">LATE</Text>
            <Text className="text-3xl font-light tracking-tight text-white">(ish)</Text>
          </View>
        </View>

        {/* Prompt */}
        <View className="flex-1 items-center justify-center gap-4">
          <MapPin color="#FFFFFF" fill="#FFFFFF" size={64} />
          <Text className="text-center text-4xl font-bold text-white">
            Location Permission
          </Text>
          <Text className="max-w-xs text-center text-lg leading-7 text-white/55">
            Need location permission to use sales map feature.
          </Text>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Pressable
            onPress={allow}
            disabled={busy}
            className="h-16 items-center justify-center rounded-2xl bg-white active:opacity-90 disabled:opacity-70"
          >
            {busy ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text className="text-lg font-bold text-black">Allow Location</Text>
            )}
          </Pressable>
          <Pressable
            onPress={finish}
            disabled={busy}
            className="h-11 items-center justify-center active:opacity-70"
          >
            <Text className="text-base text-white/55 underline">Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
