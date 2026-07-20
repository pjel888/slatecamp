# Plan 010 — Add zod input validation + size cap to AI route handlers

> Audit: 2026-07-20, commit `064e3a43a`. Category: security. Severity: MEDIUM. Effort: M. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: 5 AI route handlers (`tutor`, `study-agent`, `generate-questions`, `embed`, `socratic`) destructured `req.json()` without validation or size cap.

## Why this mattered

- **No size cap** — server actions have a 4 MB body limit but route handlers don't. A free-tier user could POST a multi-MB body and exhaust model-provider quota.
- **No type validation** — `tutor/route.ts` JSON.stringified client-supplied `context` into the prompt (prompt-injection sink).
- **No audit trail** — model output wasn't tied back to the user.

## What was changed

Created `src/lib/ai/route-validation.ts` exporting `parseAiBody(req, schema)`:
- Pre-checks `Content-Length` against a 100 KB cap → 413 if over.
- Reads body as text, enforces the cap again post-read.
- Parses JSON, validates against the provided zod schema → 400 on invalid.
- Returns `{ok: true, data}` or `{ok: false, response}` — callers do `if (parsed.ok === false) return parsed.response` (the `=== false` form is required because the tsconfig has `strict: false` and `!parsed.ok` doesn't narrow cleanly).

Per-route zod schemas added:
- `embed`: `{ text: string min 1 max 8000 }`.
- `generate-questions`: `{ chunkContent: max 20_000, profession, examTarget, difficulty?, count: int 1-20 default 5 }`.
- `study-agent`: `{ action: enum, content: max 8000 }`.
- `tutor`: `{ message: max 4000, context?: unknown }` (context is stringified into prompt — capped but shape-flexible).
- `socratic`: `{ questionText, selectedAnswer, correctAnswer, topicName?, topicId?, conversationHistory: array max MAX_TURNS+2 }` — all bounded.

Each route's `req.json()` is now preceded by `parseAiBody(req, Schema)`. The old `as SocraticRequest` cast and inline `if (!action || typeof content !== 'string')` ad-hoc checks were removed.

Added `src/lib/ai/route-validation.test.ts` — 7 tests covering: valid body, malformed JSON, schema mismatch (length + range), Content-Length cap, actual body-size cap, non-object top-level body.

## Verification

- `bun test src/lib/ai/route-validation.test.ts` — 7 pass / 0 fail.
- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.

## Maintenance note

Every `req.json()` in a route handler should be parsed by a zod schema before any field is used. New AI routes follow the same pattern; a shared `parseAiBody` reduces boilerplate.
