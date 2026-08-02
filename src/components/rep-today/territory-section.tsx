import { useQuery } from "@tanstack/react-query";
import { MapPin, Search } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { TERRITORY_CHANNELS } from "@/lib/rep-today-route-data";
import { cn } from "@/lib/utils";
import type { ApiBrand } from "@/types/brand";

interface ApiAccount {
  id: string;
  name: string;
  address: string;
  city: string | null;
  account_type: string;
  channel: string;
}

/** Content shown under the "Territory" tab. */
export function TerritorySection() {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const { data: brands = [] } = useQuery({
    queryKey: ["brands", orgId],
    queryFn: () => api.get<ApiBrand[]>(`/organizations/${orgId}/brands`),
    enabled: !!orgId,
  });
  const { data: page, isLoading } = useQuery({
    queryKey: ["accounts", orgId],
    queryFn: () => api.getPaginated<ApiAccount>(`/organizations/${orgId}/accounts`),
    enabled: !!orgId,
  });
  const accounts = page?.data ?? [];

  const brandOptions = [
    "All Brands",
    ...brands.filter((b) => b.status === "active").map((b) => b.name),
  ];
  const [brand, setBrand] = useState<string>("All Brands");
  const [channel, setChannel] = useState<string>(TERRITORY_CHANNELS[0]);
  const [query, setQuery] = useState("");

  const filtered = accounts.filter((a) => {
    const matchSearch = !query || a.name.toLowerCase().includes(query.toLowerCase());
    const matchChannel =
      channel === "All Channels" ||
      (channel === "On-Premise" && a.account_type === "on-premise") ||
      (channel === "Off-Premise" && a.account_type === "off-premise") ||
      a.channel?.toLowerCase().includes(channel.toLowerCase());
    return matchSearch && matchChannel;
  });

  return (
    <View className="gap-4">
      <Dropdown size="md" options={brandOptions} value={brand} onChange={setBrand} />

      <Text className="text-2xl font-bold">Territory &amp; Venues</Text>

      <View className="flex-row items-center gap-3">
        <View className="h-12 flex-1 flex-row items-center gap-2.5 rounded-2xl bg-muted px-4">
          <View className="shrink-0">
            <Search color={colors.mutedForeground} size={20} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search venues"
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 text-base text-foreground"
          />
        </View>
        <Dropdown
          size="md"
          options={[...TERRITORY_CHANNELS]}
          value={channel}
          onChange={setChannel}
        />
      </View>

      {isLoading ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">Loading…</Text>
      ) : filtered.length === 0 ? (
        <Text className="py-6 text-center text-sm text-muted-foreground">
          {accounts.length === 0
            ? "No accounts yet."
            : "No venues match your search."}
        </Text>
      ) : (
        <View className="gap-3">
          {filtered.map((a) => (
            <VenueRow key={a.id} account={a} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
}

function VenueRow({
  account,
  colors,
}: {
  account: ApiAccount;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const onPremise = account.account_type === "on-premise";
  const location = [account.city, account.address].filter(Boolean).join(", ");
  return (
    <View className="gap-1.5 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-base font-semibold" numberOfLines={1}>
          {account.name}
        </Text>
        <View
          className={cn(
            "rounded-md border px-2 py-0.5",
            onPremise
              ? "border-blue-500/30 bg-blue-500/10"
              : "border-amber-500/30 bg-amber-500/10",
          )}
        >
          <Text
            className={cn(
              "text-xs font-medium",
              onPremise ? "text-blue-400" : "text-amber-400",
            )}
          >
            {onPremise ? "On-Premise" : "Off-Premise"}
          </Text>
        </View>
      </View>
      {account.channel ? (
        <Text className="text-xs capitalize text-muted-foreground">
          {account.channel.replace(/-/g, " ")}
        </Text>
      ) : null}
      {location ? (
        <View className="flex-row items-center gap-1">
          <MapPin color={colors.mutedForeground} size={13} />
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            {location}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
