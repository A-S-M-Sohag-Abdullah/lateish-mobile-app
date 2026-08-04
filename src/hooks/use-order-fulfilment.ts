import { useQuery } from "@tanstack/react-query";

import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import type {
  AutoReorderRule,
  ChannelRow,
  DistributorPerf,
  FinancialImpactOrder,
  ForecastPoint,
  GhostOrder,
  Order,
  OrderStatus,
} from "@/lib/order-fulfilment-data";

// ── API shapes (subset of front-end/src/lib/api-endpoints.ts) ────────────────

interface ApiOrder {
  id: string;
  account_name: string | null;
  distributor_name: string | null;
  qty_cases: number;
  cases_delivered: number;
  fulfilled_at: string | null;
  delivery_end: string | null;
  status: string;
  created_at: string;
}

interface ApiDistributorPerf {
  distributor_name: string;
  total_orders: number;
  fulfilled: number;
  partial: number;
  pending: number;
  failed: number;
  fulfilment_rate: number;
  avg_days: number | null;
  trend: "up" | "down" | "flat";
}

export interface ApiOrderStats {
  fulfilment_rate: number | null;
  avg_days: number | null;
  variance_pct: number | null;
  orders_pending: number;
  orders_partial: number;
  orders_failed: number;
}

export interface FulfilmentAnalytics {
  channels: ChannelRow[];
  forecast: ForecastPoint[] | null;
  ghostOrders: GhostOrder[];
  autoReorderRules: AutoReorderRule[];
  financialOrders: FinancialImpactOrder[];
}

// ── Mapping ──────────────────────────────────────────────────────────────────

function normalizeStatus(raw: string): OrderStatus {
  const s = raw.toLowerCase();
  if (s === "fulfilled") return "Fulfilled";
  if (s === "partial") return "Partial";
  if (s === "failed") return "Failed";
  return "Pending";
}

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000,
  );
}

function mapApiOrder(o: ApiOrder): Order {
  const status = normalizeStatus(o.status);
  const isPending = status === "Pending";
  const actual =
    (o.cases_delivered ?? 0) > 0
      ? o.cases_delivered
      : !isPending
        ? 0
        : null;
  const days = o.fulfilled_at ? daysBetween(o.created_at, o.fulfilled_at) : null;
  const daysOverdue =
    isPending && !!o.delivery_end && new Date(o.delivery_end) < new Date();

  return {
    id: o.id.slice(0, 8).toUpperCase(),
    date: formatOrderDate(o.created_at),
    account: o.account_name ?? "-",
    distributor: o.distributor_name ?? "-",
    expected: o.qty_cases,
    actual,
    status,
    days,
    daysOverdue,
  };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useOrderStats() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  return useQuery({
    queryKey: ["order-stats", orgId],
    queryFn: () =>
      api.get<ApiOrderStats>(`/organizations/${orgId}/mdi/orders/stats`),
    enabled: !!orgId,
  });
}

/** All three order-fulfilment queries + mapping to the mobile shapes. */
export function useOrderFulfilment() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const ordersQuery = useQuery({
    queryKey: ["orders", orgId],
    queryFn: () =>
      api.getPaginated<ApiOrder>(
        `/organizations/${orgId}/mdi/orders?limit=50&page=1`,
      ),
    enabled: !!orgId,
  });

  const distributorsQuery = useQuery({
    queryKey: ["distributor-performance", orgId],
    queryFn: () =>
      api.get<ApiDistributorPerf[]>(
        `/organizations/${orgId}/mdi/orders/distributor-performance`,
      ),
    enabled: !!orgId,
  });

  const analyticsQuery = useQuery({
    queryKey: ["fulfilment-analytics", orgId, 90],
    queryFn: () =>
      api.get<FulfilmentAnalytics>(
        `/organizations/${orgId}/mdi/orders/fulfilment-analytics?period=90`,
      ),
    enabled: !!orgId,
  });

  const orders: Order[] = (ordersQuery.data?.data ?? []).map(mapApiOrder);
  const distributors: DistributorPerf[] = (distributorsQuery.data ?? []).map(
    (d) => ({
      name: d.distributor_name,
      orders: d.total_orders,
      fulfilled: d.fulfilled,
      fulfilmentRate: d.fulfilment_rate,
      avgDays: d.avg_days,
    }),
  );

  return {
    orders,
    ordersLoading: ordersQuery.isLoading,
    distributors,
    distributorsLoading: distributorsQuery.isLoading,
    analytics: analyticsQuery.data,
    analyticsLoading: analyticsQuery.isLoading,
  };
}
