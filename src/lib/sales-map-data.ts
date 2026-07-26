/**
 * UI-preview data for the Sales Map. Mirrors the web app's Leaflet map
 * (front-end/src/components/sales-map) but with a curated legend and a handful
 * of mock accounts around New York — no API, matching the preview brief.
 */

export interface SalesChannel {
  slug: string;
  label: string;
  color: string;
}

/** The legend shown in the bottom sheet (colours sampled from the design). */
export const CHANNEL_LEGEND: SalesChannel[] = [
  { slug: "modern-cocktail-bar", label: "Modern Cocktail Bar", color: "#8B5CF6" },
  { slug: "aspiring-cocktail-bar", label: "Aspiring Cocktail Bar", color: "#A78BFA" },
  { slug: "high-volume-cocktail", label: "High-Volume Cocktail", color: "#C026D3" },
  { slug: "hatted-starred", label: "Hatted / Starred", color: "#EC4899" },
  { slug: "elevated-dining", label: "Elevated Dining", color: "#FB7185" },
  { slug: "traditional-pub", label: "Traditional Pub", color: "#22C55E" },
  { slug: "specialist-retailer", label: "Specialist Retailer", color: "#60A5FA" },
  { slug: "luxury-prestige", label: "Luxury / Prestige", color: "#2563EB" },
];

const COLOR_BY_SLUG: Record<string, string> = Object.fromEntries(
  CHANNEL_LEGEND.map((c) => [c.slug, c.color]),
);
const LABEL_BY_SLUG: Record<string, string> = Object.fromEntries(
  CHANNEL_LEGEND.map((c) => [c.slug, c.label]),
);

export function channelColor(slug: string): string {
  return COLOR_BY_SLUG[slug] ?? "#9CA3AF";
}
export function channelLabel(slug: string): string {
  return LABEL_BY_SLUG[slug] ?? slug;
}

export interface SalesAccount {
  id: string;
  name: string;
  channel: string;
  city: string;
  lat: number;
  lng: number;
}

/**
 * Accounts scattered around Lower Manhattan / the harbour. A tight knot near
 * the waterfront collapses into a single cluster badge at the default zoom,
 * exactly like the design.
 */
export const SALES_ACCOUNTS: SalesAccount[] = [
  // Waterfront knot — clusters together at zoom 13.
  { id: "a1", name: "Harbor House", channel: "modern-cocktail-bar", city: "New York", lat: 40.7048, lng: -74.0165 },
  { id: "a2", name: "Pier 25 Social", channel: "aspiring-cocktail-bar", city: "New York", lat: 40.7041, lng: -74.017 },
  { id: "a3", name: "The Battery Room", channel: "high-volume-cocktail", city: "New York", lat: 40.7036, lng: -74.0158 },
  { id: "a4", name: "Liberty & Vine", channel: "hatted-starred", city: "New York", lat: 40.7052, lng: -74.0149 },
  { id: "a5", name: "Seaport Table", channel: "elevated-dining", city: "New York", lat: 40.7059, lng: -74.0161 },
  { id: "a6", name: "Dockside Tavern", channel: "traditional-pub", city: "New York", lat: 40.7044, lng: -74.0142 },
  { id: "a7", name: "Wall St. Cellars", channel: "specialist-retailer", city: "New York", lat: 40.7061, lng: -74.0153 },
  { id: "a8", name: "Prestige Fine Wines", channel: "luxury-prestige", city: "New York", lat: 40.7033, lng: -74.0147 },
  { id: "a9", name: "Exchange Lounge", channel: "modern-cocktail-bar", city: "New York", lat: 40.7055, lng: -74.0138 },
  { id: "a10", name: "Whitehall Bar", channel: "high-volume-cocktail", city: "New York", lat: 40.7029, lng: -74.0156 },
  { id: "a11", name: "Stone Street Pub", channel: "traditional-pub", city: "New York", lat: 40.7047, lng: -74.0131 },
  { id: "a12", name: "Bowling Green Bar", channel: "aspiring-cocktail-bar", city: "New York", lat: 40.7039, lng: -74.0136 },

  // Scattered singles further out.
  { id: "b1", name: "Tribeca Grand", channel: "hatted-starred", city: "New York", lat: 40.7195, lng: -74.0089 },
  { id: "b2", name: "SoHo Provisions", channel: "specialist-retailer", city: "New York", lat: 40.7233, lng: -74.0021 },
  { id: "b3", name: "West Village Cellar", channel: "luxury-prestige", city: "New York", lat: 40.7331, lng: -74.0053 },
  { id: "b4", name: "Hudson Yards Bar", channel: "modern-cocktail-bar", city: "New York", lat: 40.7538, lng: -74.0021 },
  { id: "b5", name: "Jersey City Tap", channel: "traditional-pub", city: "Jersey City", lat: 40.7178, lng: -74.0431 },
  { id: "b6", name: "Hoboken Social", channel: "elevated-dining", city: "Hoboken", lat: 40.7439, lng: -74.0324 },
];
