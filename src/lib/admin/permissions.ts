import { UserRole } from './roles';

export interface Permission {
  name: string;
  description: string;
}

export const PERMISSIONS = {
  // Content Management
  MANAGE_QUESTIONS: 'manage_questions',
  MANAGE_WIKI: 'manage_wiki',
  MANAGE_3D_ASSETS: 'manage_3d_assets',
  MANAGE_TAXONOMY: 'manage_taxonomy',
  
  // Review
  REVIEW_CONTENT: 'review_content',
  APPROVE_CONTENT: 'approve_content',
  
  // User Management
  MANAGE_USERS: 'manage_users',
  ASSIGN_ROLES: 'assign_roles',
  
  // Audit
  VIEW_AUDIT_LOG: 'view_audit_log',
  
  // Publishing
  PUBLISH_CONTENT: 'publish_content',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  super_admin: [
    PERMISSIONS.MANAGE_QUESTIONS,
    PERMISSIONS.MANAGE_WIKI,
    PERMISSIONS.MANAGE_3D_ASSETS,
    PERMISSIONS.MANAGE_TAXONOMY,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.APPROVE_CONTENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_AUDIT_LOG,
    PERMISSIONS.PUBLISH_CONTENT,
  ],
  content_admin: [
    PERMISSIONS.MANAGE_QUESTIONS,
    PERMISSIONS.MANAGE_WIKI,
    PERMISSIONS.MANAGE_3D_ASSETS,
    PERMISSIONS.MANAGE_TAXONOMY,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
  ],
  sme_reviewer: [
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.APPROVE_CONTENT,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | null, permission: PermissionKey): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole | null): PermissionKey[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}
