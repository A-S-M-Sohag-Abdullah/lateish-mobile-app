import type { TagVariant } from "@/components/ui/tag";

export const REP_TODAY_HEADER = {
  date: "Monday May 25, 2026",
  title: "Rep Today 2.0",
  subtitle: "BDM Cockpit • Opportunity Flow • Field Intelligence",
};

export const BRAND_MOMENTUM = {
  title: "Brand momentum",
  sample: "Stable Sample",
  trend: "Flat",
  note: "Esther Run Gaining traction in on premise",
};

export interface RepStat {
  label: string;
  value: string;
  suffix?: string;
}

export const REP_STATS: RepStat[] = [
  { label: "Active Venues", value: "18" },
  { label: "Opportunities", value: "7", suffix: "(£12000)" },
  { label: "Follow ups due", value: "3" },
  { label: "Conversion Rate", value: "67%" },
];

export interface PremiseStat {
  label: string;
  status: string;
  detail: string;
  tone: "success" | "neutral";
}

export const AI_INSIGHT = {
  summary: "7 opportunities in play • 3 follow-ups due",
  onPremise: {
    label: "On premise",
    status: "Warning",
    detail: "(11/17)",
    tone: "success",
  } satisfies PremiseStat,
  offPremise: {
    label: "Off premise",
    status: "Stable",
    detail: "(11/11)",
    tone: "neutral",
  } satisfies PremiseStat,
  note: "These are example insights. Real network intelligence will appear as market activity grows.",
};

export interface NetworkInsight {
  text: string;
  subtext: string;
  tags: { label: string; variant: TagVariant }[];
}

export const NETWORK_INSIGHTS: NetworkInsight[] = [
  {
    text: "Across similar urban markets, early wins tend to cluster in trend-leading cocktail venues.",
    subtext:
      "Bartender influence and menu visibility drive faster adoption in these venues.",
    tags: [
      { label: "Example", variant: "neutral" },
      { label: "High Confidence", variant: "success" },
      { label: "On-Premise", variant: "neutral" },
    ],
  },
  {
    text: "Premium spirits often gain traction faster in venues where staff receive brand education.",
    subtext: "Training creates advocates who recommend your brand to guests.",
    tags: [
      { label: "Example", variant: "neutral" },
      { label: "Medium Confidence", variant: "warning" },
      { label: "On-Premise", variant: "neutral" },
    ],
  },
];

export interface NextStep {
  title: string;
  description: string;
  /** Left-edge accent colour. */
  accent: string;
}

export const SUGGESTED_STEPS_NOTE =
  "These are suggested focus areas. Your personalized steps will appear after logging interactions.";

export const SUGGESTED_STEPS: NextStep[] = [
  {
    title: "Start with trend-leading cocktail bars",
    description:
      "Modern Cocktail Bars typically show fastest adoption for premium spirits. Identify 3-5 in your territory.",
    accent: "#B91C1C",
  },
  {
    title: "Balance on-premise and off-premise coverage",
    description:
      "A healthy territory mix is roughly 70% on-premise, 30% off-premise for emerging brands.",
    accent: "#2563EB",
  },
  {
    title: "Build relationships with agave specialists",
    description:
      "Agave / Category Specialist Bars are natural advocates for tequila and mezcal brands.",
    accent: "#D97706",
  },
  {
    title: "Connect with independent retailers",
    description:
      "Independent Specialist Retailers often convert faster than chains for emerging brands.",
    accent: "#2563EB",
  },
  {
    title: "Log your first interaction",
    description:
      "Start building your territory intelligence by logging a visit or call with any account.",
    accent: "#2563EB",
  },
];
