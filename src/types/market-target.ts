// Market target types — mirrors front-end/src/lib/api-endpoints.ts (subset).

export interface ApiMarketTarget {
  id: string;
  organization_id: string;
  brand_id: string;
  brand_name: string | null;
  territory_id: string | null;
  territory_name: string | null;
  territory_state: string | null;
  period_start: string;
  period_end: string;
  channels: { channel: string; role: string }[];
  case_target: number;
  case_actual: number;
  distribution_target: number | null;
  distribution_actual: number | null;
  ap_target: number;
  ap_actual: number | null;
  confidence: "high" | "medium" | "low";
  notes: string | null;
  // Server-computed
  status: "Ahead" | "On Track" | "Behind";
  pace: "Ahead of plan" | "On pace";
  day_of_period: number;
  total_days: number;
  created_at: string;
}
