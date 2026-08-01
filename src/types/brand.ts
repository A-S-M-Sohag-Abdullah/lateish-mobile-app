// Brand types — kept in sync with front-end/src/types/brand.ts (mobile subset).

export type BrandCategory =
  | "rum"
  | "tequila"
  | "wine"
  | "beer"
  | "whisky"
  | "gin"
  | "vodka"
  | "other";

export const BRAND_CATEGORIES: BrandCategory[] = [
  "rum",
  "tequila",
  "wine",
  "beer",
  "whisky",
  "gin",
  "vodka",
  "other",
];

export const BRAND_CATEGORY_LABEL: Record<BrandCategory, string> = {
  rum: "Rum",
  tequila: "Tequila",
  wine: "Wine",
  beer: "Beer",
  whisky: "Whisky",
  gin: "Gin",
  vodka: "Vodka",
  other: "Other",
};

/** Badge classes per category (mirrors the web colour scheme). */
export const BRAND_CATEGORY_BADGE: Record<BrandCategory, string> = {
  rum: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  tequila: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  wine: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  beer: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  whisky: "border-amber-700/30 bg-amber-700/10 text-amber-500",
  gin: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  vodka: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  other: "border-border bg-secondary text-muted-foreground",
};

/** Shape returned by GET /organizations/:orgId/brands. */
export interface ApiBrand {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
}

export function toBrandCategory(raw: string | null): BrandCategory {
  return raw && (BRAND_CATEGORIES as string[]).includes(raw)
    ? (raw as BrandCategory)
    : "other";
}

export function brandInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "BR"
  );
}
