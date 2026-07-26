import { create } from "zustand";

interface SidebarState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/** Controls the left navigation drawer, opened from the header menu button. */
export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
