import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Mirrors front-end/src/components/providers/query-provider.tsx.
 *
 * The extra piece on mobile is focusManager: React Query's default focus
 * detection is a web `visibilitychange` listener, which never fires in RN, so
 * refetch-on-focus has to be wired to AppState instead.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    });
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
