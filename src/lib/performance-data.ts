/**
 * UI-preview data for the Performance Dashboard (the "Activity Logs" page).
 * Gamified leaderboard — mock data only, no API.
 */
import {
  Building2,
  Calendar,
  ChartColumn,
  CircleCheck,
  CreditCard,
  Crown,
  Database,
  DollarSign,
  MapPin,
  Package,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react-native";

export interface StatTile {
  label: string;
  value: string;
  suffix?: string;
}
export const PERF_STATS: StatTile[] = [
  { label: "Top Performer", value: "Sarah Johnson" },
  { label: "KPIs on Track", value: "12", suffix: "/15" },
  { label: "Team Growth", value: "24%" },
  { label: "Active Members", value: "18", suffix: "All Online" },
];

export const PERF_TABS = [
  "Leaderboard",
  "Depletions",
  "VIP Intelligence",
  "Custom KPIs",
  "Integrations",
] as const;

export const PERIODS = ["Daily", "Weekly", "Monthly"] as const;

export type Tier = "gold" | "silver" | "bronze";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  score: number;
  revenue: number;
  visits: number;
  orders: number;
  targetPct: number;
  tier: Tier;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "m1",
    name: "Sarah Johnson",
    initials: "S",
    score: 92,
    revenue: 18500,
    visits: 28,
    orders: 12,
    targetPct: 92,
    tier: "gold",
  },
  {
    id: "m2",
    name: "Emma Wilson",
    initials: "E",
    score: 89,
    revenue: 18500,
    visits: 28,
    orders: 12,
    targetPct: 92,
    tier: "silver",
  },
  {
    id: "m3",
    name: "Mike Chen",
    initials: "M",
    score: 85,
    revenue: 18500,
    visits: 28,
    orders: 12,
    targetPct: 92,
    tier: "bronze",
  },
];

/** Ring / crown / gradient colours per tier. */
export const TIER_STYLE: Record<
  Tier,
  { ring: string; crown: string; gradient: readonly [string, string] }
> = {
  gold: { ring: "#F59E0B", crown: "#F59E0B", gradient: ["#3B2A14", "#17130E"] },
  silver: { ring: "#9CA3AF", crown: "#E5E7EB", gradient: ["#24272C", "#141619"] },
  bronze: { ring: "#F59E0B", crown: "#22C55E", gradient: ["#123021", "#0E1712"] },
};

export interface AchievementItem {
  title: string;
  member: string;
  icon: LucideIcon;
  color: string;
}
export const ACHIEVEMENTS: AchievementItem[] = [
  { title: "Top Performer", member: "Sarah Johnson", icon: Trophy, color: "#F59E0B" },
  { title: "Revenue Champion", member: "Sarah Johnson", icon: DollarSign, color: "#22C55E" },
  { title: "Visit Master", member: "Mike Chen", icon: Target, color: "#3B82F6" },
  { title: "Conversion King", member: "Sarah Johnson", icon: Crown, color: "#A855F7" },
  { title: "Consistency Award", member: "Emma Wilson", icon: Star, color: "#F97316" },
  { title: "Most Improved", member: "Emma Wilson", icon: TrendingUp, color: "#EC4899" },
];

export interface BonusTile {
  label: string;
  value: string;
  tone: "navy" | "green";
}
export const BONUS_TILES: BonusTile[] = [
  { label: "Cases Sold", value: "0", tone: "navy" },
  { label: "Total Cost", value: "$3000", tone: "navy" },
  { label: "Cost/Case", value: "$0", tone: "green" },
  { label: "Target", value: "$0", tone: "green" },
];

// ── Depletions tab ───────────────────────────────────────────────────────────

export interface DepletionStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}
export const DEPLETION_STATS: DepletionStat[] = [
  { label: "Realised NSV", value: "$0K", icon: DollarSign, color: "#22C55E" },
  { label: "Expected NSV", value: "$0K", icon: TrendingUp, color: "#3B82F6" },
  { label: "Total Cases", value: "0", icon: Package, color: "#A855F7" },
  { label: "Distributors", value: "0", icon: Building2, color: "#F97316" },
  { label: "Markets", value: "0", icon: MapPin, color: "#14B8A6" },
  { label: "SKUS", value: "0", icon: ChartColumn, color: "#EC4899" },
];

export const DEPLETION_SUBTABS = [
  "Overview",
  "Distributors",
  "Markets",
  "SKU Trends",
  "Data Table",
] as const;

// ── VIP Intelligence tab ─────────────────────────────────────────────────────

export const VIP_SUBTABS = [
  "Depletions",
  "Expected",
  "Territory",
  "Pricing",
  "Distributor",
  "Alerts",
] as const;

