/**
 * Static config + shared types for the Performance Dashboard (Activity Logs).
 * All tab data is now fetched live (see use-performance-dashboard); only the
 * tab list, leaderboard tier styling, shared shapes, and the roadmap
 * "Upcoming Integrations" placeholders remain here.
 */
import { Calendar, Database, RefreshCw, type LucideIcon } from "lucide-react-native";

export interface StatTile {
  label: string;
  value: string;
  suffix?: string;
}

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

/** Ring / crown / gradient colours per tier. */
export const TIER_STYLE: Record<
  Tier,
  { ring: string; crown: string; gradient: readonly [string, string] }
> = {
  gold: { ring: "#F59E0B", crown: "#F59E0B", gradient: ["#3B2A14", "#17130E"] },
  silver: { ring: "#9CA3AF", crown: "#E5E7EB", gradient: ["#24272C", "#141619"] },
  bronze: { ring: "#F59E0B", crown: "#22C55E", gradient: ["#123021", "#0E1712"] },
};

// ── Depletions — roadmap placeholders (future automation, not live data) ─────

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
