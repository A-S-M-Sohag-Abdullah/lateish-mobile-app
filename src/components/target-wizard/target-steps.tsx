import { View } from "react-native";

import { CheckboxRow, Field, OptionCard, SearchField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  CHANNEL_CHOICES,
  CONFIDENCE_CHOICES,
  CONFIDENCE_LABELS,
  GUARDRAIL_CHOICES,
  periodDays,
  type TargetDraft,
} from "@/lib/target-wizard-data";

interface StepProps {
  draft: TargetDraft;
  update: (partial: Partial<TargetDraft>) => void;
}

/** Read-only display field — dates have no picker in the UI preview. */
function ReadonlyField({ value }: { value: string }) {
  return (
    <View className="h-12 justify-center rounded-lg border border-input bg-input/30 px-4">
      <Text className="text-base text-muted-foreground">{value}</Text>
    </View>
  );
}

export function MarketDatesStep({ draft, update }: StepProps) {
  const days = periodDays(draft.startDate, draft.endDate);
  return (
    <>
      <Field label="Market">
        <SearchField
          value={draft.market}
          onChangeText={(market) => update({ market })}
          placeholder="Search market"
        />
      </Field>

      <Field label="Start date">
        <ReadonlyField value={draft.startDate} />
      </Field>

      <Field label="End date">
        <ReadonlyField value={draft.endDate} />
      </Field>

      {days != null ? (
        <Text className="text-sm text-muted-foreground">Period: {days} days</Text>
      ) : null}
    </>
  );
}

export function ChannelsStep({ draft, update }: StepProps) {
  function toggle(channel: string) {
    const has = draft.channels.includes(channel);
    update({
      channels: has
        ? draft.channels.filter((c) => c !== channel)
        : [...draft.channels, channel],
    });
  }

  return (
    <View className="gap-3">
      {CHANNEL_CHOICES.map((channel) => (
        <CheckboxRow
          key={channel}
          label={channel}
          checked={draft.channels.includes(channel)}
          onToggle={() => toggle(channel)}
        />
      ))}
    </View>
  );
}

export function TargetsStep({ draft, update }: StepProps) {
  return (
    <>
      <Field
        emphasis="heading"
        label="Case Target"
        description="Total cases expected during this period"
      >
        <Input
          className="h-12"
          keyboardType="number-pad"
          placeholder="0"
          value={draft.caseTarget}
          onChangeText={(caseTarget) => update({ caseTarget })}
        />
      </Field>

      <Field
        emphasis="heading"
        label="Distribution Target (optional)"
        description="Target number of active distribution points"
      >
        <Input
          className="h-12"
          keyboardType="number-pad"
          placeholder="eg.50"
          value={draft.distributionTarget}
          onChangeText={(distributionTarget) => update({ distributionTarget })}
        />
      </Field>
    </>
  );
}

export function GuardrailStep({ draft, update }: StepProps) {
  return (
    <>
      <View className="gap-3">
        <Field
          emphasis="heading"
          label="A&P Guardrail Type"
          description="This is a guardrail not a budget."
        />
        {GUARDRAIL_CHOICES.map((choice) => (
          <OptionCard
            key={choice.id}
            align="center"
            title={choice.title}
            subtitle={choice.subtitle}
            selected={draft.guardrailType === choice.id}
            onPress={() => update({ guardrailType: choice.id })}
          />
        ))}
      </View>

      <Field emphasis="heading" label="A & P Budget (£)">
        <Input
          className="h-12"
          keyboardType="number-pad"
          placeholder="0"
          value={draft.apBudget}
          onChangeText={(apBudget) => update({ apBudget })}
        />
      </Field>
    </>
  );
}

export function ConfidenceStep({ draft, update }: StepProps) {
  return (
    <View className="gap-3">
      <Field
        emphasis="heading"
        label="Confidence level"
        description="How confident are you in this target?"
      />
      {CONFIDENCE_CHOICES.map((choice) => (
        <OptionCard
          key={choice.id}
          title={choice.title}
          selected={draft.confidence === choice.id}
          onPress={() => update({ confidence: choice.id })}
        />
      ))}
    </View>
  );
}

function ReviewCell({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1 rounded-xl bg-secondary p-4">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-lg font-semibold text-foreground">{value}</Text>
    </View>
  );
}

export function ReviewStep({ draft }: StepProps) {
  const dash = (v: string) => (v.trim().length > 0 ? v : "-");

  const cells: [string, string][] = [
    ["Market", dash(draft.market)],
    ["Period", `${draft.startDate} • ${draft.endDate}`],
    ["Case target", dash(draft.caseTarget)],
    ["Distribution", dash(draft.distributionTarget)],
    ["A&P Guardrail", draft.apBudget.trim() || "0"],
    ["Confidence", CONFIDENCE_LABELS[draft.confidence]],
  ];
  const rows = [cells.slice(0, 2), cells.slice(2, 4), cells.slice(4, 6)];

  return (
    <>
      <View className="gap-3">
        {rows.map((row, i) => (
          <View key={i} className="flex-row gap-3">
            {row.map(([label, value]) => (
              <ReviewCell key={label} label={label} value={value} />
            ))}
          </View>
        ))}
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold">Channels</Text>
        {draft.channels.length === 0 ? (
          <Text className="text-base text-muted-foreground">
            No channels selected
          </Text>
        ) : (
          draft.channels.map((channel, i) => (
            <Text key={channel} className="text-base text-muted-foreground">
              {channel}
              {i === 0 ? " (primary)" : ""}
            </Text>
          ))
        )}
      </View>
    </>
  );
}
