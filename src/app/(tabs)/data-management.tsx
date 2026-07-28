import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  History,
  Lock,
  Shield,
  SlidersHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react-native";
import { Fragment } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface ActionRowData {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  value?: string;
  valueColor?: string;
}

const ACTIONS: ActionRowData[] = [
  { icon: Download, iconColor: "#22C55E", iconBg: "bg-green-500/15", title: "Export Data", subtitle: "Download a copy of your data" },
  { icon: Trash2, iconColor: "#A855F7", iconBg: "bg-purple-500/15", title: "Delete Data", subtitle: "Permanently delete your data" },
  { icon: History, iconColor: "#D9A521", iconBg: "bg-amber-500/20", title: "Data Activity Log", subtitle: "View recent data activities" },
];

const PREFERENCES: ActionRowData[] = [
  { icon: Shield, iconColor: "#14B8A6", iconBg: "bg-teal-500/15", title: "Data Sharing", subtitle: "Manage data sharing preferences", value: "On", valueColor: "#22C55E" },
  { icon: Lock, iconColor: "#3B82F6", iconBg: "bg-blue-500/15", title: "Data Retention", subtitle: "Choose how long we keep your data", value: "12 Months", valueColor: "#3B82F6" },
  { icon: SlidersHorizontal, iconColor: "#94A3B8", iconBg: "bg-white/10", title: "Manage Cookies", subtitle: "Manage cookie preferences", value: "On", valueColor: "#22C55E" },
];

export default function DataManagementScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <ChevronLeft color={colors.foreground} size={26} />
        </Pressable>
        <Text className="text-2xl font-bold">Data Management</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-16 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Data Overview */}
        <View className="gap-2">
          <Text className="text-sm text-muted-foreground">Data Overview</Text>
          <View className="flex-row items-start gap-3 rounded-2xl border border-border bg-white/[0.03] p-4">
            <IconCircle icon={Database} color="#3B82F6" bg="bg-blue-500/15" />
            <View className="flex-1 gap-2">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-sm text-muted-foreground">Total Data Used</Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-bold">2.45 GB</Text>
                    <Text className="text-sm text-muted-foreground">of 10 GB used</Text>
                  </View>
                </View>
                <View className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5">
                  <Text className="text-xs font-medium text-blue-400">10 GB Limit</Text>
                </View>
              </View>
              <Progress value={0.24} indicatorClassName="bg-blue-500" />
              <Text className="text-xs text-muted-foreground">24% used</Text>
            </View>
          </View>
        </View>

        {/* Data Actions */}
        <View className="gap-2">
          <Text className="text-sm text-muted-foreground">Data Actions</Text>
          <Card rows={ACTIONS} />
        </View>

        {/* Data Preferences */}
        <View className="gap-2">
          <Text className="text-sm text-muted-foreground">Data Preferences</Text>
          <Card rows={PREFERENCES} />
        </View>
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

function Card({ rows }: { rows: ActionRowData[] }) {
  return (
    <View className="rounded-2xl border border-border bg-white/[0.03] px-4">
      {rows.map((row, i) => (
        <Fragment key={row.title}>
          {i > 0 ? <View className="h-px bg-border/50" /> : null}
          <ActionRow row={row} />
        </Fragment>
      ))}
    </View>
  );
}

function IconCircle({
  icon: Icon,
  color,
  bg,
}: {
  icon: LucideIcon;
  color: string;
  bg: string;
}) {
  return (
    <View className={cn("h-11 w-11 items-center justify-center rounded-full", bg)}>
      <Icon color={color} size={20} />
    </View>
  );
}

function ActionRow({ row }: { row: ActionRowData }) {
  return (
    <Pressable className="flex-row items-center gap-3 py-3.5 active:opacity-80">
      <IconCircle icon={row.icon} color={row.iconColor} bg={row.iconBg} />
      <View className="flex-1">
        <Text className="text-base font-semibold">{row.title}</Text>
        <Text className="text-sm text-muted-foreground">{row.subtitle}</Text>
      </View>
      {row.value ? (
        <Text className="text-sm font-medium" style={{ color: row.valueColor }}>
          {row.value}
        </Text>
      ) : null}
      <ChevronRight color="#64748B" size={20} />
    </Pressable>
  );
}
