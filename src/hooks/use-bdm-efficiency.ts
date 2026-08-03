import { useQuery } from "@tanstack/react-query";

import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import type { BdmEfficiencyData } from "@/types/bdm-efficiency";

/** Maps the mobile period labels to the endpoint's day window. */
const PERIOD_DAYS: Record<string, number> = {
  "This Month": 30,
  "Last Month": 30,
  "This Quarter": 90,
  "This Year": 365,
};

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
};

export const currencySymbol = (currency?: string) =>
  CURRENCY_SYMBOL[currency ?? ""] ?? "£";

/**
 * Fetches the single `bdm-efficiency` payload that powers every tab of the BDM
 * screen. Mirrors the web app's `bdmEfficiencyApi.get`.
 */
export function useBdmEfficiency(periodLabel: string) {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const currency = currentOrg?.currency ?? "GBP";
  const symbol = currencySymbol(currency);
  const period = PERIOD_DAYS[periodLabel] ?? 30;

  const { data, isLoading } = useQuery({
    queryKey: ["bdm-efficiency", orgId, period, currency],
    queryFn: () =>
      api.get<BdmEfficiencyData>(
        `/organizations/${orgId}/bdm-efficiency?period=${period}&currency=${currency}`,
      ),
    enabled: !!orgId,
  });

  return { data, isLoading, symbol };
}
