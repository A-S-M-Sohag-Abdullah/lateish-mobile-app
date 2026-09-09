import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import {
  GooglePlacesInput,
  type PlaceSelection,
} from "@/components/ui/google-places-input";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { type OrgMember } from "@/types/organization";
import {
  MATURITY_TIERS,
  TIER_DESC,
  TIER_LABEL,
  tierFromLabel,
  type ApiTerritory,
  type MaturityTier,
} from "@/types/territory";

const TIER_OPTIONS = MATURITY_TIERS.map((t) => TIER_LABEL[t]);

function memberName(m: OrgMember): string {
  const parts = [m.user.first_name, m.user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : m.user.email;
}

export function TerritoryForm({
  orgId,
  territoriesKey,
  territory,
  onDone,
}: {
  orgId: string;
  territoriesKey: readonly unknown[];
  /** Present = edit mode; absent = create. */
  territory?: ApiTerritory;
  onDone: () => void;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const isEdit = !!territory;

  const { data: members = [] } = useQuery({
    queryKey: ["organizations", orgId, "members"],
    queryFn: () => api.get<OrgMember[]>(`/organizations/${orgId}/members`),
    enabled: !!orgId,
  });
  const bdmOptions = [
    { label: "Unassigned", id: "" },
    ...members.map((m) => ({ label: memberName(m), id: m.user_id })),
  ];

  const [name, setName] = useState(territory?.name ?? "");
  const [state, setState] = useState(territory?.state ?? "");
  const [subRegion, setSubRegion] = useState(territory?.sub_region ?? "");
  const [tier, setTier] = useState<MaturityTier>(
    territory?.maturity_tier ?? "delta",
  );
  const [bdmId, setBdmId] = useState(territory?.bdm_user_id ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Search area — the center/radius the auto-populate (Google Places) feature
  // searches around. Optional: a territory without one just can't run
  // auto-populate yet; it isn't required to create/edit a territory.
  const [centerInput, setCenterInput] = useState("");
  const [centerLat, setCenterLat] = useState<number | null>(
    territory?.center_lat ?? null,
  );
  const [centerLng, setCenterLng] = useState<number | null>(
    territory?.center_lng ?? null,
  );
  const [centerPlaceId, setCenterPlaceId] = useState<string | null>(
    territory?.center_place_id ?? null,
  );
  const [centerLabel, setCenterLabel] = useState<string | null>(
    territory?.center_lat != null && territory?.center_lng != null
      ? `${territory.center_lat.toFixed(4)}, ${territory.center_lng.toFixed(4)}`
      : null,
  );
  const [radiusKm, setRadiusKm] = useState(
    String(territory?.search_radius_km ?? 25),
  );

  function handleCenterSelect(place: PlaceSelection) {
    setCenterLat(place.latitude);
    setCenterLng(place.longitude);
    setCenterPlaceId(place.placeId || null);
    setCenterLabel(place.address || place.name);
    // Only fill Region if it's still blank — don't clobber a value the admin
    // already typed, or an existing territory's on edit.
    if (place.region && state.trim() === "") setState(place.region);
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(),
        state: state.trim(),
        sub_region: subRegion.trim() || null,
        maturity_tier: tier,
        bdm_user_id: bdmId || null,
        center_lat: centerLat,
        center_lng: centerLng,
        center_place_id: centerPlaceId,
        search_radius_km: Number(radiusKm) || 25,
      };
      return isEdit
        ? api.put(
            `/organizations/${orgId}/territories/${territory.id}`,
            payload,
          )
        : api.post(`/organizations/${orgId}/territories`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: territoriesKey });
      onDone();
    },
  });

  const remove = useMutation({
    mutationFn: () =>
      api.delete(`/organizations/${orgId}/territories/${territory?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: territoriesKey });
      onDone();
    },
  });

  const busy = save.isPending || remove.isPending;
  const canSubmit =
    name.trim().length >= 2 && state.trim().length >= 1 && !busy;
  const bdmLabel =
    bdmOptions.find((o) => o.id === bdmId)?.label ?? "Unassigned";

  return (
    <View className="gap-5">
      <Text className="text-lg font-bold">
        {isEdit ? "Edit Territory" : "New Territory"}
      </Text>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Territory name</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="e.g. Chicago Metro"
          placeholderTextColor={colors.mutedForeground}
          className="h-12"
        />
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Region</Text>
        <Input
          value={state}
          onChangeText={setState}
          placeholder="e.g. IL"
          placeholderTextColor={colors.mutedForeground}
          className="h-12"
        />
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">
          Sub-region (optional)
        </Text>
        <Input
          value={subRegion}
          onChangeText={setSubRegion}
          placeholder="Optional"
          placeholderTextColor={colors.mutedForeground}
          className="h-12"
        />
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Search Area</Text>
        <GooglePlacesInput
          value={centerInput}
          onChangeText={setCenterInput}
          onPlaceSelect={handleCenterSelect}
          types="(cities)"
          placeholder="Search for a city…"
        />
        <View className="flex-row items-center gap-3">
          <Text className="flex-1 text-xs text-muted-foreground">
            {centerLabel
              ? `Centered near ${centerLabel} — used by the auto-populate feature to search Google Places for target accounts.`
              : "Not set — auto-populate can't run for this territory until a search center is picked."}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Input
              value={radiusKm}
              onChangeText={setRadiusKm}
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedForeground}
              className="h-10 w-16 text-center"
            />
            <Text className="text-xs text-muted-foreground">km radius</Text>
          </View>
        </View>
      </View>

      <View className="gap-2">
        <SelectField
          label="Maturity Tier"
          value={TIER_LABEL[tier]}
          options={TIER_OPTIONS}
          onChange={(label) => setTier(tierFromLabel(label))}
        />
        <Text className="text-xs text-muted-foreground">{TIER_DESC[tier]}</Text>
      </View>

      <SelectField
        label="Assigned BDM"
        value={bdmLabel}
        options={bdmOptions.map((o) => o.label)}
        onChange={(label) =>
          setBdmId(bdmOptions.find((o) => o.label === label)?.id ?? "")
        }
      />

      <FormError error={save.error ?? remove.error} />

      <Pressable
        onPress={() => save.mutate()}
        disabled={!canSubmit}
        className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
      >
        <Check color={colors.primaryForeground} size={18} />
        <Text className="text-base font-semibold text-primary-foreground">
          {save.isPending
            ? "Saving…"
            : isEdit
              ? "Save Changes"
              : "Create Territory"}
        </Text>
      </Pressable>

      {isEdit ? (
        <View className="mt-2 gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
          <View>
            <Text className="text-base font-semibold text-red-500">
              Delete Territory
            </Text>
            <Text className="text-sm text-muted-foreground">
              Permanently remove this territory. This cannot be undone.
            </Text>
          </View>
          {confirmingDelete ? (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setConfirmingDelete(false)}
                disabled={busy}
                className="flex-1 items-center rounded-lg border border-border bg-secondary py-3 active:opacity-80"
              >
                <Text className="text-sm font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => remove.mutate()}
                disabled={busy}
                className="flex-1 items-center rounded-lg bg-red-600 py-3 active:opacity-90 disabled:opacity-50"
              >
                <Text className="text-sm font-medium text-white">
                  {remove.isPending ? "Deleting…" : "Delete"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              className="h-11 flex-row items-center justify-center gap-2 rounded-lg border border-red-500/40 active:bg-red-500/10"
            >
              <Trash2 color="#EF4444" size={16} />
              <Text className="text-sm font-medium text-red-500">
                Delete territory
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}
