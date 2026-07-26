import { ArrowRight, Lightbulb } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  ACTIVITY_ENTRIES,
  ACTIVITY_NOTE,
  type ActivityEntry,
} from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

/** Content shown under the "Activity Log" tab. */
export function ActivityLogSection() {
  const colors = useThemeColors();
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-2xl font-bold">Activity History</Text>
        <Text className="text-base text-muted-foreground">
          Example entries showing what good activity logging looks like
        </Text>
      </View>

      <View className="flex-row gap-2 rounded-[12px] border border-white/5 bg-white/5 p-4">
        <Lightbulb color={colors.mutedForeground} size={18} />
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground">
            {ACTIVITY_NOTE.title}
          </Text>
          <Text className="text-sm leading-5 text-muted-foreground">
            {ACTIVITY_NOTE.body}
          </Text>
        </View>
      </View>

      {ACTIVITY_ENTRIES.map((entry) => (
        <ActivityCard key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

function ActivityCard({ entry }: { entry: ActivityEntry }) {
  const colors = useThemeColors();
  const Icon = entry.icon;

  return (
    <View className="gap-3 rounded-[12px] border border-white/5 bg-white/5 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Icon color={colors.foreground} size={18} />
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-base font-semibold">{entry.name}</Text>
              <View className="rounded-md border border-border px-2 py-0.5">
                <Text className="text-xs font-semibold text-muted-foreground">
                  EXAMPLE
                </Text>
              </View>
            </View>
            <Text className="text-sm text-muted-foreground">
              {entry.location}
            </Text>
          </View>
        </View>

        <View className="items-end gap-1">
          <Text className="text-sm text-muted-foreground">{entry.date}</Text>
          <StatusBadge status={entry.status} />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <View key={tag} className="rounded-lg bg-secondary px-3 py-1.5">
            <Text className="text-sm text-foreground">{tag}</Text>
          </View>
        ))}
      </View>

      <Text className="text-sm leading-5 text-muted-foreground">
        {entry.description}
      </Text>

      <View className="flex-row items-center gap-2 border-t border-border pt-3">
        <ArrowRight color={colors.mutedForeground} size={16} />
        <Text className="flex-1 text-sm text-muted-foreground">
          Next: {entry.next}
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: ActivityEntry["status"] }) {
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
