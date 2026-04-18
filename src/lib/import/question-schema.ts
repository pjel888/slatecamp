import { z } from 'zod'

const IMPORT_DIFFICULTY_SCHEMA = z
  .number()
  .finite('Difficulty must be a valid number')
  .refine((value) => (value >= 0 && value <= 1) || (value >= 1 && value <= 5), {
    message: 'Difficulty must be between 0 and 1, or between 1 and 5',
  })

// CSV column schema (denormalized columns)
export const QuestionCSVSchema = z.object({
  taxonomy_node_id: z.string().uuid({ message: 'Invalid UUID' }),
  question_text: z.string().min(10, 'Question must be at least 10 characters'),
  option_a: z.string().min(1, 'Option A is required'),
  option_b: z.string().min(1, 'Option B is required'),
  option_c: z.string().min(1, 'Option C is required'),
  option_d: z.string().min(1, 'Option D is required'),
  option_e: z.string().optional(),
  correct_answer: z.enum(['a', 'b', 'c', 'd'], {
    message: 'Correct answer must be a, b, c, or d'
  }),
  rationale: z.string().optional(),
  difficulty: IMPORT_DIFFICULTY_SCHEMA,
}).superRefine((data, ctx) => {
  if (data.option_e && data.option_e.trim().length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['option_e'],
      message: 'Standard question import supports exactly 4 options (A-D)',
    })
  }
})

// JSON schema (nested options)
export const QuestionJSONSchema = z.object({
  taxonomy_node_id: z.string().uuid({ message: 'Invalid UUID' }),
  question_text: z.string().min(10, 'Question must be at least 10 characters'),
  options: z
    .array(z.string().min(1, 'Option text is required'))
    .length(4, 'Standard question import supports exactly 4 options (A-D)'),
  correct_answer: z.union([
    z.string(),
    z.number()
  ]).refine(
    val => {
      if (typeof val === 'string') return ['a', 'b', 'c', 'd'].includes(val.toLowerCase())
      if (typeof val === 'number') return val >= 0 && val < 4
      return false
    },
    { message: 'Correct answer must be a-d (string) or 0-3 (index)' }
  ),
  rationale: z.string().optional(),
  difficulty: IMPORT_DIFFICULTY_SCHEMA,
})

// Bulk import wrapper
export const BulkImportSchema = z.object({
  questions: z.array(QuestionJSONSchema),
})

export type QuestionCSV = z.infer<typeof QuestionCSVSchema>
export type QuestionJSON = z.infer<typeof QuestionJSONSchema>
export type BulkImport = z.infer<typeof BulkImportSchema>

// Validate a single question (convert CSV format to internal format)
export function validateCSVQuestion(data: unknown): QuestionCSV {
  return QuestionCSVSchema.parse(data)
}

// Validate a single question (JSON format to internal format)
export function validateJSONQuestion(data: unknown): QuestionJSON {
  return QuestionJSONSchema.parse(data)
}

export function normalizeImportDifficulty(difficulty: number) {
  if (difficulty <= 1) return difficulty
  return (difficulty - 1) / 4
}

// Convert CSV question to database format
export function csvToDbFormat(csv: QuestionCSV) {
  const optionValues = [csv.option_a, csv.option_b, csv.option_c, csv.option_d]
  
  return {
    topic_id: csv.taxonomy_node_id,
    text: csv.question_text,
    options: optionValues.map((text, index) => ({
      id: ['A', 'B', 'C', 'D'][index],
      text,
    })),
    correct_option_id: csv.correct_answer.toUpperCase(),
    rationale: csv.rationale || null,
    difficulty: normalizeImportDifficulty(csv.difficulty),
  }
}

// Convert JSON question to database format
export function jsonToDbFormat(json: QuestionJSON) {
  let correctLetter: string

  if (typeof json.correct_answer === 'string') {
    correctLetter = json.correct_answer.toUpperCase()
  } else {
    correctLetter = ['A', 'B', 'C', 'D'][json.correct_answer] || 'A'
  }
  
  return {
    topic_id: json.taxonomy_node_id,
    text: json.question_text,
    options: json.options.slice(0, 4).map((text, index) => ({
      id: ['A', 'B', 'C', 'D'][index],
      text,
    })),
    correct_option_id: correctLetter,
    rationale: json.rationale || null,
    difficulty: normalizeImportDifficulty(json.difficulty),
  }
}
