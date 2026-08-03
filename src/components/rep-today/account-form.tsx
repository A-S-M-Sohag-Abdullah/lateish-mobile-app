import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { CenteredPopup } from "@/components/ui/centered-popup";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import {
  ALL_CHANNELS,
  OFF_PREMISE_CHANNELS,
  ON_PREMISE_CHANNELS,
  type Channel,
} from "@/lib/channels";
import type { ApiTerritory } from "@/types/territory";

const TYPE_OPTIONS = ["On-Premise", "Off-Premise"] as const;
const typeToSlug = (label: string) =>
  label === "On-Premise" ? "on-premise" : label === "Off-Premise" ? "off-premise" : "";

/** "Create New Account" popup, opened from the Rep Today Territory tab. */
export function AccountForm({
  visible,
  onClose,
  orgId,
}: {
  visible: boolean;
  onClose: () => void;
  orgId: string;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [typeLabel, setTypeLabel] = useState("");
  const [channelLabel, setChannelLabel] = useState("");
  const [territoryLabel, setTerritoryLabel] = useState("No territory");
  const [notes, setNotes] = useState("");

  const { data: territories = [] } = useQuery({
    queryKey: ["territories", orgId],
    queryFn: () => api.get<ApiTerritory[]>(`/organizations/${orgId}/territories`),
    enabled: !!orgId && visible,
  });

  const channelPool: Channel[] =
    typeLabel === "On-Premise"
      ? ON_PREMISE_CHANNELS
      : typeLabel === "Off-Premise"
        ? OFF_PREMISE_CHANNELS
        : ALL_CHANNELS;

  const territoryOptions = [
    "No territory",
    ...territories.map((t) => `${t.name}${t.state ? ` (${t.state})` : ""}`),
  ];

  const isValid =
    name.trim() !== "" &&
    address.trim() !== "" &&
    typeLabel !== "" &&
    channelLabel !== "";

  const create = useMutation({
    mutationFn: () => {
      const territoryId =
        territoryLabel === "No territory"
          ? null
          : (territories.find(
              (t) => `${t.name}${t.state ? ` (${t.state})` : ""}` === territoryLabel,
            )?.id ?? null);
      const channel =
        ALL_CHANNELS.find((c) => c.label === channelLabel)?.slug ?? "";
      return api.post(`/organizations/${orgId}/accounts`, {
        name: name.trim(),
        address: address.trim(),
        city: city.trim() || null,
        state: region.trim() || null,
        account_type: typeToSlug(typeLabel),
        channel,
        notes: notes.trim() || null,
        latitude: null,
        longitude: null,
        place_id: null,
        territory_id: territoryId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", orgId] });
      reset();
      onClose();
    },
  });

  function reset() {
    setName("");
    setAddress("");
    setCity("");
    setRegion("");
    setTypeLabel("");
    setChannelLabel("");
    setTerritoryLabel("No territory");
    setNotes("");
    create.reset();
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <CenteredPopup visible={visible} onClose={close} heightRatio={0.92}>
      <View className="flex-1">
        <View className="gap-1 px-6 pt-6">
          <Text className="text-2xl font-bold">Create New Account</Text>
          <Text className="text-sm text-muted-foreground">
            Add a new account to your territory. Select from canonical sales
            channels.
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 18 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Account Name *</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g., The Cocktail Club"
              placeholderTextColor={colors.mutedForeground}
              className="h-12"
            />
          </View>

          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Address *</Text>
            <Input
              value={address}
              onChangeText={setAddress}
              placeholder="Full address for geo-mapping"
              placeholderTextColor={colors.mutedForeground}
              className="h-12"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className="text-base text-muted-foreground">City</Text>
              <Input
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={colors.mutedForeground}
                className="h-12"
              />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-base text-muted-foreground">Region</Text>
              <Input
                value={region}
                onChangeText={setRegion}
                placeholder="Region"
                placeholderTextColor={colors.mutedForeground}
                className="h-12"
              />
            </View>
          </View>

          <SelectField
            label="Account Type *"
            value={typeLabel}
            placeholder="Select account type"
            options={[...TYPE_OPTIONS]}
            onChange={(v) => {
              setTypeLabel(v);
              setChannelLabel("");
            }}
          />

          <SelectField
            label="Primary Sales Channel *"
            value={channelLabel}
            placeholder="Select primary channel"
            options={channelPool.map((c) => c.label)}
            onChange={setChannelLabel}
          />

          {territories.length > 0 ? (
            <SelectField
              label="Territory (Optional)"
              value={territoryLabel}
              options={territoryOptions}
              onChange={setTerritoryLabel}
            />
          ) : null}

          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes about this account..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
              className="h-24 rounded-lg border border-input bg-input/30 px-4 py-3 text-base text-foreground"
            />
          </View>

          <FormError error={create.error} />
        </ScrollView>

        <View className="flex-row gap-3 px-6 pb-4 pt-3">
          <Pressable
            onPress={close}
            disabled={create.isPending}
            className="h-12 flex-1 items-center justify-center rounded-xl border border-border bg-secondary active:opacity-80"
          >
            <Text className="text-base font-semibold text-foreground">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => create.mutate()}
            disabled={!isValid || create.isPending}
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
          >
            <Check color={colors.primaryForeground} size={18} />
            <Text className="text-base font-semibold text-primary-foreground">
              {create.isPending ? "Creating…" : "Create Account"}
            </Text>
          </Pressable>
        </View>
      </View>
    </CenteredPopup>
  );
}
