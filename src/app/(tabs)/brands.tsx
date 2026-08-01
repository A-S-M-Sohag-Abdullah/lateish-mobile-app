import { useQuery } from "@tanstack/react-query";
import { useGoBack } from "@/hooks/use-go-back";
import { ChevronLeft, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CreateBrandForm } from "@/components/brands/create-brand-form";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BRAND_CATEGORY_BADGE,
  BRAND_CATEGORY_LABEL,
  brandInitials,
  toBrandCategory,
  type ApiBrand,
} from "@/types/brand";

export default function BrandsScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const [creating, setCreating] = useState(false);

  const brandsKey = ["brands", orgId] as const;
  const { data: brands = [], isLoading } = useQuery({
    queryKey: brandsKey,
    queryFn: () => api.get<ApiBrand[]>(`/organizations/${orgId}/brands`),
    enabled: !!orgId,
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => (creating ? setCreating(false) : goBack())}
            hitSlop={8}
            className="active:opacity-70"
          >
            <ChevronLeft color={colors.foreground} size={26} />
          </Pressable>
          <Text className="text-2xl font-bold">Brands</Text>
        </View>
        {!creating ? (
          <Pressable
            onPress={() => setCreating(true)}
            className="h-9 flex-row items-center gap-1.5 rounded-lg bg-primary px-3 active:opacity-90"
          >
            <Plus color={colors.primaryForeground} size={16} />
            <Text className="text-sm font-medium text-primary-foreground">New Brand</Text>
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
          <CreateBrandForm
            orgId={orgId}
            brandsKey={brandsKey}
            onDone={() => setCreating(false)}
          />
        ) : isLoading ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">Loading…</Text>
        ) : brands.length === 0 ? (
          <View className="items-center gap-2 py-16">
            <Text className="text-base font-semibold">No brands yet</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Create your first brand to start tracking its performance.
            </Text>
          </View>
        ) : (
          brands.map((brand) => <BrandRow key={brand.id} brand={brand} />)
        )}
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

function BrandRow({ brand }: { brand: ApiBrand }) {
  const category = toBrandCategory(brand.category);
  const isActive = brand.status === "active";
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
        <Text className="font-bold text-primary">{brandInitials(brand.name)}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" numberOfLines={1}>
          {brand.name}
        </Text>
        {brand.description ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {brand.description}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-1.5">
        <View className={cn("rounded-md border px-2 py-0.5", BRAND_CATEGORY_BADGE[category])}>
          <Text className={cn("text-xs font-medium", BRAND_CATEGORY_BADGE[category])}>
            {BRAND_CATEGORY_LABEL[category]}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: isActive ? "#22C55E" : "#64748B" }}
          />
          <Text className="text-xs capitalize text-muted-foreground">{brand.status}</Text>
        </View>
      </View>
    </View>
  );
}
