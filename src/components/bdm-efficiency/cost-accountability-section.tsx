import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { FormError } from "@/components/auth/form-error";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  MILESTONE_METRICS,
  type ApiBdmCostRow,
  type ApiCostAccountabilityData,
  type CreateMilestoneInput,
} from "@/types/cost-accountability";

const TABS = [
  "Overview",
  "Breakdown",
  "Log Cost",
  "Trends",
  "Compare",
  "Milestones",
  "Reports",
] as const;

const CURRENCIES = ["GBP", "USD", "EUR", "AUD", "NZD"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function CostAccountabilitySection({
  orgId,
  periodDays,
  symbol,
}: {
  orgId: string;
  periodDays: number;
  symbol: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const money = (n: number, dec = 2) =>
    `${symbol}${n.toLocaleString("en-GB", {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    })}`;
  const num = (n: number) => n.toLocaleString("en-GB");

  const costKey = ["cost-accountability", orgId, periodDays] as const;
  const { data, isLoading } = useQuery({
    queryKey: costKey,
    queryFn: () =>
      api.get<ApiCostAccountabilityData>(
        `/organizations/${orgId}/bdm-accountability?period=${periodDays}`,
      ),
    enabled: !!orgId,
  });

  return (
    <View className="gap-5">
      <TabRow tabs={TABS} value={tab} onChange={(t) => setTab(t as typeof tab)} />

      {isLoading || !data ? (
        <Text className="py-10 text-center text-sm text-muted-foreground">
          Loading…
        </Text>
      ) : tab === "Overview" ? (
        <Overview data={data} money={money} num={num} />
      ) : tab === "Breakdown" ? (
        <Breakdown data={data} money={money} num={num} />
      ) : tab === "Log Cost" ? (
        <LogCost orgId={orgId} costKey={costKey} money={money} />
      ) : tab === "Trends" ? (
        <Trends data={data} money={money} num={num} />
      ) : tab === "Compare" ? (
        <Compare data={data} money={money} num={num} />
      ) : tab === "Milestones" ? (
        <Milestones data={data} orgId={orgId} costKey={costKey} num={num} />
      ) : (
        <Reports data={data} money={money} num={num} periodDays={periodDays} />
      )}
    </View>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({
  data,
  money,
  num,
}: {
  data: ApiCostAccountabilityData;
  money: (n: number, d?: number) => string;
  num: (n: number) => string;
}) {
  const ov = data.overview;
  const stats = [
    {
      label: "Total Monthly Cost",
      value: money(ov.totalMonthlyCost, 0),
      sub: `${ov.bdmCount} BDMs`,
    },
    {
      label: "Avg Cost per Case",
      value: ov.avgCostPerCase > 0 ? money(ov.avgCostPerCase) : "—",
      sub: `${num(ov.totalCasesSold)} cases sold`,
    },
    {
      label: "Active BDMs",
      value: String(ov.bdmCount),
      sub: `${ov.territoryCount} territories`,
    },
    {
      label: "Avg Cost / Territory",
      value: ov.avgCostPerTerritory > 0 ? money(ov.avgCostPerTerritory, 0) : "—",
      sub: "per month",
    },
  ];
  const composition = [
    { key: "Salary", pct: ov.salaryPct, color: "#3B82F6" },
    { key: "Expenses", pct: ov.expensesPct, color: "#22C55E" },
    { key: "Est. Bonus", pct: ov.bonusPct, color: "#F59E0B" },
  ];

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-3">
        {stats.map((s) => (
          <View
            key={s.label}
            className="flex-1 gap-1 rounded-2xl border border-border bg-card p-4"
            style={{ minWidth: "45%" }}
          >
            <Text className="text-sm text-muted-foreground">{s.label}</Text>
            <Text className="text-2xl font-bold">{s.value}</Text>
            <Text className="text-xs text-muted-foreground">{s.sub}</Text>
          </View>
        ))}
      </View>

      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <Text className="text-sm font-medium">Cost Composition</Text>
        <View className="h-3 flex-row overflow-hidden rounded-full bg-secondary">
          {composition.map((c) => (
            <View
              key={c.key}
              style={{ width: `${c.pct}%`, backgroundColor: c.color }}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-x-6 gap-y-2">
          {composition.map((c) => (
            <View key={c.key} className="flex-row items-center gap-1.5">
              <View
                style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c.color }}
              />
              <Text className="text-sm text-muted-foreground">{c.key}</Text>
              <Text className="text-sm font-medium">{c.pct}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Breakdown ─────────────────────────────────────────────────────────────────

function Breakdown({
  data,
  money,
  num,
}: {
  data: ApiCostAccountabilityData;
  money: (n: number, d?: number) => string;
  num: (n: number) => string;
}) {
  if (data.breakdown.length === 0) {
    return (
      <EmptyCard>
        No BDM cost records found. Use the Log Cost tab to add costs.
      </EmptyCard>
    );
  }
  return (
    <View className="gap-3">
      {data.breakdown.map((r) => (
        <View
          key={r.userId}
          className="gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <View>
            <Text className="text-base font-semibold">{r.name}</Text>
            <Text className="text-xs text-muted-foreground">{r.email}</Text>
          </View>
          <View className="flex-row flex-wrap gap-y-3">
            <Cell label="Salary" value={money(r.monthlySalary, 0)} />
            <Cell label="Expenses" value={money(r.monthlyExpenses, 0)} />
            <Cell
              label="Est. Bonus"
              value={money(r.estimatedBonus, 0)}
              valueClassName="text-amber-400"
            />
            <Cell label="Total Monthly" value={money(r.totalMonthly, 0)} bold />
            <Cell label="Cases" value={num(r.casesSold)} />
            <Cell label="CPC" value={r.cpc > 0 ? money(r.cpc) : "—"} />
          </View>
          <Text className="text-xs text-muted-foreground">
            Effective from {r.effectiveFrom}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Log Cost ──────────────────────────────────────────────────────────────────

function LogCost({
  orgId,
  costKey,
  money,
}: {
  orgId: string;
  costKey: readonly unknown[];
  money: (n: number, d?: number) => string;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const bdmKey = ["bdm-costs", orgId] as const;

  const { data: rows = [] } = useQuery({
    queryKey: bdmKey,
    queryFn: () => api.get<ApiBdmCostRow[]>(`/organizations/${orgId}/bdm-costs`),
    enabled: !!orgId,
  });

  const [userId, setUserId] = useState("");
  const [salary, setSalary] = useState("");
  const [expenses, setExpenses] = useState("");
  const [bonus, setBonus] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [effectiveFrom, setEffectiveFrom] = useState(today());
  const [notes, setNotes] = useState("");

  const rowName = (r: ApiBdmCostRow) =>
    [r.user_first_name, r.user_last_name].filter(Boolean).join(" ") ||
    r.user_email;
  const bdmOptions = rows.map(rowName);
  const selectedName = rows.find((r) => r.user_id === userId);

  function selectByName(name: string) {
    const row = rows.find((r) => rowName(r) === name);
    if (!row) return;
    setUserId(row.user_id);
    save.reset();
    if (row.cost) {
      setSalary(String(row.cost.monthly_salary));
      setExpenses(String(row.cost.monthly_expenses));
      setBonus(String(row.cost.bonus_per_case));
      setCurrency(row.cost.currency);
      setNotes(row.cost.notes ?? "");
    } else {
      setSalary("");
      setExpenses("");
      setBonus("");
      setCurrency("GBP");
      setNotes("");
    }
    setEffectiveFrom(today());
  }

  const save = useMutation({
    mutationFn: () =>
      api.put(`/organizations/${orgId}/bdm-costs/${userId}`, {
        monthly_salary: parseFloat(salary) || 0,
        monthly_expenses: parseFloat(expenses) || 0,
        bonus_per_case: parseFloat(bonus) || 0,
        currency,
        effective_from: effectiveFrom,
        notes: notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bdmKey });
      queryClient.invalidateQueries({ queryKey: costKey });
    },
  });

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <SelectField
        label="Select BDM"
        value={userId ? (selectedName ? rowName(selectedName) : "") : ""}
        placeholder="— choose a BDM —"
        options={bdmOptions}
        onChange={selectByName}
      />
      {selectedName ? (
        <Text className="text-xs text-muted-foreground">
          {selectedName.cost
            ? `Current record: ${money(
                selectedName.cost.monthly_salary +
                  selectedName.cost.monthly_expenses,
                0,
              )}/mo — effective ${selectedName.cost.effective_from}`
            : "No cost record yet"}
        </Text>
      ) : null}

      {userId ? (
        <>
          <View className="flex-row gap-3">
            <NumField label="Monthly Salary" value={salary} onChange={setSalary} />
            <NumField
              label="Monthly Expenses"
              value={expenses}
              onChange={setExpenses}
            />
          </View>
          <View className="flex-row gap-3">
            <NumField label="Bonus per Case" value={bonus} onChange={setBonus} />
            <View className="flex-1">
              <SelectField
                label="Currency"
                value={currency}
                options={CURRENCIES}
                onChange={setCurrency}
              />
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-sm text-muted-foreground">Effective From</Text>
            <Input
              value={effectiveFrom}
              onChangeText={setEffectiveFrom}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              className="h-12"
            />
          </View>
          <View className="gap-2">
            <Text className="text-sm text-muted-foreground">Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
              className="h-20 rounded-lg border border-input bg-input/30 px-4 py-3 text-base text-foreground"
            />
          </View>

          <FormError error={save.error} />
          {save.isSuccess ? (
            <View className="flex-row items-center gap-1.5">
              <Check color="#22C55E" size={16} />
              <Text className="text-sm text-green-500">Saved successfully</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => save.mutate()}
            disabled={save.isPending}
            className="h-12 items-center justify-center rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {save.isPending ? "Saving…" : "Save Cost Record"}
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

// ── Trends ────────────────────────────────────────────────────────────────────

function Trends({
  data,
  money,
  num,
}: {
  data: ApiCostAccountabilityData;
  money: (n: number, d?: number) => string;
  num: (n: number) => string;
}) {
  if (!data.trends || data.trends.length === 0) {
    return (
      <EmptyCard>
        Not enough history — trends require at least 2 months of order data.
      </EmptyCard>
    );
  }
  const trends = data.trends;
  const latest = trends[trends.length - 1];
  const totalCases = trends.reduce((s, t) => s + t.casesSold, 0);
  const avgCost = Math.round(
    trends.reduce((s, t) => s + t.totalCost, 0) / trends.length,
  );
  const maxCases = Math.max(1, ...trends.map((t) => t.casesSold));

  return (
    <View className="gap-4">
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <Text className="text-sm font-medium">Monthly Cost vs Cases Sold</Text>
        {trends.map((t) => (
          <View key={t.month} className="gap-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">{t.label}</Text>
              <Text className="text-xs">
                {num(t.casesSold)} cases · {money(t.cpc)} CPC
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-secondary">
              <View
                style={{
                  width: `${(t.casesSold / maxCases) * 100}%`,
                  backgroundColor: "#3B82F6",
                  height: "100%",
                }}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row gap-3">
        <MiniStat label="Current CPC" value={latest ? money(latest.cpc) : "—"} />
        <MiniStat label="Total Cases" value={num(totalCases)} />
        <MiniStat label="Avg Monthly Cost" value={money(avgCost, 0)} />
      </View>
    </View>
  );
}

// ── Compare ───────────────────────────────────────────────────────────────────

function Compare({
  data,
  money,
  num,
}: {
  data: ApiCostAccountabilityData;
  money: (n: number, d?: number) => string;
  num: (n: number) => string;
}) {
  if (data.compare.length === 0) {
    return <EmptyCard>No territory data to compare.</EmptyCard>;
  }
  const avgCpc = data.overview.avgCostPerCase;
  const sorted = [...data.compare].sort((a, b) => {
    if (a.cpc === 0 && b.cpc === 0) return 0;
    if (a.cpc === 0) return 1;
    if (b.cpc === 0) return -1;
    return a.cpc - b.cpc;
  });

  return (
    <View className="gap-3">
      <Text className="text-xs text-muted-foreground">
        Org avg CPC:{" "}
        <Text className="font-medium text-foreground">
          {avgCpc > 0 ? money(avgCpc) : "—"}
        </Text>{" "}
        — sorted by CPC (best first)
      </Text>
      {sorted.map((r) => (
        <View
          key={r.territory}
          className="gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold">{r.territory}</Text>
              <Text className="text-xs text-muted-foreground">{r.bdmName}</Text>
            </View>
            {r.cpc > 0 ? (
              <View className="flex-row items-center gap-1">
                {r.cpcGood ? (
                  <TrendingUp color="#22C55E" size={16} />
                ) : (
                  <TrendingDown color="#EF4444" size={16} />
                )}
                <Text
                  className={cn(
                    "text-base font-semibold",
                    r.cpcGood ? "text-green-500" : "text-red-500",
                  )}
                >
                  {money(r.cpc)}
                </Text>
              </View>
            ) : (
              <Text className="text-base text-muted-foreground">—</Text>
            )}
          </View>
          <View className="flex-row flex-wrap gap-y-3">
            <Cell label="Monthly Cost" value={money(r.monthlyCost, 0)} />
            <Cell label="Cases" value={num(r.casesSold)} />
            <Cell label="Active Venues" value={num(r.venues)} />
            <Cell
              label="Cost / Venue"
              value={r.costPerVenue > 0 ? money(r.costPerVenue, 0) : "—"}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Milestones ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  achieved: "border-green-500/20 bg-green-500/10 text-green-400",
  "on-track": "border-primary/20 bg-primary/10 text-primary",
  "at-risk": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  overdue: "border-red-500/20 bg-red-500/10 text-red-400",
};

function Milestones({
  data,
  orgId,
  costKey,
  num,
}: {
  data: ApiCostAccountabilityData;
  orgId: string;
  costKey: readonly unknown[];
  num: (n: number) => string;
}) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: costKey });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CreateMilestoneInput>({
    title: "",
    metric: "cpc",
    target_value: 0,
    target_date: today(),
    notes: null,
  });
  const [targetValue, setTargetValue] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.post(`/organizations/${orgId}/bdm-accountability/milestones`, {
        ...form,
        target_value: parseFloat(targetValue) || 0,
      }),
    onSuccess: () => {
      invalidate();
      setShowAdd(false);
      setForm({ title: "", metric: "cpc", target_value: 0, target_date: today(), notes: null });
      setTargetValue("");
    },
  });

  const metricLabel = (m: string) => MILESTONE_METRICS[m] ?? m;

  return (
    <View className="gap-4">
      {data.milestones.length === 0 ? (
        <EmptyCard>
          No milestones yet. Add one below to track progress against goals.
        </EmptyCard>
      ) : (
        data.milestones.map((m) => (
          <MilestoneCard
            key={m.id}
            m={m}
            orgId={orgId}
            onMutated={invalidate}
            num={num}
          />
        ))
      )}

      <View className="rounded-2xl border border-border bg-card">
        <Pressable
          onPress={() => setShowAdd((v) => !v)}
          className="h-12 flex-row items-center gap-2 px-4 active:opacity-80"
        >
          <Plus color={colors.foreground} size={16} />
          <Text className="flex-1 text-sm font-medium">Add Milestone</Text>
          {showAdd ? (
            <ChevronUp color={colors.foreground} size={18} />
          ) : (
            <ChevronDown color={colors.foreground} size={18} />
          )}
        </Pressable>

        {showAdd ? (
          <View className="gap-4 border-t border-border px-4 py-4">
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">Title</Text>
              <Input
                value={form.title}
                onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
                placeholder="e.g. Reduce CPC to 12"
                placeholderTextColor={colors.mutedForeground}
                className="h-12"
              />
            </View>
            <SelectField
              label="Metric"
              value={metricLabel(form.metric)}
              options={Object.values(MILESTONE_METRICS)}
              onChange={(label) => {
                const key =
                  Object.keys(MILESTONE_METRICS).find(
                    (k) => MILESTONE_METRICS[k] === label,
                  ) ?? "cpc";
                setForm((f) => ({ ...f, metric: key }));
              }}
            />
            <View className="flex-row gap-3">
              <NumField
                label="Target Value"
                value={targetValue}
                onChange={setTargetValue}
              />
              <View className="flex-1 gap-2">
                <Text className="text-sm text-muted-foreground">Target Date</Text>
                <Input
                  value={form.target_date}
                  onChangeText={(t) => setForm((f) => ({ ...f, target_date: t }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                  className="h-12"
                />
              </View>
            </View>
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">Notes</Text>
              <TextInput
                value={form.notes ?? ""}
                onChangeText={(t) => setForm((f) => ({ ...f, notes: t || null }))}
                placeholder="Optional"
                placeholderTextColor={colors.mutedForeground}
                multiline
                textAlignVertical="top"
                className="h-16 rounded-lg border border-input bg-input/30 px-4 py-2 text-base text-foreground"
              />
            </View>
            <FormError error={create.error} />
            <Pressable
              onPress={() => create.mutate()}
              disabled={create.isPending || !form.title}
              className="h-12 items-center justify-center rounded-xl bg-primary active:opacity-90 disabled:opacity-50"
            >
              <Text className="text-base font-semibold text-primary-foreground">
                {create.isPending ? "Saving…" : "Create Milestone"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function MilestoneCard({
  m,
  orgId,
  onMutated,
  num,
}: {
  m: ApiCostAccountabilityData["milestones"][number];
  orgId: string;
  onMutated: () => void;
  num: (n: number) => string;
}) {
  const colors = useThemeColors();
  const [showAchieve, setShowAchieve] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [achievedValue, setAchievedValue] = useState("");
  const [achievedAt, setAchievedAt] = useState(today());

  const markAchieved = useMutation({
    mutationFn: () =>
      api.put(`/organizations/${orgId}/bdm-accountability/milestones/${m.id}`, {
        achieved_at: achievedAt,
        achieved_value: parseFloat(achievedValue) || null,
      }),
    onSuccess: onMutated,
  });
  const remove = useMutation({
    mutationFn: () =>
      api.delete(`/organizations/${orgId}/bdm-accountability/milestones/${m.id}`),
    onSuccess: onMutated,
  });

  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {m.title}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {MILESTONE_METRICS[m.metric] ?? m.metric}
          </Text>
        </View>
        <View
          className={cn(
            "rounded-full border px-2 py-0.5",
            STATUS_STYLE[m.status] ?? "border-border bg-secondary",
          )}
        >
          <Text className="text-xs font-medium capitalize">
            {m.status.replace("-", " ")}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-6">
        <Cell label="Target" value={num(m.targetValue)} />
        <Cell label="By" value={m.targetDate} />
        {m.achievedValue !== null ? (
          <Cell
            label="Achieved"
            value={num(m.achievedValue)}
            valueClassName="text-green-500"
          />
        ) : null}
      </View>

      {m.notes ? (
        <Text className="text-xs text-muted-foreground">{m.notes}</Text>
      ) : null}

      <View className="flex-row items-center gap-2">
        {m.status !== "achieved" ? (
          <Pressable
            onPress={() => setShowAchieve((v) => !v)}
            className="flex-row items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 active:opacity-80"
          >
            <Check color={colors.foreground} size={14} />
            <Text className="text-xs">Mark Achieved</Text>
          </Pressable>
        ) : null}
        {confirmDelete ? (
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-red-500">Confirm?</Text>
            <Pressable onPress={() => remove.mutate()} disabled={remove.isPending}>
              <Text className="text-xs font-medium text-red-500">Yes</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmDelete(false)}>
              <Text className="text-xs text-muted-foreground">No</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setConfirmDelete(true)}
            className="flex-row items-center gap-1.5 rounded-md border border-red-500/30 px-2.5 py-1.5 active:opacity-80"
          >
            <Trash2 color="#EF4444" size={14} />
            <Text className="text-xs text-red-500">Delete</Text>
          </Pressable>
        )}
      </View>

      {showAchieve ? (
        <View className="gap-2 border-t border-border pt-3">
          <View className="flex-row gap-3">
            <NumField
              label="Achieved Value"
              value={achievedValue}
              onChange={setAchievedValue}
            />
            <View className="flex-1 gap-2">
              <Text className="text-sm text-muted-foreground">Date Achieved</Text>
              <Input
                value={achievedAt}
                onChangeText={setAchievedAt}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
                className="h-12"
              />
            </View>
          </View>
          <Pressable
            onPress={() => markAchieved.mutate()}
            disabled={markAchieved.isPending}
            className="h-11 items-center justify-center rounded-xl bg-green-600 active:opacity-90 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-white">
              {markAchieved.isPending ? "Saving…" : "Confirm Achievement"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────

function Reports({
  data,
  money,
  num,
  periodDays,
}: {
  data: ApiCostAccountabilityData;
  money: (n: number, d?: number) => string;
  num: (n: number) => string;
  periodDays: number;
}) {
  const ov = data.overview;
  const periodStart = new Date(Date.now() - periodDays * 86_400_000)
    .toISOString()
    .slice(0, 10);

  return (
    <View className="gap-4">
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <Text className="text-base font-semibold">Period Summary</Text>
        <View className="flex-row flex-wrap gap-y-3">
          <Cell label="Date Range" value={`${periodStart} → ${today()}`} wide />
          <Cell label="Total Monthly Cost" value={money(ov.totalMonthlyCost, 0)} />
          <Cell label="Total Cases" value={num(ov.totalCasesSold)} />
          <Cell
            label="Avg CPC"
            value={ov.avgCostPerCase > 0 ? money(ov.avgCostPerCase) : "—"}
          />
        </View>
      </View>

      <Breakdown data={data} money={money} num={num} />
    </View>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────────

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {tabs.map((t) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            className={cn(
              "rounded-lg px-3.5 py-2",
              active ? "bg-primary" : "bg-secondary",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                active ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {t}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Cell({
  label,
  value,
  valueClassName,
  bold,
  wide,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  bold?: boolean;
  wide?: boolean;
}) {
  return (
    <View style={{ width: wide ? "100%" : "33.33%" }} className="gap-0.5 pr-2">
      <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <Text
        className={cn(
          "text-sm",
          bold ? "font-bold" : "font-medium",
          valueClassName,
        )}
      >
        {value}
      </Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-0.5 rounded-2xl border border-border bg-card p-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-lg font-semibold">{value}</Text>
    </View>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Input
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={colors.mutedForeground}
        className="h-12"
      />
    </View>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="items-center rounded-2xl border border-border bg-card p-6">
      <Text className="text-center text-sm text-muted-foreground">{children}</Text>
    </View>
  );
}
