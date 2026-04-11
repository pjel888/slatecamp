import { formatSupabaseError } from '@/lib/supabase/format-error'

const REDACTED_KEYS = new Set([
  'authorization',
  'cookie',
  'cookies',
  'password',
  'access_token',
  'refresh_token',
  'token',
  'secret',
  'signature',
  'x-signature',
  'payrex-signature',
  'set-cookie',
])

const truncateString = (value: string, max = 500): string =>
  value.length > max ? `${value.slice(0, max)}...` : value

export const sanitizeForLog = (value: unknown, depth = 0): unknown => {
  if (value == null) return value

  if (typeof value === 'string') return truncateString(value)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (value instanceof Date) return value.toISOString()

  if (Array.isArray(value)) {
    if (depth >= 4) return '[truncated-array]'
    return value.slice(0, 20).map((entry) => sanitizeForLog(entry, depth + 1))
  }

  if (typeof value === 'object') {
    if (depth >= 4) return '[truncated-object]'

    const entries = Object.entries(value as Record<string, unknown>).slice(0, 30)
    return Object.fromEntries(
      entries.map(([key, entryValue]) => {
        if (REDACTED_KEYS.has(key.toLowerCase())) {
          return [key, '[REDACTED]']
        }

        return [key, sanitizeForLog(entryValue, depth + 1)]
      }),
    )
  }

  return String(value)
}

export const normalizeErrorForLog = (error: unknown): Record<string, unknown> | null => {
  if (!error) return null

  if (error instanceof Error) {
    return {
      name: error.name,
      message: truncateString(error.message),
      cause: error.cause ? sanitizeForLog(error.cause) : undefined,
    }
  }

  if (typeof error === 'object') {
    const maybeRecord = error as Record<string, unknown>

    return {
      message: truncateString(formatSupabaseError(error)),
      code: maybeRecord.code ? String(maybeRecord.code) : undefined,
      details: maybeRecord.details ? sanitizeForLog(maybeRecord.details) : undefined,
      hint: maybeRecord.hint ? sanitizeForLog(maybeRecord.hint) : undefined,
      raw: sanitizeForLog(maybeRecord),
    }
  }

  return {
    message: truncateString(String(error)),
  }
}
