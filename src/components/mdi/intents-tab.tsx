import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { IntentCard } from "@/components/mdi/intent-card";
import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import {
  STATUS_FILTERS,
  type Confidence,
  type IntentRecord,
  type IntentStatus,
} from "@/lib/mdi-data";
import type { ApiMdiIntent, MdiIntentStatus } from "@/types/mdi";

const STATUS_LABEL: Record<MdiIntentStatus, IntentStatus> = {
  draft: "Submitted",
  submitted: "Submitted",
  brand_review: "Brand Review",
  distributor_review: "Distributor Review",
  converted: "Converted",
  rejected: "Lost",
  expired: "Lost",
};

function mapIntent(i: ApiMdiIntent): IntentRecord {
  const items = i.line_items ?? [];
  const cases = items.reduce((s, li) => s + (li.qty_cases ?? 0), 0);
  const daysLeft = i.expires_at
    ? Math.floor((new Date(i.expires_at).getTime() - Date.now()) / 86400000)
    : null;
  return {
    id: i.id,
    account: i.account_name ?? "Unknown account",
    region: i.state ?? i.city ?? "—",
    premise: i.account_type === "off-premise" ? "Off-Premise" : "On-Premise",
    status: STATUS_LABEL[i.status] ?? "Submitted",
    buyer: i.buyer_name ?? "—",
    cases,
    items: items.length,
    windowDays: i.conversion_window_days,
    confidence: ((i.confidence.charAt(0).toUpperCase() +
      i.confidence.slice(1)) as Confidence),
    daysLeft: daysLeft != null && daysLeft < 0 ? null : daysLeft,
  };
}

export function IntentsTab() {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const [status, setStatus] = useState<string>("All Status");

  const { data: page, isLoading } = useQuery({
    queryKey: ["mdi-intents", "list", orgId],
    queryFn: () =>
      api.getPaginated<ApiMdiIntent>(
        `/organizations/${orgId}/mdi/intents?limit=100&page=1`,
      ),
    enabled: !!orgId,
  });

  const intents = useMemo(
    () => (page?.data ?? []).map(mapIntent),
    [page],
  );
  const rows = useMemo(
    () =>
      status === "All Status"
        ? intents
        : intents.filter((i) => i.status === status),
    [status, intents],
  );

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Dropdown
          options={STATUS_FILTERS}
          value={status}
          onChange={setStatus}
          size="md"
          className="flex-1"
        />
        <Pressable className="h-12 flex-row items-center gap-2 rounded-lg border border-border px-4 active:opacity-70">
          <Download color={colors.foreground} size={18} />
          <Text className="text-sm font-medium">Export</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text variant="muted" className="py-8 text-center">
          Loading intents…
        </Text>
      ) : rows.length === 0 ? (
        <Text variant="muted" className="py-8 text-center">
          {intents.length === 0
            ? "No intents yet."
            : "No intents with this status."}
        </Text>
      ) : (
        rows.map((intent) => <IntentCard key={intent.id} intent={intent} />)
      )}
    </View>
  );
}
