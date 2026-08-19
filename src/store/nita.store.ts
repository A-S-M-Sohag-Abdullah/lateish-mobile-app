import { create } from "zustand";

/** Open/close state for the global NITA chat panel (button lives on every screen). */
interface NitaState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useNitaStore = create<NitaState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
