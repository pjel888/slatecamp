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
      href="/dashboard/review?mode=camp&source=srs"
      className="block rounded-md border border-[#D4DAE3] bg-white p-4 transition-shadow duration-150 ease-out hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#1A2332]">
            {itemsDue} {itemsDue === 1 ? 'item' : 'items'} ready for review
          </p>
          <p className="mt-0.5 text-xs text-[#8896A7]">
            {subjectList}{hasMore ? ` +${subjects.length - 3} more` : ''} &middot; ~{estimatedMinutes} min
          </p>
        </div>
        <span className="text-xs font-medium text-[#1B3FC4]">
          Review &rarr;
        </span>
      </div>
    </Link>
  )
}
