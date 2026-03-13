import { z } from "zod";

// UUID validation helper
const uuidSchema = z.string().uuid("Invalid ID format");

// Note validation schemas
export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  subject_id: uuidSchema.optional(),
});

export const updateNoteSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  is_pinned: z.boolean().optional(),
});

export const deleteNoteSchema = z.object({
  id: uuidSchema,
});

// Session validation schemas
export const sessionIdSchema = z.object({
  sessionId: uuidSchema,
});

export const createSessionSchema = z.object({
  exam_profile_id: uuidSchema,
  session_type: z.enum([
    "subject_quick",
    "custom_compiled",
    "srs_review",
    "ai_adaptive",
    "retake",
    "topic_drill",
    "weak_areas",
  ]),
  subject_id: uuidSchema.optional(),
  topic_ids: z.array(uuidSchema).optional(),
  question_count: z.number().int().min(1).max(100).optional(),
  time_limit_minutes: z.number().int().min(1).optional(),
});

// Question/Answer validation
export const submitAnswerSchema = z.object({
  session_id: uuidSchema,
  question_id: uuidSchema,
  selected_choice_id: uuidSchema.optional(),
  text_response: z.string().optional(),
  time_spent_seconds: z.number().int().min(0).optional(),
});

// Wiki search validation
export const wikiSearchSchema = z.object({
  query: z.string().min(1, "Search query required").max(200, "Query too long"),
  category_id: uuidSchema.optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

// API route validation schemas
export const aiTutorSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.object({
    pageSlug: z.string().optional(),
    subjectId: z.string().optional(),
  }).optional(),
});

export const studyAgentSchema = z.object({
  action: z.enum(["summarize", "flashcards", "check"]),
  content: z.string().min(1).max(10000),
  noteId: uuidSchema.optional(),
});

export const checkoutSchema = z.object({
  tier: z.enum(["pro", "max"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Feature flags validation
export const featureFlagsSchema = z.record(z.string(), z.boolean());

// Type exports
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type SessionIdInput = z.infer<typeof sessionIdSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type WikiSearchInput = z.infer<typeof wikiSearchSchema>;
export type AiTutorInput = z.infer<typeof aiTutorSchema>;
export type StudyAgentInput = z.infer<typeof studyAgentSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type FeatureFlagsInput = z.infer<typeof featureFlagsSchema>;
