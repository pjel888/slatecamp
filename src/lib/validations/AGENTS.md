<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# validations

## Purpose

Centralized Zod validation schemas for all user-facing inputs: notes, sessions, answers, wiki search, AI tutor messages, checkout, and feature flags. Schemas are consumed by server actions for runtime type checking. Exports both schemas and inferred TypeScript types.

## Key Files

| File | Description |
|------|-------------|
| **index.ts** | All validation schemas and type exports. Key schemas: `createNoteSchema`, `updateNoteSchema`, `deleteNoteSchema`, `sessionIdSchema`, `createSessionSchema`, `submitAnswerSchema`, `wikiSearchSchema`, `aiTutorSchema`, `studyAgentSchema`, `checkoutSchema`, `featureFlagsSchema`, `UUIDSchema`. |

## For AI Agents

### Working In This Directory

1. **Single barrel file.** All schemas live in `index.ts`. Import via `import { schemaName } from '@/lib/validations'`.
2. **UUID helper.** Use `UUIDSchema` (`z.string().uuid()`) for any ID field. Also available as `uuidSchema` (internal).
3. **Session types.** `createSessionSchema` supports types: `subject_quick`, `custom_compiled`, `srs_review`, `ai_adaptive`, `retake`, `topic_drill`, `weak_areas`.
4. **Checkout tiers.** `checkoutSchema` validates `tier` as `"camp" | "insurance" | "institutional"` with URL validation for success/cancel URLs.
5. **Type exports.** Every schema has a corresponding `z.infer<>` type export (e.g., `CreateNoteInput`, `SubmitAnswerInput`).

### Adding a New Schema

1. Define the Zod schema with descriptive error messages.
2. Export the schema as a named constant.
3. Export the inferred type: `export type MyInput = z.infer<typeof mySchema>`.
4. Use in server actions: `const parsed = mySchema.safeParse(input)`.

## Dependencies

### Internal

- None (leaf module, pure schema definitions)

### External

- `zod` -- schema validation library
