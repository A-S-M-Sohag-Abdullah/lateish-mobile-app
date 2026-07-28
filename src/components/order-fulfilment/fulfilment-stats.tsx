import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react-native";
import { View } from "react-native";

import { StatCard } from "@/components/ui/stat-card";
import { FULFILMENT_STATS as S } from "@/lib/order-fulfilment-data";

const NAVY = ["#132B5C", "#0B1833"] as const;

export function FulfilmentStats() {
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
