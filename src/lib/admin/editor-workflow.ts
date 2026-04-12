export const CANONICAL_EDITOR_STATUSES = [
  'draft',
  'in_review',
  'changes_requested',
  'approved',
  'published',
  'archived',
] as const

export type CanonicalEditorStatus = (typeof CANONICAL_EDITOR_STATUSES)[number]

/**
 * Transitional storage bridge for environments that still enforce the pre-normalization
 * `pending_review` value at the database level.
 *
 * Canonical app-level status remains `in_review`. This compatibility path exists only
 * to keep older environments writable until the canonical migration is universally applied.
 */
export const LEGACY_REVIEW_STATUS_COMPAT = {
  enabled: true,
  canonical: 'in_review' as const,
  legacyStorageValue: 'pending_review',
} as const

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

export const getStatusWriteCandidates = (
  status: string | null | undefined,
): string[] => {
  const canonicalStatus = normalizeEditorStatus(status)

  if (
    LEGACY_REVIEW_STATUS_COMPAT.enabled &&
    canonicalStatus === LEGACY_REVIEW_STATUS_COMPAT.canonical
  ) {
    return [
      LEGACY_REVIEW_STATUS_COMPAT.canonical,
      LEGACY_REVIEW_STATUS_COMPAT.legacyStorageValue,
    ]
  }

  return [canonicalStatus]
}

export const isLegacyStatusConstraintError = (error: { code?: string; message?: string } | null | undefined) =>
  Boolean(
    error &&
      (error.code === '23514' ||
        error.message?.toLowerCase().includes('status')),
  )
