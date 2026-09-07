import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChartColumn,
  Minus,
  Plus,
  SquarePen,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { FormError } from "@/components/auth/form-error";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { usePerformanceDashboard } from "@/hooks/use-performance-dashboard";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiPerfKpi } from "@/types/performance";

interface KpiRow {
  id: string;
  emoji: string;
  name: string;
  description: string;
  value: string;
  target: string;
  pct: number;
  tone: "green" | "amber" | "red";
  trend: "up" | "down" | "flat";
  trendData: number[];
  xLabels: string[];
  targetValue: number;
  currentValue: number;
}

const TONE_TEXT: Record<KpiRow["tone"], string> = {
  amber: "text-amber-500",
  green: "text-green-500",
  red: "text-red-500",
};

function mapKpi(k: ApiPerfKpi): KpiRow {
  const ratio = k.targetValue > 0 ? k.currentValue / k.targetValue : 0;
  const pct = Math.round(ratio * 100);
  const fmt = (n: number) => `${n}${k.unit ? `${k.unit}` : ""}`;
  return {
    id: k.id,
    emoji: k.emoji || "📊",
    name: k.name,
    description: k.description,
    value: fmt(k.currentValue),
    target: fmt(k.targetValue),
    pct: Math.min(100, pct),
    tone: ratio >= 1 ? "green" : ratio >= 0.5 ? "amber" : "red",
    trend: k.trend,
    trendData: (k.trendData ?? []).map((p) => p.value),
    xLabels: (k.trendData ?? []).map((p) => p.month),
    targetValue: k.targetValue,
    currentValue: k.currentValue,
  };
}

type SheetState = { mode: "create" | "edit"; kpi?: KpiRow } | null;

