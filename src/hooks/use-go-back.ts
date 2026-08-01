import { useRouter, type Href } from "expo-router";
import { useCallback } from "react";

/**
 * Back handler that is safe when there's no navigation history — e.g. the user
 * deep-linked or reloaded directly onto a pushed screen (common on web dev).
 * `router.back()` would emit "GO_BACK was not handled by any navigator" then;
 * this falls back to a route instead.
 */
export function useGoBack(fallback: Href = "/") {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}
