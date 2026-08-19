import { Redirect, Stack } from "expo-router";
import { View } from "react-native";

import { NitaButton } from "@/components/layout/nita-button";
import { NitaPanel } from "@/components/layout/nita-panel";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { useAuthStore } from "@/store/auth.store";
import { useLocationGate } from "@/store/location-gate.store";

export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  const previewSignedIn = usePreviewStore((s) => s.signedIn);
  const colors = useThemeColors();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const needsLocationPrompt = useLocationGate((s) => s.needsPrompt);

  // In preview the gate is a local flag the auth buttons flip, so the flow
  // still starts on Sign In without needing a real session.
  const allowed = PREVIEW_MODE ? previewSignedIn : !!session;
  if (!allowed) return <Redirect href="/login" />;

  const hold = <View style={{ flex: 1, backgroundColor: colors.background }} />;

  // A signed-in user with no organization is sent to onboarding. Hold the screen
  // while things load/resolve so the dashboard never flashes before a redirect.
  if (!PREVIEW_MODE) {
    // First thing after sign-in / sign-up: ask for location (for the sales map).
    // `null` = still checking the OS permission — hold rather than flash tabs.
    if (needsLocationPrompt === null) return hold;
    if (needsLocationPrompt) return <Redirect href="/location-permission" />;

    if (orgsLoading) return hold;
    if (organizations.length === 0) return <Redirect href="/setup" />;
  }

  // The five tabs live in a single swipeable pager (index); "orders" is a
  // separate stack screen reachable from the sidebar. The NITA button + panel
  // are hosted here so they overlay every signed-in screen.
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <NitaButton />
      <NitaPanel />
    </View>
  );
}
