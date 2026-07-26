import { create } from "zustand";

interface NotificationsState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/** Controls the right notifications panel, opened from the header bell. */
export const useNotificationsStore = create<NotificationsState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
