import { LinearGradient } from "expo-linear-gradient";
import { Bell } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RightSheet } from "@/components/ui/right-sheet";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS, type NotificationItem, type Priority } from "@/lib/notifications-data";
import { useNotificationsStore } from "@/store/notifications.store";

const PRIORITY: Record<Priority, string> = {
  High: "bg-orange-500",
  Critical: "bg-red-700",
};

export function NotificationsPanel() {
  const open = useNotificationsStore((s) => s.open);
  const setOpen = useNotificationsStore((s) => s.setOpen);
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<"unread" | "all">("all");
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);

  const list = tab === "unread" ? items.filter((n) => !n.read) : items;

  function clear(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <RightSheet visible={open} onClose={() => setOpen(false)} widthRatio={0.88}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1" style={{ paddingTop: insets.top + 16 }}>
          {/* Explicit bg — theme tokens can render transparent inside a Modal. */}
          <LinearGradient
            colors={["#16223D", "#0A0F1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Title */}
          <Text className="px-5 text-3xl font-bold">Notifications</Text>

          {/* Tabs */}
          <View className="flex-row gap-3 px-5 pt-4">
            <TabButton
              label="Unread"
              active={tab === "unread"}
              onPress={() => setTab("unread")}
            />
            <TabButton
              label={`All (${items.length})`}
              active={tab === "all"}
              onPress={() => setTab("all")}
            />
          </View>

          {/* List / empty */}
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
              {list.map((n, i) => (
                <View key={n.id} className="gap-3">
                  {n.section && n.section !== list[i - 1]?.section ? (
                    <Text className="pt-1 text-lg font-bold">{n.section}</Text>
                  ) : null}
                  <Swipeable
                    renderRightActions={() => (
                      <Pressable
                        onPress={() => clear(n.id)}
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
                </View>
              ))}
            </ScrollView>
          )}

          {/* Mark all as read */}
          {list.length > 0 ? (
            <View
              className="px-5 pt-2"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <Pressable
                onPress={markAllRead}
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

function NotificationCard({ item }: { item: NotificationItem }) {
  const Icon = item.icon;
  return (
    <View className="flex-row gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: item.iconBg }}
      >
        <Icon color="#FFFFFF" size={18} />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="shrink text-base font-bold" numberOfLines={1}>
            {item.title}
          </Text>
          <View className={cn("rounded-md px-2 py-0.5", PRIORITY[item.priority])}>
            <Text className="text-xs font-semibold text-white">
              {item.priority}
            </Text>
          </View>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground" numberOfLines={2}>
          {item.description}
        </Text>
        <Text className="pt-1 text-xs text-muted-foreground">{item.time}</Text>
      </View>
    </View>
  );
}
