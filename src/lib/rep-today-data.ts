import type { TagVariant } from "@/components/ui/tag";

export const REP_TODAY_HEADER = {
  date: "Monday May 25, 2026",
  title: "Rep Today 2.0",
  subtitle: "BDM Cockpit • Opportunity Flow • Field Intelligence",
};

export interface RepStat {
  label: string;
  value: string;
  suffix?: string;
}

export interface PremiseStat {
  label: string;
  status: string;
  detail: string;
  tone: "success" | "neutral";
}

export interface NetworkInsight {
  text: string;
  subtext: string;
  tags: { label: string; variant: TagVariant }[];
}

export interface NextStep {
  title: string;
  description: string;
  /** Left-edge accent colour. */
  accent: string;
}
