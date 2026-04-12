import { z } from 'zod'

// CSV column schema (denormalized columns)
export const QuestionCSVSchema = z.object({
  taxonomy_node_id: z.string().uuid({ message: 'Invalid UUID' }),
  question_text: z.string().min(10, 'Question must be at least 10 characters'),
  option_a: z.string().min(1, 'Option A is required'),
  option_b: z.string().min(1, 'Option B is required'),
  option_c: z.string().min(1, 'Option C is required'),
  option_d: z.string().min(1, 'Option D is required'),
  option_e: z.string().optional(),
  correct_answer: z.enum(['a', 'b', 'c', 'd', 'e'], {
    message: 'Correct answer must be a, b, c, d, or e'
  }),
  rationale: z.string().optional(),
  difficulty: z.number().min(1).max(5, 'Difficulty must be between 1 and 5'),
})

// JSON schema (nested options)
export const QuestionJSONSchema = z.object({
  taxonomy_node_id: z.string().uuid({ message: 'Invalid UUID' }),
  question_text: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(z.string()).min(2).max(5),
  correct_answer: z.union([
    z.string(),
    z.number()
  ]).refine(
    val => {
      if (typeof val === 'string') return ['a', 'b', 'c', 'd', 'e'].includes(val.toLowerCase())
      if (typeof val === 'number') return val >= 0 && val < 5
      return false
    },
    { message: 'Correct answer must be a-e (string) or 0-4 (index)' }
  ),
  rationale: z.string().optional(),
  difficulty: z.number().min(1).max(5, 'Difficulty must be between 1 and 5'),
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
    difficulty: csv.difficulty,
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
    difficulty: json.difficulty,
  }
}
