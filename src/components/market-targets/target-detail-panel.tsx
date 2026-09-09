import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AutoPopulateSheet } from "@/components/market-targets/auto-populate-sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import type { TargetRecord } from "@/lib/market-targets-data";
import { formatCount } from "@/lib/mock-data";
import type { ApiTerritory } from "@/types/territory";

interface TargetDetailPanelProps {
  target: TargetRecord;
  onClose: () => void;
}

/** Body of the slide-in target detail. Rendered inside a RightSheet. */
export function TargetDetailPanel({ target, onClose }: TargetDetailPanelProps) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const casesPct = target.cases.current / target.cases.target;
  const distPct = target.distribution.current / target.distribution.target;

  const [autoPopulateOpen, setAutoPopulateOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Only fetched to resolve this target's territory + check whether it has a
  // search area set yet (auto-populate needs one — configured in Territories).
  const { data: territories = [] } = useQuery({
    queryKey: ["territories", orgId],
    queryFn: () =>
      api.get<ApiTerritory[]>(`/organizations/${orgId}/territories`),
    enabled: !!orgId && !!target.territoryId,
  });
  const territory =
    territories.find((t) => t.id === target.territoryId) ?? null;
  const canAutoPopulate =
    !!territory && territory.center_lat != null && territory.center_lng != null;

  const del = useMutation({
    mutationFn: () =>
      api.delete(`/organizations/${orgId}/market-targets/${target.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-targets", orgId] });
      onClose();
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          className="h-11 w-11 items-center justify-center self-start rounded-lg active:bg-muted"
        >
          <ArrowLeft color={colors.foreground} size={24} />
        </Pressable>

        <View className="gap-2">
          <Text className="text-4xl font-semibold">{target.location}</Text>
          <Text className="text-base text-muted-foreground">
            {target.dateRange} Day {target.dayCurrent} of {target.dayTotal}
          </Text>
          <View className="mt-1 self-start rounded-full bg-warning/15 px-4 py-1.5">
            <Text className="text-base font-medium text-warning">
              {target.confidence}
            </Text>
          </View>
        </View>

        <View className="gap-5">
          <View className="flex-row items-center gap-2">
            <MapPin color={colors.foreground} size={20} />
            <Text className="text-xl font-bold">Execution Progress</Text>
          </View>

          <ProgressRow
            label="Time elapsed"
            value={target.timeElapsedPct}
            caption={`${Math.round(target.timeElapsedPct * 100)}% of time elapsed`}
          />
          <ProgressRow
            label="Cases"
            value={casesPct}
            caption={`${Math.round(casesPct * 100)}% of target`}
          />
          <ProgressRow
            label="Distribution"
            value={distPct}
            caption={`${formatCount(target.distribution.current)}/${formatCount(
              target.distribution.target,
            )}`}
          />
        </View>

        {/* A&P Pacing — Inter Medium, 18px, line-height 16 (per spec). */}
        <View className="gap-2">
          <Text
            className="font-medium"
            style={{ fontSize: 18, lineHeight: 16 }}
          >
            A&P Pacing
          </Text>
          <Text
            className="font-medium"
            style={{ fontSize: 18, lineHeight: 16 }}
          >
            £{formatCount(target.apSpend)}{" "}
            <Text className="font-normal text-muted-foreground">
              / {target.apBudget}
            </Text>
          </Text>
        </View>

        <Text className="text-lg font-medium">{target.momentumNote}</Text>
      </ScrollView>

      <View className="gap-2 px-6 pb-2 pt-3">
        <Button
          variant="default"
          size="lg"
          disabled={!canAutoPopulate}
          onPress={() => setAutoPopulateOpen(true)}
        >
          <Sparkles color={colors.primaryForeground} size={18} />
          <Text>Auto-Populate Accounts</Text>
        </Button>
        {!canAutoPopulate ? (
          <Text className="text-xs text-muted-foreground">
            {territory
              ? "Set a search area on this territory first (Territories) to enable auto-populate."
              : "This target has no territory assigned, so auto-populate can't run."}
          </Text>
        ) : null}

        {confirmingDelete ? (
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={del.isPending}
              onPress={() => setConfirmingDelete(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="brand"
              size="lg"
              className="flex-1"
              disabled={del.isPending}
              onPress={() => del.mutate()}
            >
              <Text>{del.isPending ? "Deleting…" : "Confirm Delete"}</Text>
            </Button>
          </View>
        ) : (
          <Button
            variant="brand"
            size="lg"
            onPress={() => setConfirmingDelete(true)}
          >
            <Text>Delete Target</Text>
          </Button>
        )}
      </View>

      {territory && canAutoPopulate ? (
        <AutoPopulateSheet
          visible={autoPopulateOpen}
          onClose={() => setAutoPopulateOpen(false)}
          orgId={orgId}
          territory={territory}
          brandName={target.brandName}
          channels={target.channels}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ProgressRow({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <View className="gap-2">
      <Text className="text-base text-muted-foreground">{label}</Text>
      <Progress value={value} />
      <Text className="text-sm font-medium text-success">{caption}</Text>
    </View>
  );
}
