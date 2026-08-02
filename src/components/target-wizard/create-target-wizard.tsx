import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Text } from "@/components/ui/text";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { useOrganizations } from "@/hooks/use-organizations";
import { useWizard } from "@/hooks/use-wizard";
import { api } from "@/lib/api";
import {
  DEFAULT_TARGET_DRAFT,
  TARGET_STEPS,
  type TargetDraft,
} from "@/lib/target-wizard-data";

interface CreateTargetWizardProps {
  visible: boolean;
  onClose: () => void;
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

/** "22/05/2026" → "2026-05-22". */
function dmyToISO(value: string): string {
  const [d, m, y] = value.split("/");
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function buildPayload(draft: TargetDraft) {
  return {
    brand_id: draft.brandId,
    territory_id: draft.territoryId || null,
    period_start: dmyToISO(draft.startDate),
    period_end: dmyToISO(draft.endDate),
    channels: draft.channels.map((c, i) => ({
      channel: c,
      role: i === 0 ? "primary" : "secondary",
    })),
    case_target: Number(draft.caseTarget) || 0,
    distribution_target: draft.distributionTarget
      ? Number(draft.distributionTarget)
      : null,
    ap_target: Number(draft.apBudget) || 0,
    confidence: draft.confidence,
    notes: null,
  };
}

/**
 * The Create Target flow as a self-contained centred popup. Owns its step and
 * form state and POSTs a real market target on the final step.
 */
export function CreateTargetWizard({ visible, onClose }: CreateTargetWizardProps) {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();

  const wizard = useWizard(TARGET_STEPS.length);
  const [draft, setDraft] = useState<TargetDraft>(DEFAULT_TARGET_DRAFT);
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = (partial: Partial<TargetDraft>) => {
    setValidationError(null);
    setDraft((d) => ({ ...d, ...partial }));
  };

  const create = useMutation({
    mutationFn: () =>
      api.post(`/organizations/${orgId}/market-targets`, buildPayload(draft)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-targets", orgId] });
      close();
    },
  });

  function close() {
    wizard.reset();
    setDraft(DEFAULT_TARGET_DRAFT);
    setValidationError(null);
    create.reset();
    onClose();
  }

  function handlePrimary() {
    if (!wizard.isLast) {
      wizard.next();
      return;
    }
    if (!draft.territoryId) return setValidationError("Select a territory.");
    if (!draft.brandId) return setValidationError("Select a brand.");
    if (!draft.caseTarget.trim()) return setValidationError("Enter a case target.");
    create.mutate();
  }

  const errorMessage =
    validationError ?? (create.isError ? (create.error as Error).message : null);

  const primaryLabel = wizard.isLast
    ? create.isPending
      ? "Creating…"
      : "Create Target"
    : "Next";

  const Body = STEP_BODIES[wizard.step];

  return (
    <CenteredPopup visible={visible} onClose={close}>
      <WizardShell
        steps={TARGET_STEPS}
        current={wizard.step}
        onStepPress={wizard.goTo}
        onCancel={close}
        onPrimary={handlePrimary}
        primaryLabel={primaryLabel}
        footerBottomInset={0}
      >
        <Body draft={draft} update={update} />
        {errorMessage ? (
          <Text className="mt-3 text-sm text-red-500">{errorMessage}</Text>
        ) : null}
      </WizardShell>
    </CenteredPopup>
  );
}
