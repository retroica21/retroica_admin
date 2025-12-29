import type { UserProfile } from "./rbac"

/**
 * Permission definitions for different resources
 */
export const Permissions = {
  // Product permissions
  PRODUCT_VIEW_ALL: "product:view:all",
  PRODUCT_VIEW_OWN: "product:view:own",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE_OWN: "product:update:own",
  PRODUCT_UPDATE_ALL: "product:update:all",
  PRODUCT_DELETE_OWN: "product:delete:own",
  PRODUCT_DELETE_ALL: "product:delete:all",

  // Order permissions
  ORDER_VIEW_ALL: "order:view:all",
  ORDER_VIEW_OWN: "order:view:own",
  ORDER_UPDATE_ALL: "order:update:all",
  ORDER_CREATE: "order:create",

  // Financial permissions
  FINANCIAL_VIEW_ALL: "financial:view:all",
  FINANCIAL_VIEW_OWN: "financial:view:own",
  FINANCIAL_EXPORT: "financial:export",

  // Platform integration permissions
  PLATFORM_MANAGE: "platform:manage",
  PLATFORM_SYNC: "platform:sync",

  // User management permissions
  USER_VIEW_ALL: "user:view:all",
  USER_MANAGE: "user:manage",
  USER_DELETE: "user:delete",

  // Settings permissions
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
} as const

type Permission = (typeof Permissions)[keyof typeof Permissions]

/**
 * Role-based permission mapping
 */
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    // Admins have all permissions
    Permissions.PRODUCT_VIEW_ALL,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_UPDATE_ALL,
    Permissions.PRODUCT_DELETE_ALL,
    Permissions.ORDER_VIEW_ALL,
    Permissions.ORDER_UPDATE_ALL,
    Permissions.ORDER_CREATE,
    Permissions.FINANCIAL_VIEW_ALL,
    Permissions.FINANCIAL_EXPORT,
    Permissions.PLATFORM_MANAGE,
    Permissions.PLATFORM_SYNC,
    Permissions.USER_VIEW_ALL,
    Permissions.USER_MANAGE,
    Permissions.USER_DELETE,
    Permissions.SETTINGS_VIEW,
    Permissions.SETTINGS_UPDATE,
  ],
  seller: [
    // Sellers have limited permissions
    Permissions.PRODUCT_VIEW_OWN,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_UPDATE_OWN,
    Permissions.PRODUCT_DELETE_OWN,
    Permissions.ORDER_VIEW_OWN,
    Permissions.FINANCIAL_VIEW_OWN,
  ],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(profile: UserProfile, permission: Permission): boolean {
  const permissions = rolePermissions[profile.role] || []
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(profile: UserProfile, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(profile, permission))
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(profile: UserProfile, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(profile, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return rolePermissions[role] || []
}
