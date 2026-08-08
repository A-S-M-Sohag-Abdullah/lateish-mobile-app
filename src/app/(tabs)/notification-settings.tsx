import { useGoBack } from "@/hooks/use-go-back";
import {
  Bell,
  ChevronLeft,
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
import { Fragment } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import {
  useNotificationPreferences,
  type PreferenceToggle,
} from "@/hooks/use-notification-preferences";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface ToggleItem {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  field: PreferenceToggle;
}

const CHANNELS: ToggleItem[] = [
  { icon: Smartphone, iconColor: "#3B82F6", iconBg: "bg-blue-500/15", title: "Push Notifications", subtitle: "Receive notifications on this device", field: "push_enabled" },
  { icon: Mail, iconColor: "#3B82F6", iconBg: "bg-blue-500/15", title: "Email Notifications", subtitle: "Receive notifications via email", field: "email_enabled" },
];

const PREFERENCES: ToggleItem[] = [
  { icon: LineChart, iconColor: "#22C55E", iconBg: "bg-green-500/15", title: "Sales & Performance Alerts", subtitle: "Get notified about sales updates and performance", field: "sales_performance" },
  { icon: Target, iconColor: "#A855F7", iconBg: "bg-purple-500/15", title: "Targets & Goals", subtitle: "Alerts for target progress and achievements", field: "targets_goals" },
  { icon: ShoppingCart, iconColor: "#D9A521", iconBg: "bg-amber-500/20", title: "Orders & Activities", subtitle: "Notifications for new orders and activities", field: "orders_activities" },
  { icon: DollarSign, iconColor: "#14B8A6", iconBg: "bg-teal-500/15", title: "Financial Updates", subtitle: "P&L updates, budgets and financial reports", field: "financial_updates" },
  { icon: Users, iconColor: "#F43F5E", iconBg: "bg-rose-500/15", title: "User & Access", subtitle: "Alerts for user invites and access changes", field: "user_access" },
  { icon: Megaphone, iconColor: "#8B5CF6", iconBg: "bg-violet-500/15", title: "System & Announcements", subtitle: "Important system updates and announcements", field: "system_announcements" },
];

// 30-minute time slots as 24h values with 12h labels for the pickers.
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const value = `${String(h).padStart(2, "0")}:${m}`;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { value, label: `${h12}:${m} ${period}` };
});
const labelForTime = (v: string) =>
  TIME_SLOTS.find((t) => t.value === v)?.label ?? v;
const timeForLabel = (l: string) =>
  TIME_SLOTS.find((t) => t.label === l)?.value ?? l;
const TIME_LABELS = TIME_SLOTS.map((t) => t.label);

export default function NotificationSettingsScreen() {
  const goBack = useGoBack();
  const colors = useThemeColors();
  const { prefs, isLoading, update } = useNotificationPreferences();

  const set = (patch: Parameters<typeof update.mutate>[0]) => update.mutate(patch);
  const globalOff = !prefs.global_enabled;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="gap-0.5 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => goBack()} hitSlop={8} className="active:opacity-70">
            <ChevronLeft color={colors.foreground} size={26} />
          </Pressable>
          <Text className="text-2xl font-bold">Notification Settings</Text>
        </View>
        <Text className="ml-9 text-sm text-muted-foreground">
          Manage how and when you want to be notified.
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-4 pb-16 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {/* Global */}
          <View className="rounded-2xl border border-border bg-white/[0.03] px-4">
            <ToggleRow
              icon={Bell}
              iconColor="#3B82F6"
              iconBg="bg-blue-500/15"
              title="Global Notifications"
              subtitle="Enable or disable all notifications"
              value={prefs.global_enabled}
              onToggle={() => set({ global_enabled: !prefs.global_enabled })}
            />
          </View>

          {/* Channels */}
          <View className="gap-2">
            <SectionLabel
              title="Notification Channels"
              subtitle="Choose where you want to receive notifications"
            />
            <Card
              items={CHANNELS}
              prefs={prefs}
              disabled={globalOff}
              onToggle={(field) => set({ [field]: !prefs[field] })}
            />
          </View>

          {/* Preferences */}
          <View className="gap-2">
            <SectionLabel
              title="Notification Preferences"
              subtitle="Choose the types of notifications you want to receive"
            />
            <Card
              items={PREFERENCES}
              prefs={prefs}
              disabled={globalOff}
              onToggle={(field) => set({ [field]: !prefs[field] })}
            />
          </View>

          {/* Quiet Hours */}
          <View className="gap-2">
            <SectionLabel
              title="Quiet Hours"
              subtitle="Choose when you don't want to receive push notifications"
            />
            <View className="gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
              <View className="flex-row items-center gap-3">
                <IconCircle icon={Moon} color="#A855F7" bg="bg-purple-500/15" />
                <View className="flex-1">
                  <Text className="text-base font-medium">Quiet Hours</Text>
                  <Text className="text-sm text-muted-foreground">
                    {prefs.quiet_hours_enabled
                      ? `${labelForTime(prefs.quiet_hours_start)} – ${labelForTime(prefs.quiet_hours_end)}`
                      : "Off"}
                  </Text>
                </View>
                <Toggle
                  value={prefs.quiet_hours_enabled}
                  onToggle={() =>
                    set({ quiet_hours_enabled: !prefs.quiet_hours_enabled })
                  }
                />
              </View>

              {prefs.quiet_hours_enabled ? (
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <SelectField
                      label="Start"
                      value={labelForTime(prefs.quiet_hours_start)}
                      options={TIME_LABELS}
                      onChange={(l) => set({ quiet_hours_start: timeForLabel(l) })}
                    />
                  </View>
                  <View className="flex-1">
                    <SelectField
                      label="End"
                      value={labelForTime(prefs.quiet_hours_end)}
                      options={TIME_LABELS}
                      onChange={(l) => set({ quiet_hours_end: timeForLabel(l) })}
                    />
                  </View>
                </View>
              ) : null}
            </View>
            <View className="flex-row items-center gap-1.5 pl-1">
              <Info color={colors.mutedForeground} size={13} />
              <Text className="text-xs text-muted-foreground">
                You will still receive important alerts during quiet hours.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

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

function Card({
  items,
  prefs,
  disabled,
  onToggle,
}: {
  items: ToggleItem[];
  prefs: Record<PreferenceToggle, boolean>;
  disabled?: boolean;
  onToggle: (field: PreferenceToggle) => void;
}) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-border bg-white/[0.03] px-4",
        disabled && "opacity-50",
      )}
      pointerEvents={disabled ? "none" : "auto"}
    >
      {items.map((item, i) => (
        <Fragment key={item.field}>
          {i > 0 ? <View className="h-px bg-border/50" /> : null}
          <ToggleRow
            icon={item.icon}
            iconColor={item.iconColor}
            iconBg={item.iconBg}
            title={item.title}
            subtitle={item.subtitle}
            value={prefs[item.field]}
            onToggle={() => onToggle(item.field)}
          />
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

function ToggleRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  value,
  onToggle,
}: {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <IconCircle icon={icon} color={iconColor} bg={iconBg} />
      <View className="flex-1">
        <Text className="text-base font-medium">{title}</Text>
        <Text className="text-xs text-muted-foreground">{subtitle}</Text>
      </View>
      <Toggle value={value} onToggle={onToggle} />
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
