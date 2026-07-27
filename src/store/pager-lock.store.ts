import { create } from "zustand";

/**
 * Lets a nested horizontal scroller (e.g. the Rep Today tab row) freeze the
 * tabs pager's own horizontal swipe while a finger is on it — otherwise the
 * pager steals the gesture and the whole screen slides instead.
 */
interface PagerLockState {
  locked: boolean;
  setLocked: (locked: boolean) => void;
}

export const usePagerLock = create<PagerLockState>((set) => ({
  locked: false,
  setLocked: (locked) => set({ locked }),
}));
