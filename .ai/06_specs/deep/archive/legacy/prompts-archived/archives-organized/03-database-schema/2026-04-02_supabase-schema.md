## Distractor Normalization Pipeline — Implementation Plan

### The Core Strategy

Three principles govern this:

1. **Pre-filter in SQL, not in Claude** — Claude only sees questions that actually need work. This cuts API calls by ~60–70%.
2. **Never write back without validation** — Every API response is checked for correct-answer mutation before a single DB row is touched.
3. **Resumable by design** — A crash at question 4,300 should never mean starting over.

---

## Phase 0 — Pre-Flight SQL Audit

Before writing a single line of application code, run this to understand your actual scope. First, I need to know how your questions table stores options — whether as separate columns (`option_a`, `option_b`) or a `JSONB` field (`options`). Assuming the common separate-column pattern:

```sql
-- PRE-FLIGHT AUDIT: How many questions actually need normalization?
-- Run this in Supabase SQL Editor before anything else.

WITH option_lengths AS (
  SELECT
    id,
    answer,
    LENGTH(option_a) AS len_a,
    LENGTH(option_b) AS len_b,
    LENGTH(option_c) AS len_c,
    LENGTH(option_d) AS len_d,
    CASE answer
      WHEN 'a' THEN LENGTH(option_a)
      WHEN 'b' THEN LENGTH(option_b)
      WHEN 'c' THEN LENGTH(option_c)
      WHEN 'd' THEN LENGTH(option_d)
    END AS correct_len,
    CASE answer
      WHEN 'a' THEN (LENGTH(option_b) + LENGTH(option_c) + LENGTH(option_d)) / 3.0
      WHEN 'b' THEN (LENGTH(option_a) + LENGTH(option_c) + LENGTH(option_d)) / 3.0
      WHEN 'c' THEN (LENGTH(option_a) + LENGTH(option_b) + LENGTH(option_d)) / 3.0
      WHEN 'd' THEN (LENGTH(option_a) + LENGTH(option_b) + LENGTH(option_c)) / 3.0
    END AS avg_distractor_len
  FROM questions
  WHERE archived_at IS NULL  -- respect soft delete
)
SELECT
  COUNT(*) FILTER (WHERE correct_len > avg_distractor_len * 1.15) AS needs_normalization,
  COUNT(*) FILTER (WHERE correct_len <= avg_distractor_len * 1.15) AS already_balanced,
  COUNT(*) AS total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE correct_len > avg_distractor_len * 1.15) / COUNT(*), 1
  ) AS pct_flagged
FROM option_lengths;
```

This gives you: exact count of questions to process, percentage of the bank affected, and a cost estimate basis. **Do not proceed to Phase 1 until you have this number.**

---

## Phase 1 — Schema Migration

Add tracking columns to the `questions` table so the job is resumable and auditable:

```sql
-- Migration: 20260402_1000_add_normalization_tracking.sql

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS normalization_status text
    CHECK (normalization_status IN ('pending', 'processing', 'complete', 'skipped', 'failed'))
    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS normalization_log jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS normalization_run_at timestamptz DEFAULT NULL;

-- Index for the job runner to efficiently fetch unprocessed batches
CREATE INDEX idx_questions_normalization_status
  ON questions(normalization_status)
  WHERE normalization_status IS NULL OR normalization_status = 'pending';

COMMENT ON COLUMN questions.normalization_status IS
  'NULL = not yet evaluated. skipped = already balanced. complete = distractors expanded. failed = Claude error or validation failure.';

COMMENT ON COLUMN questions.normalization_log IS
  'Stores the normalization_log object from the Claude response for audit.';
```

The `NULL` state means "not yet touched" — this lets you restart the job without re-processing completed questions.

---

## Phase 2 — The Normalization Script

This lives at `scripts/normalize-distractors.ts`. It is **not** a Next.js route — it's a standalone Node.js script run from the terminal with a service role key. It never touches the web server.

