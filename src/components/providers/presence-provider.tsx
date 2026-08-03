import { createContext, useContext, useEffect, useState } from "react";

import { useOrganizations } from "@/hooks/use-organizations";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";

interface PresenceContextValue {
  onlineUserIds: Set<string>;
}

const PresenceContext = createContext<PresenceContextValue>({
  onlineUserIds: new Set(),
});

export function usePresence() {
  return useContext(PresenceContext);
}

/**
 * Tracks the signed-in user's presence on a per-org Supabase Realtime channel
 * and exposes the set of online user ids. Mirrors the web app's
 * front-end/src/components/providers/presence-provider.tsx.
 */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!orgId || !userId || !profile) return;

    const first = profile.first_name ?? "";
    const last = profile.last_name ?? "";
    const name = [first, last].filter(Boolean).join(" ") || profile.email;
    const initials =
      [first[0], last[0]].filter(Boolean).join("").toUpperCase() ||
      profile.email.slice(0, 2).toUpperCase();

    const channel = supabase.channel(`presence:${orgId}`, {
      config: { presence: { key: userId } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ user_id: string }>();
      setOnlineUserIds(new Set(Object.keys(state)));
    });
    channel.on("presence", { event: "join" }, ({ key }: { key: string }) => {
      setOnlineUserIds((prev) => new Set([...prev, key]));
    });
    channel.on("presence", { event: "leave" }, ({ key }: { key: string }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          name,
          initials,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, userId, profile]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds }}>
      {children}
    </PresenceContext.Provider>
  );
}
