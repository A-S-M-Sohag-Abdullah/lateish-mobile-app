import { create } from "zustand";

interface LocationGateState {
  /** null = not yet checked, true = show the permission screen, false = resolved. */
  needsPrompt: boolean | null;
  setNeedsPrompt: (v: boolean | null) => void;
}

/**
 * Drives the one-time Location Permission screen shown after sign-in / sign-up.
 * Set to `true` when the OS permission isn't granted; the permission screen sets
 * it to `false` once the user allows or skips. Reset to `null` on sign-out so it
 * is re-checked on the next login.
 */
export const useLocationGate = create<LocationGateState>((set) => ({
  needsPrompt: null,
  setNeedsPrompt: (needsPrompt) => set({ needsPrompt }),
}));
