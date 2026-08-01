import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ArrowLeft, Building2, Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { MY_ORGS_QUERY_KEY } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { type OrgInvitation } from "@/types/organization";

/** Accept a full invite URL or a bare token/uuid. */
function extractToken(value: string): string {
  return value.split("/").pop()?.trim() ?? "";
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  org_admin: "Admin",
  bdm: "BDM",
  distributor: "Distributor",
};

export function JoinOrganizationFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const [token, setToken] = useState("");
  const [invitation, setInvitation] = useState<OrgInvitation | null>(null);

  const lookup = useMutation({
    mutationFn: (raw: string) =>
      api.get<OrgInvitation>(`/invitations/${extractToken(raw)}`),
    onSuccess: (data) => setInvitation(data),
    onError: () => setInvitation(null),
  });

  const accept = useMutation({
    mutationFn: () => api.post(`/invitations/${invitation?.token}/accept`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY });
      router.replace("/");
    },
  });

  const lookupError =
    lookup.isError && !invitation
      ? "No invitation found for that link. Check it and try again."
      : null;

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
        <Text className="text-2xl font-bold">Join an Organization</Text>
        <Text className="text-sm text-muted-foreground">
          Paste the invite link sent to you by your team admin.
        </Text>
      </View>

      <View className="gap-4 rounded-2xl border border-border bg-white/[0.03] p-4">
        <View className="gap-2">
          <Text className="text-sm font-medium">Invite link</Text>
          <View className="flex-row gap-2">
            <Input
              value={token}
              onChangeText={(v) => {
                setToken(v);
                setInvitation(null);
              }}
              autoCapitalize="none"
              placeholder="Paste invite link here…"
              placeholderTextColor={colors.mutedForeground}
              className="h-11 flex-1"
            />
            <Pressable
              onPress={() => lookup.mutate(token)}
              disabled={!token.trim() || lookup.isPending}
              className="h-11 items-center justify-center rounded-lg bg-primary px-4 active:opacity-90 disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-primary-foreground">
                {lookup.isPending ? "…" : "Look up"}
              </Text>
            </Pressable>
          </View>
        </View>

        {lookupError ? (
          <Text className="text-sm text-red-500">{lookupError}</Text>
        ) : null}

        {invitation && invitation.status === "pending" ? (
          <View className="gap-4">
            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 color={colors.primary} size={24} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold" numberOfLines={1}>
                  {invitation.organization?.name ?? "Unknown org"}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Role: {ROLE_LABELS[invitation.role] ?? invitation.role}
                </Text>
              </View>
            </View>

            {accept.isError ? (
              <Text className="text-sm text-red-500">
                {(accept.error as Error).message}
              </Text>
            ) : null}

            <Pressable
              onPress={() => accept.mutate()}
              disabled={accept.isPending}
              className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-primary active:opacity-90 disabled:opacity-50"
            >
              <Check color={colors.primaryForeground} size={16} />
              <Text className="font-medium text-primary-foreground">
                {accept.isPending ? "Joining…" : "Accept & Join"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {invitation && invitation.status !== "pending" ? (
          <Text className="text-sm capitalize text-red-500">
            This invitation has already been {invitation.status}.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
