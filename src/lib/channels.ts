/** Canonical sales channels — ported from front-end/src/lib/channels.ts. */
export interface Channel {
  label: string;
  slug: string;
}

export const ON_PREMISE_CHANNELS: Channel[] = [
  { label: "Modern Cocktail Bar (Trend-Leading)", slug: "modern-cocktail-bar" },
  { label: "Aspiring Cocktail Bar", slug: "aspiring-cocktail-bar" },
  { label: "High-Volume Cocktail Bar", slug: "high-volume-cocktail-bar" },
  { label: "Premium Nightlife / Late-Night", slug: "premium-nightlife" },
  { label: "Beer + Shot / Dive Bar", slug: "beer-shot-dive-bar" },
  { label: "Agave / Category Specialist Bar", slug: "agave-specialist" },
  { label: "Hatted / Starred Restaurant", slug: "hatted-restaurant" },
  { label: "Elevated Dining (Non-Starred)", slug: "elevated-dining" },
  { label: "Casual Food & Beverage", slug: "casual-food-beverage" },
  { label: "Modern Pub / Premium Local", slug: "modern-pub" },
  { label: "Traditional Pub", slug: "traditional-pub" },
  { label: "Hotel Bar (Lifestyle / Luxury)", slug: "hotel-bar" },
  { label: "Premium Group Operator", slug: "premium-group-operator" },
  { label: "Catering & Events Company", slug: "catering-events" },
  { label: "Outdoor / Pool / Seasonal Venue", slug: "outdoor-seasonal-venue" },
  { label: "LGBTQ+ Venue", slug: "lgbtq-venue" },
  { label: "Market / Location-Specific Concept", slug: "location-specific-concept" },
  { label: "Food Service Operator", slug: "food-service-operator" },
  { label: "Sports / Cinema / Event Venue", slug: "sports-cinema-event" },
  { label: "Private Members Club", slug: "private-members-club" },
  { label: "Brewery / Distillery / Winery", slug: "brewery-distillery-winery" },
  { label: "Other", slug: "other-on-premise" },
];

export const OFF_PREMISE_CHANNELS: Channel[] = [
  { label: "Independent Specialist Retailer", slug: "independent-retailer" },
  { label: "Deli / Food-Led Retail", slug: "deli-food-retail" },
  { label: "Convenience / Mom & Pop Store", slug: "convenience-store" },
  { label: "Luxury / Prestige Retail", slug: "luxury-retail" },
  { label: "Regional Chain", slug: "regional-chain" },
  { label: "National Chain", slug: "national-chain" },
  { label: "E-commerce / DTC", slug: "ecommerce-dtc" },
  { label: "Local Chain", slug: "local-chain" },
  { label: "Other", slug: "other-off-premise" },
];

export const ALL_CHANNELS: Channel[] = [
  ...ON_PREMISE_CHANNELS,
  ...OFF_PREMISE_CHANNELS,
];

export function channelLabel(slug: string): string {
  return ALL_CHANNELS.find((c) => c.slug === slug)?.label ?? slug;
}