export const VIP_STATS: DepletionStat[] = [
  { label: "Total Cases", value: "740", icon: Package, color: "#22C55E" },
  { label: "Total NSV", value: "$21,924.5", icon: TrendingUp, color: "#22C55E" },
  { label: "Markets", value: "3", icon: MapPin, color: "#3B82F6" },
  { label: "Distributors", value: "3", icon: Building2, color: "#A855F7" },
];

export interface BarDatum {
  label: string;
  value: number;
}
export const VIP_DISTRIBUTOR_BARS: BarDatum[] = [
  { label: "Breakthru Bever…", value: 145 },
  { label: "Southern Glazier", value: 175 },
  { label: "Breakthru Bever…", value: 215 },
];
export const VIP_BAR_TICKS = [80, 120, 160, 200];

export interface DonutSlice {
  label: string;
  pct: number;
  color: string;
}
export const VIP_MARKET_DONUT: DonutSlice[] = [
  { label: "CA", pct: 49, color: "#22C55E" },
  { label: "NY", pct: 32, color: "#9CA3AF" },
  { label: "TX", pct: 19, color: "#EAB308" },
];

// ── Integrations tab ─────────────────────────────────────────────────────────

export interface ActiveIntegration {
  name: string;
  icon: LucideIcon;
  lastSync: string;
  status: "ok" | "warn";
  enabled: boolean;
}
export const ACTIVE_INTEGRATIONS: ActiveIntegration[] = [
  { name: "Salesforce", icon: Users, lastSync: "Just now", status: "ok", enabled: true },
  { name: "Google Calendar", icon: Calendar, lastSync: "30m ago", status: "ok", enabled: true },
  { name: "Stripe", icon: CreditCard, lastSync: "Never", status: "warn", enabled: false },
];

// ── Custom KPIs tab ──────────────────────────────────────────────────────────

export interface CustomKpi {
  icon: LucideIcon;
  name: string;
  description: string;
  value: string;
  target: string;
  pct: number;
  tone: "amber" | "green" | "red";
  trend: "up" | "flat" | "down";
  trendData: number[];
  xLabels: string[];
}
export const CUSTOM_KPIS: CustomKpi[] = [
  {
    icon: DollarSign,
    name: "Monthly Revenue Growth",
    description: "Track month-over-month revenue growth percentage",
    value: "12.5%",
    target: "15%",
    pct: 83,
    tone: "amber",
    trend: "flat",
    trendData: [11, 12, 12.5],
    xLabels: ["2024-01", "2024-02", "2024-03"],
  },
  {
    icon: MapPin,
    name: "Weekly Venue Visits",
    description: "Number of venue visits completed per week",
    value: "23visits",
    target: "25visits",
    pct: 92,
    tone: "amber",
    trend: "flat",
    trendData: [22, 23, 23],
    xLabels: ["Week 1", "Week 2", "Week 3"],
  },
  {
    icon: CircleCheck,
    name: "Call-to-Order Conversion",
    description: "Percentage of sales calls that result in orders",
    value: "42%",
    target: "35%",
    pct: 100,
    tone: "green",
    trend: "up",
    trendData: [40, 41, 42],
    xLabels: ["Week 1", "Week 2", "Week 3"],
  },
  {
    icon: Star,
    name: "Customer Satisfaction Score",
    description: "Average customer satisfaction rating from surveys",
    value: "4.2/5",
    target: "4.5/5",
    pct: 93,
    tone: "amber",
    trend: "flat",
    trendData: [4.1, 4.2, 4.2],
    xLabels: ["Month 1", "Month 2", "Month 3"],
  },
];

export interface VipAlert {
  severity: "warning" | "critical";
  title: string;
  body: string;
}
export const VIP_ALERTS: VipAlert[] = [
  {
    severity: "warning",
    title: "RNDC underperforming in Texas",
    body: "14.7% below projected velocity. Review distributor execution and stock levels.",
  },
  {
    severity: "warning",
    title: "Texas wholesale pricing above corridor",
    body: "Avg wholesale $45.20 may be limiting velocity. Consider pricing adjustment.",
  },
  {
    severity: "warning",
    title: "RNDC health score critical in Texas",
    body: "Score: 68/100. Potential fulfilment or stock issues.",
  },
];

export const VIP_DISTRIBUTOR_AVG = "80/100";

export interface DistributorHealth {
  name: string;
  market: string;
  healthScore: number;
  cases: string;
  nsv: string;
  pricingIssues: number;
  within: boolean;
}
export const VIP_DISTRIBUTORS_HEALTH: DistributorHealth[] = [
  { name: "Southern Glazers", market: "New York", healthScore: 82, cases: "234", nsv: "$6,980.5", pricingIssues: 0, within: true },
  { name: "Breakthru Beverage", market: "California", healthScore: 91, cases: "366", nsv: "$10,506", pricingIssues: 0, within: true },
  { name: "RNDC", market: "Texas", healthScore: 68, cases: "140", nsv: "$4,438", pricingIssues: 1, within: false },
];

