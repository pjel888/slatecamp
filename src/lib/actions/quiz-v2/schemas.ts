import { z } from 'zod'

const uuidSchema = z.string().uuid('Must be a valid UUID')

export const startSessionInputSchema = z.object({
  mode: z.enum([
    'camp',
    'chill',
    'subject',
    'focused',
    'custom',
    'storm',
    'fullexam',
    'extended',
    'article_review',
  ]),
  config: z.record(z.string(), z.unknown()).default({}),
  trailDayId: uuidSchema.optional(),
})

export const submitAnswerInputSchema = z.object({
  sessionId: uuidSchema,
  questionId: uuidSchema,
  selectedOptionId: z.string().trim().min(1, 'Answer is required').max(256),
  topicId: uuidSchema.optional(),
  difficulty: z.number().min(0).max(1).optional(),
  confidenceLevel: z.number().min(0).max(1).optional(),
  timeSpentMs: z.number().int().min(0).max(3_600_000),
  cageToken: z.unknown().optional().nullable(),
  cageTrustLevel: z.unknown().optional(),
  signalTrace: z.array(z.unknown()).optional(),
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
