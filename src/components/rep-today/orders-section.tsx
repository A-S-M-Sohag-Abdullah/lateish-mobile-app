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
import {
  ORDER_STATUS_COUNTS,
  RECENT_ORDERS,
  type Order,
  type OrderStatus,
} from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

// Same gradient as the Rep Today stat cards: the top layer is opaque so the
// white layer beneath is hidden. 144.81° → start/end unit points.
const ORDER_GRADIENT: GradientColors = ["#132B5C", "#0B1833"];
const ORDER_START = { x: 0.21, y: 0.09 };
const ORDER_END = { x: 0.79, y: 0.91 };

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
  return (
    <View className="gap-5">
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Package color="#A78BFA" size={22} />
          <Text className="text-2xl font-bold">My Order Status</Text>
        </View>

        <View className="flex-row gap-3">
          <StatCard
            colors={ORDER_GRADIENT}
            start={ORDER_START}
            end={ORDER_END}
            label="Received"
            value={String(ORDER_STATUS_COUNTS.received)}
            className="h-24"
          />
          <StatCard
            colors={ORDER_GRADIENT}
            start={ORDER_START}
            end={ORDER_END}
            label="Processing"
            value={String(ORDER_STATUS_COUNTS.processing)}
            className="h-24"
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            colors={ORDER_GRADIENT}
            start={ORDER_START}
            end={ORDER_END}
            label="Shipped"
            value={String(ORDER_STATUS_COUNTS.shipped)}
            className="h-24"
          />
          <StatCard
            colors={ORDER_GRADIENT}
            start={ORDER_START}
            end={ORDER_END}
            label="Delayed"
            value={String(ORDER_STATUS_COUNTS.delayed)}
            className="h-24"
          />
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-2xl font-bold">Recent Orders</Text>
        {RECENT_ORDERS.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
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
