/**
 * Organization types — kept in sync with front-end/src/types/organization.ts.
 * Only the pieces the mobile app needs are ported; add more as screens land.
 */
export type OrgPlan = "starter" | "growth" | "enterprise";
export type OrgRole = "owner" | "admin" | "member";

/** Role values exactly as stored in the database / returned by the API. */
export type BackendRole = "owner" | "org_admin" | "bdm" | "distributor";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  region: string;
  currency: string;
  plan: OrgPlan;
  role: OrgRole;
  backendRole: BackendRole;
  memberCount: number;
  createdAt: string;
  logoInitials: string;
}

/** Shape returned by GET /api/v1/organizations/me — one entry per membership. */
export interface UserMembership {
  user_id: string;
  organization_id: string;
  role: BackendRole;
  status: string;
  joined_at: string;
  updated_at: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
}

/** Map a backend role string to the UI-facing OrgRole. */
export function mapBackendRole(role: BackendRole): OrgRole {
  if (role === "owner") return "owner";
  if (role === "org_admin") return "admin";
  return "member";
}

/** Derive logo initials from an org name. */
export function orgInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "ORG"
  );
}

/** Transform a UserMembership (API response) into a mobile Organization. */
export function membershipToOrganization(m: UserMembership): Organization {
  const o = m.organization;
  const settings = o.settings ?? {};
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    industry: (settings.industry as string) ?? "",
    region: (settings.region as string) ?? "",
    currency: (settings.currency as string) ?? "USD",
    plan: (o.plan as OrgPlan) ?? "starter",
    role: mapBackendRole(m.role),
    backendRole: m.role,
    memberCount: 0,
    createdAt: o.created_at,
    logoInitials: orgInitials(o.name),
  };
}

/** Shape returned by GET /api/v1/organizations/:orgId/members. */
export interface OrgMember {
  user_id: string;
  role: BackendRole;
  status: string; // "active" | "invited" | "inactive" | ...
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

// ── Create / invitations ──────────────────────────────────────────────────────

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

/** Shape returned by GET /api/v1/invitations/:token. */
export interface OrgInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: BackendRole;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  organization?: { id: string; name: string; slug: string };
}

/** Shape returned by POST /api/v1/organizations. */
export interface ApiCreatedOrg {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  plan: OrgPlan;
  settings: { industry?: string; region?: string };
}

/** Turn a name (or full invite URL) into just the org slug / invite token. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}
