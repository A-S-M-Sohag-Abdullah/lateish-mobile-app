import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  Mail,
  MoreVertical,
  Plus,
  Search,
  UserMinus,
  Users,
  X,
} from "lucide-react-native";
import { Fragment, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FormError } from "@/components/auth/form-error";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  type BackendRole,
  type OrgInvitation,
  type OrgMember,
} from "@/types/organization";

const ASSIGNABLE_ROLES: { key: BackendRole; label: string }[] = [
  { key: "org_admin", label: "Admin" },
  { key: "bdm", label: "BDM" },
  { key: "distributor", label: "Distributor" },
];

// Backend roles → display label + badge style (keeps the existing badge look).
const ROLE_LABEL: Record<BackendRole, string> = {
  owner: "Owner",
  org_admin: "Admin",
  bdm: "BDM",
  distributor: "Distributor",
};
const ROLE_BADGE: Record<BackendRole, string> = {
  owner: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  org_admin: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  bdm: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  distributor: "border-orange-500/30 bg-orange-500/10 text-orange-400",
};

// Status → dot colour + label.
function statusMeta(status: string): { label: string; dot: string } {
  const s = status.toLowerCase();
  if (s === "active") return { label: "Active", dot: "#22C55E" };
  if (s === "invited" || s === "pending") return { label: "Invited", dot: "#F59E0B" };
  return { label: status.charAt(0).toUpperCase() + status.slice(1), dot: "#EF4444" };
}

// Deterministic avatar colour so initials circles stay varied (as in the design).
const AVATAR_COLORS = [
  "#2563EB", "#0D9488", "#B7791F", "#7C3AED",
  "#059669", "#DB2777", "#DC2626", "#475569",
];
function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function memberName(m: OrgMember): string {
  const parts = [m.user.first_name, m.user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : m.user.email;
}
function initialsFor(name: string): string {
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?"
  );
}

