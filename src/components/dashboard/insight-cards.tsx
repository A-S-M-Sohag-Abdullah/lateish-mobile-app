import { Sparkles } from "lucide-react-native";

import { EmptyState, SectionCard } from "@/components/dashboard/section-card";

/**
 * The two AI insight cards share a shape — sparkle header, an "N active" count,
 * a description, and an empty state — so they are one parameterised component.
 */
function InsightCard({
  title,
  description,
  activeCount,
  emptyLabel,
}: {
  title: string;
  description: string;
  activeCount: number;
  emptyLabel: string;
}) {
  return (
    <SectionCard
      icon={Sparkles}
      title={title}
      description={description}
      status={`${activeCount} active`}
      statusClassName="text-red-500"
    >
      <EmptyState label={emptyLabel} />
    </SectionCard>
  );
}

export function AlertsCard() {
  return (
    <InsightCard
      title="Alerts and Opportunities"
      description="Cross platform intelligence from all modules"
      activeCount={0}
      emptyLabel="No active alerts"
    />
  );
}

export function NextBestActionsCard() {
  return (
    <InsightCard
      title="Next best actions"
      description="AI-powered priorities from activity, inventory & A&P correlations"
      activeCount={0}
      emptyLabel="No active alerts"
    />
  );
}
