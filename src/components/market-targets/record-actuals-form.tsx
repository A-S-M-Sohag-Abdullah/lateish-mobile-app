import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";

import { Button } from "@/components/ui/button";
import { CenteredPopup } from "@/components/ui/centered-popup";
import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  RECORD_ACTUALS_PREV,
  TARGET_RECORDS,
  type PrevMonthValue,
} from "@/lib/market-targets-data";
import { cn } from "@/lib/utils";

interface RecordActualsFormProps {
  visible: boolean;
  onClose: () => void;
}

const SELECT_PLACEHOLDER = "Select target";
const TARGET_OPTIONS = [
  SELECT_PLACEHOLDER,
  ...TARGET_RECORDS.map((t) => t.location),
];

/**
 * "Record Monthly Actuals" — a single-step form popup. Each field sits beside a
 * card showing the prior month's value for comparison. Inert in the preview.
 */
export function RecordActualsForm({ visible, onClose }: RecordActualsFormProps) {
  const [target, setTarget] = useState(SELECT_PLACEHOLDER);
  const [cases, setCases] = useState("");
  const [distribution, setDistribution] = useState("");
  const [apSpend, setApSpend] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <CenteredPopup visible={visible} onClose={onClose}>
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
          <FieldRow label="Market Target *" prev={RECORD_ACTUALS_PREV.target}>
            <Dropdown
              className="h-12"
              options={TARGET_OPTIONS}
              value={target}
              onChange={setTarget}
            />
          </FieldRow>

          <FieldRow label="Month" prev={RECORD_ACTUALS_PREV.month}>
            <DisabledField value="Current Month (June 2026)" />
          </FieldRow>

          <FieldRow label="Cases sold" prev={RECORD_ACTUALS_PREV.cases}>
            <Input
              className="h-12"
              keyboardType="number-pad"
              placeholder="e.g. 1250"
              value={cases}
              onChangeText={setCases}
            />
          </FieldRow>

          <FieldRow
            label="Distribution points"
            prev={RECORD_ACTUALS_PREV.distribution}
          >
            <Input
              className="h-12"
              keyboardType="number-pad"
              placeholder="e.g. 15"
              value={distribution}
              onChangeText={setDistribution}
            />
          </FieldRow>

          <FieldRow label="A&P Spend ($)" prev={RECORD_ACTUALS_PREV.apSpend}>
            <Input
              className="h-12"
              keyboardType="number-pad"
              placeholder="e.g. 1200"
              value={apSpend}
              onChangeText={setApSpend}
            />
          </FieldRow>

          <FieldRow label="Notes (optional)" prev={RECORD_ACTUALS_PREV.notes}>
            <NotesField value={notes} onChangeText={setNotes} />
          </FieldRow>
        </ScrollView>

        <View className="flex-row gap-3 px-6 pb-4 pt-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onPress={onClose}
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            variant="brand"
            size="lg"
            className="flex-1"
            onPress={onClose}
          >
            <Text>Next</Text>
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
      <Text className="text-base font-bold text-foreground">{prev.value}</Text>
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
