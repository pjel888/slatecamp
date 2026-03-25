/**
 * SleepAwareLabel — Server Component
 *
 * Shows a subtle nudge when a step's preferred study time conflicts
 * with the user's study window. Based on sleep science (Walker 2017):
 * morning is better for retrieval, evening for encoding new material.
 *
 * Renders null when there is no conflict.
 */

interface SleepAwareLabelProps {
  preferredTime: 'morning' | 'evening' | 'any'
  userStudyWindow: 'morning' | 'evening' | 'both' | 'any'
}

const SleepAwareLabel = ({ preferredTime, userStudyWindow }: SleepAwareLabelProps) => {
  // No conflict when step has no preference or user has no preference
  if (preferredTime === 'any' || userStudyWindow === 'any' || userStudyWindow === 'both') {
    return null
  }

  // Conflict: step prefers morning but user studies in the evening
  if (preferredTime === 'morning' && userStudyWindow === 'evening') {
    return (
      <span className="text-[11px] italic text-[warning]">
        Best studied in the morning
      </span>
    )
  }

  // Conflict: step prefers evening but user studies in the morning
  if (preferredTime === 'evening' && userStudyWindow === 'morning') {
    return (
      <span className="text-[11px] italic text-[warning]">
        Best studied in the evening
      </span>
    )
  }

  return null
}

export { SleepAwareLabel }
export type { SleepAwareLabelProps }
