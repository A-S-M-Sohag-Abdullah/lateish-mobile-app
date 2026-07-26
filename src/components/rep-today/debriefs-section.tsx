import {
  Brain,
  Clock,
  Eye,
  MessageSquare,
  RotateCcw,
  Star,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  DEBRIEFS,
  GAP_ALERTS,
  SCORE_FILTER_OPTIONS,
  scoreTone,
  type Debrief,
  type GapAlert,
} from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";

const TONE_FILL: Record<"green" | "amber" | "red", string> = {
  green: "bg-green-500/15",
  amber: "bg-yellow-500/15",
  red: "bg-red-500/15",
};
const TONE_TEXT: Record<"green" | "amber" | "red", string> = {
  green: "text-green-400",
  amber: "text-yellow-400",
  red: "text-red-400",
};

/** Content shown under the "Debriefs" tab. */
export function DebriefsSection() {
  const [scoreFilter, setScoreFilter] = useState<string>(
    SCORE_FILTER_OPTIONS[0],
  );

  return (
    <View className="gap-5">
      <View className="gap-3">
        <Text className="text-2xl font-bold">Predictive Gap Alerts</Text>
        {GAP_ALERTS.map((alert) => (
          <GapAlertCard key={alert.id} alert={alert} />
        ))}
      </View>

      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-2xl font-bold">Debrief History</Text>
          <Text className="text-base text-muted-foreground">
            Track interaction completeness and gap resolution over time
          </Text>
        </View>

        <View className="self-start">
          <Dropdown
            size="md"
            options={SCORE_FILTER_OPTIONS}
            value={scoreFilter}
            onChange={setScoreFilter}
          />
        </View>

        <EmptyDebriefs />

        {DEBRIEFS.map((debrief) => (
          <DebriefCard key={debrief.id} debrief={debrief} />
        ))}
      </View>
    </View>
  );
}

function GapAlertCard({ alert }: { alert: GapAlert }) {
  const tone = scoreTone(alert.avgPct);
  return (
    <View
      className="gap-2 rounded-xl bg-card p-4"
      style={{ borderLeftWidth: 3, borderLeftColor: alert.accent }}
    >
      <View className="flex-row items-center gap-2">
        <Text className="flex-1 text-base font-semibold">{alert.name}</Text>
        <ScoreBadge label={`${alert.avgPct}% avg`} tone={tone} />
      </View>
      <Text className="text-sm text-muted-foreground">Recurring gaps:</Text>
      <View className="flex-row flex-wrap gap-2">
        {alert.gaps.map((gap) => (
          <GapTag key={gap} label={gap} />
        ))}
      </View>
      <Text className="text-xs text-muted-foreground">{alert.analyzed}</Text>
    </View>
  );
}

function EmptyDebriefs() {
  const colors = useThemeColors();
  return (
    <View className="items-center gap-3 rounded-2xl border border-border bg-card px-6 py-10">
      <Brain color={colors.mutedForeground} size={40} strokeWidth={1.5} />
      <Text className="text-center text-sm leading-5 text-muted-foreground">
        No debriefs yet. Submit an interaction in Rep Today to generate your
        first AI debrief.
      </Text>
    </View>
  );
}

function DebriefCard({ debrief }: { debrief: Debrief }) {
  const colors = useThemeColors();
  const tone = scoreTone(debrief.score);

  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row flex-wrap items-center gap-2">
        <Text className="text-lg font-bold">{debrief.name}</Text>
        <ScoreBadge label={`${debrief.score}%`} tone={tone} />
        {debrief.badge === "Exemplary" ? (
          <View className="flex-row items-center gap-1 rounded-md border border-green-600/50 px-2 py-0.5">
            <Star color="#4ADE80" size={12} />
            <Text className="text-xs font-medium text-green-400">Exemplary</Text>
          </View>
        ) : null}
      </View>

      {debrief.badge === "Revisit Account" ? (
        <View className="flex-row items-center gap-1 self-start rounded-md border border-blue-500/50 px-2 py-0.5">
          <RotateCcw color="#60A5FA" size={12} />
          <Text className="text-xs font-medium text-blue-400">
            Revisit Account
          </Text>
        </View>
      ) : null}

      <Text className="text-sm leading-5 text-muted-foreground">
        {debrief.summary}
      </Text>

      {debrief.tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {debrief.tags.map((tag) => (
            <GapTag key={tag} label={tag} />
          ))}
        </View>
      ) : null}

      {debrief.comment ? (
        <View className="flex-row items-start gap-2">
          <MessageSquare color={colors.mutedForeground} size={16} />
          <Text className="flex-1 text-sm text-muted-foreground">
            {debrief.comment}
          </Text>
        </View>
      ) : null}

      {debrief.revisitReason ? (
        <View className="flex-row gap-2 rounded-xl border border-blue-500/30 bg-blue-500/5 p-3">
          <RotateCcw color="#60A5FA" size={16} />
          <Text className="flex-1 text-sm leading-5 text-blue-300">
            {debrief.revisitReason}
          </Text>
        </View>
      ) : null}

      {debrief.helperTag ? (
        <View className="flex-row items-center gap-2">
          <GapTag label={debrief.helperTag} />
          <Text className="text-xs text-muted-foreground">
            {debrief.helperNote}
          </Text>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
        <View className="flex-row items-center gap-1.5">
          <Clock color={colors.mutedForeground} size={14} />
          <Text className="text-sm text-muted-foreground">{debrief.date}</Text>
        </View>
        <Pressable
          className={cn(
            "h-10 flex-row items-center gap-1.5 rounded-lg px-4 active:opacity-80",
            debrief.reviewRed ? "bg-brand-maroon" : "bg-secondary",
          )}
        >
          <Eye
            color={debrief.reviewRed ? "#FFFFFF" : colors.foreground}
            size={16}
          />
          <Text
            className={cn(
              "text-sm font-medium",
              debrief.reviewRed ? "text-white" : "text-foreground",
            )}
          >
            Review
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ScoreBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "amber" | "red";
}) {
  return (
    <View className={cn("rounded-md px-2 py-0.5", TONE_FILL[tone])}>
      <Text className={cn("text-xs font-semibold", TONE_TEXT[tone])}>
        {label}
      </Text>
    </View>
  );
}

function GapTag({ label }: { label: string }) {
  return (
    <View className="rounded-md border border-border px-2.5 py-1">
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
