import type { ApplicationLogEvent, ApplicationLogEventInput } from './types'
import { normalizeErrorForLog, sanitizeForLog } from './redaction'

export const APPLICATION_ERROR_EVENT_PREFIX = 'app_error.'

const buildFingerprint = (
  family: string,
  eventName: string,
  routeOrAction: string,
  error: Record<string, unknown> | null,
) => {
  const message =
    typeof error?.message === 'string'
      ? error.message
      : 'no-error-message'

  return [family, eventName, routeOrAction, message].join('|')
}

export const buildApplicationLogEvent = (
  input: ApplicationLogEventInput,
): ApplicationLogEvent => {
  const normalizedError = normalizeErrorForLog(input.error)
  const requestId = input.context.requestId ?? crypto.randomUUID()

  return {
    namespace: 'application_error',
    severity: input.severity,
    family: input.family,
    eventName: input.eventName,
    message: input.message,
    requestId,
    traceId: input.context.traceId ?? null,
    routeOrAction: input.context.routeOrAction,
    userId: input.context.userId ?? null,
    sessionId: input.context.sessionId ?? null,
    provider: input.context.provider ?? null,
    eventId: input.context.eventId ?? null,
    fingerprint: buildFingerprint(
      input.family,
      input.eventName,
      input.context.routeOrAction,
      normalizedError,
    ),
    metadata: (sanitizeForLog(input.context.metadata ?? {}) as Record<string, unknown>) ?? {},
    error: normalizedError,
    createdAt: new Date().toISOString(),
  }
}

export const logApplicationEventToConsole = (event: ApplicationLogEvent) => {
  const sink =
    event.severity === 'error'
      ? console.error
      : event.severity === 'warn'
        ? console.warn
        : console.info

  sink(`[application-error] ${event.family}.${event.eventName}`, event)
}
