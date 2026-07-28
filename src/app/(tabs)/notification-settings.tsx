import { useRouter } from "expo-router";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Info,
  LineChart,
  Mail,
  Megaphone,
  Moon,
  ShoppingCart,
  Smartphone,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { Fragment, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface ToggleItem {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

const CHANNELS: ToggleItem[] = [
  { icon: Smartphone, iconColor: "#3B82F6", iconBg: "bg-blue-500/15", title: "Push Notifications", subtitle: "Receive notifications on this device" },
  { icon: Mail, iconColor: "#3B82F6", iconBg: "bg-blue-500/15", title: "Email Notifications", subtitle: "Receive notifications via email" },
];

const PREFERENCES: ToggleItem[] = [
  { icon: LineChart, iconColor: "#22C55E", iconBg: "bg-green-500/15", title: "Sales & Performance Alerts", subtitle: "Get notified about sales updates and performance" },
  { icon: Target, iconColor: "#A855F7", iconBg: "bg-purple-500/15", title: "Targets & Goals", subtitle: "Alerts for target progress and achievements" },
  { icon: ShoppingCart, iconColor: "#D9A521", iconBg: "bg-amber-500/20", title: "Orders & Activities", subtitle: "Notifications for new orders and activities" },
  { icon: DollarSign, iconColor: "#14B8A6", iconBg: "bg-teal-500/15", title: "Financial Updates", subtitle: "P&L updates, budgets and financial reports" },
  { icon: Users, iconColor: "#F43F5E", iconBg: "bg-rose-500/15", title: "User & Access", subtitle: "Alerts for user invites and access changes" },
  { icon: Megaphone, iconColor: "#8B5CF6", iconBg: "bg-violet-500/15", title: "System & Announcements", subtitle: "Important system updates and announcements" },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="gap-0.5 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
            <ChevronLeft color={colors.foreground} size={26} />
          </Pressable>
          <Text className="text-2xl font-bold">Notification Settings</Text>
        </View>
        <Text className="ml-9 text-sm text-muted-foreground">
          Manage how and when you want to be notified.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Global */}
        <View className="rounded-2xl border border-border bg-white/[0.03] px-4">
          <ToggleRow
            item={{
              icon: Bell,
              iconColor: "#3B82F6",
              iconBg: "bg-blue-500/15",
              title: "Global Notifications",
              subtitle: "Enable or disable all notifications",
            }}
          />
        </View>

        {/* Channels */}
        <View className="gap-2">
          <SectionLabel
            title="Notification Channels"
            subtitle="Choose where you want to receive notifications"
          />
          <Card items={CHANNELS} />
        </View>

        {/* Preferences */}
        <View className="gap-2">
          <SectionLabel
            title="Notification Preferences"
            subtitle="Choose the types of notifications you want to receive"
          />
          <Card items={PREFERENCES} />
        </View>

        {/* Quiet Hours */}
        <View className="gap-2">
          <SectionLabel
            title="Quiet Hours"
            subtitle="Choose when you don't want to receive push notifications"
          />
          <Pressable className="flex-row items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-4 active:opacity-80">
            <IconCircle icon={Moon} color="#A855F7" bg="bg-purple-500/15" />
            <View className="flex-1">
              <Text className="text-base font-medium">Quiet Hours</Text>
              <Text className="text-sm text-muted-foreground">10:00 PM – 7:00 AM</Text>
            </View>
            <ChevronRight color="#64748B" size={20} />
          </Pressable>
          <View className="flex-row items-center gap-1.5 pl-1">
            <Info color={colors.mutedForeground} size={13} />
            <Text className="text-xs text-muted-foreground">
              You will still receive important alerts during quiet hours.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-base font-semibold">{title}</Text>
      <Text className="text-sm text-muted-foreground">{subtitle}</Text>
    </View>
  );
}

function Card({ items }: { items: ToggleItem[] }) {
  return (
    <View className="rounded-2xl border border-border bg-white/[0.03] px-4">
      {items.map((item, i) => (
        <Fragment key={item.title}>
          {i > 0 ? <View className="h-px bg-border/50" /> : null}
          <ToggleRow item={item} />
        </Fragment>
      ))}
    </View>
  );
}

function IconCircle({
  icon: Icon,
  color,
  bg,
}: {
  icon: LucideIcon;
  color: string;
  bg: string;
}) {
  return (
    <View className={cn("h-9 w-9 items-center justify-center rounded-full", bg)}>
      <Icon color={color} size={18} />
    </View>
  );
}

function ToggleRow({ item }: { item: ToggleItem }) {
  const [on, setOn] = useState(true);
  return (
    <View className="flex-row items-center gap-3 py-3">
      <IconCircle icon={item.icon} color={item.iconColor} bg={item.iconBg} />
      <View className="flex-1">
        <Text className="text-base font-medium">{item.title}</Text>
        <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
      </View>
      <Toggle value={on} onToggle={() => setOn((o) => !o)} />
    </View>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      className={cn(
        "h-6 w-11 justify-center rounded-full px-0.5 active:opacity-90",
        value ? "items-end bg-blue-600" : "items-start bg-white/20",
      )}
    >
      <View className="h-5 w-5 rounded-full bg-white" />
    </Pressable>
  );
}
