import { useQuery } from "@tanstack/react-query";
import { Minus, Package, TrendingDown, TrendingUp } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BrandInteraction {
  id: string;
  brands: { brand_name: string | null; status: string }[];
}

type Trend = "up" | "down" | "flat";

/** Content shown under the "Brands" tab. */
export function BrandsSection() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ["log-interactions", "brands-panel", orgId],
    queryFn: () =>
      api
        .getPaginated<BrandInteraction>(
          `/organizations/${orgId}/log-interactions?limit=200&page=1&period=30d`,
        )
        .then((r) => r.data),
    enabled: !!orgId,
  });

  const brandMap = new Map<
    string,
    { positive: number; negative: number; total: number }
  >();
  interactions.forEach((i) => {
    (i.brands ?? []).forEach((b) => {
      if (!b.brand_name) return;
      const cur = brandMap.get(b.brand_name) ?? { positive: 0, negative: 0, total: 0 };
      if (b.status === "progressed" || b.status === "first_listing") cur.positive++;
      else if (b.status === "blocked" || b.status === "lost") cur.negative++;
      cur.total++;
      brandMap.set(b.brand_name, cur);
    });
  });

  const brandList = [...brandMap.entries()]
    .map(([name, s]) => ({
      name,
      trend: (s.positive > s.negative && s.positive >= 2
        ? "up"
        : s.negative > s.positive
          ? "down"
          : "flat") as Trend,
      total: s.total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <View className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Package color="#A78BFA" size={22} />
          <Text className="text-2xl font-bold">
            Brand Momentum (Last 30 days)
          </Text>
        </View>
        <Text className="text-base leading-6 text-muted-foreground">
          Aggregated from interaction outcomes - single source of truth
        </Text>
      </View>

      {isLoading ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">Loading…</Text>
      ) : brandList.length === 0 ? (
        <View className="items-center rounded-2xl border border-border bg-card px-6 py-12">
          <Text className="text-center text-base leading-6 text-muted-foreground">
            No brand interactions logged yet. Start logging interactions to see
            brand momentum
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {brandList.map((b) => (
            <BrandPill key={b.name} name={b.name} trend={b.trend} />
          ))}
        </View>
      )}
    </View>
  );
}

function BrandPill({ name, trend }: { name: string; trend: Trend }) {
  const style =
    trend === "up"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : trend === "down"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-400";
  const color = trend === "up" ? "#22C55E" : trend === "down" ? "#EF4444" : "#F59E0B";
  return (
    <View className={cn("flex-row items-center gap-1 rounded-md border px-3 py-1", style)}>
      <Text className={cn("text-sm font-medium", style)}>{name}</Text>
      {trend === "up" ? (
        <TrendingUp color={color} size={12} />
      ) : trend === "down" ? (
        <TrendingDown color={color} size={12} />
      ) : (
        <Minus color={color} size={12} />
      )}
    </View>
  );
}
