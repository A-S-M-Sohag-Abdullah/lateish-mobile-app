import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";

import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useRepTodaySummary } from "@/hooks/use-rep-today-summary";
import { api } from "@/lib/api";

export function PerformanceSection() {
  const { summary } = useRepTodaySummary();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const { data: page } = useQuery({
    queryKey: ["accounts", orgId],
    queryFn: () =>
      api.getPaginated<{ id: string }>(`/organizations/${orgId}/accounts`),
    enabled: !!orgId,
  });

  const activeVenues = summary?.dayStats.activeVenues ?? 0;
  const totalVenues = page?.pagination?.total ?? page?.data?.length ?? 0;
  const coverage = totalVenues > 0 ? Math.round((activeVenues / totalVenues) * 100) : 0;
  const c = summary?.channels;

  return (
    <View className="gap-4">
      <Text className="text-2xl font-bold">Your Performance</Text>

      <Card title="Channel Mix">
        {c ? (
          <View className="gap-3">
            <Row
              label="On-Premise"
              value={`${c.onPremise.progressing} / ${c.onPremise.total}`}
            />
            <Row
              label="Off-Premise"
              value={`${c.offPremise.progressing} / ${c.offPremise.total}`}
            />
          </View>
        ) : (
          <EmptyBody label="No activity data yet" />
        )}
      </Card>

      <Card title="Territory Coverage">
        <View className="gap-3">
          <Row label="Active Venues" value={String(activeVenues)} />
          <Row label="Total Venues" value={String(totalVenues)} />
          <Row label="Coverage" value={`${coverage}%`} />
          <Progress value={coverage / 100} />
        </View>
      </Card>
    </View>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <Text className="text-lg font-bold">{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-base text-muted-foreground">{label}</Text>
      <Text className="text-base font-bold">{value}</Text>
    </View>
  );
}

function EmptyBody({ label }: { label: string }) {
  return (
    <View className="h-32 items-center justify-center">
      <Text className="text-base text-muted-foreground">{label}</Text>
    </View>
  );
}
