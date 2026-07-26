import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text variant="h3">This screen doesn&apos;t exist.</Text>
        <Link href="/">
          <Text className="font-medium underline">Go to the dashboard</Text>
        </Link>
      </View>
    </>
  );
}