export function CustomKpisTab() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();
  const { data, isLoading } = usePerformanceDashboard(30);
  const [sheet, setSheet] = useState<SheetState>(null);

  const kpis = (data?.kpis ?? []).map(mapKpi);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["performance-dashboard", orgId, 30] });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/organizations/${orgId}/kpi-definitions/${id}`),
    onSuccess: invalidate,
  });

  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text className="text-2xl font-bold">Custom KPI Tracker</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          Track and monitor your custom business metrics and performance
          indicators
        </Text>
      </View>

      {/* Add KPI */}
      <Pressable
        onPress={() => setSheet({ mode: "create" })}
        className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-white active:opacity-90"
      >
        <Plus color="#000000" size={20} />
        <Text className="text-base font-semibold text-black">Add KPI</Text>
      </Pressable>

      {/* KPI cards */}
      {isLoading ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">
          Loading KPIs…
        </Text>
      ) : kpis.length === 0 ? (
        <View className="items-center rounded-2xl border border-border bg-card p-8">
          <Text className="text-center text-sm text-muted-foreground">
            No KPIs yet. Add one to start tracking.
          </Text>
        </View>
      ) : (
        kpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            onEdit={() => setSheet({ mode: "edit", kpi })}
            onDelete={() => remove.mutate(kpi.id)}
          />
        ))
      )}

      <KpiFormSheet
        state={sheet}
        orgId={orgId}
        onClose={() => setSheet(null)}
        onSaved={invalidate}
      />
    </View>
  );
}

function KpiCard({
  kpi,
  onEdit,
  onDelete,
}: {
  kpi: KpiRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  const exceeded = kpi.tone === "green";
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      {/* Header */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 flex-row gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Text style={{ fontSize: 18 }}>{kpi.emoji}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold">{kpi.name}</Text>
            <Text className="text-xs text-muted-foreground">
              {kpi.description}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          {kpi.trend === "up" ? (
            <TrendingUp color="#22C55E" size={16} />
          ) : kpi.trend === "down" ? (
            <TrendingDown color="#EF4444" size={16} />
          ) : (
            <Minus color="#F59E0B" size={16} />
          )}
          <Pressable onPress={onEdit} hitSlop={8}>
            <SquarePen color={colors.mutedForeground} size={16} />
          </Pressable>
          {confirmDelete ? (
            <View className="flex-row items-center gap-1.5">
              <Pressable onPress={onDelete} hitSlop={6}>
                <Text className="text-xs font-medium text-red-500">Yes</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmDelete(false)} hitSlop={6}>
                <Text className="text-xs text-muted-foreground">No</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setConfirmDelete(true)} hitSlop={8}>
              <Trash2 color={colors.mutedForeground} size={16} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Value + badge */}
      <View className="gap-1">
        <Text className={cn("text-2xl font-bold", TONE_TEXT[kpi.tone])}>
          {kpi.value}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">
            Target: {kpi.target}
          </Text>
          <View
            className={cn(
              "rounded-md px-2 py-0.5",
              exceeded ? "bg-white" : "bg-secondary",
            )}
          >
            <Text
              className={cn(
                "text-xs font-medium",
                exceeded ? "text-black" : "text-muted-foreground",
              )}
            >
              {kpi.pct}%
            </Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View className="gap-1.5">
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted-foreground">
            Progress to Target
          </Text>
          <Text className="text-sm font-medium">{kpi.pct}%</Text>
        </View>
        <Progress value={kpi.pct / 100} indicatorClassName="bg-white" />
      </View>

      {/* Trend */}
      {kpi.trendData.length > 0 ? (
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <ChartColumn color={colors.mutedForeground} size={16} />
            <Text className="text-sm font-medium">Trend</Text>
          </View>
          <KpiTrendChart data={kpi.trendData} labels={kpi.xLabels} />
        </View>
      ) : null}
    </View>
  );
}

// ── Create / Edit KPI sheet ──────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium">{label}</Text>
      {children}
    </View>
  );
}

function KpiFormSheet({
  state,
  orgId,
  onClose,
  onSaved,
}: {
  state: SheetState;
  orgId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const editing = state?.mode === "edit";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  // Seed fields when a sheet opens.
  const [seededFor, setSeededFor] = useState<KpiRow | null | undefined>(
    undefined,
  );
  if (state && seededFor !== state.kpi) {
    setSeededFor(state.kpi ?? null);
    setName(state.kpi?.name ?? "");
    setDescription(state.kpi?.description ?? "");
    setUnit("");
    setTarget(state.kpi ? String(state.kpi.targetValue) : "");
    setCurrent(state.kpi ? String(state.kpi.currentValue) : "");
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        target_value: target !== "" ? Number(target) : null,
        current_value: current !== "" ? Number(current) : null,
      };
      return editing && state?.kpi
        ? api.patch(`/organizations/${orgId}/kpi-definitions/${state.kpi.id}`, payload)
        : api.post(`/organizations/${orgId}/kpi-definitions`, {
            ...payload,
            unit: unit.trim() || null,
          });
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  return (
    <Modal
      visible={!!state}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            className="rounded-t-3xl border border-border bg-popover"
            style={{ paddingBottom: insets.bottom }}
          >
            <ScrollView
              contentContainerClassName="gap-4 p-5"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Text className="text-xl font-bold">
                    {editing ? "Edit KPI" : "Create New KPI"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Define a custom KPI to track your specific business metrics
                  </Text>
                </View>
                <Pressable onPress={onClose} hitSlop={8}>
                  <X color={colors.mutedForeground} size={22} />
                </Pressable>
              </View>

              <Field label="KPI Name">
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Monthly Revenue Growth"
                />
              </Field>

              <Field label="Description">
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what this KPI measures"
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  textAlignVertical="top"
                  className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-3 text-base text-foreground"
                />
              </Field>

              {!editing ? (
                <Field label="Unit">
                  <Input
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="e.g., %, £, visits"
                  />
                </Field>
              ) : null}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field label="Target Value">
                    <Input
                      value={target}
                      onChangeText={setTarget}
                      placeholder="Target to achieve"
                      keyboardType="numeric"
                    />
                  </Field>
                </View>
                <View className="flex-1">
                  <Field label="Current Value">
                    <Input
                      value={current}
                      onChangeText={setCurrent}
                      placeholder="Current performance"
                      keyboardType="numeric"
                    />
                  </Field>
                </View>
              </View>

              <FormError error={save.error} />

              {/* Actions */}
              <View className="flex-row justify-end gap-3 pt-1">
                <Pressable
                  onPress={onClose}
                  className="h-11 items-center justify-center rounded-lg border border-border px-5 active:opacity-70"
                >
                  <Text className="text-base font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => save.mutate()}
                  disabled={!name.trim() || save.isPending}
                  className="h-11 items-center justify-center rounded-lg bg-white px-5 active:opacity-90 disabled:opacity-50"
                >
                  <Text className="text-base font-semibold text-black">
                    {save.isPending
                      ? "Saving…"
                      : editing
                        ? "Update KPI"
                        : "Create KPI"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const TREND_H = 96;
const TREND_PAD_T = 8;
const TREND_PAD_B = 18;
const TREND_PAD_L = 26;

function KpiTrendChart({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) {
  const [w, setW] = useState(0);
  const max = Math.max(...data) * 1.25 || 1;
  const plotH = TREND_H - TREND_PAD_T - TREND_PAD_B;
  const innerW = Math.max(0, w - TREND_PAD_L - 6);
  const x = (i: number) =>
    TREND_PAD_L + (data.length <= 1 ? 0 : (i * innerW) / (data.length - 1));
  const y = (v: number) => TREND_PAD_T + (1 - v / max) * plotH;
  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <View className="gap-1">
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <Svg width={w} height={TREND_H}>
            {[0, 0.5, 1].map((g) => (
              <Line
                key={g}
                x1={TREND_PAD_L}
                x2={w - 6}
                y1={TREND_PAD_T + g * plotH}
                y2={TREND_PAD_T + g * plotH}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
            <Polyline
              points={points}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            {data.map((v, i) => (
              <Circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#FFFFFF" />
            ))}
          </Svg>
        ) : (
          <View style={{ height: TREND_H }} />
        )}
      </View>
      <View
        className="flex-row justify-between"
        style={{ paddingLeft: TREND_PAD_L }}
      >
        {labels.map((l, i) => (
          <Text key={`${l}-${i}`} className="text-[10px] text-muted-foreground">
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}
