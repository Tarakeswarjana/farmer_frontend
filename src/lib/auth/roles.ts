import type { Role } from "@/types/api";

export const FARMER_ROLES: Role[] = ["FARMER", "FPO_ADMIN"];
export const BUYER_ROLES: Role[] = ["BUYER", "TRADER", "RETAILER", "RESTAURANT"];
export const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];
export const TRANSPORTER_ROLES: Role[] = ["TRANSPORTER"];
export const MARKET_ROLES: Role[] = ["MARKET_MANAGER", "ADMIN", "SUPER_ADMIN"];
export const FPO_ROLES: Role[] = ["FPO_ADMIN", "ADMIN", "SUPER_ADMIN"];
export const AUTHENTICATED_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FARMER",
  "FPO_ADMIN",
  "BUYER",
  "TRADER",
  "RETAILER",
  "RESTAURANT",
  "TRANSPORTER",
  "MARKET_MANAGER",
];

export function dashboardPath(role: string): string {
  if (role === "FPO_ADMIN") return "/fpo/dashboard";
  if (role === "FARMER") return "/farmer/dashboard";
  if (BUYER_ROLES.includes(role as Role)) return "/buyer/dashboard";
  if (role === "TRANSPORTER") return "/transporter/dashboard";
  if (role === "MARKET_MANAGER") return "/market/dashboard";
  if (ADMIN_ROLES.includes(role as Role)) return "/admin/dashboard";
  return "/";
}

export function hasRole(role: string | undefined, roles: string[] | undefined, allowed: readonly string[]) {
  if (role && allowed.includes(role)) return true;
  return Boolean(roles?.some((item) => allowed.includes(item)));
}

export const ROUTE_GUARDS: Array<{ prefix: string; roles: readonly Role[] }> = [
  { prefix: "/farmer", roles: FARMER_ROLES },
  { prefix: "/buyer", roles: BUYER_ROLES },
  { prefix: "/fpo", roles: FPO_ROLES },
  { prefix: "/transporter", roles: TRANSPORTER_ROLES },
  { prefix: "/market", roles: MARKET_ROLES },
  { prefix: "/admin", roles: ADMIN_ROLES },
  { prefix: "/messages", roles: AUTHENTICATED_ROLES },
  { prefix: "/notifications", roles: AUTHENTICATED_ROLES },
  { prefix: "/profile", roles: AUTHENTICATED_ROLES },
];
