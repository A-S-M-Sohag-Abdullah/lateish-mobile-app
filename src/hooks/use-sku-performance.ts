import { useQuery } from "@tanstack/react-query";

import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import type { SkuPerformanceData } from "@/lib/sku-performance-data";

/**
 * Fetches SKU performance for the org. Mirrors the web app's
 * `skuPerformanceApi.get`. The API response carries a few extra chart fields
 * the mobile view ignores, so the mobile `SkuPerformanceData` (a subset) types
 * the parts we render.
 */
export function useSkuPerformance(period = 30) {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  return useQuery({
    queryKey: ["sku-performance", orgId, period],
    queryFn: () =>
      api.get<SkuPerformanceData>(
        `/organizations/${orgId}/sku-performance?period=${period}`,
      ),
    enabled: !!orgId,
  });
}
