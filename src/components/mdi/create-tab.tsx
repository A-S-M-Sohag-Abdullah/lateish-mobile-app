import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  ACCOUNT_TYPES,
  BUYER_ROLES,
  CONFIDENCE_SCORES,
  CONVERSION_WINDOWS,
  DISTRIBUTORS,
  PRICE_BANDS,
  QUANTITIES,
  SALES_CHANNELS,
  SKUS,
} from "@/lib/mdi-data";

function Section({ title }: { title: string }) {
  return <Text className="pt-2 text-xl font-bold">{title}</Text>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm text-muted-foreground">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export function CreateTab() {
  const router = useRouter();
  const colors = useThemeColors();

  // Local UI state — this is a preview form, nothing is submitted.
  const [form, setForm] = useState({
    accountType: "On premise",
    primaryChannel: "Select primary channel",
    secondaryChannel: "Select primary channel",
    buyerRole: "Decision Maker",
    window: "30 days",
    confidence: "Medium",
    sku: "Select SKU",
    quantity: "12",
    distributor: "Select distributor",
    price: "Select price band",
  });
  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <View className="gap-5">
      {/* Disclaimer */}
      <View className="gap-2 rounded-2xl border border-border bg-white/5 p-4">
        <Text className="text-base font-semibold">
          Non-Binding Commercial Intent
        </Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          This is a non-binding signal of intent. Lateish.co does not sell
          alcohol, process payments, or confirm orders. The platform captures
          and governs intent only. All orders must be processed through licensed
          distributors in accordance with applicable three-tier regulations.
        </Text>
      </View>

      {/* Account Information */}
      <Section title="Account Information" />
      <Field label="Select Existing Account (Optional)">
        <Input placeholder="Search accounts" />
      </Field>
      <Field label="Account Type" required>
        <Dropdown
          options={ACCOUNT_TYPES}
          value={form.accountType}
          onChange={set("accountType")}
          size="md"
        />
      </Field>
      <Field label="Primary Sales Channel" required>
        <Dropdown
          options={SALES_CHANNELS}
          value={form.primaryChannel}
          onChange={set("primaryChannel")}
          size="md"
          placeholder="Select primary channel"
        />
      </Field>
      <Field label="Secondary Channel (Optional)">
        <Dropdown
          options={SALES_CHANNELS}
          value={form.secondaryChannel}
          onChange={set("secondaryChannel")}
          size="md"
          placeholder="Select primary channel"
        />
      </Field>
      <Field label="Account Name" required>
        <Input placeholder="Account name" />
      </Field>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="City">
            <Input placeholder="City" />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="Region / State">
            <Input placeholder="Region" />
          </Field>
        </View>
      </View>

      {/* Buyer Information */}
      <Section title="Buyer Information" />
      <Field label="Buyer Name" required>
        <Input placeholder="Contact Name" />
      </Field>
      <Field label="Buyer Role" required>
        <Dropdown
          options={BUYER_ROLES}
          value={form.buyerRole}
          onChange={set("buyerRole")}
          size="md"
        />
      </Field>
      <Field label="Email">
        <Input
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Field>
      <Field label="Phone">
        <Input placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
      </Field>

      {/* Intent Details */}
      <Section title="Intent Details" />
      <Field label="Expected Conversion Window" required>
        <Dropdown
          options={CONVERSION_WINDOWS}
          value={form.window}
          onChange={set("window")}
          size="md"
        />
      </Field>
      <Field label="BDM Confidence Score" required>
        <Dropdown
          options={CONFIDENCE_SCORES}
          value={form.confidence}
          onChange={set("confidence")}
          size="md"
        />
      </Field>
      <Field label="Notes">
        <TextInput
          placeholder="Add any relevant notes…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-3 text-base text-foreground"
          textAlignVertical="top"
        />
      </Field>

      {/* Line Items */}
      <View className="flex-row items-center justify-between pt-2">
        <Text className="text-xl font-bold">Line Items</Text>
        <Text variant="muted" className="text-sm">
          Item 1
        </Text>
      </View>
      <Field label="Brand">
        <Input placeholder="Brand name" />
      </Field>
      <Field label="SKU">
        <Dropdown
          options={SKUS}
          value={form.sku}
          onChange={set("sku")}
          size="md"
          placeholder="Select SKU"
        />
      </Field>
      <Field label="Quantity (Cases)" required>
        <Dropdown
          options={QUANTITIES}
          value={form.quantity}
          onChange={set("quantity")}
          size="md"
        />
      </Field>
      <Field label="Appointed Distributor">
        <Dropdown
          options={DISTRIBUTORS}
          value={form.distributor}
          onChange={set("distributor")}
          size="md"
          placeholder="Select distributor"
        />
      </Field>
      <Field label="Indicative Price (non-binding)">
        <Dropdown
          options={PRICE_BANDS}
          value={form.price}
          onChange={set("price")}
          size="md"
          placeholder="Select price band"
        />
      </Field>
      <Field label="A&P Intent">
        <Input placeholder="e.g. cocktail feature" />
      </Field>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="Target Delivery Start">
            <Input placeholder="dd/mm/yyyy" />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="Target Delivery End">
            <Input placeholder="dd/mm/yyyy" />
          </Field>
        </View>
      </View>

      <Pressable className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-brand-maroon active:opacity-90">
        <Plus color="#FFFFFF" size={18} />
        <Text className="text-base font-semibold text-white">Add Item</Text>
      </Pressable>

      {/* Confirmation */}
      <ConfirmationRow />

      {/* Actions */}
      <View className="flex-row gap-3 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-12 flex-1 items-center justify-center rounded-lg border border-border active:opacity-70"
        >
          <Text className="text-base font-medium">Cancel</Text>
        </Pressable>
        <Pressable className="h-12 flex-1 items-center justify-center rounded-lg border border-border bg-secondary active:opacity-80">
          <Text className="text-base font-medium">Save as Draft</Text>
        </Pressable>
        <Pressable className="h-12 flex-1 items-center justify-center rounded-lg bg-white active:opacity-90">
          <Text className="text-base font-semibold text-black">Submit</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ConfirmationRow() {
  const [checked, setChecked] = useState(true);
  return (
    <Pressable
      onPress={() => setChecked((v) => !v)}
      className="flex-row gap-3 rounded-2xl border border-border bg-white/5 p-4"
    >
      <View
        className={
          "mt-0.5 h-5 w-5 items-center justify-center rounded border " +
          (checked ? "border-brand-maroon bg-brand-maroon" : "border-border")
        }
      >
        {checked ? (
          <Text className="text-xs font-bold text-white">✓</Text>
        ) : null}
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-sm font-semibold">
          BDM Intent Confirmation <Text className="text-red-500">*</Text>
        </Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          I confirm this reflects genuine buyer intent and does not constitute a
          confirmed order.
        </Text>
      </View>
    </Pressable>
  );
}
