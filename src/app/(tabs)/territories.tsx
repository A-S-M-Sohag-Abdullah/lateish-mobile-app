import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { TerritoryForm } from "@/components/territories/territory-form";
import { Text } from "@/components/ui/text";
import { useGoBack } from "@/hooks/use-go-back";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { TIER_BADGE, TIER_SHORT, type ApiTerritory } from "@/types/territory";

export default function TerritoriesScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ApiTerritory | null>(null);

  const territoriesKey = ["territories", orgId] as const;
  const { data: territories = [], isLoading } = useQuery({
    queryKey: territoriesKey,
    queryFn: () =>
      api.get<ApiTerritory[]>(`/organizations/${orgId}/territories`),
    enabled: !!orgId,
  });

  const inForm = creating || !!editing;

  function back() {
    if (creating) setCreating(false);
    else if (editing) setEditing(null);
    else goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={back} hitSlop={8} className="active:opacity-70">
            <ChevronLeft color={colors.foreground} size={26} />
          </Pressable>
          <Text className="text-2xl font-bold">Territories</Text>
        </View>
        {!inForm ? (
          <Pressable
            onPress={() => setCreating(true)}
            className="h-9 flex-row items-center gap-1.5 rounded-lg bg-primary px-3 active:opacity-90"
          >
            <Plus color={colors.primaryForeground} size={16} />
            <Text className="text-sm font-medium text-primary-foreground">
              New
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {creating ? (
          <TerritoryForm
            orgId={orgId}
            territoriesKey={territoriesKey}
            onDone={() => setCreating(false)}
          />
        ) : editing ? (
          <TerritoryForm
            orgId={orgId}
            territoriesKey={territoriesKey}
            territory={editing}
            onDone={() => setEditing(null)}
          />
        ) : isLoading ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">
            Loading…
          </Text>
        ) : territories.length === 0 ? (
          <View className="items-center gap-2 py-16">
            <Text className="text-base font-semibold">No territories yet</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Add a territory to organize markets and assign BDMs.
            </Text>
          </View>
        ) : (
          territories.map((t) => (
            <TerritoryRow
              key={t.id}
              territory={t}
              onPress={() => setEditing(t)}
            />
          ))
        )}
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

function TerritoryRow({
  territory,
  onPress,
}: {
  territory: ApiTerritory;
  onPress: () => void;
}) {
  const hasSearchArea =
    territory.center_lat != null && territory.center_lng != null;
  const location = [
    territory.state,
    territory.sub_region,
    hasSearchArea ? `${territory.search_radius_km}km area` : "area not set",
  ]
    .filter(Boolean)
    .join(" • ");
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4 active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
        <MapPin color="#3B82F6" size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" numberOfLines={1}>
          {territory.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {location || "—"}
        </Text>
      </View>
      <View
        className={cn(
          "rounded-md border px-2 py-0.5",
          TIER_BADGE[territory.maturity_tier],
        )}
      >
        <Text
          className={cn(
            "text-xs font-medium",
            TIER_BADGE[territory.maturity_tier],
          )}
        >
          {TIER_SHORT[territory.maturity_tier]}
        </Text>
      </View>
    </Pressable>
  );
}
