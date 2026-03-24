/**
 * Format a date/timestamp as a human-readable relative time string.
 * Examples: "just now", "5m ago", "3h ago", "2d ago", "Mar 15"
 */
export const formatRelativeTime = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '\u2014'
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(date.getTime())) return '\u2014'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay <= 7) return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
