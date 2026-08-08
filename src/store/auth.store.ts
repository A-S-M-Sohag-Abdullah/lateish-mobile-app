import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import { env } from "@/lib/env";
import { signInWithApple, signInWithGoogle } from "@/lib/oauth";
import { unregisterPushToken } from "@/lib/push";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase";
import { useOrgStore } from "@/store/organization.store";
import { useTabsStore } from "@/store/tabs.store";
import type { UserMembership } from "@/types/organization";

const BASE_URL = env.apiUrl;

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface AuthResponse {
  user: SessionUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  /**
   * Stored on the Supabase auth user's metadata, not in `public.users` — that
   * table has no phone column and POST /auth/register does not accept one.
   */
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: SessionUser | null;
  /** True until the first onAuthStateChange event lands. */
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ hasOrganizations: boolean }>;
  register: (input: RegisterInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Fetch the backend user profile using an access token directly.
 * This MUST NOT use supabase.auth.getSession() — calling getSession() inside
 * onAuthStateChange triggers cascading auth events that can cause SIGNED_OUT.
 */
async function fetchProfile(accessToken: string): Promise<SessionUser | null> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  // Try /auth/sync first (upserts profile), fall back to /auth/me (read-only)
  for (const [method, path] of [
    ["POST", "/auth/sync"],
    ["GET", "/auth/me"],
  ] as const) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { method, headers });
      if (res.ok) {
        const json = await res.json();
        return json.data as SessionUser;
      }
    } catch (err) {
      console.error(`[auth] fetchProfile ${method} ${path} failed:`, err);
      // network error — try next endpoint
    }
  }
  return null;
}

/** Build a provisional profile from Supabase metadata so the UI can render
 *  immediately instead of waiting on the backend round-trip. */
function profileFromSupabaseUser(u: User | null): SessionUser | null {
  if (!u) return null;
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? "",
    full_name:
      (meta.full_name as string | undefined) ??
      `${meta.first_name ?? ""} ${meta.last_name ?? ""}`.trim() ??
      u.email ??
      "",
    first_name: (meta.first_name as string | null) ?? null,
    last_name: (meta.last_name as string | null) ?? null,
    avatar_url:
      (meta.avatar_url as string | null) ??
      (meta.picture as string | null) ??
      null,
  };
}

// Module-scoped so Fast Refresh re-running this module cannot stack listeners.
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>()((set) => {
  authSubscription?.unsubscribe();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      set({ session: null, user: null, profile: null, loading: false });
      // Reset the pager so the next sign-in opens on Dashboard, not wherever
      // the user last was (e.g. Settings). Done here — before the login screen
      // shows — so the pager mounts already on page 0 with no visible jump.
      useTabsStore.getState().setPage(0);
      // Wipe per-user state so the next account never sees the previous one's
      // cached organizations/data (the shared query keys stay fresh otherwise).
      useOrgStore.getState().setCurrentOrgId(null);
      queryClient.clear();
      return;
    }

    const supaUser = session?.user ?? null;
    set({
      session,
      user: supaUser,
      profile: profileFromSupabaseUser(supaUser),
      loading: false,
    });

    // Background-fetch the canonical backend profile OUTSIDE the callback,
    // using the token from the session parameter (never getSession()).
    if (session?.access_token) {
      const token = session.access_token;
      setTimeout(() => {
        void fetchProfile(token).then((backend) => {
          if (!backend) return;
          // Keep the Supabase-provided name/avatar (e.g. from Google metadata)
          // when the backend profile hasn't been populated with them yet —
          // otherwise the freshly-synced empty backend row overwrites the good
          // values and the UI shows nothing until a refetch.
          const existing = useAuthStore.getState().profile;
          set({
            profile: {
              ...backend,
              full_name: backend.full_name || existing?.full_name || "",
              avatar_url: backend.avatar_url ?? existing?.avatar_url ?? null,
            },
          });
        });
      }, 0);
    }
  });
  authSubscription = subscription;

  return {
    user: null,
    session: null,
    profile: null,
    loading: true,

    login: async (email, password) => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);

      // Check org memberships with the fresh token directly (no getSession).
      const token = data.session?.access_token;
      if (!token) return { hasOrganizations: false };

      try {
        const res = await fetch(`${BASE_URL}/organizations/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const memberships: UserMembership[] = json.data ?? [];
          return { hasOrganizations: memberships.length > 0 };
        }
      } catch (err) {
        console.error("[auth] login: failed to fetch org memberships:", err);
      }
      return { hasOrganizations: false };
    },

    register: async ({ email, password, phone, firstName, lastName }) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Registration failed");
      }
      const json: { data: AuthResponse } = await res.json();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);

      // The sign-up design collects a phone number but neither the register
      // endpoint nor public.users accepts one, so it is kept on the Supabase
      // auth user's metadata. Failing here must not fail the sign-up.
      if (phone) {
        const { error: phoneError } = await supabase.auth.updateUser({
          data: { phone },
        });
        if (phoneError) {
          console.error("[auth] failed to store phone number:", phoneError);
        }
      }

      if (json.data?.user) set({ profile: json.data.user });
    },

    signInWithGoogle: async () => {
      await signInWithGoogle();
    },

    signInWithApple: async () => {
      await signInWithApple();
    },

    sendPasswordReset: async (email) => {
      // No redirectTo: Supabase falls back to the project's Site URL, which is
      // the web app's reset page. Adding a mobile deep link here would need a
      // matching in-app reset screen and a Supabase redirect allow-list entry.
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw new Error(error.message);
    },

    logout: async () => {
      // Drop this device's push token first — after signOut the API call would
      // be unauthenticated. Best-effort; never block logout on it.
      await unregisterPushToken().catch(() => {});
      await supabase.auth.signOut();
    },
  };
});
