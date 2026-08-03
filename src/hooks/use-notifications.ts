import { useQuery } from "@tanstack/react-query";

import { useOrganizations } from "@/hooks/use-organizations";
import { api } from "@/lib/api";
import type { ApiNotification } from "@/types/notification";

/** Query key for the org's notifications (shared by the header + panel). */
export const notificationsKey = (orgId: string) =>
  ["notifications", orgId] as const;

/**
 * Shared notifications query — the header reads the unread count and the panel
 * renders the list. Same key ⇒ one request, one cache. Realtime invalidation
 * and the mutations live in the panel (mounted once).
 */
export function useNotifications() {
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const query = useQuery({
    queryKey: notificationsKey(orgId),
    queryFn: () =>
      api.get<ApiNotification[]>(`/organizations/${orgId}/notifications`),
    enabled: !!orgId,
    refetchOnWindowFocus: true,
  });

  const notifications = query.data ?? [];
  const unread = notifications.filter((n) => !n.read_at);

  return {
    orgId,
    notifications,
    unread,
    unreadCount: unread.length,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
