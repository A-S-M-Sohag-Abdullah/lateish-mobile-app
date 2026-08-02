import { useQuery } from "@tanstack/react-query";

import type { Confidence } from "@/components/dashboard/badges";
import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import {
  type TargetRecord,
  type TargetSummary,
} from "@/lib/market-targets-data";
import type { ApiMarketTarget } from "@/types/market-target";

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
};

function formatPeriod(start: string, end: string): string {
  if (!start || !end) return "—";
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

/** Map an API market target into the display record the UI already renders. */
function mapTarget(t: ApiMarketTarget): TargetRecord {
  const location = t.territory_name
    ? `${t.territory_name}${t.territory_state ? `, ${t.territory_state}` : ""}`
    : (t.brand_name ?? "—");

  const confidence = (t.confidence.charAt(0).toUpperCase() +
    t.confidence.slice(1) +
    " Confidence") as Confidence;

  return {
    id: t.id,
    location,
    confidence,
    status: t.status,
    cases: { current: t.case_actual, target: t.case_target },
    distribution: {
      current: t.distribution_actual ?? 0,
      target: t.distribution_target ?? 0,
    },
    dateRange: formatPeriod(t.period_start, t.period_end),
    dayCurrent: t.day_of_period,
    dayTotal: t.total_days,
    timeElapsedPct: t.total_days > 0 ? t.day_of_period / t.total_days : 0,
    apSpend: t.ap_actual ?? 0,
    apBudget: t.ap_target,
    momentumNote: t.notes || t.pace,
    activityLabel: t.pace,
    createdAt: t.created_at,
  };
}

function computeSummary(records: TargetRecord[], symbol: string): TargetSummary {
  const totalCases = records.reduce((s, r) => s + r.cases.current, 0);
  const totalDist = records.reduce((s, r) => s + r.distribution.current, 0);
  const totalAP = records.reduce((s, r) => s + r.apSpend, 0);
  const behind = records.filter((r) => r.status === "Behind").length;
  const ahead = records.filter((r) => r.status === "Ahead").length;
  const momentum = behind > ahead ? "Behind" : ahead > behind ? "Ahead" : "On Track";

  return {
    cases: totalCases.toLocaleString("en-US"),
    distribution: String(totalDist),
    apSpend: `${symbol}${totalAP.toLocaleString("en-US")}`,
    markets: String(records.length),
    momentum,
  };
}

export function useMarketTargets() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const symbol = CURRENCY_SYMBOL[currentOrg?.currency ?? ""] ?? "£";

  const { data, isLoading } = useQuery({
    queryKey: ["market-targets", orgId],
    queryFn: () =>
      api.getPaginated<ApiMarketTarget>(`/organizations/${orgId}/market-targets`),
    enabled: !!orgId,
  });

  const records = (data?.data ?? []).map(mapTarget);
  const summary = computeSummary(records, symbol);

  return { records, summary, isLoading: !!orgId && isLoading, orgId, symbol };
}
