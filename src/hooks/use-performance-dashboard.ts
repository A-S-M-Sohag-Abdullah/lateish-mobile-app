import { useQuery } from "@tanstack/react-query";

import { currencySymbol } from "@/hooks/use-bdm-efficiency";
import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import type { ApiPerformanceData } from "@/types/performance";

/**
 * Fetches the Performance Dashboard payload that powers the Activity Logs
 * screen (leaderboard, bonus, depletions, vip, kpis, integrations).
 * Mirrors the web app's `performanceDashboardApi.get`.
 */
export function usePerformanceDashboard(period = 30) {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const symbol = currencySymbol(currentOrg?.currency);

  const { data, isLoading } = useQuery({
    queryKey: ["performance-dashboard", orgId, period],
    queryFn: () =>
      api.get<ApiPerformanceData>(
        `/organizations/${orgId}/performance-dashboard?period=${period}`,
      ),
    enabled: !!orgId,
  });

  return { data, isLoading, symbol };
}
