import {
  Calendar,
  CircleAlert,
  CircleCheck,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import {
  ACTIVE_INTEGRATIONS,
  type ActiveIntegration,
} from "@/lib/performance-data";

const SUBTABS = ["Active Integrations", "Available Integrations"] as const;

export function IntegrationsTab() {
  const [sub, setSub] = useState<string>("Active Integrations");

  return (
    <View className="gap-5">
      {/* Header */}
      <View className="gap-1">
        <Text className="text-2xl font-bold">Advanced Integrations</Text>
        <Text className="text-sm leading-5 text-muted-foreground">
          Connect with CRM, Calendar, payments, and inventory management systems
        </Text>
      </View>

      {/* Sub tabs */}
      <View className="flex-row gap-2">
        {SUBTABS.map((t) => {
          const active = t === sub;
          return (
            <Pressable
              key={t}
              onPress={() => setSub(t)}
              className={cn(
                "h-10 items-center justify-center rounded-md px-4",
                active ? "bg-brand-maroon" : "bg-secondary",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-white" : "text-muted-foreground",
                )}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {sub === "Active Integrations" ? (
        <View className="gap-3">
          {ACTIVE_INTEGRATIONS.map((item) => (
            <IntegrationCard key={item.name} item={item} />
          ))}
        </View>
      ) : (
        <AvailableGoogleCalendar />
      )}
    </View>
  );
}

function AvailableGoogleCalendar() {
  const colors = useThemeColors();
  return (
    <View className="gap-3">
      <View className="items-center gap-2 rounded-2xl border border-border bg-card p-5">
        <Calendar color={colors.foreground} size={26} />
        <Text className="text-base font-semibold">Connect Google Calendar</Text>
        <Text className="text-center text-sm leading-5 text-muted-foreground">
          Connect your Google Calendar to automatically sync events and schedule
          follow-ups
        </Text>
      </View>
      <View className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-white">
        <Plus color="#000000" size={20} />
        <Text className="text-base font-semibold text-black">
          Connect to Google calendar
        </Text>
      </View>
    </View>
  );
}

function IntegrationCard({ item }: { item: ActiveIntegration }) {
  const colors = useThemeColors();
  const Icon = item.icon;
  const [on, setOn] = useState(item.enabled);

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon color={colors.foreground} size={20} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base font-bold" numberOfLines={1}>
            {item.name}
          </Text>
          {item.status === "ok" ? (
            <CircleCheck color="#22C55E" size={16} />
          ) : (
            <CircleAlert color="#F59E0B" size={16} />
          )}
        </View>
        <Text className="text-sm text-muted-foreground">
          Last sync: {item.lastSync}
        </Text>
      </View>

      <View className="flex-row items-center gap-2.5">
        <View
          className={cn(
            "h-8 flex-row items-center gap-1.5 rounded-md border border-border px-2.5",
            !on && "opacity-50",
          )}
        >
          <RefreshCw color={colors.foreground} size={13} />
          <Text className="text-xs font-medium">Sync Now</Text>
        </View>
        <Toggle value={on} onToggle={() => setOn((v) => !v)} />
        <Settings color={colors.mutedForeground} size={18} />
      </View>
    </View>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        padding: 3,
        backgroundColor: value ? "#FFFFFF" : "#3A3F47",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: value ? "#0B1220" : "#9CA3AF",
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );
}
