import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { SectionCard } from "@/components/dashboard/section-card";
import { CornerAccent } from "@/components/ui/corner-accent";
import { Text } from "@/components/ui/text";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { type PremiseStat } from "@/lib/rep-today-data";
import { cn } from "@/lib/utils";

/** Bright green used for the "Warning (11/17)" status. */
const WARNING_GREEN = "#33FF4B";

/**
 * Premise card background:
 *   linear-gradient(144.81deg,
 *     rgba(255,255,255,0.05) 0.22%, rgba(255,255,255,0.1) 94.79%)
 * 144.81° → start/end unit points.
 */
const PREMISE_GRADIENT = [
  "rgba(255,255,255,0.05)",
  "rgba(255,255,255,0.1)",
] as const;
const PREMISE_START = { x: 0.21, y: 0.09 };
const PREMISE_END = { x: 0.79, y: 0.91 };

/** Standalone card: the AI Insight header and its summary line. */
export function AiInsightCard() {
  const { summary } = useRepTodaySummary();
  const d = summary?.dayStats;
  const line = `${d?.opportunities.count ?? 0} opportunities in play • ${d?.followUpsDue ?? 0} follow-ups due`;
  return (
    <SectionCard
      icon={Sparkles}
      title="AI Insight"
      description={line}
      className="border-0 bg-white/5"
    />
  );
}

function toPremiseStat(
  label: string,
  c?: { total: number; progressing: number; status: string },
): PremiseStat {
  const ratio = c && c.total > 0 ? c.progressing / c.total : 0;
  return {
    label,
    status: c?.status ?? "—",
    detail: c ? `(${c.progressing}/${c.total})` : "",
    tone: ratio >= 0.6 ? "success" : "neutral",
  };
}

/** On premise / Off premise cards, as their own row. */
export function PremiseRow() {
  const { summary } = useRepTodaySummary();
  return (
    <View className="flex-row gap-3">
      <PremiseCell stat={toPremiseStat("On premise", summary?.channels.onPremise)} />
      <PremiseCell stat={toPremiseStat("Off premise", summary?.channels.offPremise)} />
    </View>
  );
}

/** Standalone card holding the AI insight note. */
export function InsightNoteCard() {
  const { summary } = useRepTodaySummary();
  const note =
    summary?.dayStats.aiInsight ||
    "Insights will appear here as your market activity grows.";
  return (
    <View className="rounded-2xl bg-white/5 p-4">
      <Text className="text-sm text-muted-foreground">{note}</Text>
    </View>
  );
}

function PremiseCell({ stat }: { stat: PremiseStat }) {
  const isSuccess = stat.tone === "success";
  return (
    <View className="flex-1 overflow-hidden rounded-xl">
      <LinearGradient
        colors={PREMISE_GRADIENT}
        start={PREMISE_START}
        end={PREMISE_END}
        style={StyleSheet.absoluteFill}
      />
      <CornerAccent />

      <View className="gap-1 p-4">
        <Text className="text-sm text-muted-foreground">{stat.label}</Text>
        <Text
          className="text-lg font-bold"
          style={isSuccess ? { color: WARNING_GREEN } : undefined}
        >
          {stat.status}
          <Text
            className={cn(
              "text-lg font-normal",
              !isSuccess && "text-muted-foreground",
            )}
            style={isSuccess ? { color: WARNING_GREEN } : undefined}
          >
            {" "}
            {stat.detail}
          </Text>
        </Text>
      </View>
    </View>
  );
}
