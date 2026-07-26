import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { CreateTargetWizard } from "@/components/target-wizard/create-target-wizard";
import { Text } from "@/components/ui/text";

/**
 * Closes the Market Targets section: a dashed empty slot followed by the
 * Create Target action, which opens the Create Target wizard.
 */
export function CreateTargetBlock() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <View className="gap-4 rounded-2xl border-2 border-dashed border-border p-4">
      <View className="h-24" />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create target"
        onPress={() => setWizardOpen(true)}
        className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-brand-maroon active:bg-brand-maroon-pressed"
      >
        <Plus color="#FFFFFF" size={20} />
        <Text className="text-base font-semibold text-white">
          Create Target
        </Text>
      </Pressable>

      <CreateTargetWizard
        visible={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </View>
  );
}
