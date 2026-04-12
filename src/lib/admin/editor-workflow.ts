export const CANONICAL_EDITOR_STATUSES = [
  'draft',
  'in_review',
  'changes_requested',
  'approved',
  'published',
  'archived',
] as const

export type CanonicalEditorStatus = (typeof CANONICAL_EDITOR_STATUSES)[number]

const STATUS_ALIASES: Record<string, CanonicalEditorStatus> = {
  draft: 'draft',
  review: 'in_review',
  in_review: 'in_review',
  pending_review: 'in_review',
  changes_requested: 'changes_requested',
  approved: 'approved',
  published: 'published',
  archived: 'archived',
}

export const normalizeEditorStatus = (
  status: string | null | undefined,
): CanonicalEditorStatus => {
  if (!status) return 'draft'
  return STATUS_ALIASES[status] ?? 'draft'
}

export const REVIEW_QUEUE_STATUSES = ['review', 'pending_review', 'in_review'] as const

export const PUBLISHED_EDITOR_STATUSES = ['published'] as const

export const isCanonicalEditorStatus = (
  status: string,
): status is CanonicalEditorStatus =>
  CANONICAL_EDITOR_STATUSES.includes(status as CanonicalEditorStatus)
