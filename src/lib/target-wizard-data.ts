import type { WizardStepMeta } from "@/components/wizard/wizard-shell";

export type GuardrailType = "fixed" | "nsv";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface TargetDraft {
  brandId: string;
  brandName: string;
  territoryId: string;
  territoryName: string;
  startDate: string; // dd/MM/yyyy
  endDate: string; // dd/MM/yyyy
  channels: string[];
  caseTarget: string;
  distributionTarget: string;
  guardrailType: GuardrailType;
  apBudget: string;
  confidence: ConfidenceLevel;
}

export const TARGET_STEPS: WizardStepMeta[] = [
  { title: "Territory & Dates", subtitle: "Select territory, brand and set the target date range" },
  { title: "Channels", subtitle: "Choose sales channel with focus roles" },
  { title: "Targets", subtitle: "Set your case and distribution targets" },
  { title: "A&P Guardrail", subtitle: "Set your case and distribution targets" },
  { title: "Confidence Level", subtitle: "Set confidence level for this target" },
  { title: "Review", subtitle: "Review and confirm your market target" },
];

export const CHANNEL_CHOICES = [
  "Modern cocktails Bar (Trend-learning)",
  "Aspiring Cocktail Bar",
  "High Volume Cocktail Bar",
  "Premium Nightlife / Late Night",
  "Beer + Shot / Dive Bar",
  "Agave / Category specialist bar",
  "Hatted / Starred restaurant",
] as const;

export const GUARDRAIL_CHOICES: {
  id: GuardrailType;
  title: string;
  subtitle: string;
}[] = [
  { id: "fixed", title: "$ Fixed Budget", subtitle: "Set £ amount" },
  { id: "nsv", title: "5 of NSV", subtitle: "Dynamic target" },
];

export const CONFIDENCE_CHOICES: { id: ConfidenceLevel; title: string }[] = [
  { id: "high", title: "High confidence" },
  { id: "medium", title: "Medium Confidence" },
  { id: "low", title: "Low Confidence" },
];

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const DEFAULT_TARGET_DRAFT: TargetDraft = {
  brandId: "",
  brandName: "",
  territoryId: "",
  territoryName: "",
  startDate: "22/05/2026",
  endDate: "20/08/2026",
  channels: [CHANNEL_CHOICES[0]],
  caseTarget: "",
  distributionTarget: "",
  guardrailType: "fixed",
  apBudget: "",
  confidence: "medium",
};

function parseDMY(value: string): Date | null {
  const [d, m, y] = value.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

/** Whole days between two dd/MM/yyyy strings, or null if either won't parse. */
export function periodDays(start: string, end: string): number | null {
  const a = parseDMY(start);
  const b = parseDMY(end);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
