import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth.store";

export default function AuthLayout() {
  const session = useAuthStore((s) => s.session);

  // Already signed in — never show the auth screens.
  if (session) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
