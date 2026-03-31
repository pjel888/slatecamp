#!/usr/bin/env bun
/**
 * fix-anomalous-titles.ts
 *
 * Targeted repair of confirmed-corrupted wiki_articles titles.
 *
 * These 5 titles are genuine fragments — single adjective/noun stripped of
 * their topical qualifier during batch upload. Each new title is derived
 * strictly from the article's markdown content (H2 headings and body).
 *
 * Titles like "Greek Architecture" or "Fire stations" are SHORT but valid —
 * they are intentionally left untouched.
 *
 * Run with: bun run scripts/fix-anomalous-titles.ts
 */

import { createClient } from '@supabase/supabase-js'

// ─── Supabase client ─────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Confirmed repair manifest ────────────────────────────────────────────────
//
// Each entry was verified by reading the article's content. Titles are derived
// from the subject matter described in the H2/body — not inferred or guessed.
//
// Basis for each title:
//
//  ale-plan-003-01  Content covers: PD 957, BP 220, UDHA (RA 7279), Maceda Law
//                   (RA 6552), RA 10884 — the five core housing statutes.
//
//  ale-plan-003-02  Content covers: the four housing affordability tiers
//                   (socialized, economic, low-cost, open-market) under BP 220.
//
//  ale-plan-007-01  Content covers: NHA (builder), SHFC (community finance),
//                   Pag-IBIG (individual loans) — government housing agencies.
//
//  ale-plan-007-03  Content covers: Pag-IBIG/HDMF, SSS, GSIS, NHMFC —
//                   employment-based housing finance institutions.
//
//  ale-theo-003-03  Content covers: kinesthetics — the architectural experience
//                   of bodily movement through stairs, ramps, corridors.

const REPAIRS: Array<{ article_id: string; oldTitle: string; newTitle: string; slug: string }> = [
  {
    article_id: '0d2e80df-4f76-484e-9b1f-5502da9e35be',
    slug: 'ale-plan-003-01-what-you-need-to-know-for-the-ale',
    oldTitle: 'Philippine',
    newTitle: 'Philippine Housing Law Framework',
  },
  {
    article_id: '7c0e2fa5-7f3d-419a-b592-50346ac7ab2f',
    slug: 'ale-plan-003-02-what-you-need-to-know-for-the-ale',
    oldTitle: 'Philippine',
    newTitle: 'Philippine Housing Classifications',
  },
  {
    article_id: '8a8a6153-844c-4671-aae6-b42b5a9435dd',
    slug: 'ale-plan-007-01-core-concept',
    oldTitle: 'Philippine',
    newTitle: 'Philippine Government Housing Agencies',
  },
  {
    article_id: '973b8e3d-c930-437d-b01d-eb33f4a047d8',
    slug: 'ale-plan-007-03-core-concept',
    oldTitle: 'Philippine',
    newTitle: 'Philippine Housing Finance Institutions',
  },
  {
    article_id: '1aaa804a-23f1-44da-bdcb-412fa04c848d',
    slug: 'ale-theo-003-03-core-concept',
    oldTitle: 'Architecture',
    newTitle: 'Architectural Kinesthetics: Movement Through Space',
  },
]

// ─── Anomaly check (verification pass only) ───────────────────────────────────

