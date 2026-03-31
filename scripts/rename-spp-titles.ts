#!/usr/bin/env bun
/**
 * rename-spp-titles.ts
 *
 * One-time batch mutation: shortens verbose SPP article titles in wiki_articles.
 *
 * Before: "SPP Document 201: Standards of Professional Practice on Pre-Design Services"
 * After:  "SPP Doc 201: Pre-Design Services"
 *
 * Also condenses the master overview:
 * Before: "UAP SPP Documents: Standards of Professional Practice for Philippine Architects"
 * After:  "UAP SPP: General Standards"
 *
 * Scope: ONLY articles linked to the SPP Docs taxonomy node via wiki_article_taxonomy.
 * Run with: bun run scripts/rename-spp-titles.ts
 */

import { createClient } from '@supabase/supabase-js'

// ─── Configuration ─────────────────────────────────────────────────────────

/** Taxonomy node for "Standards of Professional Practice (SPP Docs)" */
const SPP_NODE_ID = '1042b5a6-e01e-4e1c-b9e3-5c3b31042f64'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Title Transform ────────────────────────────────────────────────────────

function transformTitle(title: string): string | null {
  // Master overview document
  if (title === 'UAP SPP Documents: Standards of Professional Practice for Philippine Architects') {
    return 'UAP SPP: General Standards'
  }

  // Numbered SPP documents: "SPP Document NNN: Standards of Professional Practice on <Service>"
  const match = title.match(/^SPP Document (\S+): Standards of Professional Practice on (.+)$/)
  if (match) {
    return `SPP Doc ${match[1]}: ${match[2]}`
  }

  return null // No match — skip, do not mutate
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('─────────────────────────────────────────────────────────')
  console.log('SPP Title Rename — Phase 1: Fetching articles')
  console.log('─────────────────────────────────────────────────────────')

  // Fetch all articles linked to the SPP node
  const { data: linked, error: fetchErr } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, wiki_articles(article_id, title)')
    .eq('node_id', SPP_NODE_ID)

  if (fetchErr) {
    console.error('FATAL: Could not fetch SPP articles:', fetchErr.message)
    process.exit(1)
  }

  if (!linked || linked.length === 0) {
    console.warn('WARNING: No articles found linked to SPP node. Exiting.')
    process.exit(0)
  }

  type ArticleRow = { article_id: string; title: string }
  const articles: ArticleRow[] = linked
    .map((row: any) => row.wiki_articles)
    .filter(Boolean)

  console.log(`Fetched ${articles.length} SPP article(s).\n`)
  articles.forEach((a) => console.log(`  [${a.article_id}] ${a.title}`))

  // ── Phase 2: Build update payload ────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────')
  console.log('Phase 2: Building update payload')
  console.log('─────────────────────────────────────────────────────────\n')

  type UpdateItem = { article_id: string; oldTitle: string; newTitle: string }
  const updates: UpdateItem[] = []
  const skipped: ArticleRow[] = []

  for (const article of articles) {
    const newTitle = transformTitle(article.title)
    if (newTitle === null) {
      console.warn(`  [SKIP] ${article.article_id} — title did not match any transform pattern`)
      console.warn(`         "${article.title}"`)
      skipped.push(article)
    } else {
      updates.push({ article_id: article.article_id, oldTitle: article.title, newTitle })
      console.log(`  [QUEUED] ${article.article_id}`)
      console.log(`           "${article.title}"`)
      console.log(`        →  "${newTitle}"`)
    }
  }

  // ── Phase 3: Batch update ─────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────')
  console.log('Phase 3: Executing updates')
  console.log('─────────────────────────────────────────────────────────\n')

  let successCount = 0
  let failCount = 0
  const failures: { article_id: string; error: string }[] = []

  for (const item of updates) {
    const { error } = await supabase
      .from('wiki_articles')
      .update({ title: item.newTitle })
      .eq('article_id', item.article_id)

    if (error) {
      console.error(`  [FAIL] ${item.article_id}: ${error.message}`)
      failures.push({ article_id: item.article_id, error: error.message })
      failCount++
    } else {
      console.log(`  [OK]   ${item.article_id} → "${item.newTitle}"`)
      successCount++
    }
  }

  // ── Phase 4: Verification ─────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────')
  console.log('Phase 4: Verification')
  console.log('─────────────────────────────────────────────────────────\n')

  const { data: verified, error: verifyErr } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, wiki_articles(article_id, title)')
    .eq('node_id', SPP_NODE_ID)

  if (verifyErr) {
    console.error('WARNING: Verification query failed:', verifyErr.message)
  } else {
    const verifiedArticles: ArticleRow[] = (verified ?? [])
      .map((row: any) => row.wiki_articles)
      .filter(Boolean)

    const stillVerbose = verifiedArticles.filter(
      (a) =>
        a.title.includes('SPP Document') ||
        a.title.includes('Standards of Professional Practice on') ||
        a.title.includes('UAP SPP Documents: Standards')
    )

    console.log('Current titles in DB:')
    verifiedArticles.forEach((a) => console.log(`  ✓ ${a.title}`))

    if (stillVerbose.length > 0) {
      console.warn(`\nWARNING: ${stillVerbose.length} title(s) still contain verbose phrasing:`)
      stillVerbose.forEach((a) => console.warn(`  ✗ [${a.article_id}] "${a.title}"`))
    } else {
      console.log('\n✅ All verbose phrases eradicated from SPP titles.')
    }
  }

  // ── Final report ──────────────────────────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════')
  console.log('EXECUTION REPORT')
  console.log('═════════════════════════════════════════════════════════')
  console.log(`  Total fetched : ${articles.length}`)
  console.log(`  Updated       : ${successCount}`)
  console.log(`  Skipped       : ${skipped.length}`)
  console.log(`  Failed        : ${failCount}`)

  if (failures.length > 0) {
    console.log('\n  Failed records:')
    failures.forEach((f) => console.log(`    ${f.article_id}: ${f.error}`))
  }
  console.log('═════════════════════════════════════════════════════════')
}

main().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
