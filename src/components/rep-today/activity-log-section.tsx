import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageSquare } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { type ActivityEntry, type ActivityStatus } from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

interface LogInteraction {
  id: string;
  account_name: string | null;
  interaction_type: string;
  brands: { brand_name: string | null; status: string }[];
  notes: string | null;
  next_action: string | null;
  created_at: string;
  account: { city: string | null; state: string | null } | null;
}

function outcomeStatus(brands: LogInteraction["brands"]): ActivityStatus {
  const statuses = (brands ?? []).map((b) => b.status);
  if (statuses.some((s) => s === "blocked" || s === "lost")) return "Blocked";
  return "Progressed";
}

function titleCase(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Content shown under the "Activity Log" tab. */
export function ActivityLogSection() {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const { data: page, isLoading } = useQuery({
    queryKey: ["log-interactions", "list", orgId],
    queryFn: () =>
      api.getPaginated<LogInteraction>(
        `/organizations/${orgId}/log-interactions?limit=20&page=1`,
      ),
    enabled: !!orgId,
  });

  const entries: ActivityEntry[] = (page?.data ?? []).map((a) => ({
    id: a.id,
    name: a.account_name ?? "Unknown account",
    icon: MessageSquare,
    date: new Date(a.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    status: outcomeStatus(a.brands),
    location: [a.account?.city, titleCase(a.interaction_type)]
      .filter(Boolean)
      .join(" • "),
    tags: (a.brands ?? [])
      .map((b) => b.brand_name)
      .filter(Boolean) as string[],
    description: a.notes ?? "",
    next: a.next_action ?? "",
  }));

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-2xl font-bold">Activity History</Text>
        <Text className="text-base text-muted-foreground">
          Your logged interactions and outcomes
        </Text>
      </View>

      {isLoading ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">Loading…</Text>
      ) : entries.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          No activity logged yet.
        </Text>
      ) : (
        entries.map((entry) => <ActivityCard key={entry.id} entry={entry} colors={colors} />)
      )}
    </View>
  );
}

function ActivityCard({
  entry,
  colors,
}: {
  entry: ActivityEntry;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const Icon = entry.icon;
  return (
    <View className="gap-3 rounded-[12px] border border-white/5 bg-white/5 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Icon color={colors.foreground} size={18} />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold">{entry.name}</Text>
            <Text className="text-sm text-muted-foreground">{entry.location}</Text>
          </View>
        </View>

        <View className="items-end gap-1">
          <Text className="text-sm text-muted-foreground">{entry.date}</Text>
          <StatusBadge status={entry.status} />
        </View>
      </View>

      {entry.tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <View key={tag} className="rounded-lg bg-secondary px-3 py-1.5">
              <Text className="text-sm text-foreground">{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {entry.description ? (
        <Text className="text-sm leading-5 text-muted-foreground">
          {entry.description}
        </Text>
      ) : null}

      {entry.next ? (
        <View className="flex-row items-center gap-2 border-t border-border pt-3">
          <ArrowRight color={colors.mutedForeground} size={16} />
          <Text className="flex-1 text-sm text-muted-foreground">
            Next: {entry.next}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const progressed = status === "Progressed";
  return (
    <View
      className={cn(
        "rounded-md px-2.5 py-1",
        progressed ? "bg-green-500/15" : "bg-red-500/15",
      )}
    >
      <Text
        className={cn(
          "text-xs font-medium",
          progressed ? "text-green-400" : "text-red-400",
        )}
      >
        {status}
      </Text>
    </View>
  );
}
