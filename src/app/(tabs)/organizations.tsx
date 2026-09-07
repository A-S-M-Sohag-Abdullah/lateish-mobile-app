import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGoBack } from "@/hooks/use-go-back";
import { Check, ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormError } from "@/components/auth/form-error";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { MY_ORGS_QUERY_KEY, useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { CURRENCIES, INDUSTRIES, REGIONS } from "@/lib/org-options";

export default function OrganizationsScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganizations();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Seed the form from the current org once it resolves.
  useEffect(() => {
    if (!currentOrg) return;
    setName(currentOrg.name);
    setIndustry(currentOrg.industry || "");
    setRegion(currentOrg.region || "");
    setCurrency(currentOrg.currency || "USD");
  }, [currentOrg?.id]);

  const save = useMutation({
    mutationFn: () =>
      api.patch(`/organizations/${currentOrg?.id}`, {
        name: name.trim(),
        settings: { industry, region, currency },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY }),
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => goBack()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Organization</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!currentOrg ? (
          <Text className="text-sm text-muted-foreground">
            No organization selected.
          </Text>
        ) : (
          <>
            <View className="gap-2">
              <Text className="text-base text-muted-foreground">Organization Name</Text>
              <Input value={name} onChangeText={setName} className="h-12" />
            </View>

            <View className="gap-2">
              <Text className="text-base text-muted-foreground">URL Slug</Text>
              <View className="h-12 flex-row items-center overflow-hidden rounded-lg border border-input">
                <Text className="border-r border-input bg-muted px-3 py-3 text-sm text-muted-foreground">
                  lateish.io/
                </Text>
                <Text className="flex-1 px-3 text-sm text-muted-foreground" numberOfLines={1}>
                  {currentOrg.slug}
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground">
                Slug cannot be changed after creation.
              </Text>
            </View>

            <SelectField
              label="Industry"
              value={industry}
              options={INDUSTRIES}
              onChange={setIndustry}
              placeholder="Select an industry"
            />

            <SelectField
              label="Primary Region"
              value={region}
              options={REGIONS}
              onChange={setRegion}
              placeholder="Select a region"
            />

            <View className="gap-2">
              <SelectField
                label="Currency"
                value={currency}
                options={CURRENCIES}
                onChange={setCurrency}
              />
              <Text className="text-xs text-muted-foreground">
                Used for cost and revenue formatting across the platform.
              </Text>
            </View>

            <FormError error={save.error} />

            <Pressable
              onPress={() => save.mutate()}
              disabled={save.isPending || name.trim().length < 2}
              className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
            >
              <Check color={colors.primaryForeground} size={18} />
              <Text className="text-base font-semibold text-primary-foreground">
                {save.isPending ? "Saving…" : save.isSuccess ? "Saved" : "Save Changes"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabBar />
    </SafeAreaView>
  );
}
