import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import { env } from "./env";

/**
 * Supabase client for React Native.
 *
 * Differences from the web client (front-end/src/lib/supabase.ts):
 *  - sessions persist to AsyncStorage instead of localStorage
 *  - `detectSessionInUrl` is off; there is no URL bar to parse. OAuth callbacks
 *    arrive through the `lateish://` deep link and are exchanged manually.
 */
// createClient throws on an empty URL, which at module scope would take the
// whole app down before it can render. Fall back to a placeholder so a
// misconfigured .env surfaces as failing requests, not a blank crash screen —
// env.ts has already logged what is missing.
export const supabase = createClient(
  env.supabaseUrl || "http://localhost:54321",
  env.supabaseAnonKey || "missing-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// A backgrounded app has no timers, so the refresh loop has to be tied to the
// foreground state or the access token silently goes stale.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
