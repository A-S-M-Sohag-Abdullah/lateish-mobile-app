import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { MY_ORGS_QUERY_KEY } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { useOrgStore } from "@/store/organization.store";
import { slugify, type ApiCreatedOrg } from "@/types/organization";

const INDUSTRIES = [
  "Beverage & Spirits",
  "Beer & Craft Brewing",
  "Wine & Champagne",
  "Non-Alcoholic Beverages",
  "Hospitality & Hotels",
  "Food & Beverage Distribution",
  "Retail & Off-Trade",
  "Other",
];

const REGIONS = [
  "United States",
  "United Kingdom",
  "European Union",
  "Australia & New Zealand",
  "Canada",
  "Asia Pacific",
  "Latin America",
  "Middle East & Africa",
  "Global",
];

export function CreateOrganizationForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const setCurrentOrgId = useOrgStore((s) => s.setCurrentOrgId);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [region, setRegion] = useState(REGIONS[0]);

  const create = useMutation({
    mutationFn: () =>
      api.post<ApiCreatedOrg>("/organizations", {
        name: name.trim(),
        slug,
        plan: "starter",
        settings: { industry, region },
      }),
    onSuccess: async (org) => {
      setCurrentOrgId(org.id);
      await queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY });
      router.replace("/");
    },
  });

  const canSubmit = name.trim().length >= 2 && slug.trim().length >= 2;

  return (
    <View className="gap-6">
      <View className="gap-1">
        <Pressable
          onPress={onBack}
          className="mb-1 flex-row items-center gap-1 self-start active:opacity-70"
        >
          <ArrowLeft color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold">Create an organization</Text>
        <Text className="text-sm text-muted-foreground">
          Set up a new workspace for your brand or team.
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Organization name</Text>
        <Input
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (!slugManual) setSlug(slugify(v));
          }}
          placeholder="Acme Beverages"
          placeholderTextColor={colors.mutedForeground}
          className="h-12"
        />
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Slug</Text>
        <Input
          value={slug}
          onChangeText={(v) => {
            setSlugManual(true);
            setSlug(slugify(v));
          }}
          autoCapitalize="none"
          placeholder="acme-beverages"
          placeholderTextColor={colors.mutedForeground}
          className="h-12"
        />
        <Text className="text-xs text-muted-foreground">
          Used in links and identifiers. Lowercase, no spaces.
        </Text>
      </View>

      <SelectField
        label="Industry"
        value={industry}
        options={INDUSTRIES}
        onChange={setIndustry}
      />

      <SelectField
        label="Region"
        value={region}
        options={REGIONS}
        onChange={setRegion}
      />

      <FormError error={create.error} />

      <Pressable
        onPress={() => create.mutate()}
        disabled={!canSubmit || create.isPending}
        className="h-14 items-center justify-center rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
      >
        <Text className="text-base font-semibold text-primary-foreground">
          {create.isPending ? "Creating…" : "Create organization"}
        </Text>
      </Pressable>
    </View>
  );
}
