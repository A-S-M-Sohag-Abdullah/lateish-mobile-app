import { useQuery } from "@tanstack/react-query";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react-native";
import { View } from "react-native";

import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import { type Order, type OrderStatus } from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

// Same gradient as the Rep Today stat cards: the top layer is opaque so the
// white layer beneath is hidden. 144.81° → start/end unit points.
const ORDER_GRADIENT: GradientColors = ["#132B5C", "#0B1833"];
const ORDER_START = { x: 0.21, y: 0.09 };
const ORDER_END = { x: 0.79, y: 0.91 };

const STATUS_MAP: Record<string, OrderStatus> = {
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  delayed: "Delayed",
  pending: "Received",
  fulfilled: "Delivered",
  partial: "Processing",
  failed: "Delayed",
};

interface ApiRepOrder {
  id: string;
  account_name: string | null;
  status: string;
  created_at: string;
}

type StatusStyle = {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  badge: string;
  badgeText: string;
};

const STATUS: Record<OrderStatus, StatusStyle> = {
  Delivered: {
    icon: CircleCheck,
    iconColor: "#22C55E",
    iconBg: "bg-green-500/15",
    badge: "border border-border",
    badgeText: "text-foreground",
  },
  Shipped: {
    icon: Truck,
    iconColor: "#A78BFA",
    iconBg: "bg-violet-500/15",
    badge: "bg-violet-500/20",
    badgeText: "text-violet-300",
  },
  Processing: {
    icon: Clock,
    iconColor: "#9CA3AF",
    iconBg: "bg-secondary",
    badge: "border border-border",
    badgeText: "text-foreground",
  },
  Delayed: {
    icon: CircleAlert,
    iconColor: "#EF4444",
    iconBg: "bg-red-500/15",
    badge: "bg-red-500/20",
    badgeText: "text-red-300",
  },
  Received: {
    icon: Package,
    iconColor: "#9CA3AF",
    iconBg: "bg-secondary",
    badge: "border border-border",
    badgeText: "text-foreground",
  },
};

/** Content shown under the "Orders" tab. */
export function OrdersSection() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const { data: page } = useQuery({
    queryKey: ["mdi-orders", orgId],
    queryFn: () =>
      api.getPaginated<ApiRepOrder>(
        `/organizations/${orgId}/mdi/orders?limit=20&page=1`,
      ),
    enabled: !!orgId,
  });

  const orders: Order[] = (page?.data ?? []).map((o) => ({
    id: o.id,
    name: o.account_name ?? "Unknown Venue",
    orderNo: `#${o.id.slice(0, 8).toUpperCase()}`,
    date: new Date(o.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    status: STATUS_MAP[o.status?.toLowerCase()] ?? "Received",
  }));

  const counts = {
    received: orders.filter((o) => o.status === "Received").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delayed: orders.filter((o) => o.status === "Delayed").length,
  };

  return (
    <View className="gap-5">
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Package color="#A78BFA" size={22} />
          <Text className="text-2xl font-bold">My Order Status</Text>
        </View>

        <View className="flex-row gap-3">
          <StatCard colors={ORDER_GRADIENT} start={ORDER_START} end={ORDER_END} label="Received" value={String(counts.received)} className="h-24" />
          <StatCard colors={ORDER_GRADIENT} start={ORDER_START} end={ORDER_END} label="Processing" value={String(counts.processing)} className="h-24" />
        </View>
        <View className="flex-row gap-3">
          <StatCard colors={ORDER_GRADIENT} start={ORDER_START} end={ORDER_END} label="Shipped" value={String(counts.shipped)} className="h-24" />
          <StatCard colors={ORDER_GRADIENT} start={ORDER_START} end={ORDER_END} label="Delayed" value={String(counts.delayed)} className="h-24" />
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-2xl font-bold">Recent Orders</Text>
        {orders.length === 0 ? (
          <Text className="py-6 text-center text-sm text-muted-foreground">
            No orders yet.
          </Text>
        ) : (
          orders.map((order) => <OrderRow key={order.id} order={order} />)
        )}
      </View>
    </View>
  );
}

function OrderRow({ order }: { order: Order }) {
  const style = STATUS[order.status];
  const Icon = style.icon;
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-[#34344C]/50 bg-card p-4">
      <View
        className={cn(
          "h-10 w-10 items-center justify-center rounded-full",
          style.iconBg,
        )}
      >
        <Icon color={style.iconColor} size={18} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold" numberOfLines={1}>
          {order.name}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {order.orderNo} • {order.date}
        </Text>
      </View>

      <View className={cn("rounded-md px-2.5 py-1", style.badge)}>
        <Text className={cn("text-xs font-semibold", style.badgeText)}>
          {order.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}
