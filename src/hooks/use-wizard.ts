import { useCallback, useState } from "react";

export interface Wizard {
  step: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
  reset: () => void;
}

/**
 * Step state for any multi-step flow. Kept separate from the presentation so
 * the same hook drives the Create Target wizard and any future wizard.
 */
export function useWizard(total: number): Wizard {
  const [step, setStep] = useState(0);

  const goTo = useCallback(
    (index: number) => setStep(Math.max(0, Math.min(total - 1, index))),
    [total],
  );
  const next = useCallback(
    () => setStep((s) => Math.min(total - 1, s + 1)),
    [total],
  );
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const reset = useCallback(() => setStep(0), []);

  return {
    step,
    total,
    isFirst: step === 0,
    isLast: step === total - 1,
    next,
    back,
    goTo,
    reset,
  };
}
