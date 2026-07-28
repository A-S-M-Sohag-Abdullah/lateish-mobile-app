import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  ChevronLeft,
  Download,
  ListFilter,
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
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import {
  MANAGED_USERS,
  USER_OVERVIEW,
  type ManagedUser,
  type UserRole,
  type UserStatus,
} from "@/lib/user-management-data";

const ROLE_BADGE: Record<UserRole, string> = {
  Admin: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  BDM: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "Brand Manager": "border-purple-500/30 bg-purple-500/10 text-purple-400",
  Analyst: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Finance: "border-green-500/30 bg-green-500/10 text-green-400",
  Viewer: "border-border bg-secondary text-muted-foreground",
};

const STATUS_DOT: Record<UserStatus, string> = {
  Active: "#22C55E",
  Invited: "#F59E0B",
  Inactive: "#EF4444",
};

export default function UserManagementScreen() {
  const router = useRouter();
  const colors = useThemeColors();

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
            <OverviewStat value={`${USER_OVERVIEW.totalUsers}`} label="Total Users" color="#3B82F6" />
            <StatDivider />
            <OverviewStat value={`${USER_OVERVIEW.activeUsers}`} label="Active Users" color="#22C55E" />
            <StatDivider />
            <OverviewStat value={`${USER_OVERVIEW.pendingInvites}`} label="Pending Invites" color="#F59E0B" />
            <StatDivider />
            <OverviewStat value={`${USER_OVERVIEW.roles}`} label="Roles" color="#A855F7" />
          </View>
        </View>

        {/* Search + Filter + Sort */}
        <View className="flex-row gap-2">
          <View className="h-11 flex-1 flex-row items-center gap-2 rounded-lg border border-input bg-white/[0.03] px-3">
            <Search color={colors.mutedForeground} size={16} />
            <TextInput
              placeholder="Search users by name, email or role..."
              placeholderTextColor={colors.mutedForeground}
              className="flex-1 text-sm text-foreground"
            />
          </View>
          <Pressable className="h-11 flex-row items-center gap-1.5 rounded-lg border border-border bg-white/[0.03] px-3 active:opacity-80">
            <ListFilter color={colors.foreground} size={16} />
            <Text className="text-sm">Filter</Text>
          </Pressable>
          <Pressable className="h-11 flex-row items-center gap-1.5 rounded-lg border border-border bg-white/[0.03] px-3 active:opacity-80">
            <ArrowUpDown color={colors.foreground} size={16} />
            <Text className="text-sm">Sort</Text>
          </Pressable>
        </View>

        {/* Invite + Export */}
        <View className="flex-row items-center justify-between">
          <Pressable className="h-11 flex-row items-center gap-1.5 rounded-lg bg-blue-600 px-4 active:opacity-90">
            <Plus color="#FFFFFF" size={18} />
            <Text className="text-sm font-medium text-white">Invite User</Text>
          </Pressable>
          <Pressable className="h-11 flex-row items-center gap-1.5 rounded-lg border border-border bg-white/[0.03] px-4 active:opacity-80">
            <Download color={colors.foreground} size={16} />
            <Text className="text-sm">Export Users</Text>
          </Pressable>
        </View>

        {/* User list */}
        <View className="overflow-hidden rounded-2xl border border-border bg-white/[0.03]">
          {MANAGED_USERS.map((user, i) => (
            <Fragment key={user.email}>
              {i > 0 ? <View className="ml-4 h-px bg-border/50" /> : null}
              <UserRow user={user} />
            </Fragment>
          ))}
        </View>
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

function UserRow({ user }: { user: ManagedUser }) {
  return (
    <View className="flex-row items-center gap-2.5 px-4 py-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: user.color }}
      >
        <Text className="text-xs font-semibold text-white">{user.initials}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold" numberOfLines={1}>
          {user.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {user.email}
        </Text>
      </View>

      <View className={cn("rounded-full border px-2 py-0.5", ROLE_BADGE[user.role])}>
        <Text className={cn("text-xs font-medium", ROLE_BADGE[user.role])} numberOfLines={1}>
          {user.role}
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_DOT[user.status] }} />
        <Text className="text-xs text-muted-foreground">{user.status}</Text>
      </View>

      <Pressable hitSlop={6} className="active:opacity-70">
        <MoreVertical color="#64748B" size={18} />
      </Pressable>
    </View>
  );
}
