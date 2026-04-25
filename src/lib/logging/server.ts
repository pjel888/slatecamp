import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  APPLICATION_ERROR_EVENT_PREFIX,
  buildApplicationLogEvent,
  logApplicationEventToConsole,
} from './shared'
import type { ApplicationErrorLogRow, ApplicationLogEvent, ApplicationLogEventInput } from './types'

const toAnalyticsEventName = (event: ApplicationLogEvent) =>
  `${APPLICATION_ERROR_EVENT_PREFIX}${event.family}.${event.eventName}`

const persistApplicationEvent = async (event: ApplicationLogEvent) => {
  const supabase = createAdminClient()

  const { error } = await supabase.from('analytics_events').insert({
    user_id: event.userId,
    event_name: toAnalyticsEventName(event),
    session_id: event.sessionId,
    event_properties: event,
  })

  if (error) {
    console.warn('[application-error] persist-failed', error)
  }
}

export const logServerEvent = async (
  input: ApplicationLogEventInput,
): Promise<ApplicationLogEvent> => {
  const event = buildApplicationLogEvent(input)

  logApplicationEventToConsole(event)

  if (input.persist !== false) {
    await persistApplicationEvent(event)
  }

  return event
}

export const logServerError = async (
  input: Omit<ApplicationLogEventInput, 'severity'>,
): Promise<ApplicationLogEvent> =>
  logServerEvent({
    ...input,
    severity: 'error',
  })

export interface ApplicationErrorFilters {
  severity?: string
  family?: string
  limit?: number
}

const assertCanViewOperationalLogs = async () => {
  const { resolveCurrentUserRole } = await import('@/lib/entitlements/resolve-role')
  const { resolveDevOverrides } = await import('@/lib/entitlements/dev-overrides')
  const { canAccessDeveloperPortalForRole } = await import('@/lib/entitlements/policy')

  const [resolution, overrides] = await Promise.all([
    resolveCurrentUserRole(),
    resolveDevOverrides(),
  ])

  if (
    !canAccessDeveloperPortalForRole(
      resolution.normalizedRole,
      overrides.allowDevPortalBypass,
    )
  ) {
    throw new Error('Not authorized to view application errors')
  }
}

export const getApplicationErrorEvents = async (
  filters: ApplicationErrorFilters = {},
): Promise<ApplicationErrorLogRow[]> => {
  await assertCanViewOperationalLogs()

  const supabase = createAdminClient()
  let query = supabase
    .from('analytics_events')
    .select('id, user_id, event_name, event_properties, session_id, created_at')
    .like('event_name', `${APPLICATION_ERROR_EVENT_PREFIX}%`)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 50)

  if (filters.severity) {
    query = query.eq('event_properties->>severity', filters.severity)
  }

  if (filters.family) {
    query = query.eq('event_properties->>family', filters.family)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to load application errors: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const payload = (row.event_properties ?? {}) as Record<string, unknown>

    return {
      id: row.id,
      eventName: String(payload.eventName ?? row.event_name),
      severity: (payload.severity as ApplicationErrorLogRow['severity']) ?? 'error',
      family: (payload.family as ApplicationErrorLogRow['family']) ?? 'system',
      message: String(payload.message ?? 'Unknown application error'),
      routeOrAction: String(payload.routeOrAction ?? 'unknown'),
      requestId: String(payload.requestId ?? row.id),
      traceId: payload.traceId ? String(payload.traceId) : null,
      userId: row.user_id ?? (payload.userId ? String(payload.userId) : null),
      sessionId: row.session_id ?? (payload.sessionId ? String(payload.sessionId) : null),
      provider: payload.provider ? String(payload.provider) : null,
      eventId: payload.eventId ? String(payload.eventId) : null,
      fingerprint: String(payload.fingerprint ?? row.id),
      metadata: (payload.metadata as Record<string, unknown>) ?? {},
      error: (payload.error as Record<string, unknown> | null) ?? null,
      createdAt: row.created_at ?? String(payload.createdAt ?? ''),
    }
  })
}