/** Flags titles known to be corrupted fragments. Used only for the verification query. */
function isKnownAnomaly(title: string): boolean {
  return title === 'Philippine' || title === 'Architecture'
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // ── Phase 1: Target Acquisition ───────────────────────────────────────────
  console.log('═════════════════════════════════════════════════════════')
  console.log('PHASE 1 — Target Acquisition')
  console.log('═════════════════════════════════════════════════════════\n')

  // Verify all targets exist in DB with the expected corrupted title
  const ids = REPAIRS.map((r) => r.article_id)
  const { data: existing, error: fetchErr } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug')
    .in('article_id', ids)

  if (fetchErr) {
    console.error('FATAL: Could not fetch target articles:', fetchErr.message)
    process.exit(1)
  }

  const existingMap = new Map((existing ?? []).map((a: any) => [a.article_id, a]))

  for (const repair of REPAIRS) {
    const row = existingMap.get(repair.article_id)
    if (!row) {
      console.warn(`  [MISSING] [${repair.article_id}] not found in DB — skipping`)
    } else if (row.title !== repair.oldTitle) {
      console.warn(
        `  [SKIP] [${repair.article_id}] title is already "${row.title}" (expected "${repair.oldTitle}") — no action needed`
      )
    } else {
      console.log(`  [CONFIRMED] [${repair.article_id}] "${repair.oldTitle}"  (slug: ${row.slug})`)
    }
  }

  // ── Phase 2: Title Synthesis Summary ─────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════')
  console.log('PHASE 2 — Title Synthesis (content-derived)')
  console.log('═════════════════════════════════════════════════════════\n')

  for (const repair of REPAIRS) {
    console.log(`  [QUEUED] [${repair.article_id}]`)
    console.log(`           "${repair.oldTitle}"`)
    console.log(`        →  "${repair.newTitle}"`)
  }

  // ── Phase 3: Batch Database Mutation ──────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════')
  console.log('PHASE 3 — Batch Database Mutation')
  console.log('═════════════════════════════════════════════════════════\n')

  let successCount = 0
  let failCount = 0
  const failures: { article_id: string; error: string }[] = []

  for (const repair of REPAIRS) {
    // Skip records that don't match expected old title (already fixed or missing)
    const row = existingMap.get(repair.article_id)
    if (!row || row.title !== repair.oldTitle) {
      console.log(`  [SKIPPED] [${repair.article_id}] — pre-check failed, not mutating`)
      continue
    }

    const { error } = await supabase
      .from('wiki_articles')
      .update({ title: repair.newTitle })
      .eq('article_id', repair.article_id)

    if (error) {
      console.error(`  [FAIL] [${repair.article_id}]: ${error.message}`)
      failures.push({ article_id: repair.article_id, error: error.message })
      failCount++
    } else {
      console.log(`  [OK]   [${repair.article_id}] → "${repair.newTitle}"`)
      successCount++
    }
  }

  // ── Phase 4: Verification & Closure ───────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════')
  console.log('PHASE 4 — System Verification & Closure')
  console.log('═════════════════════════════════════════════════════════\n')

  const { data: verifyData, error: verifyErr } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug')

  if (verifyErr) {
    console.error('WARNING: Verification query failed:', verifyErr.message)
  } else {
    const stillAnomalous = (verifyData ?? []).filter((a: any) => isKnownAnomaly(a.title))

    if (stillAnomalous.length === 0) {
      console.log('✅ VERIFICATION PASSED — Zero anomalous titles remain in the database.')
    } else {
      console.warn(`⚠️  VERIFICATION WARNING — ${stillAnomalous.length} anomalous title(s) remain:`)
      stillAnomalous.forEach((a: any) =>
        console.warn(`  ✗ [${a.article_id}] "${a.title}"  (slug: ${a.slug})`)
      )
    }
  }

  // ── Final Report ──────────────────────────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════')
  console.log('EXECUTION REPORT')
  console.log('═════════════════════════════════════════════════════════')
  console.log(`  Total targets    : ${REPAIRS.length}`)
  console.log(`  Titles repaired  : ${successCount}`)
  console.log(`  Failed mutations : ${failCount}`)

  console.log('\n  Repair log (old → new):')
  REPAIRS.forEach((r) => {
    const failed = failures.some((f) => f.article_id === r.article_id)
    const status = failed ? '✗ FAIL' : '✓ OK  '
    console.log(`    [${status}] [${r.article_id}]`)
    console.log(`             "${r.oldTitle}"`)
    console.log(`          →  "${r.newTitle}"`)
  })

  if (failures.length > 0) {
    console.log('\n  Failed records:')
    failures.forEach((f) => console.log(`    [FAIL] [${f.article_id}]: ${f.error}`))
  }

  console.log('═════════════════════════════════════════════════════════')

  if (failCount > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
