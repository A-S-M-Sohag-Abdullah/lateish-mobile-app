import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Search,
  Users,
} from "lucide-react-native";
import { Fragment } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  type BackendRole,
  type OrgInvitation,
  type OrgMember,
} from "@/types/organization";

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

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["organizations", orgId, "members"],
    queryFn: () => api.get<OrgMember[]>(`/organizations/${orgId}/members`),
    enabled: !!orgId,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["organizations", orgId, "invitations"],
    queryFn: () => api.get<OrgInvitation[]>(`/organizations/${orgId}/invitations`),
    enabled: !!orgId,
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

        {/* Search */}
        <View className="h-11 flex-row items-center gap-2 rounded-lg border border-input bg-white/[0.03] px-3">
          <Search color={colors.mutedForeground} size={16} />
          <TextInput
            placeholder="Search users by name, email or role..."
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 text-sm text-foreground"
          />
        </View>

        {/* Invite */}
        <Pressable className="h-11 flex-row items-center justify-center gap-1.5 self-start rounded-lg bg-blue-600 px-4 active:opacity-90">
          <Plus color="#FFFFFF" size={18} />
          <Text className="text-sm font-medium text-white">Invite User</Text>
        </Pressable>

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
            {members.map((member, i) => (
              <Fragment key={member.user_id}>
                {i > 0 ? <View className="ml-4 h-px bg-border/50" /> : null}
                <UserRow member={member} />
              </Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
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

function UserRow({ member }: { member: OrgMember }) {
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

      <Pressable hitSlop={6} className="active:opacity-70">
        <MoreVertical color="#64748B" size={18} />
      </Pressable>
    </View>
  );
}
