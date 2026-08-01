import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Tag,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BRAND_CATEGORIES,
  BRAND_CATEGORY_LABEL,
  brandInitials,
  type ApiBrand,
} from "@/types/brand";
import { slugify } from "@/types/organization";

const CATEGORY_OPTIONS = BRAND_CATEGORIES.map((c) => BRAND_CATEGORY_LABEL[c]);

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Tag, title: "Brand Details", description: "Name, slug, and category" },
  { icon: FileText, title: "Brand Info", description: "Description and initial status" },
  { icon: CheckCircle2, title: "Review & Create", description: "Confirm and launch your brand" },
];

export function CreateBrandForm({
  orgId,
  brandsKey,
  onDone,
}: {
  orgId: string;
  brandsKey: readonly unknown[];
  onDone: () => void;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const create = useMutation({
    mutationFn: () =>
      api.post<ApiBrand>(`/organizations/${orgId}/brands`, {
        name: name.trim(),
        slug,
        category: category.toLowerCase(),
        description: description.trim() || undefined,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandsKey });
      onDone();
    },
  });

  function canAdvance() {
    if (step === 0)
      return name.trim().length >= 2 && slug.trim().length >= 2 && category !== "";
    return true;
  }

  const { icon: StepIcon, title, description: stepDescription } = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View className="gap-6">
      {/* Step header */}
      <View className="gap-3">
        <Pressable
          onPress={() => (step === 0 ? onDone() : setStep((s) => s - 1))}
          className="flex-row items-center gap-1 self-start active:opacity-70"
        >
          <ChevronLeft color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </Text>
          </View>
          <Progress value={(step + 1) / STEPS.length} indicatorClassName="bg-primary" />
        </View>

        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <StepIcon color={colors.primary} size={22} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold">{title}</Text>
            <Text className="text-sm text-muted-foreground">{stepDescription}</Text>
          </View>
        </View>
      </View>

      {/* Step 1 — details */}
      {step === 0 ? (
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Brand name</Text>
            <Input
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (!slugManual) setSlug(slugify(v));
              }}
              placeholder="Broken Barrier"
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
              placeholder="broken-barrier"
              placeholderTextColor={colors.mutedForeground}
              className="h-12"
            />
          </View>
          <SelectField
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={setCategory}
            placeholder="Select a category"
          />
        </View>
      ) : null}

      {/* Step 2 — info */}
      {step === 1 ? (
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Description (optional)</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="A short description of the brand"
              placeholderTextColor={colors.mutedForeground}
              className="h-28 py-3"
              style={{ textAlignVertical: "top" }}
            />
          </View>
          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Initial status</Text>
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
        </View>
      ) : null}

      {/* Step 3 — review */}
      {step === 2 ? (
        <View className="gap-4">
          <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Text className="text-base font-bold text-primary">
                {brandInitials(name || "Brand")}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" numberOfLines={1}>
                {name || "—"}
              </Text>
              <Text className="text-xs capitalize text-muted-foreground">
                {category || "—"}
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
            <ReviewRow label="Name" value={name} />
            <ReviewRow label="Slug" value={slug} />
            <ReviewRow label="Category" value={category} />
            <ReviewRow label="Description" value={description || "None"} />
            <ReviewRow label="Status" value={status} />
          </View>
        </View>
      ) : null}

      <FormError error={create.error} />

      {/* Nav */}
      {isLast ? (
        <Pressable
          onPress={() => create.mutate()}
          disabled={create.isPending}
          className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
        >
          <CheckCircle2 color={colors.primaryForeground} size={18} />
          <Text className="text-base font-semibold text-primary-foreground">
            {create.isPending ? "Creating…" : "Create brand"}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setStep((s) => s + 1)}
          disabled={!canAdvance()}
          className="h-14 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-base font-semibold text-primary-foreground">Continue</Text>
          <ChevronRight color={colors.primaryForeground} size={18} />
        </Pressable>
      )}
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium capitalize" numberOfLines={1}>
        {value || "—"}
      </Text>
    </View>
  );
}
