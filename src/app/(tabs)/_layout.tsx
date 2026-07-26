import { Redirect, Stack } from "expo-router";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { useAuthStore } from "@/store/auth.store";

export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  const previewSignedIn = usePreviewStore((s) => s.signedIn);
  const colors = useThemeColors();

  // In preview the gate is a local flag the auth buttons flip, so the flow
  // still starts on Sign In without needing a real session.
  const allowed = PREVIEW_MODE ? previewSignedIn : !!session;
  if (!allowed) return <Redirect href="/login" />;

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