### Script Architecture

```
scripts/
  normalize-distractors.ts     ← main entrypoint
  lib/
    preflight.ts               ← SQL pre-filter, batch fetching
    claude-caller.ts           ← Anthropic API call with the system prompt
    validator.ts               ← character-exact correct-answer check
    db-writer.ts               ← upsert back to Supabase
    progress.ts                ← console progress tracking
```

### `preflight.ts` — Fetch Only Flagged Questions

```typescript
// scripts/lib/preflight.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role — runs outside Next.js
)

export async function fetchFlaggedBatch(
  batchSize: number,
  offset: number
): Promise<QuestionRow[]> {
  const { data, error } = await supabase.rpc('fetch_normalization_batch', {
    p_batch_size: batchSize,
    p_offset: offset
  })
  if (error) throw new Error(`[preflight] Fetch failed: ${error.message}`)
  return data
}
```

Create the corresponding Postgres function (keeps the filtering logic in SQL where it belongs):

```sql
-- Add to a migration or run once
CREATE OR REPLACE FUNCTION fetch_normalization_batch(p_batch_size int, p_offset int)
RETURNS TABLE (
  id uuid, question text, option_a text, option_b text,
  option_c text, option_d text, answer text, explanation text
)
LANGUAGE sql STABLE AS $$
  SELECT id, question, option_a, option_b, option_c, option_d, answer, explanation
  FROM questions
  WHERE
    archived_at IS NULL
    AND (normalization_status IS NULL)  -- only untouched rows
    AND (
      CASE answer
        WHEN 'a' THEN LENGTH(option_a) > ((LENGTH(option_b)+LENGTH(option_c)+LENGTH(option_d))/3.0 * 1.15)
        WHEN 'b' THEN LENGTH(option_b) > ((LENGTH(option_a)+LENGTH(option_c)+LENGTH(option_d))/3.0 * 1.15)
        WHEN 'c' THEN LENGTH(option_c) > ((LENGTH(option_a)+LENGTH(option_b)+LENGTH(option_d))/3.0 * 1.15)
        WHEN 'd' THEN LENGTH(option_d) > ((LENGTH(option_a)+LENGTH(option_b)+LENGTH(option_c))/3.0 * 1.15)
      END
    )
  ORDER BY id  -- deterministic order for resumability
  LIMIT p_batch_size OFFSET p_offset;
$$;
```

### `claude-caller.ts` — The API Call

