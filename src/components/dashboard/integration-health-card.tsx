import { Sparkles } from "lucide-react-native";

import { SectionCard } from "@/components/dashboard/section-card";

export function IntegrationHealthCard() {
  return (
    <SectionCard
      icon={Sparkles}
      title="Integration Health"
      status="No Integrations"
      statusClassName="text-red-500"
    />
  );
}
