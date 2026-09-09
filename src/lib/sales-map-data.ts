/**
 * Sales Map types + legend. Accounts are fetched live from the API (see the
 * sales-map screen); the legend + colours come from the canonical channel list,
 * mirroring the web app (front-end/src/components/sales-map/sales-map-data.ts).
 */
export {
  ALL_CHANNELS as CHANNEL_LEGEND,
  channelColor,
  channelLabel,
  type Channel as SalesChannel,
} from "@/lib/channels";

/** The three Sales Map layers (mirrors front-end sales-map-inner.tsx). */
export type MapLayer = "existing" | "target" | "visited";

export interface SalesAccount {
  id: string;
  name: string;
  channel: string;
  city: string;
  /** Full street address — used as the popup's location fallback when city/state are empty. */
  address: string;
  accountType: string;
  lat: number;
  lng: number;
  /** Which layer this account falls in for the current brand selection. Defaults to "existing". */
  layer?: MapLayer;
  /** BDM has a logged win (progressed/first listing) for the selected brand. */
  isVerifiedWin?: boolean;
}

/** Layer marker colours + popup badge text — mirrors LAYER_INFO / LAYER_BADGE on web. */
export const LAYER_META: Record<
  MapLayer,
  { color: string; badge: string; badgeBg: string; badgeFg: string }
> = {
  existing: {
    color: "#10B981",
    badge: "Layer 1 · Existing Account",
    badgeBg: "#d1fae5",
    badgeFg: "#065f46",
  },
  target: {
    color: "#F59E0B",
    badge: "Layer 2 · Target Account",
    badgeBg: "#fed7aa",
    badgeFg: "#9a3412",
  },
  visited: {
    color: "#EF4444",
    badge: "Layer 3 · Visited, Not Converted",
    badgeBg: "#fee2e2",
    badgeFg: "#991b1b",
  },
};
