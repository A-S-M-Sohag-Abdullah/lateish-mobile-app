import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";

import { Button } from "@/components/ui/button";
import { CenteredPopup } from "@/components/ui/centered-popup";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useMarketTargets } from "@/hooks/use-market-targets";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { type PrevMonthValue, type TargetRecord } from "@/lib/market-targets-data";
import { cn } from "@/lib/utils";

interface RecordActualsFormProps {
  visible: boolean;
  onClose: () => void;
}

const SELECT_PLACEHOLDER = "Select target";
const NO_DATA: PrevMonthValue = { month: "On record", value: "—" };

/** Build the on-record comparison cards from the selected target's live values. */
function comparisonFor(t?: TargetRecord) {
  if (!t) {
    return {
      target: NO_DATA,
      month: NO_DATA,
      cases: NO_DATA,
      distribution: NO_DATA,
      apSpend: NO_DATA,
      notes: NO_DATA,
    };
  }
  return {
    target: { month: "Selected", value: t.location },
    month: { month: "Period", value: t.dateRange },
    cases: { month: "On record", value: t.cases.current.toLocaleString("en-US") },
    distribution: { month: "On record", value: String(t.distribution.current) },
    apSpend: { month: "On record", value: t.apSpend.toLocaleString("en-US") },
    notes: { month: "On record", value: t.momentumNote || "—" },
  } satisfies Record<string, PrevMonthValue>;
}

/**
 * "Record Monthly Actuals" — a single-step form popup. Each field sits beside a
 * card showing the target's currently-recorded value. Submits real actuals.
 */
export function RecordActualsForm({ visible, onClose }: RecordActualsFormProps) {
  const queryClient = useQueryClient();
  // Reuses the page's cached market-targets query.
  const { records, orgId } = useMarketTargets();
  const targetOptions = [SELECT_PLACEHOLDER, ...records.map((t) => t.location)];

  const [target, setTarget] = useState(SELECT_PLACEHOLDER);
  const [cases, setCases] = useState("");
  const [distribution, setDistribution] = useState("");
  const [apSpend, setApSpend] = useState("");
  const [notes, setNotes] = useState("");

  const selected = records.find((r) => r.location === target);
  const prev = comparisonFor(selected);

  const record = useMutation({
    mutationFn: () =>
      api.patch(`/organizations/${orgId}/market-targets/${selected?.id}/actuals`, {
        case_actual: Number(cases),
        distribution_actual: distribution !== "" ? Number(distribution) : null,
        ap_actual: apSpend !== "" ? Number(apSpend) : null,
        notes: notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-targets", orgId] });
      close();
    },
  });

  function close() {
    setTarget(SELECT_PLACEHOLDER);
    setCases("");
    setDistribution("");
    setApSpend("");
    setNotes("");
    record.reset();
    onClose();
  }

  const canSubmit = !!selected && cases !== "" && !record.isPending;

  return (
    <CenteredPopup visible={visible} onClose={close}>
      <View className="flex-1">
        <View className="gap-2 px-6 pt-6">
          <Text className="text-3xl font-bold">Record Monthly Actuals</Text>
          <Text className="text-base text-muted-foreground">
            Log actual performance against your market target.
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-6 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FieldRow label="Market Target *" prev={prev.target}>
            <Dropdown
              className="h-12"
              options={targetOptions}
              value={target}
              onChange={setTarget}
            />
          </FieldRow>

          <FieldRow label="Period" prev={prev.month}>
            <DisabledField value={selected ? selected.dateRange : "—"} />
          </FieldRow>

          <FieldRow label="Cases sold" prev={prev.cases}>
            <Input
              className="h-12"
              keyboardType="number-pad"
              placeholder="e.g. 1250"
              value={cases}
              onChangeText={setCases}
            />
          </FieldRow>

          <FieldRow label="Distribution points" prev={prev.distribution}>
            <Input
              className="h-12"
              keyboardType="number-pad"
              placeholder="e.g. 15"
              value={distribution}
              onChangeText={setDistribution}
            />
          </FieldRow>

          <FieldRow label="A&P Spend" prev={prev.apSpend}>
            <Input
              className="h-12"
              keyboardType="number-pad"
              placeholder="e.g. 1200"
              value={apSpend}
              onChangeText={setApSpend}
            />
          </FieldRow>

          <FieldRow label="Notes (optional)" prev={prev.notes}>
            <NotesField value={notes} onChangeText={setNotes} />
          </FieldRow>

          {record.isError ? (
            <Text className="text-sm text-red-500">
              {(record.error as Error).message}
            </Text>
          ) : null}
        </ScrollView>

        <View className="flex-row gap-3 px-6 pb-4 pt-3">
          <Button variant="secondary" size="lg" className="flex-1" onPress={close}>
            <Text>Cancel</Text>
          </Button>
          <Button
            variant="brand"
            size="lg"
            className="flex-1"
            disabled={!canSubmit}
            onPress={() => record.mutate()}
          >
            <Text>{record.isPending ? "Saving…" : "Save Actuals"}</Text>
          </Button>
        </View>
      </View>
    </CenteredPopup>
  );
}

function FieldRow({
  label,
  prev,
  children,
}: {
  label: string;
  prev: PrevMonthValue;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1 gap-2">
        <Text className="text-base font-semibold text-foreground">{label}</Text>
        {children}
      </View>
      <PrevMonthCard prev={prev} />
    </View>
  );
}

const DELTA_COLOR = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const;

function PrevMonthCard({ prev }: { prev: PrevMonthValue }) {
  return (
    <View className="w-28 gap-1 rounded-xl bg-secondary/60 p-3">
      <Text className="text-xs text-muted-foreground">{prev.month}</Text>
      <Text className="text-base font-bold text-foreground" numberOfLines={1}>
        {prev.value}
      </Text>
      {prev.delta ? (
        <Text className={cn("text-xs font-medium", DELTA_COLOR[prev.deltaTone ?? "flat"])}>
          {prev.delta}
        </Text>
      ) : prev.note ? (
        <Text className="text-xs text-muted-foreground">{prev.note}</Text>
      ) : null}
    </View>
  );
}

function DisabledField({ value }: { value: string }) {
  return (
    <View className="h-12 justify-center rounded-lg border border-input bg-input/30 px-4">
      <Text className="text-base text-muted-foreground">{value}</Text>
    </View>
  );
}

function NotesField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  const colors = useThemeColors();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Write anything here"
      placeholderTextColor={colors.mutedForeground}
      multiline
      textAlignVertical="top"
      className="h-24 rounded-lg border border-input bg-input/30 px-4 py-3 text-base text-foreground"
    />
  );
}
