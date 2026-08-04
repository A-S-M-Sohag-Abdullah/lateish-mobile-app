/** Canonical sales channels — ported from front-end/src/lib/channels.ts. */
export interface Channel {
  label: string;
  slug: string;
  color: string;
}

export const ON_PREMISE_CHANNELS: Channel[] = [
  { label: "Modern Cocktail Bar (Trend-Leading)", slug: "modern-cocktail-bar", color: "#8B5CF6" },
  { label: "Aspiring Cocktail Bar", slug: "aspiring-cocktail-bar", color: "#A78BFA" },
  { label: "High-Volume Cocktail Bar", slug: "high-volume-cocktail-bar", color: "#7C3AED" },
  { label: "Premium Nightlife / Late-Night", slug: "premium-nightlife", color: "#4C1D95" },
  { label: "Beer + Shot / Dive Bar", slug: "beer-shot-dive-bar", color: "#6D28D9" },
  { label: "Agave / Category Specialist Bar", slug: "agave-specialist", color: "#C4B5FD" },
  { label: "Hatted / Starred Restaurant", slug: "hatted-restaurant", color: "#EC4899" },
  { label: "Elevated Dining (Non-Starred)", slug: "elevated-dining", color: "#F472B6" },
  { label: "Casual Food & Beverage", slug: "casual-food-beverage", color: "#FB923C" },
  { label: "Modern Pub / Premium Local", slug: "modern-pub", color: "#F59E0B" },
  { label: "Traditional Pub", slug: "traditional-pub", color: "#D97706" },
  { label: "Hotel Bar (Lifestyle / Luxury)", slug: "hotel-bar", color: "#22C55E" },
  { label: "Premium Group Operator", slug: "premium-group-operator", color: "#14B8A6" },
  { label: "Catering & Events Company", slug: "catering-events", color: "#0D9488" },
  { label: "Outdoor / Pool / Seasonal Venue", slug: "outdoor-seasonal-venue", color: "#06B6D4" },
  { label: "LGBTQ+ Venue", slug: "lgbtq-venue", color: "#F97316" },
  { label: "Market / Location-Specific Concept", slug: "location-specific-concept", color: "#EF4444" },
  { label: "Food Service Operator", slug: "food-service-operator", color: "#64748B" },
  { label: "Sports / Cinema / Event Venue", slug: "sports-cinema-event", color: "#0EA5E9" },
  { label: "Private Members Club", slug: "private-members-club", color: "#1E293B" },
  { label: "Brewery / Distillery / Winery", slug: "brewery-distillery-winery", color: "#854D0E" },
  { label: "Other", slug: "other-on-premise", color: "#9CA3AF" },
];

export const OFF_PREMISE_CHANNELS: Channel[] = [
  { label: "Independent Specialist Retailer", slug: "independent-retailer", color: "#3B82F6" },
  { label: "Deli / Food-Led Retail", slug: "deli-food-retail", color: "#60A5FA" },
  { label: "Convenience / Mom & Pop Store", slug: "convenience-store", color: "#93C5FD" },
  { label: "Luxury / Prestige Retail", slug: "luxury-retail", color: "#1D4ED8" },
  { label: "Regional Chain", slug: "regional-chain", color: "#84CC16" },
  { label: "National Chain", slug: "national-chain", color: "#65A30D" },
  { label: "E-commerce / DTC", slug: "ecommerce-dtc", color: "#16A34A" },
  { label: "Local Chain", slug: "local-chain", color: "#4ADE80" },
  { label: "Other", slug: "other-off-premise", color: "#9CA3AF" },
];

export const ALL_CHANNELS: Channel[] = [
  ...ON_PREMISE_CHANNELS,
  ...OFF_PREMISE_CHANNELS,
];

export function channelLabel(slug: string): string {
  return ALL_CHANNELS.find((c) => c.slug === slug)?.label ?? slug;
}

export function channelColor(slug: string): string {
  return ALL_CHANNELS.find((c) => c.slug === slug)?.color ?? "#9CA3AF";
}
