#!/usr/bin/env bun
/**
 * normalize-distractors.ts
 *
 * Fixes the psychometric flaw where the correct answer is almost always the
 * longest option. Uses Claude to expand distractors (wrong answers) so the
 * correct answer is no longer conspicuously longest.
 *
 * Run:      bun scripts/normalize-distractors.ts
 * Dry run:  bun scripts/normalize-distractors.ts --dry-run
 * Limited:  bun scripts/normalize-distractors.ts --limit 25
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// ─── Load .env.local ────────────────────────────────────────────────────────────

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// ─── Configuration ──────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = process.argv.includes("--limit")
  ? parseInt(process.argv[process.argv.indexOf("--limit") + 1])
  : Infinity;
const BATCH_SIZE = 25;
const RETRY_LIMIT = 3;
const DELAY_BETWEEN_BATCHES_MS = 1500;

// ─── Clients ────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ─── System Prompt ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `[SYSTEM]
You are an expert in Educational Assessment Design and Psychometrics, specializing in multiple-choice question construction and distractor engineering for professional licensure examinations. You have deep knowledge of Philippine architecture, building codes (PD 1096, RA 9514, BP 344, NSCP), and architectural theory — sufficient to craft highly plausible but factually incorrect distractors.

[OBJECTIVE]
You are processing a question bank where a detectable pattern exists: the correct answer is almost always the longest option. This is a psychometric flaw that allows test-wise candidates to guess correctly without content knowledge. Your job is to eliminate this pattern by expanding distractors — never by touching the correct answer.

[ABSOLUTE CONSTRAINTS — READ BEFORE ANYTHING ELSE]
1. The correct answer (keyed option) must be reproduced character-for-character. Zero edits. Zero additions. Zero omissions.
2. Expanded distractors must be plausible — a student who has not mastered the topic should find them credible. They must not be obviously absurd, internally contradictory, or structurally alien to the question's domain.
3. You must not introduce new facts into the correct answer, even true ones.
4. You must not shorten any option.
5. If a question already has balanced option lengths (no single option is >=20% longer than the average), leave it untouched and mark it "length_normalized": false.

[INPUT FORMAT]
You will receive a JSON array of question objects. Each object follows this schema:
{
  "id": string,
  "question": string,
  "options": {
    "a": string,
    "b": string,
    "c": string,
    "d": string
  },
  "answer": "a" | "b" | "c" | "d",
  "explanation": string  // read-only, do not modify
}

[TASK PIPELINE — EXECUTE STRICTLY IN ORDER]

STEP 1 — MEASURE
For each question, compute the character count (including spaces) of every option.
Identify the correct answer key from the "answer" field.
Determine if the correct answer is the longest option.
Flag the question for processing if: correct_answer_char_count > (average_of_distractor_char_counts * 1.15)

STEP 2 — PLAN EXPANSION
For each flagged question, determine the target length:
  target_length = correct_answer_char_count + random_offset(5, 25)
  (The random offset prevents all distractors from being exactly the same length as the correct answer, which would itself be a detectable pattern.)
Identify which specific distractors need expansion and by how many characters.

STEP 3 — EXPAND DISTRACTORS
Expand short distractors using one or more of these techniques, chosen based on what reads most naturally for the specific option:

  TECHNIQUE A — Specificity Addition
  Add a plausible but incorrect specific value, measurement, code section reference, or condition.
  Example: "The minimum clear width shall be 900mm" -> "The minimum clear width shall be 900mm, measured from the finished floor to a height of 2.10m under any obstruction"

  TECHNIQUE B — Qualifying Clause
  Add a plausible but incorrect conditional or exception clause.
  Example: "Firewall height must match the adjacent structure" -> "Firewall height must match the adjacent structure, except when the lot area exceeds 200 sqm, in which case a 300mm clearance is required"

  TECHNIQUE C — Rationale Appending
  Add a plausible but incorrect reason or purpose statement.
  Example: "The setback shall be 3.00m" -> "The setback shall be 3.00m to comply with the minimum light and ventilation requirements for habitable spaces under Rule VII"

  TECHNIQUE D — Procedural Extension
  Add a plausible but incorrect procedural step or requirement.
  Example: "Submit a barangay clearance" -> "Submit a barangay clearance along with a certified true copy of the tax declaration, both notarized within 30 days of application"

STEP 4 — VERIFY
Before writing output, run this checklist silently for each modified question:
  [ ] Correct answer is byte-for-byte identical to the original input
  [ ] All distractors are >= correct_answer_char_count in length
  [ ] No distractor is so long it becomes obviously different in texture from the others (cap expansion at correct_answer_char_count + 60 characters unless unavoidable)
  [ ] No distractor accidentally states a true fact that makes it a second correct answer
  [ ] The question stem's subject-verb agreement and pronoun references still work with expanded options
  [ ] Expansions use domain-appropriate vocabulary consistent with the question's topic

STEP 5 — OUTPUT
Emit the full JSON array. Every question object must be present in the output, whether modified or not.

[OUTPUT SCHEMA]
Return a strict JSON array. Each object must match the original schema exactly, plus two new keys:

{
  "id": string,
  "question": string,
  "options": {
    "a": string,
    "b": string,
    "c": string,
    "d": string
  },
  "answer": string,
  "explanation": string,
  "length_normalized": boolean,
  "normalization_log": {
    "correct_key": string,
    "original_lengths": { "a": int, "b": int, "c": int, "d": int },
    "final_lengths": { "a": int, "b": int, "c": int, "d": int },
    "technique_used": { "a": string | null, "b": string | null, "c": string | null, "d": string | null }
  }
}

[CRITICAL FAILURE CONDITIONS — HALT AND REPORT IF ANY ARE TRUE]
- Input JSON is malformed or unparseable -> Report the specific parse error and line number, then halt.
- A question's "answer" key does not match any key in "options" -> Report the question ID and halt.
- After expansion, you cannot make a distractor longer than the correct answer without making it obviously absurd -> Flag that specific distractor with "technique_used": "COULD_NOT_NORMALIZE" and explain why in a separate "normalization_warnings" array appended to the root output object.

[NEGATIVE CONSTRAINTS]
- DO NOT output any text before the opening \`[\` of the JSON array, except the normalization_warnings object if triggered.
- DO NOT truncate the output. The full question bank must be returned.
- DO NOT re-order questions.
- DO NOT invent new answer keys or change the answer field.
- DO NOT output markdown code fences around the JSON.`;

// ─── Types ──────────────────────────────────────────────────────────────────────

interface DbOption {
  id: string;
  text: string;
}

interface DbQuestion {
  question_id: string;
  text: string;
  options: DbOption[];
  correct_option_id: string;
  explanation: string | null;
}

interface PromptQuestion {
  id: string;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  answer: "a" | "b" | "c" | "d";
  explanation: string;
}

interface NormalizedQuestion extends PromptQuestion {
  length_normalized: boolean;
  normalization_log?: {
    correct_key: string;
    original_lengths: { a: number; b: number; c: number; d: number };
    final_lengths: { a: number; b: number; c: number; d: number };
    technique_used: {
      a: string | null;
      b: string | null;
      c: string | null;
      d: string | null;
    };
  };
}

// ─── Transform Functions ────────────────────────────────────────────────────────

const POSITION_KEYS = ["a", "b", "c", "d"] as const;

/**
 * Convert DB format → prompt format.
 * Maps options by array position (index 0→a, 1→b, 2→c, 3→d).
 * Finds the correct answer by matching correct_option_id against option IDs.
 */
