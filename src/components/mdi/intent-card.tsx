import {
  Box,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Send,
  Truck,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import type { IntentRecord, IntentStatus } from "@/lib/mdi-data";

const STATUS_ICON: Record<IntentStatus, LucideIcon> = {
  Submitted: Send,
  "Brand Review": EyeOff,
  "Distributor Review": Truck,
  Converted: CheckCircle2,
  Lost: XCircle,
};

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 gap-1.5">
      <Text className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        <Icon color={colors.mutedForeground} size={16} />
        {children}
      </View>
    </View>
  );
}

export function IntentCard({ intent }: { intent: IntentRecord }) {
  const colors = useThemeColors();
  const StatusIcon = STATUS_ICON[intent.status];
  const overdue = intent.daysLeft === null;

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      {/* Header */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold">{intent.account}</Text>
          <View className="flex-row items-center gap-1.5">
            <MapPin color={colors.mutedForeground} size={14} />
            <Text variant="muted" className="text-sm">
              {intent.region} • {intent.premise}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <StatusIcon color={colors.foreground} size={14} />
          <Text className="text-xs font-medium">{intent.status}</Text>
        </View>
      </View>

      {/* Details grid */}
      <View className="gap-4">
        <View className="flex-row gap-3">
          <Field icon={User} label="Buyer">
            <Text className="text-base font-medium">{intent.buyer}</Text>
          </Field>
          <Field icon={Box} label="Volume">
            <Text className="text-base font-medium">
              {intent.cases} cs{" "}
              <Text variant="muted" className="text-sm">
                ({intent.items} items)
              </Text>
            </Text>
          </Field>
        </View>
        <View className="flex-row gap-3">
          <Field icon={Calendar} label="Window">
            <Text className="text-base font-medium">
              {intent.windowDays} Days
            </Text>
          </Field>
          <View className="flex-1 gap-1.5">
            <Text className="text-xs uppercase tracking-wide text-muted-foreground">
              Confidence
            </Text>
            <View className="self-start rounded-full border border-border px-3 py-1">
              <Text className="text-xs font-medium">{intent.confidence}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="h-px bg-border" />

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Clock color={colors.mutedForeground} size={16} />
          <Text className="text-sm text-muted-foreground">
            Days Left:{" "}
            <Text
              className={cn(
                "text-sm font-bold",
                overdue ? "text-red-500" : "text-foreground",
              )}
            >
              {overdue ? "Overdue" : `${intent.daysLeft}d`}
            </Text>
          </Text>
        </View>
        <Eye color={colors.mutedForeground} size={18} />
      </View>
    </View>
  );
}
