import Link from 'next/link'

/**
 * SRS Review Widget — UX Strategy Section 5, Sprint 2
 * "12 items due for review today · Building Laws, Utilities · ~15 min"
 * Non-intrusive: factual status, not an alert.
 */

interface SrsReviewWidgetProps {
  itemsDue: number
  subjects: string[]
  estimatedMinutes: number
}

export const SrsReviewWidget = ({
  itemsDue,
  subjects,
  estimatedMinutes,
}: SrsReviewWidgetProps) => {
  if (itemsDue === 0) return null

  const subjectList = subjects.slice(0, 3).join(', ')
  const hasMore = subjects.length > 3

  return (
    <Link
      href="/quiz/camp/setup"
      className="block rounded-md border border-border bg-white p-4 transition-shadow duration-150 ease-out hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {itemsDue} {itemsDue === 1 ? 'item' : 'items'} ready for review
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {subjectList}{hasMore ? ` +${subjects.length - 3} more` : ''} &middot; ~{estimatedMinutes} min
          </p>
        </div>
        <span className="text-xs font-medium text-camp-cobalt">
          Review &rarr;
        </span>
      </div>
    </Link>
  )
}
