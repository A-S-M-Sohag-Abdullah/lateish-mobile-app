import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BRAND_CATEGORIES,
  BRAND_CATEGORY_LABEL,
  toBrandCategory,
  type ApiBrand,
} from "@/types/brand";

const CATEGORY_OPTIONS = BRAND_CATEGORIES.map((c) => BRAND_CATEGORY_LABEL[c]);

export function EditBrandForm({
  brand,
  orgId,
  brandsKey,
  onDone,
}: {
  brand: ApiBrand;
  orgId: string;
  brandsKey: readonly unknown[];
  onDone: () => void;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const [name, setName] = useState(brand.name);
  const [category, setCategory] = useState(
    BRAND_CATEGORY_LABEL[toBrandCategory(brand.category)],
  );
  const [description, setDescription] = useState(brand.description ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(
    brand.status === "active" ? "active" : "inactive",
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      api.patch(`/organizations/${orgId}/brands/${brand.id}`, {
        name: name.trim(),
        category: category.toLowerCase(),
        description: description.trim() || undefined,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandsKey });
      onDone();
    },
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/organizations/${orgId}/brands/${brand.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandsKey });
      onDone();
    },
  });

  const busy = save.isPending || remove.isPending;

  return (
    <View className="gap-5">
      <Text className="text-lg font-bold">Edit Brand</Text>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Brand name</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.mutedForeground}
          className="h-12"
        />
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Slug</Text>
        <View className="h-12 flex-row items-center overflow-hidden rounded-lg border border-input">
          <Text className="flex-1 px-3 text-sm text-muted-foreground" numberOfLines={1}>
            {brand.slug}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          Slug cannot be changed after creation.
        </Text>
      </View>

      <SelectField
        label="Category"
        value={category}
        options={CATEGORY_OPTIONS}
        onChange={setCategory}
        placeholder="Select a category"
      />

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Description (optional)</Text>
        <Input
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="A short description of the brand"
          placeholderTextColor={colors.mutedForeground}
          className="h-24 py-3"
          style={{ textAlignVertical: "top" }}
        />
      </View>

      <View className="gap-2">
        <Text className="text-base text-muted-foreground">Status</Text>
        <View className="flex-row gap-2">
          {(["active", "inactive"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className={cn(
                "flex-1 items-center rounded-lg border py-2.5",
                status === s
                  ? "border-transparent bg-primary"
                  : "border-border bg-secondary",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium capitalize",
                  status === s && "text-primary-foreground",
                )}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FormError error={save.error ?? remove.error} />

      <Pressable
        onPress={() => save.mutate()}
        disabled={name.trim().length < 2 || busy}
        className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
      >
        <Check color={colors.primaryForeground} size={18} />
        <Text className="text-base font-semibold text-primary-foreground">
          {save.isPending ? "Saving…" : "Save Changes"}
        </Text>
      </Pressable>

      {/* Danger zone */}
      <View className="mt-2 gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
        <View>
          <Text className="text-base font-semibold text-red-500">Delete Brand</Text>
          <Text className="text-sm text-muted-foreground">
            Permanently remove this brand and its data. This cannot be undone.
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
            <Text className="text-sm font-medium text-red-500">Delete brand</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
