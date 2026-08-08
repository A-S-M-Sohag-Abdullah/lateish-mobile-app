import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface NotificationPreferences {
  global_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sales_performance: boolean;
  targets_goals: boolean;
  orders_activities: boolean;
  financial_updates: boolean;
  user_access: boolean;
  system_announcements: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

/** Toggleable boolean keys (everything except the quiet-hours time strings). */
export type PreferenceToggle = {
  [K in keyof NotificationPreferences]: NotificationPreferences[K] extends boolean
    ? K
    : never;
}[keyof NotificationPreferences];

const PREFERENCES_KEY = ["notification-preferences"];

const DEFAULTS: NotificationPreferences = {
  global_enabled: true,
  push_enabled: true,
  email_enabled: true,
  sales_performance: true,
  targets_goals: true,
  orders_activities: true,
  financial_updates: true,
  user_access: true,
  system_announcements: true,
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
};

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PREFERENCES_KEY,
    queryFn: () => api.get<NotificationPreferences>("/notification-preferences"),
  });

  const update = useMutation({
    mutationFn: (patch: Partial<NotificationPreferences>) =>
      api.put<NotificationPreferences>("/notification-preferences", patch),
    // Optimistically apply the change so toggles feel instant.
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PREFERENCES_KEY });
      const previous =
        queryClient.getQueryData<NotificationPreferences>(PREFERENCES_KEY);
      queryClient.setQueryData<NotificationPreferences>(
        PREFERENCES_KEY,
        (old) => ({ ...(old ?? DEFAULTS), ...patch }),
      );
      return { previous };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(PREFERENCES_KEY, ctx.previous);
    },
    onSuccess: (data) => queryClient.setQueryData(PREFERENCES_KEY, data),
  });

  return {
    prefs: query.data ?? DEFAULTS,
    isLoading: query.isLoading,
    isError: query.isError,
    update,
  };
}
