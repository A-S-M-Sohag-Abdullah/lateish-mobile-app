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

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import { CUSTOM_KPIS, type CustomKpi } from "@/lib/performance-data";

const METRIC_TYPES = [
  "Select type",
  "Revenue",
  "Visits",
  "Conversion",
  "BDM Cost per Case",
  "Custom",
] as const;

const TONE_TEXT: Record<CustomKpi["tone"], string> = {
  amber: "text-amber-500",
  green: "text-green-500",
  red: "text-red-500",
};

type SheetState = { mode: "create" | "edit"; kpi?: CustomKpi } | null;

export function CustomKpisTab() {
  const [sheet, setSheet] = useState<SheetState>(null);

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
      {CUSTOM_KPIS.map((kpi) => (
        <KpiCard
          key={kpi.name}
          kpi={kpi}
          onEdit={() => setSheet({ mode: "edit", kpi })}
        />
      ))}

      <KpiFormSheet state={sheet} onClose={() => setSheet(null)} />
    </View>
  );
}

function KpiCard({ kpi, onEdit }: { kpi: CustomKpi; onEdit: () => void }) {
  const colors = useThemeColors();
  const Icon = kpi.icon;
  const exceeded = kpi.tone === "green";

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      {/* Header */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 flex-row gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon color={colors.foreground} size={18} />
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
          <Trash2 color={colors.mutedForeground} size={16} />
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
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <ChartColumn color={colors.mutedForeground} size={16} />
          <Text className="text-sm font-medium">Trend</Text>
        </View>
        <KpiTrendChart data={kpi.trendData} labels={kpi.xLabels} />
      </View>
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
  onClose,
}: {
  state: SheetState;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const editing = state?.mode === "edit";

  // Local, UI-only form state — nothing is persisted in preview.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metric, setMetric] = useState<string>("Select type");
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  // Seed fields when a sheet opens.
  const [seededFor, setSeededFor] = useState<CustomKpi | null | undefined>(
    undefined,
  );
  if (state && seededFor !== state.kpi) {
    setSeededFor(state.kpi ?? null);
    setName(state.kpi?.name ?? "");
    setDescription(state.kpi?.description ?? "");
    setMetric("Select type");
    setUnit("");
    setTarget(state.kpi?.target ?? "");
    setCurrent(state.kpi?.value ?? "");
  }

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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field label="Metric Type">
                    <Dropdown
                      options={METRIC_TYPES}
                      value={metric}
                      onChange={setMetric}
                      size="md"
                      placeholder="Select type"
                    />
                  </Field>
                </View>
                <View className="flex-1">
                  <Field label="Unit">
                    <Input
                      value={unit}
                      onChangeText={setUnit}
                      placeholder="e.g., %, £, visits"
                    />
                  </Field>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field label="Target Value">
                    <Input
                      value={target}
                      onChangeText={setTarget}
                      placeholder="Target to achieve"
                    />
                  </Field>
                </View>
                <View className="flex-1">
                  <Field label="Current Value">
                    <Input
                      value={current}
                      onChangeText={setCurrent}
                      placeholder="Current performance"
                    />
                  </Field>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row justify-end gap-3 pt-1">
                <Pressable
                  onPress={onClose}
                  className="h-11 items-center justify-center rounded-lg border border-border px-5 active:opacity-70"
                >
                  <Text className="text-base font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={onClose}
                  className="h-11 items-center justify-center rounded-lg bg-white px-5 active:opacity-90"
                >
                  <Text className="text-base font-semibold text-black">
                    {editing ? "Update KPI" : "Create KPI"}
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
        {labels.map((l) => (
          <Text key={l} className="text-[10px] text-muted-foreground">
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}
