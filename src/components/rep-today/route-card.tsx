import {
  CircleAlert,
  CircleCheck,
  MapPin,
  Play,
  Route,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  ROUTE,
  ROUTE_PROGRESS,
  ROUTE_STOPS,
  type RouteStop,
  type StopStatus,
} from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

const STATUS: Record<
  StopStatus,
  { icon: LucideIcon; color: string; dot: string; label: string }
> = {
  green: { icon: CircleCheck, color: "#22C55E", dot: "bg-green-500", label: "Green" },
  amber: { icon: TriangleAlert, color: "#EAB308", dot: "bg-yellow-500", label: "Amber" },
  red: { icon: CircleAlert, color: "#EF4444", dot: "bg-red-500", label: "Red" },
};

export function RouteCard() {
  const colors = useThemeColors();
  const pct = ROUTE_PROGRESS.total
    ? ROUTE_PROGRESS.completed / ROUTE_PROGRESS.total
    : 0;

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Route color={colors.foreground} size={22} />
        <Text className="text-2xl font-bold">{ROUTE.title}</Text>
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <View className="rounded-md border border-green-600/50 px-2.5 py-1">
          <Text className="text-xs font-medium text-green-400">
            ↗ {ROUTE.conversion}
          </Text>
        </View>
        <View className="rounded-md border border-yellow-600/50 px-2.5 py-1">
          <Text className="text-xs font-medium text-yellow-400">
            {ROUTE.sampleData}
          </Text>
        </View>
        <Text className="text-sm text-muted-foreground">{ROUTE.stopsLabel}</Text>
      </View>

      <Pressable className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-secondary active:opacity-80">
        <Play color={colors.foreground} size={18} fill={colors.foreground} />
        <Text className="text-base font-semibold">Start Route</Text>
      </Pressable>

      {/* Progress */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold">Route Progress</Text>
          <Text className="text-base font-semibold">
            {ROUTE_PROGRESS.completed} / {ROUTE_PROGRESS.total}
          </Text>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-white/10">
          <View
            className="h-full rounded-full bg-foreground"
            style={{ width: `${Math.max(pct, 0.06) * 100}%` }}
          />
        </View>
        <View className="flex-row items-center gap-4">
          <Legend dot="bg-green-500" label={`${ROUTE_PROGRESS.green} Green`} />
          <Legend dot="bg-yellow-500" label={`${ROUTE_PROGRESS.amber} Amber`} />
          <Legend dot="bg-red-500" label={`${ROUTE_PROGRESS.red} Red`} />
        </View>
      </View>

      {/* Stops */}
      <View className="gap-3">
        {ROUTE_STOPS.map((stop, i) => (
          <StopRow key={stop.id} stop={stop} active={i === 0} />
        ))}
      </View>
    </View>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={cn("h-2.5 w-2.5 rounded-full", dot)} />
      <Text className="text-sm text-muted-foreground">{label}</Text>
    </View>
  );
}

function StopRow({ stop, active }: { stop: RouteStop; active: boolean }) {
  const colors = useThemeColors();
  const status = STATUS[stop.status];
  const StatusIcon = status.icon;

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl border p-4",
        active ? "border-brand-maroon bg-secondary" : "border-border bg-card",
      )}
    >
      {/* Radio + number */}
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full border-2",
          active ? "border-brand-maroon" : "border-muted-foreground",
        )}
      >
        {active ? <View className="h-3 w-3 rounded-full bg-brand-maroon" /> : null}
      </View>
      <Text className="text-base font-bold text-muted-foreground">
        {stop.index}
      </Text>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold">{stop.name}</Text>
        <View className="flex-row items-center gap-1">
          <MapPin color={colors.mutedForeground} size={13} />
          <Text className="text-sm text-muted-foreground">{stop.location}</Text>
        </View>
      </View>

      <StatusIcon color={status.color} size={22} />
    </View>
  );
}
