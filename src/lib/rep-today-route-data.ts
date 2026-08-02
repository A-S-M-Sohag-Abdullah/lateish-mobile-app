import { type LucideIcon } from "lucide-react-native";

export type StopStatus = "green" | "amber" | "red";

export interface RouteStop {
  id: string;
  index: number;
  name: string;
  location: string;
  status: StopStatus;
}

export const REP_TABS = [
  "Momentum",
  "Territory",
  "Pipeline",
  "Activity Log",
  "Orders",
  "Brands",
  "Voice Notes",
] as const;

export const TERRITORY_CHANNELS = [
  "All Channels",
  "On-Premise",
  "Off-Premise",
  "Independent",
  "National Chains",
] as const;

// ── Pipeline tab ──────────────────────────────────────────────────────────────

export interface PipelineItem {
  id: string;
  name: string;
  amount: string;
  stage: string;
  date: string;
  progress: number; // 0–1
  priority?: boolean; // red dot beside the name
}

// ── Orders tab ────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Delivered"
  | "Shipped"
  | "Processing"
  | "Delayed"
  | "Received";

export interface Order {
  id: string;
  name: string;
  orderNo: string;
  date: string;
  status: OrderStatus;
}

// ── Activity Log tab ──────────────────────────────────────────────────────────

export type ActivityStatus = "Progressed" | "Blocked";

export interface ActivityEntry {
  id: string;
  name: string;
  icon: LucideIcon;
  date: string;
  status: ActivityStatus;
  location: string;
  tags: string[];
  description: string;
  next: string;
}

