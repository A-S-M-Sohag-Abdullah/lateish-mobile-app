import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import {
  Calendar,
  CircleAlert,
  CircleCheck,
  CreditCard,
  Plus,
  RefreshCw,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ApiActiveIntegration {
  id: string;
  provider: string;
  status: "active" | "inactive" | "error";
  lastSyncedAt: string | null;
  connectedAt: string;
}

const PROVIDER: Record<string, { name: string; icon: LucideIcon }> = {
  "google-calendar": { name: "Google Calendar", icon: Calendar },
  hubspot: { name: "HubSpot", icon: Users },
  salesforce: { name: "Salesforce", icon: Users },
  netsuite: { name: "NetSuite", icon: CreditCard },
  quickbooks: { name: "QuickBooks", icon: CreditCard },
  sap: { name: "SAP", icon: CreditCard },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const SUBTABS = ["Active Integrations", "Available Integrations"] as const;

export function IntegrationsTab() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();
  const [sub, setSub] = useState<string>("Active Integrations");

  const key = ["integrations", orgId] as const;
  const { data: active = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () =>
      api.get<ApiActiveIntegration[]>(`/organizations/${orgId}/integrations`),
    enabled: !!orgId,
  });

  const disconnect = useMutation({
    mutationFn: (provider: string) =>
      api.delete(`/organizations/${orgId}/integrations/${provider}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const connectGoogle = useMutation({
    mutationFn: () =>
      api.get<{ url: string }>(
        `/organizations/${orgId}/integrations/google-calendar/connect`,
      ),
    onSuccess: (res) => {
      if (res?.url) WebBrowser.openBrowserAsync(res.url);
    },
  });

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
          const activeTab = t === sub;
          return (
            <Pressable
              key={t}
              onPress={() => setSub(t)}
              className={cn(
                "h-10 items-center justify-center rounded-md px-4",
                activeTab ? "bg-brand-maroon" : "bg-secondary",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  activeTab ? "text-white" : "text-muted-foreground",
                )}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {sub === "Active Integrations" ? (
        isLoading ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">
            Loading integrations…
          </Text>
        ) : active.length === 0 ? (
          <View className="items-center rounded-2xl border border-border bg-card p-8">
            <Text className="text-center text-sm text-muted-foreground">
              No active integrations. Connect one from the Available tab.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {active.map((item) => (
              <IntegrationCard
                key={item.id}
                item={item}
                onDisconnect={() => disconnect.mutate(item.provider)}
                disconnecting={disconnect.isPending}
              />
            ))}
          </View>
        )
      ) : (
        <AvailableGoogleCalendar
          onConnect={() => connectGoogle.mutate()}
          connecting={connectGoogle.isPending}
        />
      )}
    </View>
  );
}

function AvailableGoogleCalendar({
  onConnect,
  connecting,
}: {
  onConnect: () => void;
  connecting: boolean;
}) {
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
      <Pressable
        onPress={onConnect}
        disabled={connecting}
        className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-white active:opacity-90 disabled:opacity-60"
      >
        {connecting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Plus color="#000000" size={20} />
        )}
        <Text className="text-base font-semibold text-black">
          Connect to Google calendar
        </Text>
      </Pressable>
    </View>
  );
}

function IntegrationCard({
  item,
  onDisconnect,
  disconnecting,
}: {
  item: ApiActiveIntegration;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const colors = useThemeColors();
  const meta = PROVIDER[item.provider] ?? { name: item.provider, icon: Users };
  const Icon = meta.icon;
  const ok = item.status === "active";

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon color={colors.foreground} size={20} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base font-bold" numberOfLines={1}>
            {meta.name}
          </Text>
          {ok ? (
            <CircleCheck color="#22C55E" size={16} />
          ) : (
            <CircleAlert color="#F59E0B" size={16} />
          )}
        </View>
        <Text className="text-sm text-muted-foreground">
          Last sync: {timeAgo(item.lastSyncedAt)}
        </Text>
      </View>

      <View className="flex-row items-center gap-2.5">
        <View className="h-8 flex-row items-center gap-1.5 rounded-md border border-border px-2.5">
          <RefreshCw color={colors.foreground} size={13} />
          <Text className="text-xs font-medium">Sync Now</Text>
        </View>
        <Pressable onPress={onDisconnect} disabled={disconnecting}>
          <Toggle value={ok} />
        </Pressable>
        <Settings color={colors.mutedForeground} size={18} />
      </View>
    </View>
  );
}

function Toggle({ value }: { value: boolean }) {
  return (
    <View
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
    </View>
  );
}
