import type { SubjectMastery } from '@/types/dashboard'

interface ReviewCenterSyncCardProps {
  enrolledReviewCenter: string | null
  subjectMastery: SubjectMastery[]
}

/**
 * ReviewCenterSyncCard — shown only when the user is enrolled in a review center.
 * Highlights the subject with the lowest mastery score as this week's priority.
 * Not rendered if enrolled_review_center is 'none' or null.
 */
export const ReviewCenterSyncCard = ({
  enrolledReviewCenter,
  subjectMastery,
}: ReviewCenterSyncCardProps) => {
  if (!enrolledReviewCenter || enrolledReviewCenter === 'none') return null

  // Find the subject with the lowest mastery sub-score among attempted subjects.
  // Fall back to the first subject alphabetically if none attempted yet.
  const attempted = subjectMastery.filter(s => s.questionsAnswered > 0)
  const sorted = [...(attempted.length > 0 ? attempted : subjectMastery)].sort(
    (a, b) => a.mastery - b.mastery
  )
  const prioritySubject = sorted[0]?.subject ?? null

  return (
    <div className="rounded-md border border-border bg-white p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: '#EEF2FC' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 1L7.236 3.528L10 3.927L8 5.878L8.472 8.635L6 7.344L3.528 8.635L4 5.878L2 3.927L4.764 3.528L6 1Z"
              stroke="#1B3FC4"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold" style={{ color: '#1A2332' }}>
          Review Center Sync
        </h3>
      </div>

      {prioritySubject ? (
        <>
          <p className="text-sm" style={{ color: '#4A5568' }}>
            Based on your heatmap, this week&apos;s priority subject is:{' '}
            <span className="font-semibold" style={{ color: '#1A2332' }}>
              {prioritySubject}
            </span>
          </p>
          <p className="text-xs" style={{ color: '#8896A7' }}>
            Check if this matches your review center schedule for maximum efficiency.
          </p>
        </>
      ) : (
        <p className="text-sm" style={{ color: '#4A5568' }}>
          Complete a session to see which subject to prioritize this week.
        </p>
      )}
    </div>
  )
}
