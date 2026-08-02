import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Clock, Mic, Search, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VoiceNote {
  id: string;
  transcription: string;
  duration_secs: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  tags: string[];
  account_name: string | null;
  created_at: string;
}

interface VoiceSummary {
  summary: string;
  themes: string[];
  actionItems: string[];
}

const SENTIMENTS: { key: "positive" | "neutral" | "negative"; emoji: string }[] = [
  { key: "positive", emoji: "👍" },
  { key: "neutral", emoji: "😐" },
  { key: "negative", emoji: "👎" },
];

const SENTIMENT_STYLE: Record<string, string> = {
  positive: "border-green-500/20 bg-green-500/10",
  neutral: "border-border bg-muted",
  negative: "border-red-500/20 bg-red-500/10",
};

type SubTab = "notes" | "insights";

/** Content shown under the "Voice Notes" tab. */
export function VoiceNotesSection() {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const [subTab, setSubTab] = useState<SubTab>("notes");
  const [sentFilter, setSentFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["voice-notes", orgId],
    queryFn: () => api.get<VoiceNote[]>(`/organizations/${orgId}/voice-notes?limit=50`),
    enabled: !!orgId,
  });

  const {
    mutate: generateSummary,
    data: aiSummary,
    isPending: summaryLoading,
    error: summaryError,
  } = useMutation({
    mutationFn: () =>
      api.post<VoiceSummary>(`/organizations/${orgId}/voice-notes/ai-summary`, {
        limit: 20,
      }),
  });

  const filtered = notes.filter((n) => {
    const q = query.toLowerCase();
    const matchSearch =
      !q ||
      n.transcription.toLowerCase().includes(q) ||
      (n.account_name ?? "").toLowerCase().includes(q) ||
      (n.tags ?? []).some((t) => t.toLowerCase().includes(q));
    const matchSent = !sentFilter || n.sentiment === sentFilter;
    return matchSearch && matchSent;
  });

  return (
    <View className="gap-4 rounded-2xl border border-border p-4">
      {/* Sub-tabs */}
      <View className="flex-row self-start rounded-lg bg-secondary p-1">
        {(
          [
            { key: "notes", label: `Notes (${notes.length})` },
            { key: "insights", label: "AI Insights" },
          ] as { key: SubTab; label: string }[]
        ).map((tab) => {
          const active = tab.key === subTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSubTab(tab.key)}
              className={cn("rounded-md px-3 py-1.5", active && "bg-white/15")}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {subTab === "notes" ? (
        <>
          <View className="flex-row items-center gap-3">
            <View className="h-12 flex-1 flex-row items-center gap-2.5 rounded-xl bg-muted px-4">
              <View className="shrink-0">
                <Search color={colors.mutedForeground} size={20} />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search transcriptions, tags, accounts..."
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 text-base text-foreground"
              />
            </View>
            <View className="flex-row gap-2">
              {SENTIMENTS.map(({ key, emoji }) => {
                const active = sentFilter === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSentFilter(active ? null : key)}
                    className={cn(
                      "h-9 w-9 items-center justify-center rounded-md",
                      active ? "bg-white" : "bg-secondary",
                    )}
                  >
                    <Text className="text-lg">{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.mutedForeground} />
            </View>
          ) : notes.length === 0 ? (
            <View className="items-center gap-2 py-12">
              <Mic color={colors.mutedForeground} size={40} />
              <Text className="text-sm font-medium text-muted-foreground">
                No voice notes yet
              </Text>
              <Text className="text-center text-xs text-muted-foreground">
                Record field notes on the web app — they&apos;ll appear here.
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <Text className="py-8 text-center text-sm text-muted-foreground">
              No notes match your filters.
            </Text>
          ) : (
            <View className="gap-3">
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note} colors={colors} />
              ))}
            </View>
          )}
        </>
      ) : (
        <View className="gap-4">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Brain color={colors.foreground} size={20} />
              <Text className="text-lg font-bold">LATE(ish) Insights</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              LATE(ish) reads your recent voice notes and surfaces what matters
            </Text>
          </View>

          <Pressable
            onPress={() => generateSummary()}
            disabled={summaryLoading || notes.length === 0}
            className={cn(
              "h-11 flex-row items-center justify-center gap-2 rounded-lg bg-primary",
              (summaryLoading || notes.length === 0) && "opacity-50",
            )}
          >
            {summaryLoading ? (
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            ) : (
              <Sparkles color={colors.primaryForeground} size={16} />
            )}
            <Text className="text-sm font-medium text-primary-foreground">
              {summaryLoading ? "Generating…" : "Generate LATE(ish) Summary"}
            </Text>
          </Pressable>

          {notes.length === 0 && !summaryLoading ? (
            <View className="items-center gap-1 py-2">
              <Text className="text-sm font-medium text-muted-foreground">
                We don&apos;t have enough data on you yet
              </Text>
              <Text className="text-center text-xs text-muted-foreground">
                Record a few voice notes first — LATE(ish) will read them and
                surface what matters.
              </Text>
            </View>
          ) : null}

          {summaryError ? (
            <Text className="text-sm text-red-400">
              {(summaryError as Error).message}
            </Text>
          ) : null}

          {aiSummary && !summaryLoading ? (
            <View className="gap-4">
              {aiSummary.summary ? (
                <View className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Text className="text-sm leading-5">{aiSummary.summary}</Text>
                </View>
              ) : null}
              {aiSummary.themes.length > 0 ? (
                <View className="gap-2">
                  <Text className="text-xs font-medium text-muted-foreground">
                    KEY THEMES
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {aiSummary.themes.map((t) => (
                      <View key={t} className="rounded-md bg-secondary px-2 py-0.5">
                        <Text className="text-xs font-medium text-secondary-foreground">
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
              {aiSummary.actionItems.length > 0 ? (
                <View className="gap-2">
                  <Text className="text-xs font-medium text-muted-foreground">
                    ACTION ITEMS
                  </Text>
                  <View className="gap-2">
                    {aiSummary.actionItems.map((a, i) => (
                      <View key={i} className="flex-row items-start gap-2">
                        <View className="h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                          <Text className="text-xs font-medium text-primary">
                            {i + 1}
                          </Text>
                        </View>
                        <Text className="flex-1 text-sm">{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function NoteCard({
  note,
  colors,
}: {
  note: VoiceNote;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const sentEmoji = SENTIMENTS.find((s) => s.key === note.sentiment)?.emoji;
  const date = new Date(note.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <Clock color={colors.mutedForeground} size={12} />
          <Text className="text-xs text-muted-foreground">
            {date}
            {note.duration_secs ? ` • ${note.duration_secs}s` : ""}
          </Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-1">
          {note.account_name ? (
            <View className="rounded-md bg-secondary px-2 py-0.5">
              <Text className="text-xs font-medium text-secondary-foreground">
                {note.account_name}
              </Text>
            </View>
          ) : null}
          {sentEmoji ? (
            <View
              className={cn(
                "rounded-md border px-2 py-0.5",
                SENTIMENT_STYLE[note.sentiment ?? "neutral"],
              )}
            >
              <Text className="text-xs">{sentEmoji}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text className="text-sm leading-5">{note.transcription}</Text>
      {note.tags && note.tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-1">
          {note.tags.map((tag) => (
            <View key={tag} className="rounded-md border border-border px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
