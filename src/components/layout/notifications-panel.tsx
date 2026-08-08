import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  CircleCheckBig,
  ClipboardCheck,
  Clock,
  Info,
  Package,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createClient } from "@supabase/supabase-js";

import { RightSheet } from "@/components/ui/right-sheet";
import { Text } from "@/components/ui/text";
import { notificationsKey, useNotifications } from "@/hooks/use-notifications";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/store/notifications.store";
import type { ApiNotification, NotificationPriority } from "@/types/notification";

const TYPE_ICON: Record<string, { icon: LucideIcon; bg: string }> = {
  churn_risk: { icon: TriangleAlert, bg: "#EAB308" },
  overdue_followup: { icon: Clock, bg: "#F97316" },
  target_behind: { icon: ClipboardCheck, bg: "#A855F7" },
  new_account: { icon: UserPlus, bg: "#22C55E" },
  intent_expiring: { icon: Info, bg: "#3B82F6" },
  order_progress: { icon: Package, bg: "#0EA5E9" },
};
const FALLBACK = { icon: CircleCheckBig, bg: "#6B7280" };

const PRIORITY: Record<NotificationPriority, { bg: string; text: string }> = {
  Critical: { bg: "bg-red-700", text: "text-white" },
  High: { bg: "bg-orange-500", text: "text-white" },
  Medium: { bg: "bg-secondary", text: "text-muted-foreground" },
  Low: { bg: "bg-secondary", text: "text-muted-foreground" },
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsPanel() {
  const open = useNotificationsStore((s) => s.open);
  const setOpen = useNotificationsStore((s) => s.setOpen);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { orgId, notifications, unread } = useNotifications();
  const [tab, setTab] = useState<"unread" | "all">("all");

  // On open, default to the Unread tab when there's anything unread — otherwise
  // All. Only re-evaluated on the open transition so it doesn't yank the tab
  // while the user is browsing.
  useEffect(() => {
    if (open) setTab(unread.length > 0 ? "unread" : "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Realtime: invalidate on any INSERT to this org's notifications.
  //
  // Uses a dedicated anon client (not the shared authenticated one) with a
  // unique channel name, mirroring the web app. The shared client authenticates
  // as the signed-in user, so its Realtime connection is gated by the stricter
  // `authenticated` RLS policy and is subject to token-refresh churn; a fresh
  // anon client cleanly hits the permissive `anon` SELECT policy. The unique
  // topic name avoids a wedged re-subscribe when the effect remounts.
  useEffect(() => {
    if (!orgId) return;
    const rt = createClient(env.supabaseUrl, env.supabaseAnonKey);
    const channel = rt
      .channel(`notifications_${orgId}_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `organization_id=eq.${orgId}`,
        },
        () =>
          queryClient.invalidateQueries({ queryKey: notificationsKey(orgId) }),
      )
      .subscribe();
    return () => {
      void rt.removeChannel(channel);
    };
  }, [orgId, queryClient]);

  const markAllRead = useMutation({
    mutationFn: () =>
      api.patch(`/organizations/${orgId}/notifications/read-all`, {}),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKey(orgId) });
      queryClient.setQueryData<ApiNotification[]>(
        notificationsKey(orgId),
        (old = []) =>
          old.map((n) => ({
            ...n,
            read_at: n.read_at ?? new Date().toISOString(),
          })),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKey(orgId) }),
  });

  const dismiss = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/organizations/${orgId}/notifications/${id}/dismiss`, {}),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationsKey(orgId) });
      queryClient.setQueryData<ApiNotification[]>(
        notificationsKey(orgId),
        (old = []) => old.filter((n) => n.id !== id),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsKey(orgId) }),
  });

  const list = tab === "unread" ? unread : notifications;

  return (
    <RightSheet visible={open} onClose={() => setOpen(false)} widthRatio={0.88}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1" style={{ paddingTop: insets.top + 16 }}>
          <LinearGradient
            colors={["#16223D", "#0A0F1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <Text className="px-5 text-3xl font-bold">Notifications</Text>

          <View className="flex-row gap-3 px-5 pt-4">
            <TabButton
              label="Unread"
              active={tab === "unread"}
              onPress={() => setTab("unread")}
            />
            <TabButton
              label={`All (${notifications.length})`}
              active={tab === "all"}
              onPress={() => setTab("all")}
            />
          </View>

          {list.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-3">
              <Bell color="#6B7280" fill="#6B7280" size={72} />
              <Text className="text-base font-medium text-red-500">
                No notifications found
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-3 px-5 pt-4 pb-4"
              showsVerticalScrollIndicator={false}
            >
              {list.map((n) => (
                <Swipeable
                  key={n.id}
                  renderRightActions={() => (
                    <Pressable
                      onPress={() => dismiss.mutate(n.id)}
                      className="ml-3 w-24 items-center justify-center rounded-2xl bg-red-950"
                    >
                      <Text className="text-base font-semibold text-red-500">
                        Clear
                      </Text>
                    </Pressable>
                  )}
                >
                  <NotificationCard item={n} />
                </Swipeable>
              ))}
            </ScrollView>
          )}

          {list.length > 0 ? (
            <View
              className="px-5 pt-2"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <Pressable
                onPress={() => markAllRead.mutate()}
                className="h-14 items-center justify-center rounded-2xl bg-brand-navy active:opacity-90"
              >
                <Text className="text-base font-semibold text-white">
                  Mark all as read
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </GestureHandlerRootView>
    </RightSheet>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "h-12 flex-1 items-center justify-center rounded-2xl",
        active ? "bg-brand-maroon" : "bg-secondary",
      )}
    >
      <Text
        className={cn(
          "text-base font-semibold",
          active ? "text-white" : "text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NotificationCard({ item }: { item: ApiNotification }) {
  const { icon: Icon, bg } = TYPE_ICON[item.type] ?? FALLBACK;
  const priority = PRIORITY[item.priority] ?? PRIORITY.Medium;
  return (
    <View className="flex-row gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: bg }}
      >
        <Icon color="#FFFFFF" size={18} />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="shrink text-base font-bold" numberOfLines={1}>
            {item.title}
          </Text>
          <View className={cn("rounded-md px-2 py-0.5", priority.bg)}>
            <Text className={cn("text-xs font-semibold", priority.text)}>
              {item.priority}
            </Text>
          </View>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground" numberOfLines={2}>
          {item.description}
        </Text>
        <Text className="pt-1 text-xs text-muted-foreground">
          {timeAgo(item.created_at)}
        </Text>
      </View>
    </View>
  );
}
