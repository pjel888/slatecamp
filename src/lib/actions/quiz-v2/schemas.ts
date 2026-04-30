import { z } from 'zod'

const uuidSchema = z.string().uuid('Must be a valid UUID')

const clampUnitInterval = (value: unknown) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue)) return value
  return Math.min(1, Math.max(0, numericValue))
}

export const startSessionInputSchema = z.object({
  mode: z.enum([
    'camp',
    'chill',
    'subject',
    'focus_review',
    'custom',
    'storm',
    'full_exam',
    'endurance',
    'article_review',
  ]),
  config: z.record(z.string(), z.unknown()).default({}),
  trailDayId: uuidSchema.optional(),
})

export const gestureSignalEventSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw

    const event = raw as Record<string, unknown>
    return {
      ...event,
      x: clampUnitInterval(event.x),
      y: clampUnitInterval(event.y),
      pressure:
        event.pressure == null ? event.pressure : clampUnitInterval(event.pressure),
    }
  },
  z.object({
    timestamp: z.number().min(0),
    type: z.enum(['start', 'move', 'end', 'cancel']),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    contactWidth: z.number().min(0).optional(),
    contactHeight: z.number().min(0).optional(),
    pressure: z.number().min(0).max(1).optional(),
    accelerometer: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    gyroscope: z.object({ alpha: z.number(), beta: z.number(), gamma: z.number() }).optional(),
  }),
)

export const cageBindingTokenSchema = z.object({
  nonce: z.string().min(8),
  signature: z.string().min(16),
  version: z.number().int().min(1),
})

const cageTrustLevelSchema = z.enum([
  'verified',
  'absent',
  'failed',
  'timeout',
  'nonce_expired',
  'offline_nonce',
  'dev_mode',
])

export const submitAnswerInputSchema = z.object({
  sessionId: uuidSchema,
  questionId: uuidSchema,
  selectedOptionId: z.string().trim().min(1, 'Answer is required').max(256),
  topicId: uuidSchema.optional(),
  difficulty: z.number().min(0).max(1).optional(),
  confidenceLevel: z.number().min(0).max(1).optional(),
  timeSpentMs: z.number().int().min(0).max(3_600_000),
  cageToken: cageBindingTokenSchema.optional().nullable(),
  cageTrustLevel: cageTrustLevelSchema.optional(),
  signalTrace: z.array(gestureSignalEventSchema).optional(),
  gestureDurationMs: z.number().int().min(0).optional(),
  sensorsAvailable: z.boolean().optional(),
})

export const endSessionInputSchema = z.object({
  sessionId: uuidSchema,
  endReason: z.enum(['completed', 'user_exit', 'timer_expired', 'auto_submitted']),
})

export const sessionQuestionSliceInputSchema = z.object({
  sessionId: uuidSchema,
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(50),
})

export type SessionQuestionSliceInput = z.infer<typeof sessionQuestionSliceInputSchema>
