#!/usr/bin/env bun
// scripts/insert-spp-questions.ts
// Reads all SPP question JSON files from SPP Docs/ and inserts them into the Supabase questions table.

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DOCS_DIR = join(import.meta.dir, "..", "SPP Docs");

async function main() {
  const jsonFiles = readdirSync(DOCS_DIR).filter((f) => f.endsWith("_questions.json"));
  console.log(`Found ${jsonFiles.length} question files to insert.\n`);

  let totalInserted = 0;
  let totalFailed = 0;

  for (const file of jsonFiles) {
    const filePath = join(DOCS_DIR, file);
    const questions = JSON.parse(readFileSync(filePath, "utf8"));

    // Map each question to the DB column structure
    const rows = questions.map((q: any) => ({
      topic_id: q.topic_id,
      article_id: q.article_id,
      text: q.text,
      options: q.options,
      correct_option_id: q.correct_option_id,
      rationale: q.rationale,
      difficulty: q.difficulty,
      bloom_level: q.bloom_level,
      code_citation: q.code_citation,
      question_type: q.question_type || "mcq",
      is_assessment: q.is_assessment ?? false,
    }));

    const { data, error } = await supabase.from("questions").insert(rows).select("question_id");

    if (error) {
      console.error(`✗ ${file}: FAILED — ${error.message}`);
      totalFailed += questions.length;
    } else {
      console.log(`✓ ${file}: ${data.length} questions inserted`);
      totalInserted += data.length;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`INSERTION REPORT`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Files processed: ${jsonFiles.length}`);
  console.log(`Questions inserted: ${totalInserted}`);
  console.log(`Questions failed: ${totalFailed}`);
  console.log(`${"=".repeat(60)}`);
}

main().catch(console.error);
