import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Plus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { MY_ORGS_QUERY_KEY } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { useOrgStore } from "@/store/organization.store";
import {
  slugify,
  type ApiCreatedOrg,
  type UserMembership,
} from "@/types/organization";

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

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Building2, title: "Organization Details", description: "Name and identify your organization" },
  { icon: Globe, title: "Industry & Region", description: "Tell us about your market" },
  { icon: Users, title: "Invite Members", description: "Add teammates (you can skip this)" },
  { icon: CheckCircle2, title: "Review & Create", description: "Confirm and launch your organization" },
];

export function CreateOrganizationForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const setCurrentOrgId = useOrgStore((s) => s.setCurrentOrgId);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.post<ApiCreatedOrg>("/organizations", {
        name: name.trim(),
        slug,
        plan: "starter",
        settings: { industry, region },
      }),
    onSuccess: (org) => {
      // Optimistically inject the new org so the org gate sees it immediately —
      // the /organizations/me refetch often doesn't return the fresh membership
      // right away, which would bounce us back to /setup. Reconcile in the
      // background (not awaited). Mirrors the web OrganizationProvider.addOrg.
      const membership: UserMembership = {
        user_id: "",
        organization_id: org.id,
        role: "owner",
        status: "active",
        joined_at: org.created_at,
        updated_at: org.created_at,
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan: "starter",
          status: "active",
          settings: { industry, region },
          created_at: org.created_at,
          updated_at: org.created_at,
        },
      };
      queryClient.setQueryData<UserMembership[]>(MY_ORGS_QUERY_KEY, (old = []) => [
        membership,
        ...old,
      ]);
      setCurrentOrgId(org.id);
      void queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY });
      router.replace("/");
    },
  });

  function canAdvance() {
    if (step === 0) return name.trim().length >= 2 && slug.trim().length >= 2;
    if (step === 1) return industry !== "" && region !== "";
    return true;
  }

  function addInvite() {
    const email = inviteInput.trim();
    if (email && !inviteEmails.includes(email)) {
      setInviteEmails((prev) => [...prev, email]);
    }
    setInviteInput("");
  }

  const { icon: StepIcon, title, description } = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View className="gap-6">
      {/* Step header */}
      <View className="gap-3">
        <Pressable
          onPress={() => (step === 0 ? onBack() : setStep((s) => s - 1))}
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
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
        </View>
      </View>

      {/* Step body */}
      {step === 0 ? (
        <View className="gap-5">
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
        </View>
      ) : null}

      {step === 1 ? (
        <View className="gap-5">
          <SelectField
            label="Industry"
            value={industry}
            options={INDUSTRIES}
            onChange={setIndustry}
            placeholder="Select an industry"
          />
          <SelectField
            label="Region"
            value={region}
            options={REGIONS}
            onChange={setRegion}
            placeholder="Select a region"
          />
        </View>
      ) : null}

      {step === 2 ? (
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-base text-muted-foreground">Teammate email</Text>
            <View className="flex-row gap-2">
              <Input
                value={inviteInput}
                onChangeText={setInviteInput}
                onSubmitEditing={addInvite}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="teammate@company.com"
                placeholderTextColor={colors.mutedForeground}
                className="h-12 flex-1"
              />
              <Pressable
                onPress={addInvite}
                disabled={!inviteInput.trim()}
                className="h-12 w-12 items-center justify-center rounded-lg bg-primary active:opacity-90 disabled:opacity-50"
              >
                <Plus color={colors.primaryForeground} size={20} />
              </Pressable>
            </View>
          </View>

          {inviteEmails.length > 0 ? (
            <View className="gap-2">
              {inviteEmails.map((email) => (
                <View
                  key={email}
                  className="flex-row items-center justify-between rounded-lg border border-border bg-white/[0.03] px-3 py-2.5"
                >
                  <Text className="flex-1 text-sm" numberOfLines={1}>
                    {email}
                  </Text>
                  <Pressable
                    onPress={() =>
                      setInviteEmails((prev) => prev.filter((e) => e !== email))
                    }
                    hitSlop={8}
                    className="active:opacity-70"
                  >
                    <X color={colors.mutedForeground} size={18} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground">
              No invites added yet — you can skip this and invite people later.
            </Text>
          )}
        </View>
      ) : null}

      {step === 3 ? (
        <View className="gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
          <ReviewRow label="Name" value={name} />
          <ReviewRow label="Slug" value={slug} />
          <ReviewRow label="Industry" value={industry} />
          <ReviewRow label="Region" value={region} />
          <ReviewRow
            label="Invites"
            value={
              inviteEmails.length > 0
                ? `${inviteEmails.length} member${inviteEmails.length > 1 ? "s" : ""}`
                : "None"
            }
          />
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
            {create.isPending ? "Creating…" : "Create organization"}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setStep((s) => s + 1)}
          disabled={!canAdvance()}
          className="h-14 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Continue
          </Text>
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
      <Text className="flex-1 text-right text-sm font-medium" numberOfLines={1}>
        {value || "—"}
      </Text>
    </View>
  );
}
