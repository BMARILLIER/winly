/**
 * Role constants for the application.
 * The User.role field is a free string in Prisma — these are the known values.
 */
export const ROLES = {
  FREE: "free",
  PRO: "pro",
  TEAM: "team",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles that can access the admin panel */
export const ADMIN_ROLES: readonly Role[] = [ROLES.ADMIN];

/** Check if a role has admin access */
export function isAdmin(role: string): boolean {
  return role === ROLES.ADMIN;
}
