import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { ALL_CHANNELS } from "@/lib/channels";
import {
  ACCOUNT_TYPES,
  BUYER_ROLES,
  CONFIDENCE_SCORES,
  CONVERSION_WINDOWS,
  QUANTITIES,
} from "@/lib/mdi-data";
import type { ApiBrand } from "@/types/brand";
import type { MdiConfidence, MdiIntentStatus } from "@/types/mdi";

interface ApiSku {
  id: string;
  name: string;
}

const CHANNEL_PLACEHOLDER = "Select primary channel";
const BRAND_PLACEHOLDER = "Select brand";
const SKU_PLACEHOLDER = "Select SKU";
const channelSlug = (label: string) =>
  ALL_CHANNELS.find((c) => c.label === label)?.slug ?? null;

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

export function CreateTab({ onCreated }: { onCreated?: () => void }) {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();

  const channelOptions = [CHANNEL_PLACEHOLDER, ...ALL_CHANNELS.map((c) => c.label)];

  const [form, setForm] = useState({
    accountType: "On premise",
    primaryChannel: CHANNEL_PLACEHOLDER,
    secondaryChannel: CHANNEL_PLACEHOLDER,
    accountName: "",
    city: "",
    region: "",
    buyerName: "",
    buyerRole: "Decision Maker",
    buyerEmail: "",
    buyerPhone: "",
    window: "30 days",
    confidence: "Medium",
    notes: "",
    brand: BRAND_PLACEHOLDER,
    sku: SKU_PLACEHOLDER,
    quantity: "12",
    distributor: "",
    indicativePrice: "",
    apIntent: "",
  });
  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [confirmed, setConfirmed] = useState(true);

  const { data: brands = [] } = useQuery({
    queryKey: ["brands", orgId],
    queryFn: () => api.get<ApiBrand[]>(`/organizations/${orgId}/brands`),
    enabled: !!orgId,
  });
  const activeBrands = brands.filter((b) => b.status === "active");
  const selectedBrand = activeBrands.find((b) => b.name === form.brand);

  const { data: skus = [] } = useQuery({
    queryKey: ["skus", orgId, selectedBrand?.id],
    queryFn: () =>
      api
        .getPaginated<ApiSku>(
          `/organizations/${orgId}/brands/${selectedBrand!.id}/skus?limit=100`,
        )
        .then((r) => r.data),
    enabled: !!orgId && !!selectedBrand,
  });
  const selectedSku = skus.find((s) => s.name === form.sku);

  const submit = useMutation({
    mutationFn: (status: MdiIntentStatus) =>
      api.post(`/organizations/${orgId}/mdi/intents`, {
        account_name: form.accountName.trim() || null,
        account_type:
          form.accountType === "On premise" ? "on-premise" : "off-premise",
        primary_channel:
          form.primaryChannel === CHANNEL_PLACEHOLDER
            ? null
            : channelSlug(form.primaryChannel),
        secondary_channel:
          form.secondaryChannel === CHANNEL_PLACEHOLDER
            ? null
            : channelSlug(form.secondaryChannel),
        city: form.city.trim() || null,
        state: form.region.trim() || null,
        buyer_name: form.buyerName.trim() || null,
        buyer_role: form.buyerRole,
        buyer_email: form.buyerEmail.trim() || null,
        buyer_phone: form.buyerPhone.trim() || null,
        conversion_window_days: parseInt(form.window, 10) || 30,
        confidence: form.confidence.toLowerCase() as MdiConfidence,
        notes: form.notes.trim() || null,
        status,
        line_items: [
          {
            brand_id: selectedBrand?.id ?? null,
            brand_name: selectedBrand?.name ?? null,
            sku_id: selectedSku?.id ?? null,
            sku_name: selectedSku?.name ?? null,
            qty_cases: Number(form.quantity) || 0,
            distributor_name: form.distributor.trim() || null,
            indicative_price: form.indicativePrice
              ? Number(form.indicativePrice)
              : null,
            ap_intent: form.apIntent.trim() || null,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mdi-intents"] });
      queryClient.invalidateQueries({ queryKey: ["mdi-analytics"] });
      onCreated?.();
    },
  });

  const canSubmit =
    form.accountName.trim() !== "" &&
    form.buyerName.trim() !== "" &&
    confirmed &&
    !submit.isPending;

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
          options={channelOptions}
          value={form.primaryChannel}
          onChange={set("primaryChannel")}
          size="md"
          placeholder={CHANNEL_PLACEHOLDER}
        />
      </Field>
      <Field label="Secondary Channel (Optional)">
        <Dropdown
          options={channelOptions}
          value={form.secondaryChannel}
          onChange={set("secondaryChannel")}
          size="md"
          placeholder={CHANNEL_PLACEHOLDER}
        />
      </Field>
      <Field label="Account Name" required>
        <Input
          value={form.accountName}
          onChangeText={set("accountName")}
          placeholder="Account name"
        />
      </Field>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="City">
            <Input value={form.city} onChangeText={set("city")} placeholder="City" />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="Region / State">
            <Input
              value={form.region}
              onChangeText={set("region")}
              placeholder="Region"
            />
          </Field>
        </View>
      </View>

      {/* Buyer Information */}
      <Section title="Buyer Information" />
      <Field label="Buyer Name" required>
        <Input
          value={form.buyerName}
          onChangeText={set("buyerName")}
          placeholder="Contact Name"
        />
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
          value={form.buyerEmail}
          onChangeText={set("buyerEmail")}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Field>
      <Field label="Phone">
        <Input
          value={form.buyerPhone}
          onChangeText={set("buyerPhone")}
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
        />
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
          value={form.notes}
          onChangeText={set("notes")}
          placeholder="Add any relevant notes…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-3 text-base text-foreground"
          textAlignVertical="top"
        />
      </Field>

      {/* Line Items */}
      <View className="flex-row items-center justify-between pt-2">
        <Text className="text-xl font-bold">Line Item</Text>
      </View>
      <Field label="Brand">
        <Dropdown
          options={[BRAND_PLACEHOLDER, ...activeBrands.map((b) => b.name)]}
          value={form.brand}
          onChange={(v) => setForm((f) => ({ ...f, brand: v, sku: SKU_PLACEHOLDER }))}
          size="md"
          placeholder={BRAND_PLACEHOLDER}
        />
      </Field>
      <Field label="SKU">
        <Dropdown
          options={[SKU_PLACEHOLDER, ...skus.map((s) => s.name)]}
          value={form.sku}
          onChange={set("sku")}
          size="md"
          placeholder={SKU_PLACEHOLDER}
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
        <Input
          value={form.distributor}
          onChangeText={set("distributor")}
          placeholder="Distributor name"
        />
      </Field>
      <Field label="Indicative Price (non-binding)">
        <Input
          value={form.indicativePrice}
          onChangeText={set("indicativePrice")}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </Field>
      <Field label="A&P Intent">
        <Input
          value={form.apIntent}
          onChangeText={set("apIntent")}
          placeholder="e.g. cocktail feature"
        />
      </Field>

      {/* Confirmation */}
      <ConfirmationRow checked={confirmed} onToggle={() => setConfirmed((v) => !v)} />

      <FormError error={submit.error} />

      {/* Actions */}
      <View className="flex-row gap-3 pt-1">
        <Pressable
          onPress={() => submit.mutate("draft")}
          disabled={!canSubmit}
          className="h-12 flex-1 items-center justify-center rounded-lg border border-border bg-secondary active:opacity-80 disabled:opacity-50"
        >
          <Text className="text-base font-medium">Save as Draft</Text>
        </Pressable>
        <Pressable
          onPress={() => submit.mutate("submitted")}
          disabled={!canSubmit}
          className="h-12 flex-1 items-center justify-center rounded-lg bg-white active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-base font-semibold text-black">
            {submit.isPending ? "Submitting…" : "Submit"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ConfirmationRow({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row gap-3 rounded-2xl border border-border bg-white/5 p-4"
    >
      <View
        className={
          "mt-0.5 h-5 w-5 items-center justify-center rounded border " +
          (checked ? "border-brand-maroon bg-brand-maroon" : "border-border")
        }
      >
        {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
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