```typescript
// scripts/lib/claude-caller.ts

const SYSTEM_PROMPT = `... (the full normalization system prompt verbatim) ...`

// Shape questions into the JSON format the prompt expects
function toPromptFormat(rows: QuestionRow[]): PromptQuestion[] {
  return rows.map(r => ({
    id: r.id,
    question: r.question,
    options: { a: r.option_a, b: r.option_b, c: r.option_c, d: r.option_d },
    answer: r.answer,
    explanation: r.explanation
  }))
}

export async function callNormalizationApi(
  rows: QuestionRow[]
): Promise<NormalizedQuestion[]> {
  const payload = JSON.stringify(toPromptFormat(rows), null, 2)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: payload }]
    })
  })

  if (!response.ok) {
    throw new Error(`[claude] HTTP ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  const rawText = data.content.find((b: any) => b.type === 'text')?.text ?? ''

  let parsed: NormalizedQuestion[]
  try {
    parsed = JSON.parse(rawText)
  } catch (e) {
    throw new Error(`[claude] JSON parse failed. Raw response:\n${rawText.slice(0, 500)}`)
  }

  return parsed
}
```

### `validator.ts` — The Safety Gate

This is the most important module. **No DB write happens without passing this.**

```typescript
// scripts/lib/validator.ts

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateBatchResponse(
  originals: QuestionRow[],
  normalized: NormalizedQuestion[]
): ValidationResult {
  const errors: string[] = []
  const originalMap = new Map(originals.map(q => [q.id, q]))

  for (const norm of normalized) {
    const orig = originalMap.get(norm.id)
    if (!orig) {
      errors.push(`[${norm.id}] Returned in response but not in input batch.`)
      continue
    }

    // THE CRITICAL CHECK — correct answer must be character-for-character identical
    const correctKey = norm.answer as 'a' | 'b' | 'c' | 'd'
    const origCorrect = orig[`option_${correctKey}` as keyof QuestionRow] as string
    const normCorrect = norm.options[correctKey]

    if (origCorrect !== normCorrect) {
      errors.push(
        `[${norm.id}] CORRECT ANSWER MUTATED.\n` +
        `  Original (${correctKey}): "${origCorrect}"\n` +
        `  Returned (${correctKey}): "${normCorrect}"`
      )
    }

    // answer key must be unchanged
    if (orig.answer !== norm.answer) {
      errors.push(`[${norm.id}] Answer key changed from "${orig.answer}" to "${norm.answer}".`)
    }

    // No option should be shorter after processing
    const keys = ['a', 'b', 'c', 'd'] as const
    for (const k of keys) {
      const origLen = orig[`option_${k}` as keyof QuestionRow] as string
      const normLen = norm.options[k]
      if (normLen.length < origLen.length) {
        errors.push(`[${norm.id}] Option ${k} was shortened: ${origLen.length} → ${normLen.length} chars.`)
      }
    }
  }

  // Check for missing questions
  for (const orig of originals) {
    if (!normalized.find(n => n.id === orig.id)) {
      errors.push(`[${orig.id}] Missing from response — question was dropped.`)
    }
  }

  return { valid: errors.length === 0, errors }
}
```

### `db-writer.ts` — Conditional Write-Back

```typescript
// scripts/lib/db-writer.ts

export async function writeNormalizedBatch(
  normalized: NormalizedQuestion[]
): Promise<void> {
  for (const q of normalized) {
    const status = q.length_normalized ? 'complete' : 'skipped'

    const { error } = await supabase
      .from('questions')
      .update({
        option_a: q.options.a,
        option_b: q.options.b,
        option_c: q.options.c,
        option_d: q.options.d,
        normalization_status: status,
        normalization_log: q.length_normalized ? q.normalization_log : null,
        normalization_run_at: new Date().toISOString()
      })
      .eq('id', q.id)

    if (error) throw new Error(`[db-writer] Failed to update ${q.id}: ${error.message}`)
  }
}

export async function markBatchFailed(ids: string[], reason: string): Promise<void> {
  await supabase
    .from('questions')
    .update({ normalization_status: 'failed', normalization_log: { reason } })
    .in('id', ids)
}
```

### `normalize-distractors.ts` — Main Orchestrator

```typescript
// scripts/normalize-distractors.ts

const BATCH_SIZE = 25          // 25 questions per Claude call — safe token budget
const CONCURRENCY = 1          // sequential — no rate limit risk
const RETRY_LIMIT = 3
const DELAY_BETWEEN_BATCHES_MS = 1500  // be a good API citizen

