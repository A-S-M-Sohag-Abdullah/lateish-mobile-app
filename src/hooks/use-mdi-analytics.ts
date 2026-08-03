import { useQuery } from "@tanstack/react-query";

import { currencySymbol } from "@/hooks/use-bdm-efficiency";
import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import type { ApiMdiAnalytics } from "@/types/mdi";

/**
 * Fetches the MDI analytics payload that powers the Analytics tab.
 * Mirrors the web app's `mdiAnalyticsApi.get`.
 */
export function useMdiAnalytics(period = 90) {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const symbol = currencySymbol(currentOrg?.currency);

  const { data, isLoading } = useQuery({
    queryKey: ["mdi-analytics", orgId, period],
    queryFn: () =>
      api.get<ApiMdiAnalytics>(
        `/organizations/${orgId}/mdi/intents/analytics?period=${period}`,
      ),
    enabled: !!orgId,
  });

  return { data, isLoading, symbol };
}
