import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Star,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { CenteredPopup } from "@/components/ui/centered-popup";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { ALL_CHANNELS } from "@/lib/channels";
import { channelSearchTerm } from "@/lib/channel-search-terms";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { ApiTerritory } from "@/types/territory";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Candidate {
  channel: string; // taxonomy slug
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string;
  rating: number | null;
  include: boolean;
}

interface ApiProcessResult {
  newAccounts: number;
  rowsSkipped: number;
  errors: string[];
}

export interface AutoPopulateSheetProps {
  visible: boolean;
  onClose: () => void;
  orgId: string;
  territory: ApiTerritory;
  brandName: string | null;
  channels: { channel: string; role: string }[];
}

type Step = "configure" | "searching" | "review" | "done";

const PLACES_TEXTSEARCH =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";

// ── Google Places Text Search (direct REST — no JS SDK on native, same
// pattern as GooglePlacesInput). One call per channel search term. ────────────
async function textSearchOnce(
  term: string,
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<
  {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    rating?: number;
    geometry?: { location?: { lat: number; lng: number } };
  }[]
> {
  const params = new URLSearchParams({
    query: term,
    location: `${lat},${lng}`,
    radius: String(Math.round(radiusMeters)),
    key: env.googleMapsApiKey,
  });
  const res = await fetch(`${PLACES_TEXTSEARCH}?${params}`);
  const json = await res.json();
  if (json.status === "OK") return json.results ?? [];
  if (json.status === "ZERO_RESULTS") return [];
  if (json.status === "REQUEST_DENIED") {
    throw new Error(
      "Google's Places API rejected the request — the Places API is likely not enabled for this key's project. Enable \"Places API\" in Google Cloud Console, then try again.",
    );
  }
  // OVER_QUERY_LIMIT / INVALID_REQUEST for one channel shouldn't fail the run.
  return [];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AutoPopulateSheet({
  visible,
  onClose,
  orgId,
  territory,
  brandName,
  channels,
}: AutoPopulateSheetProps) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  // Market-target channel labels matched to the taxonomy by exact label (see
  // create-target-wizard.tsx, which stores the canonical label verbatim).
  const matchedSlugs = useMemo(
    () =>
      channels
        .map((c) => ALL_CHANNELS.find((ch) => ch.label === c.channel)?.slug)
        .filter(
          (slug): slug is string => !!slug && channelSearchTerm(slug) !== null,
        ),
    [channels],
  );
  const unmatchedChannels = useMemo(
    () =>
      channels.filter(
        (c) =>
          !ALL_CHANNELS.some(
            (ch) =>
              ch.label === c.channel && channelSearchTerm(ch.slug) !== null,
          ),
      ),
    [channels],
  );

  const [step, setStep] = useState<Step>("configure");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(matchedSlugs),
  );
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [searchError, setSearchError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiProcessResult | null>(null);

  const { data: existingPlaceIds } = useQuery({
    queryKey: ["accounts-place-ids", orgId],
    queryFn: async () => {
      const rows = await api.getAll<{ place_id: string | null }>(
        `/organizations/${orgId}/accounts`,
      );
      return new Set(rows.map((r) => r.place_id).filter(Boolean) as string[]);
    },
    enabled: visible && !!orgId,
  });

  function reset() {
    setStep("configure");
    setSelected(new Set(matchedSlugs));
    setProgress({ done: 0, total: 0 });
    setSearchError(null);
    setCandidates([]);
    setSubmitting(false);
    setSubmitError(null);
    setResult(null);
  }

  // Start clean every time the sheet is opened — the component stays mounted
  // between opens (and may be reused for a different target), so the initial
  // useState value alone would go stale.
  useEffect(() => {
    if (visible) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function handleClose() {
    reset();
    onClose();
  }

  function toggleChannel(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function runSearch() {
    setSearchError(null);
    setStep("searching");
    const slugs = Array.from(selected);
    setProgress({ done: 0, total: slugs.length });

    try {
      if (!env.googleMapsApiKey) {
        throw new Error(
          "Missing Google Maps API key — auto-populate can't run.",
        );
      }
      const radiusMeters = territory.search_radius_km * 1000;
      const found = new Map<string, Candidate>();

      for (let i = 0; i < slugs.length; i++) {
        const term = channelSearchTerm(slugs[i]);
        if (term) {
          const results = await textSearchOnce(
            term,
            territory.center_lat as number,
            territory.center_lng as number,
            radiusMeters,
          );
          for (const r of results) {
            if (
              !r.place_id ||
              found.has(r.place_id) ||
              existingPlaceIds?.has(r.place_id)
            ) {
              continue;
            }
            found.set(r.place_id, {
              channel: slugs[i],
              name: r.name ?? "Unknown",
              address: r.formatted_address ?? "",
              latitude: r.geometry?.location?.lat ?? null,
              longitude: r.geometry?.location?.lng ?? null,
              placeId: r.place_id,
              rating: r.rating ?? null,
              include: true,
            });
          }
        }
        setProgress({ done: i + 1, total: slugs.length });
      }

      setCandidates(Array.from(found.values()));
      setStep("review");
    } catch (err) {
      setSearchError((err as Error).message);
      setStep("configure");
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const rows = candidates
        .filter((c) => c.include)
        .map((c) => ({
          name: c.name,
          address: c.address || "Unknown address",
          city: null,
          state: null,
          channel: c.channel,
          account_type: null,
          notes: null,
          latitude: c.latitude,
          longitude: c.longitude,
        }));
      const res = await api.post<ApiProcessResult>(
        `/organizations/${orgId}/imports/accounts`,
        {
          filename: `auto-populate-${territory.name}.csv`,
          source: "auto_populate",
          territory_id: territory.id,
          rows,
        },
      );
      queryClient.invalidateQueries({ queryKey: ["accounts", orgId] });
      setResult(res);
      setStep("done");
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const includedCount = candidates.filter((c) => c.include).length;

  return (
    <CenteredPopup visible={visible} onClose={handleClose} heightRatio={0.9}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-start justify-between gap-3 px-6 pt-6">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <Sparkles color={colors.primary} size={18} />
              <Text className="text-xl font-bold">Auto-Populate Accounts</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              {territory.name}
              {brandName ? ` — ${brandName}` : ""} · searches Google Places
              within {territory.search_radius_km}km
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Close"
            onPress={handleClose}
            className="h-9 w-9 items-center justify-center rounded-lg active:bg-white/10"
          >
            <X color={colors.foreground} size={20} />
          </Pressable>
        </View>

        {/* ── configure ── */}
        {step === "configure" ? (
          <>
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-4 px-6 py-4"
              keyboardShouldPersistTaps="handled"
            >
              {searchError ? (
                <View className="flex-row items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <AlertCircle color="#EF4444" size={16} />
                  <Text className="flex-1 text-sm text-red-400">
                    {searchError}
                  </Text>
                </View>
              ) : null}

              <Text className="text-sm text-muted-foreground">
                Pre-checked from this target&apos;s channels. Uncheck any you
                don&apos;t want to search this time.
              </Text>

              <View className="gap-1.5 rounded-lg border border-border p-3">
                {matchedSlugs.length === 0 ? (
                  <Text className="py-4 text-center text-sm text-muted-foreground">
                    None of this target&apos;s channels can be auto-searched —
                    add accounts manually instead.
                  </Text>
                ) : (
                  matchedSlugs.map((slug) => {
                    const ch = ALL_CHANNELS.find((c) => c.slug === slug)!;
                    const on = selected.has(slug);
                    return (
                      <Pressable
                        key={slug}
                        onPress={() => toggleChannel(slug)}
                        className={cn(
                          "flex-row items-center gap-2.5 px-1 py-1.5",
                          !on && "opacity-40",
                        )}
                      >
                        <View
                          className="h-4 w-4 items-center justify-center rounded border"
                          style={{
                            backgroundColor: on ? ch.color : "transparent",
                            borderColor: ch.color,
                          }}
                        >
                          {on ? (
                            <CheckCircle2 color="#FFFFFF" size={12} />
                          ) : null}
                        </View>
                        <View
                          className="h-3 w-3 rounded-full border border-white/60"
                          style={{ backgroundColor: ch.color }}
                        />
                        <Text className="flex-1 text-sm">{ch.label}</Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              {unmatchedChannels.length > 0 ? (
                <Text className="text-xs text-muted-foreground">
                  Not searchable here — add manually:{" "}
                  {unmatchedChannels.map((c) => c.channel).join(", ")}
                </Text>
              ) : null}
            </ScrollView>

            <View className="flex-row gap-3 px-6 pb-4 pt-3">
              <Pressable
                onPress={handleClose}
                className="h-12 flex-1 items-center justify-center rounded-xl border border-border bg-secondary active:opacity-80"
              >
                <Text className="text-base font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={runSearch}
                disabled={selected.size === 0}
                className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
              >
                <Sparkles color={colors.primaryForeground} size={16} />
                <Text className="text-base font-semibold text-primary-foreground">
                  Search {selected.size > 0 ? selected.size : ""}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {/* ── searching ── */}
        {step === "searching" ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-center text-sm font-medium">
              Searching {progress.done} of {progress.total} channels…
            </Text>
            <Text className="text-center text-xs text-muted-foreground">
              Looking up venues near {territory.name}.
            </Text>
          </View>
        ) : null}

        {/* ── review ── */}
        {step === "review" ? (
          <>
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-4 px-6 py-4"
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-row gap-3">
                {[
                  { label: "Found", value: candidates.length },
                  { label: "Selected", value: includedCount },
                  { label: "Channels", value: selected.size },
                ].map((c) => (
                  <View
                    key={c.label}
                    className="flex-1 rounded-lg border border-border p-3"
                  >
                    <Text className="text-xs text-muted-foreground">
                      {c.label}
                    </Text>
                    <Text className="mt-0.5 text-lg font-semibold">
                      {c.value}
                    </Text>
                  </View>
                ))}
              </View>

              {candidates.length === 0 ? (
                <View className="rounded-lg border border-dashed border-border p-6">
                  <Text className="text-center text-sm text-muted-foreground">
                    No new venues found — every match may already be an existing
                    account, or try different channels.
                  </Text>
                </View>
              ) : (
                candidates.map((c, i) => (
                  <View
                    key={c.placeId}
                    className="flex-row items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <Pressable
                      onPress={() =>
                        setCandidates((prev) =>
                          prev.map((row, idx) =>
                            idx === i ? { ...row, include: !row.include } : row,
                          ),
                        )
                      }
                      className="mt-0.5 h-5 w-5 items-center justify-center rounded border"
                      style={{
                        backgroundColor: c.include ? "#7C1D1E" : "transparent",
                        borderColor: c.include
                          ? "#7C1D1E"
                          : colors.mutedForeground,
                      }}
                    >
                      {c.include ? (
                        <CheckCircle2 color="#FFFFFF" size={14} />
                      ) : null}
                    </Pressable>
                    <View className="min-w-0 flex-1 gap-1">
                      <Text
                        className={cn(
                          "text-sm font-medium",
                          !c.include && "text-muted-foreground line-through",
                        )}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      <Text
                        className="text-xs text-muted-foreground"
                        numberOfLines={1}
                      >
                        {c.address || "No address"}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        {c.rating != null ? (
                          <View className="flex-row items-center gap-0.5">
                            <Star color={colors.mutedForeground} size={12} />
                            <Text className="text-xs text-muted-foreground">
                              {c.rating}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <SelectField
                        value={
                          ALL_CHANNELS.find((ch) => ch.slug === c.channel)
                            ?.label ?? c.channel
                        }
                        options={ALL_CHANNELS.map((ch) => ch.label)}
                        onChange={(label) => {
                          const slug =
                            ALL_CHANNELS.find((ch) => ch.label === label)
                              ?.slug ?? c.channel;
                          setCandidates((prev) =>
                            prev.map((row, idx) =>
                              idx === i ? { ...row, channel: slug } : row,
                            ),
                          );
                        }}
                      />
                    </View>
                  </View>
                ))
              )}

              {submitError ? (
                <View className="flex-row items-start gap-2">
                  <AlertCircle color="#EF4444" size={16} />
                  <Text className="flex-1 text-sm text-red-400">
                    {submitError}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View className="flex-row gap-3 px-6 pb-4 pt-3">
              <Pressable
                onPress={() => setStep("configure")}
                disabled={submitting}
                className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary active:opacity-80 disabled:opacity-50"
              >
                <ChevronLeft color={colors.foreground} size={16} />
                <Text className="text-base font-semibold">Back</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={submitting || includedCount === 0}
                className="h-12 flex-[2] flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryForeground}
                  />
                ) : null}
                <Text className="text-base font-semibold text-primary-foreground">
                  {submitting ? "Adding…" : `Add ${includedCount} to Call List`}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {/* ── done ── */}
        {step === "done" && result ? (
          <>
            <ScrollView
              className="flex-1"
              contentContainerClassName="items-center gap-4 px-6 py-10"
            >
              <CheckCircle2 color="#22C55E" size={56} />
              <Text className="text-2xl font-bold">Added to Call List</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {result.newAccounts} new account
                {result.newAccounts !== 1 ? "s" : ""} added — they&apos;re on
                the Sales Map now.
              </Text>
              {result.rowsSkipped > 0 ? (
                <View className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <Text className="mb-1 text-sm font-medium text-amber-400">
                    {result.rowsSkipped} skipped
                  </Text>
                  {result.errors.slice(0, 5).map((e, i) => (
                    <Text key={i} className="text-xs text-amber-300">
                      • {e}
                    </Text>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View className="px-6 pb-4 pt-3">
              <Pressable
                onPress={handleClose}
                className="h-12 items-center justify-center rounded-xl bg-primary active:opacity-90"
              >
                <Text className="text-base font-semibold text-primary-foreground">
                  Done
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </CenteredPopup>
  );
}
