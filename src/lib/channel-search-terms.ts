// Maps the 31-slug channel taxonomy (see ./channels.ts) to a Google Places
// Text Search query fragment, for the auto-populate feature — e.g. searching
// "cocktail bar" near a territory's center for `modern-cocktail-bar`.
//
// Ported verbatim from front-end/src/lib/channel-search-terms.ts — the channel
// taxonomy in ./channels.ts matches the web's slug-for-slug.
//
// This is a best-effort mapping, not a precise one — several channels describe
// a business model or scale, not a venue type Places can search for directly,
// so they fall back to the closest generic proxy.
//
// `null` means the channel has no physical-venue equivalent Places can search
// for at all (e.g. "E-commerce / DTC" isn't a place) — the auto-populate UI
// treats these as unsearchable, distinct from a channel simply missing a
// mapping.
export const CHANNEL_SEARCH_TERMS: Record<string, string | null> = {
  // On-premise
  "modern-cocktail-bar": "cocktail bar",
  "aspiring-cocktail-bar": "cocktail bar",
  "high-volume-cocktail-bar": "cocktail bar",
  "premium-nightlife": "nightclub",
  "beer-shot-dive-bar": "dive bar",
  "agave-specialist": "agave bar",
  "hatted-restaurant": "fine dining restaurant",
  "elevated-dining": "upscale restaurant",
  "casual-food-beverage": "casual dining restaurant",
  "modern-pub": "gastropub",
  "traditional-pub": "pub",
  "hotel-bar": "hotel bar",
  "premium-group-operator": "restaurant",
  "catering-events": "catering company",
  "outdoor-seasonal-venue": "rooftop bar",
  "lgbtq-venue": "gay bar",
  "location-specific-concept": null,
  "food-service-operator": "restaurant",
  "sports-cinema-event": "sports bar",
  "private-members-club": "private members club",
  "brewery-distillery-winery": "brewery",
  "other-on-premise": null,

  // Off-premise
  "independent-retailer": "liquor store",
  "deli-food-retail": "deli",
  "convenience-store": "convenience store",
  "luxury-retail": "wine shop",
  "regional-chain": "liquor store",
  "national-chain": "liquor store",
  "ecommerce-dtc": null,
  "local-chain": "liquor store",
  "other-off-premise": null,
};

export function channelSearchTerm(slug: string): string | null {
  return CHANNEL_SEARCH_TERMS[slug] ?? null;
}
