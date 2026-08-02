import { useQuery } from "@tanstack/react-query";

import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
};

/** GET /organizations/:orgId/rep-today/summary — mirrors the web RepTodaySummary. */
export interface RepTodaySummary {
  dayStats: {
    activeVenues: number;
    opportunities: { count: number; value: number };
    followUpsDue: number;
    conversionRate: number;
    aiInsight: string;
  };
  momentum: {
    status: "Growing" | "Flat" | "Declining";
    trend: string;
    note: string;
    isSample: boolean;
    drivers: string[];
    brandPills: { name: string; trend: "up" | "flat" | "down" }[];
  };
  channels: {
    onPremise: { total: number; progressing: number; status: string; trend: string };
    offPremise: { total: number; progressing: number; status: string; trend: string };
  };
  networkInsights: string[];
  suggestedSteps: string[];
}

/**
 * Shared rep-today summary query — feeds the dashboard's Alerts, Next Best
 * Actions and Channel Suggestions cards (all one query, matching the web).
 */
export function useRepTodaySummary() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const symbol = CURRENCY_SYMBOL[currentOrg?.currency ?? ""] ?? "£";

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["rep-today-summary", orgId, 30],
    queryFn: () =>
      api.get<RepTodaySummary>(
        `/organizations/${orgId}/rep-today/summary?period=30`,
      ),
    enabled: !!orgId,
  });

  return {
    summary: data,
    isLoading: !!orgId && isLoading,
    isFetching,
    refetch,
    symbol,
  };
}
