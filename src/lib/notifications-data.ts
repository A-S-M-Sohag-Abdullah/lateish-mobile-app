import { ClipboardCheck, TriangleAlert, type LucideIcon } from "lucide-react-native";

export type Priority = "High" | "Critical";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  priority: Priority;
  icon: LucideIcon;
  iconBg: string;
  /** Section header shown before the first item of a run; "" = no header. */
  section: string;
  read: boolean;
}

const AP = {
  title: "A&P Budget: Approval Required",
  description: "New £2,500 cocktail bar activation request awaiting your approval",
  priority: "High" as Priority,
  icon: ClipboardCheck,
  iconBg: "#A855F7",
  section: "",
};

const CHURN = {
  title: "Churn Risk: 3 Accounts",
  description:
    "The Langham Hotel, The Velvet Room, and Pacific Provisions have not reordered in 60+ days — £52k at risk",
  priority: "Critical" as Priority,
  icon: TriangleAlert,
  iconBg: "#EAB308",
  section: "Risk",
};

// Grouped: approvals first, then the "Risk" section — 12 total.
export const NOTIFICATIONS: NotificationItem[] = [
  { ...AP, id: "n1", time: "46m ago", read: false },
  { ...AP, id: "n2", time: "46m ago", read: false },
  { ...AP, id: "n3", time: "1h ago", read: false },
  { ...AP, id: "n4", time: "2h ago", read: true },
  { ...AP, id: "n5", time: "3h ago", read: true },
  { ...AP, id: "n6", time: "5h ago", read: false },
  { ...CHURN, id: "n7", time: "41m ago", read: false },
  { ...CHURN, id: "n8", time: "41m ago", read: false },
  { ...CHURN, id: "n9", time: "1h ago", read: false },
  { ...CHURN, id: "n10", time: "2h ago", read: true },
  { ...CHURN, id: "n11", time: "4h ago", read: true },
  { ...CHURN, id: "n12", time: "6h ago", read: false },
];
