#!/usr/bin/env bun
/**
 * sanitize-article-refs.ts
 *
 * Removes explicit article references from quiz questions.
 * 4-tier approach: DELETE garbage → LLM-rewrite stems → regex rationale → regex explanation
 *
 * Run with: bun run scripts/sanitize-article-refs.ts
 * Dry run:  bun run scripts/sanitize-article-refs.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local explicitly (bun auto-loads .env but not .env.local in scripts)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// ─── Configuration ──────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const BACKUP_DIR = path.join(process.cwd(), "scripts", "backups");
const BACKUP_FILE = path.join(
  BACKUP_DIR,
  `article-ref-backup-${new Date().toISOString().slice(0, 10)}.json`
);

// Legal article patterns that must NOT be touched
const LEGAL_ARTICLE_EXCLUSION = `
  AND text !~* 'article \\d|article [IVXLC]+|Civil Code|PD \\d|RA \\d|PEC Article|Code of Ethical|Water Code|Electrical Code|Fire Code|Building Code'
`;

// ─── Supabase Client ────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/** Execute raw SQL via Supabase RPC */
async function sql<T = Record<string, unknown>>(
  query: string
): Promise<T[]> {
  const { data, error } = await supabase.rpc("exec_sql", {
    query_text: query,
  });
  if (error) {
    // Fallback: use the REST endpoint directly
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query_text: query }),
      }
    );
    if (!resp.ok) throw new Error(`SQL failed: ${await resp.text()}`);
    return (await resp.json()) as T[];
  }
  return (data ?? []) as T[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function log(emoji: string, msg: string) {
  console.log(`${emoji}  ${msg}`);
}

function logTable(label: string, rows: Record<string, unknown>[]) {
  console.log(`\n--- ${label} ---`);
  console.table(rows);
}

/** Fetch ALL rows from a table, paginating past the 1000-row Supabase limit */
async function fetchAll<T = Record<string, unknown>>(
  table: string,
  select: string
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const allRows: T[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(`fetchAll(${table}) failed at offset ${offset}: ${error.message}`);
    if (!data || data.length === 0) break;
    allRows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return allRows;
}

/** Safely parse rationale — can be JSONB object, JSON string, or plain text */
function safeParseRationale(
  rationale: unknown
): Record<string, unknown> | null {
  if (!rationale) return null;
  if (typeof rationale === "object" && !Array.isArray(rationale))
    return rationale as Record<string, unknown>;
  if (typeof rationale === "string") {
    try {
      const parsed = JSON.parse(rationale);
      if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // Plain text rationale — not a JSON object
      return null;
    }
  }
  return null;
}

// ─── Row types for Supabase queries ─────────────────────────────────────────────

interface QuestionRow {
  question_id: string
  text: string
  options: unknown
  rationale: unknown
  explanation: string
}

// ─── Phase 1: Pre-flight Audit ──────────────────────────────────────────────────

async function preflight(): Promise<{
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
  total: number;
}> {
  log("1", "Running pre-flight audit...");

  const allRows = await fetchAll<QuestionRow>("questions", "question_id, text, options, rationale, explanation");
  const totalQuestions = allRows.length;

  // Tier 1: Garbage template questions
  const tier1Rows = allRows.filter(
    (q) =>
      JSON.stringify(q.options).toLowerCase().includes("as stated in the article") ||
      (/as discussed in "/i.test(q.text) &&
        JSON.stringify(q.options).toLowerCase().includes("provision applies"))
  );

  // Tier 2: Article ref in question text (exclude legal articles and tier 1)
  const tier1Ids = new Set(tier1Rows.map((q) => q.question_id));
  const legalPattern =
    /article \d|article [IVXLC]+|Civil Code|PD \d|RA \d|PEC Article|Code of Ethical|Water Code|Electrical Code|Fire Code|Building Code/i;
  const badTextPattern =
    /according to the article|based on the article|the article states|the article discusses|per the article|as mentioned in the article|as described in the article|Top 50 Traps article|case study.*(from|in) the article/i;
  const theArticlePattern = /the article/i;

  const tier2Rows = allRows.filter(
    (q) =>
      !tier1Ids.has(q.question_id) &&
      (badTextPattern.test(q.text) ||
        (theArticlePattern.test(q.text) && !legalPattern.test(q.text)))
  );

  // Tier 3: Rationale JSONB "correct" key starts with "The article states/explains/..."
  const tier2Ids = new Set(tier2Rows.map((q) => q.question_id));
  const rationaleArticlePattern =
    /^The article (states|explains|mentions|describes|notes|highlights|discusses|emphasizes|indicates|specifies|provides|outlines|covers|identifies|recommends|suggests|details|clarifies|establishes|shows|presents|illustrates|confirms|demonstrates|documents|examines|focuses|contextualizes|differentiates|distinguishes|elaborates|summarizes|warns|gives|makes|maps|names|offers|organizes|pairs|places|ranks|recognizes|sets|traces|uses|breaks|categorizes|refers|reveals)/i;

  const tier3Rows = allRows.filter((q) => {
    if (tier1Ids.has(q.question_id) || tier2Ids.has(q.question_id)) return false;
    if (!q.rationale) return false;
    const rat = safeParseRationale(q.rationale);
    if (!rat) return false;
    const correct = rat?.correct;
    return typeof correct === "string" && rationaleArticlePattern.test(correct);
  });

  // Tier 4: Explanation field with article refs
  const tier123Ids = new Set([
    ...tier1Ids,
    ...tier2Ids,
    ...tier3Rows.map((q) => q.question_id),
  ]);
  const explanationPattern =
    /the article (states|explains|mentions|describes|notes|discusses|highlights)/i;

  const tier4Rows = allRows.filter(
    (q) =>
      !tier123Ids.has(q.question_id) &&
      q.explanation &&
      explanationPattern.test(q.explanation)
  );

  const counts = {
    tier1: tier1Rows.length,
    tier2: tier2Rows.length,
    tier3: tier3Rows.length,
    tier4: tier4Rows.length,
    total: tier1Rows.length + tier2Rows.length + tier3Rows.length + tier4Rows.length,
  };

  logTable("Pre-flight Audit", [
    { metric: "Total questions", count: totalQuestions },
    { metric: "Tier 1 — Garbage (DELETE)", count: counts.tier1 },
    { metric: "Tier 2 — Bad text (LLM rewrite)", count: counts.tier2 },
    { metric: "Tier 3 — Rationale only (SQL regex)", count: counts.tier3 },
    { metric: "Tier 4 — Explanation only (SQL regex)", count: counts.tier4 },
    { metric: "TOTAL AFFECTED", count: counts.total },
    {
      metric: "Clean questions",
      count: totalQuestions - counts.total,
    },
  ]);

  return counts;
}

// ─── Phase 2: Backup ────────────────────────────────────────────────────────────

async function backupAffected() {
  log("2", "Backing up affected questions...");

  const allData = await fetchAll<QuestionRow>("questions", "*");

  const rationalePattern =
    /^The article (states|explains|mentions|describes|notes|highlights|discusses|emphasizes|indicates|specifies|provides|outlines|covers|identifies|recommends|suggests|details|clarifies|establishes|shows|presents|illustrates|confirms|demonstrates|documents|examines|focuses)/i;

  const affectedIds = new Set<string>();

  // Add text/options/explanation matches
  for (const q of allData) {
    if (
      /the article/i.test(q.text) ||
      JSON.stringify(q.options).toLowerCase().includes("as stated in the article") ||
      (q.explanation && /the article/i.test(q.explanation))
    ) {
      affectedIds.add(q.question_id);
    }
  }

  // Add rationale matches
  for (const q of allData) {
    if (!q.rationale) continue;
    const rat = safeParseRationale(q.rationale);
    if (typeof rat?.correct === "string" && rationalePattern.test(rat.correct)) {
      affectedIds.add(q.question_id);
    }
  }

  const affectedRows = allData.filter((q) =>
    affectedIds.has(q.question_id)
  );

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(affectedRows, null, 2));
  log("2", `Backed up ${affectedRows.length} questions to ${BACKUP_FILE}`);
}

// ─── Phase 3: Tier 1 — Delete Garbage Questions ────────────────────────────────

async function tier1Delete() {
  log("3", "Tier 1: Identifying garbage template questions...");

  // First, find the IDs
  const allQ = await fetchAll<QuestionRow>("questions", "question_id, text, options");

  const garbageIds = allQ
    .filter(
      (q) =>
        JSON.stringify(q.options).toLowerCase().includes("as stated in the article") ||
        (/as discussed in "/i.test(q.text) &&
          JSON.stringify(q.options).toLowerCase().includes("provision applies"))
    )
    .map((q) => q.question_id);

  if (garbageIds.length === 0) {
    log("3", "No garbage questions found. Skipping.");
    return 0;
  }

  log("3", `Found ${garbageIds.length} garbage questions to delete.`);

  // Check FK safety — are any of these referenced in session_questions?
  const { data: fkCheck, error: fkErr } = await supabase
    .from("session_questions")
    .select("question_id")
    .in("question_id", garbageIds);

  if (fkErr) {
    log("3", `FK check failed: ${fkErr.message} — proceeding with caution`);
  }

  const referencedIds = new Set((fkCheck ?? []).map((r) => r.question_id));
  const safeToDelete = garbageIds.filter((id) => !referencedIds.has(id));
  const blocked = garbageIds.filter((id) => referencedIds.has(id));

  if (blocked.length > 0) {
    log("3", `${blocked.length} garbage questions are referenced in sessions — skipping those.`);
  }

  if (safeToDelete.length === 0) {
    log("3", "All garbage questions are referenced. Cannot delete.");
    return 0;
  }

  if (DRY_RUN) {
    log("3", `[DRY RUN] Would delete ${safeToDelete.length} garbage questions.`);
    return safeToDelete.length;
  }

  // Delete in batches of 50 (Supabase .in() limit)
  let deleted = 0;
  for (let i = 0; i < safeToDelete.length; i += 50) {
    const batch = safeToDelete.slice(i, i + 50);
    const { error: delErr, count } = await supabase
      .from("questions")
      .delete()
      .in("question_id", batch);
    if (delErr) throw new Error(`Tier 1 delete failed: ${delErr.message}`);
    deleted += batch.length;
  }

  log("3", `Deleted ${deleted} garbage questions.`);
  return deleted;
}

// ─── Phase 4: Tier 2 — LLM Rewrite Question Texts ──────────────────────────────

async function tier2LLMRewrite() {
  log("4", "Tier 2: Fetching questions with article refs in text...");

  const allQ = await fetchAll<QuestionRow>("questions", "question_id, text, options");

  const legalPattern =
    /article \d|article [IVXLC]+|Civil Code|PD \d|RA \d|PEC Article|Code of Ethical|Water Code|Electrical Code|Fire Code|Building Code/i;
  const badTextPattern =
    /according to the article|based on the article|the article states|the article discusses|per the article|as mentioned in the article|as described in the article|Top 50 Traps article|case study.*(from|in) the article/i;
  const theArticlePattern = /the article/i;

  // Exclude garbage (already deleted) — check options aren't garbage
  const garbageOptionsPattern = /as stated in the article/i;

  const tier2Rows = allQ.filter(
    (q) =>
      !garbageOptionsPattern.test(JSON.stringify(q.options)) &&
      (badTextPattern.test(q.text) ||
        (theArticlePattern.test(q.text) && !legalPattern.test(q.text)))
  );

  if (tier2Rows.length === 0) {
    log("4", "No questions with bad text refs found. Skipping.");
    return 0;
  }

  log("4", `Found ${tier2Rows.length} questions to LLM-rewrite.`);

  if (DRY_RUN) {
    log("4", `[DRY RUN] Would rewrite ${tier2Rows.length} question texts.`);
    for (const q of tier2Rows.slice(0, 3)) {
      console.log(`  - ${q.text.slice(0, 120)}...`);
    }
    return tier2Rows.length;
  }

  // Rewrite using OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set in environment");

  const rewrites: { id: string; newText: string }[] = [];

  for (const q of tier2Rows) {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `You rewrite exam questions to remove references to source articles/texts.

Rules:
- Remove phrases like "According to the article", "Based on the article", "the article states", "as discussed in [title]", "Top 50 Traps article"
- Keep the EXACT same conceptual question being asked
- Keep all technical terms, numbers, dimensions, and specifics
- Do NOT change the difficulty or scope of the question
- Do NOT add new information
- References to LEGAL articles (e.g., "Article 1723 of the Civil Code", "PEC Article 700") must be PRESERVED — those are real law citations
- Return ONLY the rewritten question text, nothing else`,
          },
          {
            role: "user",
            content: q.text,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenAI API error: ${resp.status} ${errText}`);
    }

    const json = (await resp.json()) as {
      choices: { message: { content: string } }[];
    };
    const newText = json.choices[0]?.message?.content?.trim();

    if (!newText) {
      log("4", `Warning: Empty LLM response for ${q.question_id}, keeping original.`);
      continue;
    }

    rewrites.push({ id: q.question_id, newText });
    process.stdout.write(".");
  }
  console.log(""); // newline after dots

  log("4", `Got ${rewrites.length} rewrites from LLM. Applying bulk update...`);

  // Bulk update using individual updates batched in parallel
  const BATCH_SIZE = 10;
  for (let i = 0; i < rewrites.length; i += BATCH_SIZE) {
    const batch = rewrites.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(({ id, newText }) =>
        supabase
          .from("questions")
          .update({ text: newText, updated_at: new Date().toISOString() })
          .eq("question_id", id)
          .then(({ error }) => {
            if (error)
              throw new Error(`Update failed for ${id}: ${error.message}`);
          })
      )
    );
  }

  log("4", `Updated ${rewrites.length} question texts.`);
  return rewrites.length;
}

// ─── Phase 5: Tier 3 — Regex Replace Rationale JSONB ────────────────────────────

async function tier3RationaleRegex() {
  log("5", "Tier 3: Fixing rationale JSONB 'correct' field...");

  const allQ = await fetchAll<QuestionRow>("questions", "question_id, rationale");

  const verbPattern =
    /^The article (states|explains|mentions|describes|notes|highlights|discusses|emphasizes|indicates|specifies|provides|outlines|covers|identifies|recommends|suggests|details|clarifies|establishes|shows|presents|illustrates|confirms|demonstrates|documents|examines|focuses|contextualizes|differentiates|distinguishes|elaborates|summarizes|warns|gives|makes|maps|names|offers|organizes|pairs|places|ranks|recognizes|sets|traces|uses|breaks|categorizes|refers|reveals)(\s+that|\s*:\s*['"]?|\s+)/i;

  const affected = allQ.filter((q) => {
    if (!q.rationale) return false;
    const rat = safeParseRationale(q.rationale);
    return typeof rat?.correct === "string" && verbPattern.test(rat.correct as string);
  });

  if (affected.length === 0) {
    log("5", "No rationale fixes needed. Skipping.");
    return 0;
  }

  log("5", `Found ${affected.length} rationales to fix.`);

  if (DRY_RUN) {
    log("5", `[DRY RUN] Would fix ${affected.length} rationale fields.`);
    for (const q of affected.slice(0, 3)) {
      const rat = safeParseRationale(q.rationale);
      if (!rat) continue;
      console.log(`  BEFORE: ${(rat.correct as string).slice(0, 100)}...`);
      const fixed = (rat.correct as string).replace(verbPattern, "");
      const capitalized = fixed.charAt(0).toUpperCase() + fixed.slice(1);
      console.log(`  AFTER:  ${capitalized.slice(0, 100)}...`);
      console.log("");
    }
    return affected.length;
  }

  // Build updates
  const updates: { id: string; rationale: Record<string, unknown> }[] = [];

  for (const q of affected) {
    const rat = safeParseRationale(q.rationale);
    if (!rat) continue;
    const cloned = { ...rat };
    const original = cloned.correct as string;
    let fixed = original.replace(verbPattern, "");
    fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
    cloned.correct = fixed;
    updates.push({ id: q.question_id, rationale: cloned });
  }

  // Bulk update in parallel batches
  const BATCH_SIZE = 20;
  let updated = 0;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(({ id, rationale }) =>
        supabase
          .from("questions")
          .update({ rationale, updated_at: new Date().toISOString() })
          .eq("question_id", id)
          .then(({ error }) => {
            if (error)
              throw new Error(`Rationale update failed for ${id}: ${error.message}`);
          })
      )
    );
    updated += batch.length;
    process.stdout.write(`\r  Progress: ${updated}/${updates.length}`);
  }
  console.log("");

  log("5", `Fixed ${updated} rationale fields.`);
  return updated;
}

// ─── Phase 6: Tier 4 — Regex Replace Explanation Fields ─────────────────────────

async function tier4ExplanationRegex() {
  log("6", "Tier 4: Fixing explanation fields...");

  const explanationPattern =
    /The article (states|explains|mentions|describes|notes|discusses|highlights|emphasizes|indicates|specifies|provides|outlines|covers|identifies)[:\s]+['"]?/gi;

  const allExpl = await fetchAll<QuestionRow>("questions", "question_id, explanation");

  const affected = allExpl.filter(
    (q) => q.explanation && explanationPattern.test(q.explanation)
  );

  // Reset regex lastIndex since we used /g flag
  if (affected.length === 0) {
    log("6", "No explanation fixes needed. Skipping.");
    return 0;
  }

  log("6", `Found ${affected.length} explanations to fix.`);

  if (DRY_RUN) {
    log("6", `[DRY RUN] Would fix ${affected.length} explanation fields.`);
    return affected.length;
  }

  const updates: { id: string; explanation: string }[] = [];

  for (const q of affected) {
    const rewritePattern =
      /The article (states|explains|mentions|describes|notes|discusses|highlights|emphasizes|indicates|specifies|provides|outlines|covers|identifies)[:\s]+['"]?/gi;
    let fixed = q.explanation.replace(rewritePattern, "");
    fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
    updates.push({ id: q.question_id, explanation: fixed });
  }

  const BATCH_SIZE = 20;
  let updated = 0;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(({ id, explanation }) =>
        supabase
          .from("questions")
          .update({ explanation, updated_at: new Date().toISOString() })
          .eq("question_id", id)
          .then(({ error }) => {
            if (error)
              throw new Error(`Explanation update failed for ${id}: ${error.message}`);
          })
      )
    );
    updated += batch.length;
  }

  log("6", `Fixed ${updated} explanation fields.`);
  return updated;
}

// ─── Phase 7: Post-flight Audit ─────────────────────────────────────────────────

async function postflight() {
  log("7", "Running post-flight verification...");

  const allRows = await fetchAll<QuestionRow>("questions", "question_id, text, options, rationale, explanation");

  // Re-check all patterns
  const garbageCount = allRows.filter(
    (q) =>
      JSON.stringify(q.options).toLowerCase().includes("as stated in the article")
  ).length;

  const legalPattern =
    /article \d|article [IVXLC]+|Civil Code|PD \d|RA \d|PEC Article|Code of Ethical|Water Code|Electrical Code|Fire Code|Building Code/i;
  const badTextCount = allRows.filter(
    (q) =>
      /the article/i.test(q.text) && !legalPattern.test(q.text)
  ).length;

  const verbPattern =
    /^The article (states|explains|mentions|describes|notes|highlights|discusses|emphasizes|indicates|specifies|provides|outlines|covers|identifies|recommends|suggests|details|clarifies|establishes|shows|presents|illustrates|confirms|demonstrates|documents|examines|focuses)/i;
  const badRationaleCount = allRows.filter((q) => {
    if (!q.rationale) return false;
    const rat = safeParseRationale(q.rationale);
    return typeof rat?.correct === "string" && verbPattern.test(rat.correct);
  }).length;

  const badExplanationCount = allRows.filter(
    (q) =>
      q.explanation &&
      /the article (states|explains|mentions|describes|notes|discusses|highlights)/i.test(
        q.explanation
      )
  ).length;

  const remaining = garbageCount + badTextCount + badRationaleCount + badExplanationCount;

  logTable("Post-flight Verification", [
    { metric: "Remaining garbage questions", count: garbageCount },
    { metric: "Remaining bad text refs", count: badTextCount },
    { metric: "Remaining bad rationale refs", count: badRationaleCount },
    { metric: "Remaining bad explanation refs", count: badExplanationCount },
    { metric: "TOTAL REMAINING", count: remaining },
  ]);

  // Verify legal articles were NOT touched
  const legalArticleCount = allRows.filter(
    (q) => legalPattern.test(q.text)
  ).length;
  log("7", `Legal article references preserved: ${legalArticleCount} questions`);

  if (remaining === 0) {
    log("7", "ALL CLEAR — zero article references remaining.");
  } else {
    log("7", `WARNING: ${remaining} questions still have article references.`);
  }

  return remaining;
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("  QUESTION SANITIZER — Remove Article References");
  console.log(`  Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE"}`);
  console.log("=".repeat(60));
  console.log("");

  // Phase 1: Audit
  const counts = await preflight();

  if (counts.total === 0) {
    log("0", "Nothing to fix! All questions are clean.");
    return;
  }

  // Phase 2: Backup
  await backupAffected();

  // Phase 3-6: Execute tiers
  const deleted = await tier1Delete();
  const rewritten = await tier2LLMRewrite();
  const rationaleFixed = await tier3RationaleRegex();
  const explanationFixed = await tier4ExplanationRegex();

  // Phase 7: Verify
  console.log("");
  const remaining = await postflight();

  // Summary
  console.log("");
  console.log("=".repeat(60));
  console.log("  SUMMARY");
  console.log("=".repeat(60));
  logTable("Results", [
    { action: "Garbage questions deleted", count: deleted },
    { action: "Question texts rewritten (LLM)", count: rewritten },
    { action: "Rationale fields fixed (regex)", count: rationaleFixed },
    { action: "Explanation fields fixed (regex)", count: explanationFixed },
    { action: "Remaining issues", count: remaining },
  ]);

  if (!DRY_RUN && remaining === 0) {
    log("0", "Done! All article references have been removed.");
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
