export type NotificationPriority = "Critical" | "High" | "Medium" | "Low";

/** Ported from front-end/src/lib/api-endpoints.ts (ApiNotification). */
export interface ApiNotification {
  id: string;
  organization_id: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}