export default function UserManagementScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();
  const myId = useAuthStore((s) => s.profile?.id);
  // Only an owner or admin may manage members. Role precedence:
  // Owner → Admin → BDM / Distributor.
  const canManage =
    currentOrg?.backendRole === "owner" || currentOrg?.backendRole === "org_admin";

  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionMember, setActionMember] = useState<OrgMember | null>(null);

  const membersKey = ["organizations", orgId, "members"] as const;
  const { data: members = [], isLoading } = useQuery({
    queryKey: membersKey,
    queryFn: () => api.get<OrgMember[]>(`/organizations/${orgId}/members`),
    enabled: !!orgId,
  });

  const invitationsKey = ["organizations", orgId, "invitations"] as const;
  const { data: invitations = [] } = useQuery({
    queryKey: invitationsKey,
    queryFn: () => api.get<OrgInvitation[]>(`/organizations/${orgId}/invitations`),
    enabled: !!orgId,
  });

  const changeRole = useMutation({
    mutationFn: (vars: { userId: string; role: BackendRole }) =>
      api.patch(`/organizations/${orgId}/members/${vars.userId}/role`, {
        role: vars.role,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/organizations/${orgId}/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });

  const activeUsers = members.filter((m) => m.status.toLowerCase() === "active").length;
  const pendingInvites = invitations.filter(
    (i) => i.status === "pending",
  ).length;
  const roleCount = new Set(members.map((m) => m.role)).size;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">User Management</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Overview */}
        <View className="rounded-2xl border border-border bg-white/[0.03] p-4">
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
              <Users color="#E5E7EB" size={18} />
            </View>
            <Text className="text-lg font-bold">Overview</Text>
          </View>
          <View className="flex-row">
            <OverviewStat value={`${members.length}`} label="Total Users" color="#3B82F6" />
            <StatDivider />
            <OverviewStat value={`${activeUsers}`} label="Active Users" color="#22C55E" />
            <StatDivider />
            <OverviewStat value={`${pendingInvites}`} label="Pending Invites" color="#F59E0B" />
            <StatDivider />
            <OverviewStat value={`${roleCount}`} label="Roles" color="#A855F7" />
          </View>
        </View>

        {/* Search + Invite */}
        <View className="flex-row gap-2">
          <View className="h-11 flex-1 flex-row items-center gap-2 rounded-lg border border-input bg-white/[0.03] px-3">
            <Search color={colors.mutedForeground} size={16} />
            <TextInput
              placeholder="Search users by name, email or role..."
              placeholderTextColor={colors.mutedForeground}
              className="flex-1 text-sm text-foreground"
            />
          </View>
          <Pressable
            onPress={() => setInviteOpen(true)}
            className="h-11 flex-row items-center gap-1.5 rounded-lg bg-blue-600 px-4 active:opacity-90"
          >
            <Plus color="#FFFFFF" size={18} />
            <Text className="text-sm font-medium text-white">Invite</Text>
          </Pressable>
        </View>

        {/* User list */}
        {isLoading ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">Loading…</Text>
        ) : members.length === 0 ? (
          <View className="items-center gap-1 py-12">
            <Text className="text-base font-semibold">No members yet</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Invite teammates to your organization to see them here.
            </Text>
          </View>
        ) : (
          <View className="overflow-hidden rounded-2xl border border-border bg-white/[0.03]">
            {members.map((member, i) => {
              // Owners can't be managed; you can't manage yourself; only
              // owner/admin can manage at all.
              const actionable =
                canManage && member.role !== "owner" && member.user_id !== myId;
              return (
                <Fragment key={member.user_id}>
                  {i > 0 ? <View className="ml-4 h-px bg-border/50" /> : null}
                  <UserRow
                    member={member}
                    actionable={actionable}
                    onActions={() => setActionMember(member)}
                  />
                </Fragment>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomTabBar />

      <InviteModal
        orgId={orgId}
        invitationsKey={invitationsKey}
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      {actionMember ? (
        <MemberActionsSheet
          key={actionMember.user_id}
          member={actionMember}
          onClose={() => setActionMember(null)}
          onChangeRole={(role) => {
            changeRole.mutate({ userId: actionMember.user_id, role });
            setActionMember(null);
          }}
          onRemove={() => {
            removeMember.mutate(actionMember.user_id);
            setActionMember(null);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function MemberActionsSheet({
  member,
  onClose,
  onChangeRole,
  onRemove,
}: {
  member: OrgMember;
  onClose: () => void;
  onChangeRole: (role: BackendRole) => void;
  onRemove: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState(false);
  const name = memberName(member);

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />
        <View
          style={{ paddingBottom: insets.bottom + 12 }}
          className="rounded-t-2xl border-t border-border bg-popover px-4 pt-4"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-bold" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {member.user.email}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} className="active:opacity-70">
              <X color={colors.mutedForeground} size={20} />
            </Pressable>
          </View>

          <Text className="px-1 py-1 text-xs font-medium text-muted-foreground">
            Change role
          </Text>
          {ASSIGNABLE_ROLES.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => onChangeRole(r.key)}
              className="flex-row items-center justify-between rounded-lg px-3 py-3 active:bg-white/5"
            >
              <Text className="text-base">{r.label}</Text>
              {member.role === r.key ? (
                <Check color={colors.primary} size={18} />
              ) : null}
            </Pressable>
          ))}

          <View className="my-1 h-px bg-border/60" />

          {confirming ? (
            <View className="gap-2 py-1">
              <Text className="px-1 text-sm text-muted-foreground">
                Remove {name} from the organization?
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setConfirming(false)}
                  className="flex-1 items-center rounded-lg border border-border bg-secondary py-3 active:opacity-80"
                >
                  <Text className="text-sm font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={onRemove}
                  className="flex-1 items-center rounded-lg bg-red-600 py-3 active:opacity-90"
                >
                  <Text className="text-sm font-medium text-white">Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setConfirming(true)}
              className="flex-row items-center gap-2 rounded-lg px-3 py-3 active:bg-red-500/10"
            >
              <UserMinus color="#EF4444" size={18} />
              <Text className="text-base text-red-500">Remove member</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

function InviteModal({
  orgId,
  invitationsKey,
  visible,
  onClose,
}: {
  orgId: string;
  invitationsKey: readonly unknown[];
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BackendRole>("bdm");

  const invite = useMutation({
    mutationFn: () =>
      api.post(`/organizations/${orgId}/invitations`, {
        email: email.trim(),
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsKey });
      setEmail("");
      setRole("bdm");
      onClose();
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop as a sibling layer behind the card — clicking the card does
            not bubble to it (which on web would otherwise close the modal). */}
        <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />
        <View className="w-full gap-4 rounded-2xl border border-border bg-popover p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">Invite a Member</Text>
            <Pressable onPress={onClose} hitSlop={8} className="active:opacity-70">
              <X color={colors.mutedForeground} size={20} />
            </Pressable>
          </View>

          <View className="gap-2">
            <Text className="text-sm text-muted-foreground">Email address</Text>
            <View className="h-12 flex-row items-center gap-2 rounded-lg border border-input bg-white/[0.03] px-3">
              <Mail color={colors.mutedForeground} size={16} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="colleague@example.com"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 text-base text-foreground"
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm text-muted-foreground">Role</Text>
            <View className="flex-row gap-2">
              {ASSIGNABLE_ROLES.map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  className={cn(
                    "flex-1 items-center rounded-lg border py-2.5",
                    role === r.key
                      ? "border-transparent bg-primary"
                      : "border-border bg-secondary",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      role === r.key && "text-primary-foreground",
                    )}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <FormError error={invite.error} />

          <Pressable
            onPress={() => invite.mutate()}
            disabled={!email.trim() || invite.isPending}
            className="h-12 items-center justify-center rounded-lg bg-blue-600 active:opacity-90 disabled:opacity-50"
          >
            <Text className="text-base font-semibold text-white">
              {invite.isPending ? "Sending…" : "Send Invite"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function OverviewStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-center text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

function StatDivider() {
  return <View className="w-px self-stretch bg-border/60" />;
}

function UserRow({
  member,
  actionable,
  onActions,
}: {
  member: OrgMember;
  actionable: boolean;
  onActions: () => void;
}) {
  const name = memberName(member);
  const status = statusMeta(member.status);
  return (
    <View className="flex-row items-center gap-2.5 px-4 py-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: avatarColor(member.user_id || member.user.email) }}
      >
        <Text className="text-xs font-semibold text-white">{initialsFor(name)}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {member.user.email}
        </Text>
      </View>

      <View
        className={cn(
          "rounded-full border px-2 py-0.5",
          ROLE_BADGE[member.role] ?? "border-border bg-secondary",
        )}
      >
        <Text
          className={cn(
            "text-xs font-medium",
            ROLE_BADGE[member.role] ?? "text-muted-foreground",
          )}
          numberOfLines={1}
        >
          {ROLE_LABEL[member.role] ?? member.role}
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
        <Text className="text-xs text-muted-foreground">{status.label}</Text>
      </View>

      {actionable ? (
        <Pressable onPress={onActions} hitSlop={6} className="active:opacity-70">
          <MoreVertical color="#64748B" size={18} />
        </Pressable>
      ) : (
        <View style={{ width: 18 }} />
      )}
    </View>
  );
}
