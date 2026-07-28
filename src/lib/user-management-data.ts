// Sample data for Settings → User Management. Static for the mobile preview.
// See [[project_mobile_app]] PREVIEW_MODE.

export type UserStatus = "Active" | "Invited" | "Inactive";
export type UserRole =
  | "Admin"
  | "Brand Manager"
  | "BDM"
  | "Analyst"
  | "Viewer"
  | "Finance";

export interface ManagedUser {
  initials: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** Avatar circle colour. */
  color: string;
}

export const USER_OVERVIEW = {
  totalUsers: 48,
  activeUsers: 12,
  pendingInvites: 4,
  roles: 5,
};

export const MANAGED_USERS: ManagedUser[] = [
  { initials: "RS", name: "Rahul Sharma", email: "rahul.sharma@lateish.com", role: "Admin", status: "Active", color: "#2563EB" },
  { initials: "PN", name: "Priya Nair", email: "priya.nair@lateish.com", role: "Brand Manager", status: "Active", color: "#3F6F63" },
  { initials: "AM", name: "Arjun Mehta", email: "arjun.mehta@lateish.com", role: "BDM", status: "Active", color: "#0D9488" },
  { initials: "KM", name: "Karan Malhotra", email: "karan.m@lateish.com", role: "BDM", status: "Active", color: "#475569" },
  { initials: "NS", name: "Neha Singh", email: "neha.singh@lateish.com", role: "Analyst", status: "Active", color: "#B7791F" },
  { initials: "VT", name: "Vikram Tiwari", email: "vikram.t@lateish.com", role: "Viewer", status: "Invited", color: "#7C3AED" },
  { initials: "PP", name: "Pooja Patel", email: "pooja.patel@lateish.com", role: "BDM", status: "Inactive", color: "#059669" },
  { initials: "SJ", name: "Siddharth Jain", email: "siddharth.j@lateish.com", role: "Finance", status: "Inactive", color: "#475569" },
];
