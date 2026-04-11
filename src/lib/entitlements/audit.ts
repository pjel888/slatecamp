import type { EntitlementAuditEvent } from './types'

const AUDIT_PREFIX = '[entitlement-audit]'

export const logEntitlementAuditEvent = (event: EntitlementAuditEvent): void => {
  const payload = JSON.stringify(event)
  const sink =
    event.eventName === 'entitlement.denied' ||
    event.eventName === 'entitlement.config.mismatch'
      ? console.warn
      : console.info

  sink(`${AUDIT_PREFIX} ${payload}`)
}
