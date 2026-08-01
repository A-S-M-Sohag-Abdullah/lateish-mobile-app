import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { queryClient } from "@/lib/query-client";

/**
 * Mirrors front-end/src/components/providers/query-provider.tsx.
 *
 * The client is a module singleton (see lib/query-client) so the auth store can
 * clear it on logout. The extra piece on mobile is focusManager: React Query's
 * default focus detection is a web `visibilitychange` listener, which never
 * fires in RN, so refetch-on-focus has to be wired to AppState instead.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    });
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