async function run() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1])
    : Infinity

  console.log(`\n🏕️  SlateCamp Distractor Normalizer`)
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no writes)' : 'LIVE'}`)
  console.log(`Batch size: ${BATCH_SIZE} | Limit: ${limit === Infinity ? 'none' : limit}\n`)

  let processed = 0
  let succeeded = 0
  let failed = 0
  let skipped = 0
  let offset = 0

  while (processed < limit) {
    const batch = await fetchFlaggedBatch(BATCH_SIZE, 0)  // always offset 0 — completed rows are excluded by SQL filter

    if (batch.length === 0) {
      console.log('\n✅ All flagged questions processed.')
      break
    }

    console.log(`Batch ${Math.floor(processed / BATCH_SIZE) + 1} — ${batch.length} questions`)

    let attempt = 0
    let success = false

    while (attempt < RETRY_LIMIT && !success) {
      try {
        const normalized = await callNormalizationApi(batch)
        const validation = validateBatchResponse(batch, normalized)

        if (!validation.valid) {
          console.error(`  ❌ Validation failed:\n  ${validation.errors.join('\n  ')}`)
          if (!isDryRun) await markBatchFailed(batch.map(q => q.id), validation.errors.join(' | '))
          failed += batch.length
          success = true  // don't retry validation failures — they need human review
          continue
        }

        if (!isDryRun) {
          await writeNormalizedBatch(normalized)
        }

        const completedCount = normalized.filter(q => q.length_normalized).length
        const skippedCount = normalized.filter(q => !q.length_normalized).length
        succeeded += completedCount
        skipped += skippedCount
        success = true
        console.log(`  ✓ ${completedCount} normalized, ${skippedCount} already balanced`)

      } catch (err) {
        attempt++
        console.warn(`  ⚠ Attempt ${attempt} failed: ${err}`)
        if (attempt < RETRY_LIMIT) await sleep(3000 * attempt)
        else {
          if (!isDryRun) await markBatchFailed(batch.map(q => q.id), String(err))
          failed += batch.length
        }
      }
    }

    processed += batch.length
    await sleep(DELAY_BETWEEN_BATCHES_MS)
  }

  console.log(`\n📊 Run complete`)
  console.log(`  Normalized: ${succeeded}`)
  console.log(`  Skipped (balanced): ${skipped}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total processed: ${processed}`)
}

run().catch(err => { console.error('Fatal:', err); process.exit(1) })
```

---

## Phase 3 — Phased Rollout

Never run this on 7,000 questions cold.

**Run 1 — Dry run, 25 questions**
```bash
npx tsx scripts/normalize-distractors.ts --dry-run --limit 25
```
Inspect the logged output. Verify the JSON. Confirm correct answers are untouched.

**Run 2 — Live, 50 questions**
```bash
npx tsx scripts/normalize-distractors.ts --limit 50
```
Query Supabase, manually review 5-10 modified rows. Spot-check the content quality.

**Run 3 — Live, full bank**
```bash
npx tsx scripts/normalize-distractors.ts
```
Let it run. The script is resumable — if it crashes, just run again. Already-completed rows are excluded by the SQL filter on `normalization_status IS NULL`.

---

## Phase 4 — Post-Run Audit Query

```sql
-- After the full run, audit the results
SELECT
  normalization_status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as pct
FROM questions
WHERE archived_at IS NULL
GROUP BY normalization_status
ORDER BY count DESC;

-- Spot-check: Find any remaining imbalanced questions (should be zero)
SELECT id, answer, option_a, option_b, option_c, option_d
FROM questions
WHERE
  archived_at IS NULL
  AND normalization_status = 'complete'
  AND (
    CASE answer
      WHEN 'a' THEN LENGTH(option_a) > ((LENGTH(option_b)+LENGTH(option_c)+LENGTH(option_d))/3.0 * 1.15)
      -- ... etc
    END
  )
LIMIT 20;
```

---

## Cost Estimate

| Variable | Assumption |
|---|---|
| Questions needing normalization | ~35% = ~2,450 |
| Batch size | 25 |
| Batches | ~98 |
| Tokens/batch (in+out) | ~6,000 input + ~9,000 output |
| Sonnet 4 pricing | $3/M in, $15/M out |
| **Estimated total cost** | **~$15–20** |

---

## Rollback Plan

If anything goes wrong after live writes: every modified question has its `normalization_log` with original_lengths stored. The options themselves can be restored from a Supabase point-in-time backup. Before any live run, **take a manual backup snapshot** from the Supabase dashboard.

---

**Start with Phase 0.** Run that audit query and tell me how many questions are flagged — that number determines whether we tweak the batch size or adjust the concurrency.