function dbToPrompt(q: DbQuestion): PromptQuestion | null {
  if (!q.options || q.options.length < 4) return null;

  const correctIndex = q.options.findIndex(
    (opt) => opt.id === q.correct_option_id
  );
  if (correctIndex === -1 || correctIndex > 3) return null;

  return {
    id: q.question_id,
    question: q.text,
    options: {
      a: q.options[0].text,
      b: q.options[1].text,
      c: q.options[2].text,
      d: q.options[3].text,
    },
    answer: POSITION_KEYS[correctIndex],
    explanation: q.explanation ?? "",
  };
}

/**
 * Convert prompt format → DB JSONB array.
 * Maps a/b/c/d back to the original option IDs from the DB row.
 */
function promptToDbOptions(
  result: NormalizedQuestion,
  original: DbQuestion
): DbOption[] {
  return [
    { id: original.options[0].id, text: result.options.a },
    { id: original.options[1].id, text: result.options.b },
    { id: original.options[2].id, text: result.options.c },
    { id: original.options[3].id, text: result.options.d },
  ];
}

// ─── Validation ─────────────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateBatchResponse(
  originals: DbQuestion[],
  normalized: NormalizedQuestion[]
): ValidationResult {
  const errors: string[] = [];
  const originalMap = new Map(originals.map((q) => [q.question_id, q]));

  for (const norm of normalized) {
    const orig = originalMap.get(norm.id);
    if (!orig) {
      errors.push(`[${norm.id}] Returned in response but not in input batch.`);
      continue;
    }

    // Find original correct answer text
    const correctIndex = orig.options.findIndex(
      (opt) => opt.id === orig.correct_option_id
    );
    if (correctIndex === -1 || correctIndex > 3) {
      errors.push(
        `[${norm.id}] Could not find correct option in original data.`
      );
      continue;
    }

    const origCorrectText = orig.options[correctIndex].text;
    const normCorrectText = norm.options[norm.answer];

    // THE CRITICAL CHECK — correct answer must be character-for-character identical
    if (origCorrectText !== normCorrectText) {
      errors.push(
        `[${norm.id}] CORRECT ANSWER MUTATED.\n` +
          `  Original (${norm.answer}): "${origCorrectText.slice(0, 80)}"\n` +
          `  Returned (${norm.answer}): "${normCorrectText.slice(0, 80)}"`
      );
    }

    // Answer key must be unchanged
    const expectedKey = POSITION_KEYS[correctIndex];
    if (norm.answer !== expectedKey) {
      errors.push(
        `[${norm.id}] Answer key changed from "${expectedKey}" to "${norm.answer}".`
      );
    }

    // No option should be shorter after processing
    for (let i = 0; i < 4; i++) {
      const key = POSITION_KEYS[i];
      const origLen = orig.options[i].text.length;
      const normLen = norm.options[key].length;
      if (normLen < origLen) {
        errors.push(
          `[${norm.id}] Option ${key} was shortened: ${origLen} → ${normLen} chars.`
        );
      }
    }
  }

  // Check for missing questions
  for (const orig of originals) {
    if (!normalized.find((n) => n.id === orig.question_id)) {
      errors.push(
        `[${orig.question_id}] Missing from response — question was dropped.`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── DB Writes ──────────────────────────────────────────────────────────────────

async function writeNormalizedQuestion(
  norm: NormalizedQuestion,
  original: DbQuestion
): Promise<void> {
  const status = norm.length_normalized ? "normalized" : "skipped";
  const newOptions = norm.length_normalized
    ? promptToDbOptions(norm, original)
    : undefined;

  const updatePayload: Record<string, unknown> = {
    normalization_status: status,
    normalization_log: norm.length_normalized
      ? norm.normalization_log ?? null
      : null,
    normalization_run_at: new Date().toISOString(),
  };

  if (newOptions) {
    updatePayload.options = newOptions;
  }

  const { error } = await supabase
    .from("questions")
    .update(updatePayload)
    .eq("question_id", norm.id);

  if (error)
    throw new Error(`Failed to update ${norm.id}: ${error.message}`);
}

async function markBatchFailed(
  ids: string[],
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .update({
      normalization_status: "failed",
      normalization_log: { error: reason },
      normalization_run_at: new Date().toISOString(),
    })
    .in("question_id", ids);

  if (error) console.error(`  Failed to mark batch as failed: ${error.message}`);
}

// ─── Batch Processing ───────────────────────────────────────────────────────────

async function fetchBatch(): Promise<DbQuestion[]> {
  const { data, error } = await supabase.rpc("fetch_normalization_batch", {
    p_batch_size: BATCH_SIZE,
  });
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return (data ?? []) as DbQuestion[];
}

async function callLLM(
  questions: PromptQuestion[]
): Promise<NormalizedQuestion[]> {
  const payload = JSON.stringify(questions, null, 2);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 16000,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: payload },
    ],
  });

  const rawText = response.choices[0]?.message?.content ?? "";

  let parsed: NormalizedQuestion[];
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      `JSON parse failed. Raw response:\n${rawText.slice(0, 500)}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Response is not an array. Got: ${typeof parsed}`);
  }

  return parsed;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n  SlateCamp Distractor Normalizer`);
  console.log(`  Mode: ${DRY_RUN ? "DRY RUN (no API calls, no writes)" : "LIVE"}`);
  console.log(
    `  Batch size: ${BATCH_SIZE} | Limit: ${LIMIT === Infinity ? "none" : LIMIT}\n`
  );

  let totalProcessed = 0;
  let totalNormalized = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let batchNum = 0;

  while (totalProcessed < LIMIT) {
    const batch = await fetchBatch();

    if (batch.length === 0) {
      console.log("\n  All flagged questions processed.");
      break;
    }

    batchNum++;
    console.log(
      `\n  Batch ${batchNum} — ${batch.length} questions`
    );

    // Transform to prompt format, skip questions that can't be transformed
    const promptBatch: PromptQuestion[] = [];
    const skippedTransform: string[] = [];

    for (const q of batch) {
      const prompt = dbToPrompt(q);
      if (prompt) {
        promptBatch.push(prompt);
      } else {
        skippedTransform.push(q.question_id);
      }
    }

    if (skippedTransform.length > 0) {
      console.log(
        `  Skipped ${skippedTransform.length} questions (incompatible format)`
      );
      if (!DRY_RUN) {
        await markBatchFailed(
          skippedTransform,
          "Could not transform to prompt format (missing options or correct_option_id mismatch)"
        );
      }
      totalFailed += skippedTransform.length;
    }

    if (promptBatch.length === 0) {
      totalProcessed += batch.length;
      continue;
    }

    // Dry-run: log diagnostics without calling Claude
    if (DRY_RUN) {
      for (const pq of promptBatch) {
        const correctLen = pq.options[pq.answer].length;
        const distractorKeys = POSITION_KEYS.filter((k) => k !== pq.answer);
        const avgDistractorLen =
          distractorKeys.reduce((sum, k) => sum + pq.options[k].length, 0) / 3;
        const ratio = correctLen / avgDistractorLen;
        console.log(
          `  [${pq.id.slice(0, 8)}] correct=${correctLen} avg_distractor=${avgDistractorLen.toFixed(0)} ratio=${ratio.toFixed(2)} ${ratio > 1.15 ? "FLAGGED" : "ok"}`
        );
      }
      totalProcessed += batch.length;
      totalSkipped += promptBatch.length;
      continue;
    }

    // Live run: call Claude and validate
    let attempt = 0;
    let success = false;
    const batchOriginalMap = new Map(batch.map((q) => [q.question_id, q]));

    while (attempt < RETRY_LIMIT && !success) {
      try {
        const normalized = await callLLM(promptBatch);
        const validation = validateBatchResponse(
          batch.filter((q) => !skippedTransform.includes(q.question_id)),
          normalized
        );

        if (!validation.valid) {
          console.error(
            `  Validation failed:\n  ${validation.errors.join("\n  ")}`
          );
          const failedIds = batch
            .filter((q) => !skippedTransform.includes(q.question_id))
            .map((q) => q.question_id);
          await markBatchFailed(failedIds, validation.errors.join(" | "));
          totalFailed += failedIds.length;
          success = true; // don't retry validation failures
          continue;
        }

        // Write each question
        let batchNormalized = 0;
        let batchSkipped = 0;

        for (const norm of normalized) {
          const orig = batchOriginalMap.get(norm.id);
          if (!orig) continue;

          await writeNormalizedQuestion(norm, orig);

          if (norm.length_normalized) {
            batchNormalized++;
          } else {
            batchSkipped++;
          }
        }

        totalNormalized += batchNormalized;
        totalSkipped += batchSkipped;
        success = true;
        console.log(
          `  ${batchNormalized} normalized, ${batchSkipped} already balanced`
        );
      } catch (err) {
        attempt++;
        console.warn(`  Attempt ${attempt} failed: ${err}`);
        if (attempt < RETRY_LIMIT) {
          await sleep(3000 * attempt);
        } else {
          const failedIds = batch
            .filter((q) => !skippedTransform.includes(q.question_id))
            .map((q) => q.question_id);
          await markBatchFailed(failedIds, String(err));
          totalFailed += failedIds.length;
        }
      }
    }

    totalProcessed += batch.length;
    await sleep(DELAY_BETWEEN_BATCHES_MS);
  }

  console.log(`\n  Run complete`);
  console.log(`  Normalized: ${totalNormalized}`);
  console.log(`  Skipped (balanced): ${totalSkipped}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Total processed: ${totalProcessed}`);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
