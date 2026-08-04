import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react-native";
import { View } from "react-native";

import { StatCard } from "@/components/ui/stat-card";
import { useOrderStats } from "@/hooks/use-order-fulfilment";

const NAVY = ["#132B5C", "#0B1833"] as const;

export function FulfilmentStats() {
  const { data } = useOrderStats();
  const S = {
    fulfilmentRate: Math.round(data?.fulfilment_rate ?? 0),
    avgDays: data?.avg_days != null ? Math.round(data.avg_days * 10) / 10 : 0,
    variancePct: data?.variance_pct != null ? Math.round(data.variance_pct * 10) / 10 : 0,
    ordersPending: data?.orders_pending ?? 0,
    ordersPartial: data?.orders_partial ?? 0,
    ordersFailed: data?.orders_failed ?? 0,
  };
  const variance = S.variancePct;

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCard
          label="Fulfilment Rate"
          value={`${S.fulfilmentRate}%`}
          colors={NAVY}
          className="h-28"
        />
        <StatCard
          label="Avg. Time to Fulfilment"
          value={`${S.avgDays} days`}
          caption="From order to delivery"
          colors={NAVY}
          className="h-28"
        />
      </View>
      <View className="flex-row gap-3">
        <StatCard
          label="Variance vs. Expected"
          value={`${Math.abs(variance)}%`}
          valueClassName={
            variance < 0 ? "text-red-500" : variance > 0 ? "text-emerald-500" : "text-white"
          }
          trailing={
            variance < 0 ? (
              <ArrowDownRight color="#EF4444" size={20} />
            ) : variance > 0 ? (
              <ArrowUpRight color="#10B981" size={20} />
            ) : (
              <Minus color="#94A3B8" size={20} />
            )
          }
          caption="Actual vs expected cases"
          colors={NAVY}
          className="h-28"
        />
        <StatCard
          label="Orders Pending"
          value={`${S.ordersPending}`}
          caption={`${S.ordersPartial} partial, ${S.ordersFailed} failed`}
          colors={NAVY}
          className="h-28"
        />
      </View>
    </View>
  );
}
