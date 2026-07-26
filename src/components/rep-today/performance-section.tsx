import { View } from "react-native";

import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { TERRITORY_COVERAGE } from "@/lib/rep-today-route-data";

export function PerformanceSection() {
  return (
    <View className="gap-4">
      <Text className="text-2xl font-bold">Your Performance</Text>

      <Card title="Channel Mix">
        <EmptyBody label="No activity data yet" />
      </Card>

      <Card title="Territory Coverage">
        <View className="gap-3">
          <Row
            label="Active Venues"
            value={String(TERRITORY_COVERAGE.activeVenues)}
          />
          <Row
            label="Total Venues"
            value={String(TERRITORY_COVERAGE.totalVenues)}
          />
          <Row label="Coverage" value={`${TERRITORY_COVERAGE.coverage}%`} />
          <Progress value={TERRITORY_COVERAGE.coverage / 100} />
        </View>
      </Card>

      <Card title="Brand Activity">
        <EmptyBody label="No brand activity yet" />
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
