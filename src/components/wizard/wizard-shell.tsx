import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { WizardStepper } from "@/components/wizard/wizard-stepper";

export interface WizardStepMeta {
  title: string;
  subtitle: string;
}

interface WizardShellProps {
  steps: WizardStepMeta[];
  current: number;
  onStepPress?: (index: number) => void;
  onCancel: () => void;
  onPrimary: () => void;
  primaryLabel?: string;
  cancelLabel?: string;
  /** When provided, a full-width secondary action shows below the button row. */
  onSaveDraft?: () => void;
  saveDraftLabel?: string;
  /**
   * Extra padding below the footer. Defaults to the device bottom safe-area
   * inset (for edge-anchored sheets); pass 0 for a centred popup that already
   * has margin around it.
   */
  footerBottomInset?: number;
  /** The current step's body. */
  children: React.ReactNode;
}

/**
 * Presentation for any multi-step flow: a fixed stepper + header, a scrolling
 * body, and a pinned footer. Knows nothing about what the steps contain, so it
 * is reused across wizards — the caller supplies step metadata and the body.
 */
export function WizardShell({
  steps,
  current,
  onStepPress,
  onCancel,
  onPrimary,
  primaryLabel = "Next",
  cancelLabel = "Cancel",
  onSaveDraft,
  saveDraftLabel = "Save as draft",
  footerBottomInset,
  children,
}: WizardShellProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = footerBottomInset ?? insets.bottom;
  const meta = steps[current];

  return (
    <View className="flex-1">
      <View className="gap-5 px-6 pt-6">
        <WizardStepper
          total={steps.length}
          current={current}
          onStepPress={onStepPress}
        />
        <View className="gap-1">
          <Text className="text-3xl font-bold">{meta.title}</Text>
          <Text className="text-base text-muted-foreground">
            {meta.subtitle}
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 py-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        {children}
      </KeyboardAwareScrollView>

      <View
        className="gap-3 px-6 pt-3"
        style={{ paddingBottom: bottomInset + 12 }}
      >
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onPress={onCancel}
          >
            <Text>{cancelLabel}</Text>
          </Button>
          <Button
            variant="brand"
            size="lg"
            className="flex-1"
            onPress={onPrimary}
          >
            <Text>{primaryLabel}</Text>
          </Button>
        </View>

        {onSaveDraft ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSaveDraft}
            className="h-12 items-center justify-center rounded-xl bg-brand-navy active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">
              {saveDraftLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
