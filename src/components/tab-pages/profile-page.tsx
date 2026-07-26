import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/contexts/theme-context";
import { PREVIEW_MODE, usePreviewStore } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();

  const router = useRouter();
  const setPreviewSignedIn = usePreviewStore((s) => s.setSignedIn);

  const signOut = useMutation({
    mutationFn: async () => {
      if (PREVIEW_MODE) {
        setPreviewSignedIn(false);
        router.replace("/login");
        return;
      }
      await logout();
    },
  });

  return (
    <Screen embedded title="Profile">
      <Card>
        <CardContent className="gap-1 p-4">
          <Text className="text-base font-semibold">
            {profile?.full_name || "—"}
          </Text>
          <Text variant="muted">{profile?.email || "—"}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-3 p-4">
          <Text className="text-sm font-medium">Appearance</Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((option) => {
              const selected = theme === option.value;
              return (
                <Button
                  key={option.value}
                  variant={selected ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1"
                  onPress={() => setTheme(option.value)}
                >
                  <Text className={cn(selected && "font-semibold")}>
                    {option.label}
                  </Text>
                </Button>
              );
            })}
          </View>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        onPress={() => signOut.mutate()}
        loading={signOut.isPending}
      >
        <Text>Sign out</Text>
      </Button>
    </Screen>
  );
}
