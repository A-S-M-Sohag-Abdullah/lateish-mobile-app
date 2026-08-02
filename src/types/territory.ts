// Territory types — mirrors front-end/src/lib/api-endpoints.ts (mobile subset).

export type MaturityTier = "alpha" | "beta" | "gamma" | "delta";

export interface ApiTerritory {
  id: string;
  organization_id: string;
  name: string;
  state: string;
  sub_region: string | null;
  maturity_tier: MaturityTier;
  bdm_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTerritoryInput {
  name: string;
  state: string;
  sub_region?: string | null;
  maturity_tier?: MaturityTier;
  bdm_user_id?: string | null;
}

export const MATURITY_TIERS: MaturityTier[] = ["alpha", "beta", "gamma", "delta"];

export const TIER_LABEL: Record<MaturityTier, string> = {
  alpha: "Alpha — Mature",
  beta: "Beta — Growth",
  gamma: "Gamma — Emerging",
  delta: "Delta — Early Stage",
};

export const TIER_SHORT: Record<MaturityTier, string> = {
  alpha: "Alpha",
  beta: "Beta",
  gamma: "Gamma",
  delta: "Delta",
};

export const TIER_DESC: Record<MaturityTier, string> = {
  alpha: "20+ active accounts, 100+ cases/month, brand established 12+ months",
  beta: "10–20 accounts, 40–100 cases/month, 6–12 months in market",
  gamma: "3–10 accounts, under 40 cases/month, 0–6 months in market",
  delta: "1–3 accounts, brand just launched or testing this market",
};

export const TIER_BADGE: Record<MaturityTier, string> = {
  alpha: "border-green-500/30 bg-green-500/10 text-green-400",
  beta: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  gamma: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  delta: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

export function tierFromLabel(label: string): MaturityTier {
  return (
    (Object.keys(TIER_LABEL) as MaturityTier[]).find(
      (k) => TIER_LABEL[k] === label,
    ) ?? "delta"
  );
}
