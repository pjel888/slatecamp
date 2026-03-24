/**
 * Shared helpers for rendering audit log event type badges.
 * Used by admin/dashboard and admin/activity pages.
 */

type BadgeVariant = 'success' | 'info' | 'danger' | 'purple' | 'default'

/**
 * Maps an audit log event_type string to a Badge variant.
 */
export const eventBadgeVariant = (eventType: string): BadgeVariant => {
  const upper = eventType?.toUpperCase() ?? ''
  if (upper.includes('CREATE') || upper.includes('INSERT')) return 'success'
  if (upper.includes('UPDATE')) return 'info'
  if (upper.includes('DELETE')) return 'danger'
  if (upper.includes('PUBLISH')) return 'purple'
  return 'default'
}

/**
 * Maps an audit log event_type string to a short display label.
 */
export const eventBadgeLabel = (eventType: string): string => {
  const upper = eventType?.toUpperCase() ?? ''
  if (upper.includes('CREATE') || upper.includes('INSERT')) return 'CREATE'
  if (upper.includes('UPDATE')) return 'UPDATE'
  if (upper.includes('DELETE')) return 'DELETE'
  if (upper.includes('PUBLISH')) return 'PUBLISH'
  return upper || eventType
}
