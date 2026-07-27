import { Activity, Bell, TrendingDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Dropdown } from "@/components/ui/dropdown";
import { Progress } from "@/components/ui/progress";
import { StatCard, type GradientColors } from "@/components/ui/stat-card";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";
import {
  BDM_INNER_TABS,
  BDM_OUTER_TABS,
  BDM_PERIODS,
  BDM_SCORE_MAX,
  BDM_STATS,
  BDM_TERRITORIES,
  type Maturity,
  type Territory,
} from "@/lib/bdm-data";

const NAVY: GradientColors = ["#132B5C", "#0B1833"];

const MATURITY: Record<Maturity, { bg: string; text: string }> = {
  Mature: { bg: "bg-green-500/15", text: "text-green-400" },
  Growth: { bg: "bg-secondary", text: "text-muted-foreground" },
  Emerging: { bg: "bg-amber-500/15", text: "text-amber-400" },
};

export function BdmPage() {
  const colors = useThemeColors();
  const [outer, setOuter] = useState<string>("Efficiency ROI");
  const [inner, setInner] = useState<string>("Efficiency");
  const [period, setPeriod] = useState<string>("This Month");
  const [anon, setAnon] = useState(true);

  const statRows = [];
  for (let i = 0; i < BDM_STATS.length; i += 2) {
    statRows.push(BDM_STATS.slice(i, i + 2));
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-5 px-4 pb-16 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="gap-1">
          <Text className="text-2xl font-bold">BDM Efficiency and ROI</Text>
          <Text className="text-sm text-muted-foreground">
            Measurable performance without surveillance
          </Text>
        </View>

        {/* Outer tabs */}
        <TabRow tabs={BDM_OUTER_TABS} value={outer} onChange={setOuter} />

        {outer === "Efficiency ROI" ? (
          <>
            {/* Privacy card */}
            <View className="gap-1.5 rounded-2xl border border-border bg-white/5 p-4">
              <Text className="text-base font-semibold text-info">
                Privacy Protected Analytics
              </Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                BDM identities are anonymised by default. Performance is shown in
                aggregate to prevent micromanagement while maintaining ROI
              </Text>
            </View>

            {/* Controls */}
            <View className="flex-row items-center justify-between gap-3">
              <Dropdown
                options={BDM_PERIODS}
                value={period}
                onChange={setPeriod}
                size="sm"
              />
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1.5">
                  <Bell color={colors.foreground} size={16} />
                  <Text className="text-sm">Alerts</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Toggle value={anon} onToggle={() => setAnon((v) => !v)} />
                  <Text className="text-sm">Anonymise</Text>
                </View>
              </View>
            </View>

            {/* Stat tiles */}
            <View className="gap-3">
              {statRows.map((row, i) => (
                <View key={i} className="flex-row gap-3">
                  {row.map((s) => (
                    <StatCard
                      key={s.label}
                      label={s.label}
                      value={s.value}
                      colors={NAVY}
                      className="h-24"
                      trailing={
                        s.suffix ? (
                          <Text className="text-xs text-white/60">
                            {s.suffix}
                          </Text>
                        ) : undefined
                      }
                    />
                  ))}
                </View>
              ))}
            </View>

            {/* Inner tabs */}
            <TabRow tabs={BDM_INNER_TABS} value={inner} onChange={setInner} />

            {inner === "Efficiency" ? (
              <View className="gap-4">
                <View className="gap-1">
                  <View className="flex-row items-center gap-2">
                    <Activity color={colors.foreground} size={20} />
                    <Text className="text-xl font-bold">
                      Composite Efficiency
                    </Text>
                  </View>
                  <Text className="text-sm leading-5 text-muted-foreground">
                    Weighted composite from your scorecard configuration —
                    adjusted for market maturity
                  </Text>
                </View>
                {BDM_TERRITORIES.map((t) => (
                  <TerritoryCard key={t.name} territory={t} />
                ))}
              </View>
            ) : (
              <Stub name={inner} />
            )}
          </>
        ) : (
          <Stub name={outer} />
        )}
      </ScrollView>
    </View>
  );
}

function TabRow({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly string[];
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            className={cn(
              "h-9 items-center justify-center rounded-md px-3.5",
              active ? "bg-brand-maroon" : "bg-secondary",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                active ? "text-white" : "text-muted-foreground",
              )}
            >
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Metric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      {children}
    </View>
  );
}

function TerritoryCard({ territory: t }: { territory: Territory }) {
  const m = MATURITY[t.maturity];
  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold">{t.name}</Text>
        <View className={cn("rounded-full px-2.5 py-1", m.bg)}>
          <Text className={cn("text-xs font-medium", m.text)}>
            {t.maturity}
          </Text>
        </View>
      </View>

      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Composite Score
          </Text>
          <Text className="text-lg font-bold">{t.score}</Text>
        </View>
        <Progress value={t.score / BDM_SCORE_MAX} indicatorClassName="bg-white" />
      </View>

      <View className="gap-3">
        <View className="flex-row">
          <Metric label="Velocity">
            <View className="flex-row items-center gap-1">
              <TrendingDown color="#EF4444" size={14} />
              <Text className="text-sm font-medium text-red-500">
                {t.velocity} c/a/w
              </Text>
            </View>
          </Metric>
          <Metric label="CPC">
            <Text
              className={cn(
                "text-sm font-medium",
                t.cpcHigh ? "text-red-500" : "text-green-500",
              )}
            >
              {t.cpc}
            </Text>
          </Metric>
        </View>
        <View className="flex-row">
          <Metric label="Fulfillment">
            <Text className="text-sm font-medium">{t.fulfillment}</Text>
          </Metric>
          <Metric label="Orders/WK">
            <Text className="text-sm font-medium">{t.ordersWk}</Text>
          </Metric>
        </View>
      </View>
    </View>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
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
    </Pressable>
  );
}

function Stub({ name }: { name: string }) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-border bg-card p-8">
      <Text className="text-base font-semibold">{name}</Text>
      <Text variant="muted" className="text-center text-sm">
        {name} view coming soon.
      </Text>
    </View>
  );
}
