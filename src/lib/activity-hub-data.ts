// Sample data for the Activity Hub page. Mirrors the web front-end
// (front-end/src/components/activity-hub) — live from the API there, static
// here for the mobile preview. See [[project_mobile_app]] PREVIEW_MODE.

export type ActivityCategory = "wins" | "orders" | "visits" | "goals";

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  title: string;
  time: string;
  description: string;
  user: { initials: string; name: string };
  tags?: string[];
  /** Cyan highlight pill (e.g. a goal % achieved) shown instead of tags. */
  highlight?: string;
}

export interface TeamMember {
  initials: string;
  name: string;
  status: string;
  online: boolean;
}

export const ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    category: "wins",
    title: "New Listing Won!",
    time: "Just now",
    description: "The Ivy Chelsea Garden is now stocking Premium Gin",
    user: { initials: "SJ", name: "Sarah Johnson" },
    tags: ["The Ivy", "Premium Gin"],
  },
  {
    id: "2",
    category: "orders",
    title: "Order Placed",
    time: "5 mins ago",
    description: "Sketch placed a reorder for 24 cases",
    user: { initials: "MC", name: "Mike Chen" },
    tags: ["Sketch", "24 Cases"],
  },
  {
    id: "3",
    category: "visits",
    title: "Visit Completed",
    time: "15 mins ago",
    description: "Completed tasting session at Dishoom Shoreditch",
    user: { initials: "EW", name: "Emma Wilson" },
    tags: ["Dishoom", "45 min"],
  },
  {
    id: "4",
    category: "goals",
    title: "Monthly Target Hit!",
    time: "30 mins ago",
    description: "Central London territory reached 105% of monthly target",
    user: { initials: "SJ", name: "Sarah Johnson" },
    highlight: "105%",
  },
  {
    id: "5",
    category: "wins",
    title: "New Listing Won!",
    time: "45 mins ago",
    description: "Nightjar added Broken Barrier Reposado to their cocktail menu",
    user: { initials: "JR", name: "James Rodriguez" },
    tags: ["Nightjar", "Reposado"],
  },
  {
    id: "6",
    category: "orders",
    title: "Order Placed",
    time: "1 hour ago",
    description: "The Botanist placed a reorder for 18 cases",
    user: { initials: "EW", name: "Emma Wilson" },
    tags: ["The Botanist", "18 Cases"],
  },
  {
    id: "7",
    category: "visits",
    title: "Visit Completed",
    time: "2 hours ago",
    description: "Completed staff training at Sketch London",
    user: { initials: "MC", name: "Mike Chen" },
    tags: ["Sketch", "30 min"],
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { initials: "SJ", name: "Sarah Johnson", status: "Visiting The Ivy", online: true },
  { initials: "MC", name: "Mike Chen", status: "On a call", online: true },
  { initials: "EW", name: "Emma Wilson", status: "Last seen 15 min ago", online: false },
  { initials: "JR", name: "James Rodriguez", status: "BDM", online: true },
];

export const TEAM_ONLINE_LABEL = "4/5";

export const TODAY_SUMMARY = { visits: 12, orders: 5 };
