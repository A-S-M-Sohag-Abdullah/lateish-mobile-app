import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The last-selected organization id, persisted so a relaunch reopens the same
 * org. Mirrors the web app's `lateish_current_org_id` localStorage key.
 */
interface OrgState {
  currentOrgId: string | null;
  setCurrentOrgId: (id: string | null) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      setCurrentOrgId: (currentOrgId) => set({ currentOrgId }),
    }),
    {
      name: "lateish_current_org",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
