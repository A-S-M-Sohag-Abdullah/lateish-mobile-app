import { useState } from "react";

import {
  ChannelsStep,
  ConfidenceStep,
  GuardrailStep,
  MarketDatesStep,
  ReviewStep,
  TargetsStep,
} from "@/components/target-wizard/target-steps";
import { CenteredPopup } from "@/components/ui/centered-popup";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { useWizard } from "@/hooks/use-wizard";
import {
  DEFAULT_TARGET_DRAFT,
  TARGET_STEPS,
  type TargetDraft,
} from "@/lib/target-wizard-data";

interface CreateTargetWizardProps {
  visible: boolean;
  onClose: () => void;
  /** Called with the draft when the final step's action is pressed. */
  onComplete?: (draft: TargetDraft) => void;
}

// Bodies are indexed by step, so the array order matches TARGET_STEPS.
const STEP_BODIES = [
  MarketDatesStep,
  ChannelsStep,
  TargetsStep,
  GuardrailStep,
  ConfidenceStep,
  ReviewStep,
];

/**
 * The Create Target flow as a self-contained centred popup. Any screen can open
 * it by holding a `visible` boolean — it owns its own step and form state —
 * which is why the wizard shell, stepper and steps are all separate, reusable
 * pieces.
 */
export function CreateTargetWizard({
  visible,
  onClose,
  onComplete,
}: CreateTargetWizardProps) {
  const wizard = useWizard(TARGET_STEPS.length);
  const [draft, setDraft] = useState<TargetDraft>(DEFAULT_TARGET_DRAFT);

  const update = (partial: Partial<TargetDraft>) =>
    setDraft((d) => ({ ...d, ...partial }));

  function close() {
    wizard.reset();
    onClose();
  }

  function handlePrimary() {
    if (wizard.isLast) {
      onComplete?.(draft);
      close();
    } else {
      wizard.next();
    }
  }

  const Body = STEP_BODIES[wizard.step];

  return (
    <CenteredPopup visible={visible} onClose={close}>
      <WizardShell
        steps={TARGET_STEPS}
        current={wizard.step}
        onStepPress={wizard.goTo}
        onCancel={close}
        onPrimary={handlePrimary}
        footerBottomInset={0}
      >
        <Body draft={draft} update={update} />
      </WizardShell>
    </CenteredPopup>
  );
}
