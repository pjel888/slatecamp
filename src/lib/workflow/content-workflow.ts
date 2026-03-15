export type ContentStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'changes_requested' 
  | 'approved' 
  | 'published'
  | 'archived';

export interface WorkflowTransition {
  from: ContentStatus;
  to: ContentStatus;
  allowedRoles: ('super_admin' | 'content_admin' | 'sme_reviewer')[];
  requiresComment?: boolean;
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // Content admin actions
  { from: 'draft', to: 'pending_review', allowedRoles: ['super_admin', 'content_admin'] },
  { from: 'draft', to: 'published', allowedRoles: ['super_admin', 'content_admin'] },
  { from: 'draft', to: 'archived', allowedRoles: ['super_admin', 'content_admin'] },
  
  // SME review actions
  { from: 'pending_review', to: 'approved', allowedRoles: ['super_admin', 'content_admin', 'sme_reviewer'] },
  { from: 'pending_review', to: 'changes_requested', allowedRoles: ['super_admin', 'content_admin', 'sme_reviewer'], requiresComment: true },
  
  // Content admin response to SME feedback
  { from: 'changes_requested', to: 'pending_review', allowedRoles: ['super_admin', 'content_admin'] },
  { from: 'changes_requested', to: 'draft', allowedRoles: ['super_admin', 'content_admin'] },
  
  // Publishing
  { from: 'approved', to: 'published', allowedRoles: ['super_admin', 'content_admin'] },
  { from: 'approved', to: 'draft', allowedRoles: ['super_admin', 'content_admin'] },
  
  // Published can go back to draft
  { from: 'published', to: 'draft', allowedRoles: ['super_admin', 'content_admin'] },
  { from: 'published', to: 'archived', allowedRoles: ['super_admin', 'content_admin'] },
];

export function canTransition(
  from: ContentStatus,
  to: ContentStatus,
  role: string | null
): boolean {
  if (!role) return false;
  
  const transition = WORKFLOW_TRANSITIONS.find(
    t => t.from === from && t.to === to
  );
  
  if (!transition) return false;
  
  return transition.allowedRoles.includes(role as any);
}

export function getAvailableTransitions(
  currentStatus: ContentStatus,
  role: string | null
): ContentStatus[] {
  if (!role) return [];
  
  return WORKFLOW_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowedRoles.includes(role as any))
    .map(t => t.to);
}

export function isTransitionValid(
  from: ContentStatus,
  to: ContentStatus,
  role: string | null,
  comment?: string
): { valid: boolean; reason?: string } {
  if (!role) {
    return { valid: false, reason: 'Not authenticated' };
  }

  const transition = WORKFLOW_TRANSITIONS.find(
    t => t.from === from && t.to === to
  );

  if (!transition) {
    return { valid: false, reason: `Invalid transition from ${from} to ${to}` };
  }

  if (!transition.allowedRoles.includes(role as any)) {
    return { valid: false, reason: 'Role not authorized for this transition' };
  }

  if (transition.requiresComment && !comment?.trim()) {
    return { valid: false, reason: 'Comment is required for this transition' };
  }

  return { valid: true };
}

export function getStatusLabel(status: ContentStatus): string {
  const labels: Record<ContentStatus, string> = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    changes_requested: 'Changes Requested',
    approved: 'Approved',
    published: 'Published',
    archived: 'Archived',
  };
  return labels[status];
}

export function getStatusColor(status: ContentStatus): string {
  const colors: Record<ContentStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    changes_requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status];
}
