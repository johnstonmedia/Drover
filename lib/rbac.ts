// Role-based access helpers. The authoritative enforcement lives in Firestore
// Security Rules (see firestore.rules); these helpers gate the UI.
import type { Permission, Role, UserProfile } from './types';

const ROLE_RANK: Record<Role, number> = {
  member: 1,
  company_admin: 2,
  site_admin: 3,
};

export function atLeast(profile: UserProfile | null, role: Role): boolean {
  if (!profile) return false;
  return ROLE_RANK[profile.role] >= ROLE_RANK[role];
}

export function isSiteAdmin(profile: UserProfile | null): boolean {
  return profile?.role === 'site_admin';
}

export function isCompanyAdmin(profile: UserProfile | null): boolean {
  return atLeast(profile, 'company_admin');
}

export function can(profile: UserProfile | null, permission: Permission): boolean {
  if (!profile) return false;
  // Admins implicitly hold every permission.
  if (atLeast(profile, 'company_admin')) return true;
  return profile.permissions?.includes(permission) ?? false;
}

/** Default permission set granted to a brand-new member. */
export const DEFAULT_MEMBER_PERMISSIONS: Permission[] = ['view_prices', 'view_margins'];

export const ALL_PERMISSIONS: Permission[] = [
  'view_prices',
  'view_margins',
  'manage_livestock',
  'export_data',
  'use_advisor',
  'manage_users',
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_prices: 'View prices',
  view_margins: 'View margins',
  manage_livestock: 'Manage livestock profiles',
  export_data: 'Export Excel data',
  use_advisor: 'Use AI advisor',
  manage_users: 'Manage company users',
};
