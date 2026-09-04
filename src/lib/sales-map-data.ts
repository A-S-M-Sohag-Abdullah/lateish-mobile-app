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
}
