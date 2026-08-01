import { QueryClient } from "@tanstack/react-query";

/**
 * Single app-wide query client. Exported as a module singleton (not created
 * inside QueryProvider) so non-React code — the auth store — can clear it on
 * logout. Without that, a second user signing in on the same device briefly
 * sees the first user's cached org/data, because the shared query keys are
 * still fresh within their staleTime window.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});