export interface PricingStat {
  label: string;
  value: string;
  tone: "green" | "amber" | "red";
}
export const VIP_PRICING_STATS: PricingStat[] = [
  { label: "Within Corridor", value: "3", tone: "green" },
  { label: "Borderline", value: "0", tone: "amber" },
  { label: "Outside", value: "3", tone: "red" },
];
export const VIP_PRICING_ALERT =
  "3 SKUs are pricing outside the recommended corridor. Review distributor agreements or adjust pricing strategy";

export interface PricingRow {
  name: string;
  wholesale: string;
  corridor: string;
}
export const VIP_PRICING_ROWS: PricingRow[] = [
  { name: "Lateish Blanco 750ml", wholesale: "$25.20", corridor: "$140-$180" },
  { name: "Lateish Reposado 750ml", wholesale: "$25.20", corridor: "$140-$180" },
  { name: "Lateish Añejo 750ml", wholesale: "$45.20", corridor: "$140-$180" },
];

export const VIP_TERRITORY_STATS: StatTile[] = [
  { label: "Active Markets", value: "3" },
  { label: "Total Cases", value: "740" },
  { label: "Total NSV", value: "$21.9K" },
];

export interface TerritoryTile {
  name: string;
  cases: number;
}
export const VIP_TERRITORIES: TerritoryTile[] = [
  { name: "California", cases: 366 },
  { name: "New York", cases: 234 },
  { name: "Texas", cases: 140 },
];

export const VIP_EXPECTED_SUMMARY = {
  avg: "-4.8%",
  avgNegative: true,
  totalExpected: "$22,500",
  totalRealized: "$21,924.5",
};
export const VIP_UNDERPERFORMING =
  "Texas is more than 10% below expected velocity.";

export interface ExpectedMarket {
  name: string;
  distributor: string;
  expected: number;
  realized: number;
}
export const VIP_EXPECTED_MARKETS: ExpectedMarket[] = [
  { name: "New York", distributor: "Southern Glazers", expected: 7500, realized: 6500 },
  { name: "California", distributor: "Breakthru Beverage", expected: 7500, realized: 10500 },
  { name: "Texas", distributor: "RNDC", expected: 5500, realized: 4400 },
];

export interface VipSku {
  name: string;
  cases: number;
  value: string;
  pct: string;
}
export const VIP_SKUS: VipSku[] = [
  { name: "Lateish Blanco 750ml", cases: 453, value: "$12,350.5", pct: "61.2%" },
  { name: "Lateish Reposado 750ml", cases: 245, value: "$7,684", pct: "33.1%" },
  { name: "Lateish Añejo 750ml", cases: 42, value: "$1,890", pct: "5.7%" },
];

export interface DepletionRecord {
  date: string;
  premise: string;
  product: string;
  distributor: string;
  location: string;
  cases: string;
  nsv: string;
}
export const DATA_TABLE_RECORDS: DepletionRecord[] = [
  {
    date: "OCT 24, 2023",
    premise: "On-Premise",
    product: "Premium Vodka 750ml",
    distributor: "Southern Glazer's",
    location: "New York (NY)",
    cases: "1,450",
    nsv: "$42,500",
  },
  {
    date: "OCT 23, 2023",
    premise: "Off-Premise",
    product: "Añejo Tequila 1L",
    distributor: "Breakthru Beverage",
    location: "California (CA)",
    cases: "890",
    nsv: "$58,200",
  },
  {
    date: "OCT 22, 2023",
    premise: "Retail",
    product: "Craft Gin 750ml",
    distributor: "RNDC",
    location: "Texas (TX)",
    cases: "320",
    nsv: "$11,800",
  },
];

export interface IntegrationItem {
  title: string;
  description: string;
  icon: LucideIcon;
}
export const UPCOMING_INTEGRATIONS: IntegrationItem[] = [
  {
    title: "Automated FTP Ingestion",
    description: "Direct FTP/SFTP connection to distributor data feeds",
    icon: Database,
  },
  {
    title: "API Integrations (In Development)",
    description: "Direct API connections to distributor systems (RNDC etc)",
    icon: Database,
  },
  {
    title: "Multi-market continuous Sync",
    description: "Real-time data synchronization across all markets",
    icon: RefreshCw,
  },
  {
    title: "Monthly Ingestions Reminder",
    description: "Automated email reminders when data is due",
    icon: Calendar,
  },
];
