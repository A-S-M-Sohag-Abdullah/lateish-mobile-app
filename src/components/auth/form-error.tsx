import { View } from "react-native";

import { Text } from "@/components/ui/text";

/** Inline error banner for the auth forms — no native alerts anywhere. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;

  const message =
    error instanceof Error ? error.message : "Something went wrong";

  return (
    <View className="mt-4 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2.5">
      <Text className="text-sm text-red-200">{message}</Text>
    </View>
  );
}
