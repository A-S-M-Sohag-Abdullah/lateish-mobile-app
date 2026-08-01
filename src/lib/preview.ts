import { create } from "zustand";

/**
 * UI preview mode.
 *
 * While true:
 *  - Sign In / Sign Up go straight to the dashboard without calling the API
 *  - the tab screens gate on `usePreviewStore` instead of a real session
 *  - the dashboard reads from src/lib/mock-data.ts instead of the backend
 *
 * This exists so the screens can be reviewed before the API is wired up.
 * **Set to false to restore real authentication** — every bypass in the app
 * checks this one flag, so nothing else needs changing.
 */
export const PREVIEW_MODE = false;

interface PreviewState {
  /** Stands in for a Supabase session while PREVIEW_MODE is on. */
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
}

/**
 * Not persisted — a fresh launch always lands on Sign In, which is the whole
 * point of being able to walk the flow.
 */
export const usePreviewStore = create<PreviewState>()((set) => ({
  signedIn: false,
  setSignedIn: (signedIn) => set({ signedIn }),
}));
