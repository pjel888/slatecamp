<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# import

## Purpose

Question import pipeline: parses CSV and JSON question files, validates against Zod schemas, converts to database format, and bulk-inserts into the `questions` table. Used by admin content management for batch question uploads.

## Key Files

| File | Description |
|------|-------------|
| **question-schema.ts** | Zod schemas for import formats: `QuestionCSVSchema` (denormalized columns: `option_a` through `option_e`, `correct_answer` as letter), `QuestionJSONSchema` (nested `options` array, answer as letter or index). `BulkImportSchema` wrapper. Conversion functions: `csvToDbFormat()`, `jsonToDbFormat()`. |
| **question-importer.ts** | File parsing: `parseCSV(file)` (uses PapaParse), `parseJSON(file)`. Returns `ImportResult` with `validCount`, row-level `errors[]`. Validates each row against the appropriate schema. |
| **import-actions.ts** | Server action: `importQuestionsToDb(questions)` -- converts validated questions to DB format and bulk-inserts via Supabase. All-or-nothing transaction. |

## For AI Agents

### Working In This Directory

1. **Two input formats.** CSV uses flat columns (`option_a`, `option_b`, etc.). JSON uses nested arrays. Both validate via Zod.
2. **Validation before import.** `parseCSV`/`parseJSON` validate every row. Only valid rows pass to `importQuestionsToDb`.
3. **Difficulty range.** 1-5 integer scale. Question text minimum 10 characters.
4. **Taxonomy node ID required.** Every question must have a valid `taxonomy_node_id` (UUID).
5. **CSV parsing.** Uses PapaParse with `header: true`, `skipEmptyLines: true`, `dynamicTyping: true`.

### Common Patterns

**Import flow:**
```typescript
import { parseCSV } from '@/lib/import/question-importer'
import { importQuestionsToDb } from '@/lib/import/import-actions'

const result = await parseCSV(file)
if (result.success && result.validCount > 0) {
  await importQuestionsToDb(validatedQuestions)
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for DB inserts

### External

- `papaparse` -- CSV parsing
- `zod` -- schema validation
