import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore } from "@/store/organization.store";
import {
  membershipToOrganization,
  type Organization,
  type UserMembership,
} from "@/types/organization";

export const MY_ORGS_QUERY_KEY = ["organizations", "me"] as const;

/**
 * The signed-in user's organizations (from GET /organizations/me) plus the
 * currently-selected one. Ported from the web OrganizationProvider — here it's a
 * hook over TanStack Query + the persisted `useOrgStore`.
 */
export function useOrganizations(): {
  currentOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  switchOrg: (id: string) => void;
} {
  const session = useAuthStore((s) => s.session);
  const currentOrgId = useOrgStore((s) => s.currentOrgId);
  const setCurrentOrgId = useOrgStore((s) => s.setCurrentOrgId);

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: MY_ORGS_QUERY_KEY,
    queryFn: () => api.get<UserMembership[]>("/organizations/me"),
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const organizations = memberships.map(membershipToOrganization);
  // Prefer the saved id, fall back to the first (most-recently-joined) org.
  const currentOrg =
    organizations.find((o) => o.id === currentOrgId) ?? organizations[0] ?? null;

  return {
    currentOrg,
    organizations,
    isLoading: !!session && isLoading,
    switchOrg: setCurrentOrgId,
  };
}
