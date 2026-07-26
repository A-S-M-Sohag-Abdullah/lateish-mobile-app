import { DollarSign, ExternalLink } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type Confidence = "High Confidence" | "Medium Confidence" | "Low Confidence";

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  "High Confidence": "bg-green-600",
  "Medium Confidence": "bg-yellow-600",
  "Low Confidence": "bg-red-700",
};

/** Gold "Gap: £…" pill with the open-in-detail affordance. */
export function GapBadge({ value }: { value: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-lg bg-yellow-700 px-3 py-2">
      <DollarSign color="#FFFFFF" size={16} />
      <Text className="text-sm font-medium text-white">Gap: {value}</Text>
      <ExternalLink color="#FFFFFF" size={14} />
    </View>
  );
}

/** Confidence pill — green / amber / red by level. */
export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <View className={cn("rounded-lg px-3 py-2", CONFIDENCE_STYLES[level])}>
      <Text className="text-sm font-medium text-white">{level}</Text>
    </View>
  );
}
