import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Map as MapIcon, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import {
  PlacePicker,
  type PickedPlace,
} from "@/components/rep-today/place-picker";
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

/**
 * Infer account type + a canonical channel slug from an OSM place's type/class,
 * so picking a venue pre-fills the selects. Ported from the web
 * add-account-dialog, but mapped to the mobile channel slugs in channels.ts.
 */
function inferAccountFields(osmType: string, osmClass: string): {
  type: string;
  channel: string;
} {
  const t = osmType.toLowerCase();
  const c = osmClass.toLowerCase();
  if (["bar", "pub", "cocktail_bar", "wine_bar", "taproom", "biergarten"].includes(t))
    return { type: "on-premise", channel: "modern-cocktail-bar" };
  if (["nightclub", "disco", "stripclub"].includes(t))
    return { type: "on-premise", channel: "premium-nightlife" };
  if (["restaurant", "cafe", "bistro", "diner", "food_court", "fast_food", "snack_bar"].includes(t))
    return { type: "on-premise", channel: "casual-food-beverage" };
  if (["hotel", "motel", "hostel", "guest_house", "chalet"].includes(t))
    return { type: "on-premise", channel: "hotel-bar" };
  if (["alcohol", "wine", "beverages", "beer", "liquor"].includes(t))
    return { type: "off-premise", channel: "independent-retailer" };
  if (["supermarket", "convenience", "department_store", "general", "mall"].includes(t))
    return { type: "off-premise", channel: "convenience-store" };
  if (["deli", "farm", "cheese", "organic", "health_food", "gift", "wholefoods"].includes(t))
    return { type: "off-premise", channel: "deli-food-retail" };
  if (c === "shop") return { type: "off-premise", channel: "independent-retailer" };
  if (c === "tourism") return { type: "on-premise", channel: "hotel-bar" };
  if (c === "amenity" || c === "leisure")
    return { type: "on-premise", channel: "casual-food-beverage" };
  return { type: "", channel: "" };
}

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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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
        latitude,
        longitude,
        place_id: placeId,
        territory_id: territoryId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", orgId] });
      reset();
      onClose();
    },
  });

  function handlePlacePicked(place: PickedPlace) {
    if (place.name) setName(place.name);
    setAddress(place.address);
    setCity(place.city);
    setRegion(place.state);
    setLatitude(place.latitude);
    setLongitude(place.longitude);
    setPlaceId(place.place_id);

    const inferred = inferAccountFields(place.osm_type, place.osm_class);
    if (inferred.type) {
      setTypeLabel(inferred.type === "on-premise" ? "On-Premise" : "Off-Premise");
    }
    if (inferred.channel) {
      const label = ALL_CHANNELS.find((c) => c.slug === inferred.channel)?.label;
      if (label) setChannelLabel(label);
    }
  }

  function reset() {
    setName("");
    setAddress("");
    setCity("");
    setRegion("");
    setTypeLabel("");
    setChannelLabel("");
    setTerritoryLabel("No territory");
    setNotes("");
    setLatitude(null);
    setLongitude(null);
    setPlaceId(null);
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
            <View className="flex-row gap-2">
              <Input
                value={address}
                onChangeText={setAddress}
                placeholder="Full address for geo-mapping"
                placeholderTextColor={colors.mutedForeground}
                className="h-12 flex-1"
              />
              <Pressable
                onPress={() => setPickerOpen(true)}
                accessibilityLabel="Find venue on map"
                className="h-12 w-12 items-center justify-center rounded-lg border border-input bg-input/30 active:opacity-70"
              >
                <MapIcon color={colors.foreground} size={20} />
              </Pressable>
            </View>
            {latitude !== null && longitude !== null ? (
              <View className="flex-row items-center gap-1">
                <MapPin color="#16A34A" size={12} />
                <Text className="text-xs text-[#16A34A]">
                  Pinned at {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </Text>
              </View>
            ) : (
              <Text className="text-xs text-muted-foreground">
                Type an address or use the map icon to find and select a venue.
              </Text>
            )}
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

      <PlacePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePlacePicked}
      />
    </CenteredPopup>
  );
}
