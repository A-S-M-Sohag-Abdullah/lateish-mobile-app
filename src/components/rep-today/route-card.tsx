import { useQuery } from "@tanstack/react-query";
import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  MapPin,
  Play,
  Route,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  type RouteStop,
  type StopStatus,
} from "@/lib/rep-today-route-data";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RouteInteraction {
  id: string;
  account_name: string | null;
  next_action: string | null;
  due_date: string | null;
  account: { city: string | null; state: string | null } | null;
}

const STATUS: Record<
  StopStatus,
  { icon: LucideIcon; color: string; dot: string; label: string }
> = {
  green: { icon: CircleCheck, color: "#22C55E", dot: "bg-green-500", label: "Green" },
  amber: { icon: TriangleAlert, color: "#EAB308", dot: "bg-yellow-500", label: "Amber" },
  red: { icon: CircleAlert, color: "#EF4444", dot: "bg-red-500", label: "Red" },
};

const URGENCY: Record<StopStatus, number> = { red: 0, amber: 1, green: 2 };

function dueDateStatus(dueDateStr: string): StopStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "red";
  if (diffDays <= 1) return "amber";
  return "green";
}

function formatNextAction(next: string | null): string {
  if (!next) return "Follow-up";
  return next.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RouteCard() {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ["log-interactions", "route", orgId],
    queryFn: () =>
      api.get<RouteInteraction[]>(`/organizations/${orgId}/log-interactions/route`),
    enabled: !!orgId,
  });

  const stops: RouteStop[] = interactions
    .filter((li) => li.due_date && li.account_name)
    .map((li) => ({
      id: li.id,
      index: 0,
      name: li.account_name as string,
      location: formatNextAction(li.next_action),
      status: dueDateStatus(li.due_date as string),
    }))
    .sort((a, b) => URGENCY[a.status] - URGENCY[b.status])
    .map((s, i) => ({ ...s, index: i + 1 }));

  const total = stops.length;
  const green = stops.filter((s) => s.status === "green").length;
  const amber = stops.filter((s) => s.status === "amber").length;
  const red = stops.filter((s) => s.status === "red").length;

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Route color={colors.foreground} size={22} />
        <Text className="text-2xl font-bold">Today's Route</Text>
      </View>

      <Text className="text-sm text-muted-foreground">{total} stops</Text>

      <Pressable className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-secondary active:opacity-80">
        <Play color={colors.foreground} size={18} fill={colors.foreground} />
        <Text className="text-base font-semibold">Start Route</Text>
      </Pressable>

      {isLoading ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">Loading…</Text>
      ) : total === 0 ? (
        <View className="items-center gap-2 rounded-2xl border border-border bg-card p-6">
          <ClipboardList color={colors.mutedForeground} size={28} />
          <Text className="text-sm font-medium text-muted-foreground">
            No upcoming follow-ups
          </Text>
          <Text className="text-center text-xs text-muted-foreground">
            Log an interaction with a due date to build your route.
          </Text>
        </View>
      ) : (
        <>
          {/* Progress */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold">Route Progress</Text>
              <Text className="text-base font-semibold">0 / {total}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-white/10">
              <View className="h-full rounded-full bg-foreground" style={{ width: "6%" }} />
            </View>
            <View className="flex-row items-center gap-4">
              <Legend dot="bg-green-500" label={`${green} Green`} />
              <Legend dot="bg-yellow-500" label={`${amber} Amber`} />
              <Legend dot="bg-red-500" label={`${red} Red`} />
            </View>
          </View>

          {/* Stops */}
          <View className="gap-3">
            {stops.map((stop, i) => (
              <StopRow key={stop.id} stop={stop} active={i === 0} />
            ))}
          </View>
        </>
      )}
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
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full border-2",
          active ? "border-brand-maroon" : "border-muted-foreground",
        )}
      >
        {active ? <View className="h-3 w-3 rounded-full bg-brand-maroon" /> : null}
      </View>
      <Text className="text-base font-bold text-muted-foreground">{stop.index}</Text>

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
