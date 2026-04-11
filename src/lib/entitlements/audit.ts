import type { EntitlementAuditEvent } from './types'
import type { DevOverrideState } from './types'
const AUDIT_PREFIX = '[entitlement-audit]'

export const serializeOverrideState = (overrides: DevOverrideState) => ({
  ...overrides,
  featureOverrides: Object.fromEntries(
    Object.entries(overrides.featureOverrides),
  ),
})

const persistEntitlementAuditEvent = async (
  event: EntitlementAuditEvent,
): Promise<void> => {
  if (event.routeOrAction.startsWith('middleware:')) {
    return
  }

  try {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = await createServiceClient()
    await supabase.from('analytics_events').insert({
      user_id: event.userId,
      event_name: event.eventName,
      event_properties: event,
    })
  } catch (error) {
    console.warn(`${AUDIT_PREFIX} persist-failed`, error)
  }
}

export const logEntitlementAuditEvent = (event: EntitlementAuditEvent): void => {
  const payload = JSON.stringify(event)
  const sink =
    event.eventName === 'entitlement.denied' ||
    event.eventName === 'entitlement.config.mismatch'
      ? console.warn
      : console.info

  sink(`${AUDIT_PREFIX} ${payload}`)
  void persistEntitlementAuditEvent(event)
}
