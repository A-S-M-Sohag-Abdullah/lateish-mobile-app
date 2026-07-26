import { create } from "zustand";

/** Index of the active tab page (Dashboard=0 … Settings=4). */
interface TabsState {
  page: number;
  setPage: (page: number) => void;
}

export const useTabsStore = create<TabsState>((set) => ({
  page: 0,
  setPage: (page) => set({ page }),
}));

// Tab order — kept in sync with the pager and the bottom bar.
export const TAB_PAGES = [
  "Dashboard",
  "Market Targets",
  "Rep Today",
  "BDM",
  "Settings",
] as const;

/** Sidebar hrefs → page index. Anything else falls through to routing. */
export const HREF_TO_PAGE: Record<string, number> = {
  "/": 0,
  "/market-targets": 1,
  "/rep-today": 2,
  "/bdm": 3,
  "/profile": 4,
};
