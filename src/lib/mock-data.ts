/**
 * Static data for the UI preview. Nothing here touches the API — it exists so
 * the screens can be reviewed before the backend is wired up.
 *
 * Delete this file once the real queries land (see PREVIEW_MODE in preview.ts).
 */
import {
  CalendarDays,
  ChartColumn,
  Send,
  Target,
  type LucideIcon,
} from "lucide-react-native";

import type { Href } from "expo-router";

import type { Confidence } from "@/components/dashboard/badges";

export type QuickAccessTone = "blue" | "purple" | "maroon" | "teal";

export interface QuickAccessItem {
  key: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: QuickAccessTone;
  /** Pager page index to jump to (Dashboard=0 … Settings=4). */
  page?: number;
  /** A real route to push instead of a pager page. */
  href?: Href;
}

export const QUICK_ACCESS: QuickAccessItem[] = [
  {
    key: "rep-today",
    title: "Rep Today",
    subtitle: "Field activity and orders",
    icon: CalendarDays,
    tone: "blue",
    page: 2,
  },
  {
    key: "market-targets",
    title: "Market Targets",
    subtitle: "Field activity and orders",
    icon: Target,
    tone: "purple",
    page: 1,
  },
  {
    key: "sku-performance",
    title: "SKU Performance",
    subtitle: "Field activity and orders",
    icon: ChartColumn,
    tone: "maroon",
    href: "/orders",
  },
  {
    key: "mdi",
    title: "90-Day Plans / MDI",
    subtitle: "Field activity and orders",
    icon: Send,
    tone: "teal",
    href: "/mdi",
  },
];

export interface MarketTarget {
  id: string;
  location: string;
  updatedAgo: string;
  gap: string;
  confidence: Confidence;
  cases: { current: number; target: number };
  distribution: { current: number; target: number };
}

export const MARKET_TARGETS: MarketTarget[] = [
  {
    id: "chicago-il",
    location: "Chicago, IL",
    updatedAgo: "1 min ago",
    gap: "£121,524",
    confidence: "High Confidence",
    cases: { current: 4250, target: 5000 },
    distribution: { current: 98, target: 120 },
  },
  {
    id: "austin-tx",
    location: "Austin, TX",
    updatedAgo: "12 min ago",
    gap: "£84,310",
    confidence: "Medium Confidence",
    cases: { current: 2980, target: 4500 },
    distribution: { current: 61, target: 95 },
  },
  {
    id: "denver-co",
    location: "Denver, CO",
    updatedAgo: "1 hr ago",
    gap: "£46,902",
    confidence: "Low Confidence",
    cases: { current: 1240, target: 3000 },
    distribution: { current: 34, target: 80 },
  },
];

/** Formats 4250 as "4,250". */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

// ── A&P Feedback ──────────────────────────────────────────────────────────────

export interface ApFeedback {
  question: string;
  gap: string;
  confidence: Confidence;
  usedLabel: string;
  totalLabel: string;
  /** 0–1, share of the guardrail spent. */
  usedPct: number;
  guardrailCaption: string;
  timeCaption: string;
}

export const AP_FEEDBACK: ApFeedback = {
  question: "Is spend aligned with how fast we need to move to hit the plan?",
  gap: "£121,524",
  confidence: "High Confidence",
  usedLabel: "£18,500",
  totalLabel: "£25,000 (guardrail)",
  usedPct: 0.64,
  guardrailCaption: "64% of guardrail used",
  timeCaption: "67% of time elapsed",
};

// ── Channel suggestions filters (visual only in preview) ──────────────────────

export const CHANNEL_TYPE_OPTIONS = [
  "All Types",
  "Distribution",
  "Velocity",
  "Coverage",
  "Pricing",
] as const;

export const CHANNEL_OPTIONS = [
  "All Channels",
  "On-Premise",
  "Off-Premise",
  "Independent",
  "National Chains",
] as const;
