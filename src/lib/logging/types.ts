export type ApplicationLogSeverity = 'error' | 'warn' | 'info'

export type ApplicationLogFamily =
  | 'auth'
  | 'quiz'
  | 'admin'
  | 'billing'
  | 'developer'
  | 'system'

export interface ApplicationLogContext {
  requestId?: string
  traceId?: string | null
  routeOrAction: string
  userId?: string | null
  sessionId?: string | null
  provider?: string | null
  eventId?: string | null
  metadata?: Record<string, unknown>
}

export interface ApplicationLogEventInput {
  severity: ApplicationLogSeverity
  family: ApplicationLogFamily
  eventName: string
  message: string
  context: ApplicationLogContext
  error?: unknown
  persist?: boolean
}

export interface ApplicationLogEvent {
  namespace: 'application_error'
  severity: ApplicationLogSeverity
  family: ApplicationLogFamily
  eventName: string
  message: string
  requestId: string
  traceId: string | null
  routeOrAction: string
  userId: string | null
  sessionId: string | null
  provider: string | null
  eventId: string | null
  fingerprint: string
  metadata: Record<string, unknown>
  error: Record<string, unknown> | null
  createdAt: string
}

export interface ApplicationErrorLogRow {
  id: string
  eventName: string
  severity: ApplicationLogSeverity
  family: ApplicationLogFamily
  message: string
  routeOrAction: string
  requestId: string
  traceId: string | null
  userId: string | null
  sessionId: string | null
  provider: string | null
  eventId: string | null
  fingerprint: string
  metadata: Record<string, unknown>
  error: Record<string, unknown> | null
  createdAt: string
}
