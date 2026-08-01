import { Redirect, Stack } from "expo-router";
import { View } from "react-native";

import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { useAuthStore } from "@/store/auth.store";

export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  const previewSignedIn = usePreviewStore((s) => s.signedIn);
  const colors = useThemeColors();
  const { organizations, isLoading: orgsLoading } = useOrganizations();

  // In preview the gate is a local flag the auth buttons flip, so the flow
  // still starts on Sign In without needing a real session.
  const allowed = PREVIEW_MODE ? previewSignedIn : !!session;
  if (!allowed) return <Redirect href="/login" />;

  // A signed-in user with no organization is sent to onboarding. Hold the screen
  // while memberships load so the dashboard never flashes before the redirect.
  if (!PREVIEW_MODE) {
    if (orgsLoading) {
      return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    }
    if (organizations.length === 0) return <Redirect href="/setup" />;
  }

  // The five tabs live in a single swipeable pager (index); "orders" is a
  // separate stack screen reachable from the sidebar.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
