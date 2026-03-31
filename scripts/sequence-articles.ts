#!/usr/bin/env bun
/**
 * sequence-articles.ts
 *
 * Comprehensive audit and normalization of wiki article reading order.
 *
 * Adds a 1-based `sort_order` integer to every row in `wiki_article_taxonomy`,
 * enabling the UI to display articles in a logical pedagogical sequence within
 * each subtopic. Ordering is derived from title semantics — not assigned blindly.
 *
 * Four phases:
 *   1. Audit    — classify every leaf taxonomy node as all-zero, mixed, or clean
 *   2. Sequence — derive intelligent 1-based sort order from article titles
 *   3. Mutate   — batch-update wiki_article_taxonomy.sort_order
 *   4. Verify   — assert zero unsequenced or duplicate-ordered articles remain
 *
 * Run with: bun run scripts/sequence-articles.ts
 *
 * Bun automatically loads .env.local from the project root.
 */

import { createClient } from '@supabase/supabase-js'

// ─── Supabase admin client ────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaxonomyNode {
  node_id: string
  name: string
  level: number
  is_leaf: boolean
}

interface ArticleMapping {
  article_id: string
  node_id: string
  sort_order: number
  title: string
}

interface NodeGroup {
  node: TaxonomyNode
  articles: ArticleMapping[]
  state: 'all-zero' | 'mixed' | 'clean'
}

interface UpdateRecord {
  article_id: string
  node_id: string
  new_order: number
  title: string
  node_name: string
}

// ─── Intelligent sort key extraction ─────────────────────────────────────────

/**
 * Roman numeral → integer conversion.
 * Handles I–XIX (sufficient for architectural rule/section numbers).
 */
function romanToInt(roman: string): number {
  const map: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5,
    VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
    XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15,
    XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20,
  }
  const upper = roman.toUpperCase()
  return map[upper] ?? 999
}

/** Ordinal word → integer */
function ordinalWordToInt(word: string): number {
  const map: Record<string, number> = {
    first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
    sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
    eleventh: 11, twelfth: 12,
  }
  return map[word.toLowerCase()] ?? 999
}

/**
 * Derive a numeric sort key from an article title.
 *
 * Priority cascade (lower number = sort earlier):
 *  Tier 0  — foundational keyword override (Overview, Introduction, General Provisions, Definitions, Scope)
 *  Tier 1  — leading integer or decimal (e.g. "01 —", "3.2 ")
 *  Tier 2  — Rule/Section/Article/Part + roman numeral (e.g. "Rule VII")
 *  Tier 3  — Rule/Section/Article/Part + arabic numeral (e.g. "Section 4")
 *  Tier 4  — PD/RA/BP decree number (e.g. "PD 1096", lower = older = foundational)
 *  Tier 5  — Ordinal word (e.g. "First", "Second")
 *  Tier 6  — Alphabetical fallback (sort key = 5000 + char codes approximated via localeCompare position)
 *  Tier 99 — Terminal/advanced keyword override (Penalties, Violations, Transitory, Miscellaneous, Final, Repealing)
 */
function deriveSortKey(title: string): number {
  const t = title.trim()
  const lower = t.toLowerCase()

  // ── Tier 99: terminal keywords (always last) ──────────────────────────────
  const terminalPatterns = [
    /\bpenalt(y|ies)\b/i,
    /\bviolation/i,
    /\btransitory\b/i,
    /\bpenal\b/i,
    /\bmiscellaneous\b/i,
    /\brepealing\b/i,
    /\bfinal provision/i,
    /\bsavings clause/i,
    /\beffectivity\b/i,
  ]
  if (terminalPatterns.some((p) => p.test(t))) return 9000

  // ── Tier 0: foundational keywords (always first) ──────────────────────────
  const foundationalPatterns = [
    /^overview\b/i,
    /\bintroduction\b/i,
    /^general provision/i,
    /\bdefinition(s)?\b/i,
    /\bscope\b.*\bapplication\b/i,
    /^(scope|purpose|objective|background|context)\b/i,
    /\bfundamental(s)?\b/i,
    /\bbasic(s)?\b/i,
    /^what is\b/i,
    /\bprinciple(s)?\b/i,
  ]
  if (foundationalPatterns.some((p) => p.test(t))) return 1

  // ── Tier 1: leading integer (e.g. "01 — ", "3.", "2 ") ───────────────────
  const leadingInt = t.match(/^(\d+)\s*[.—\-–:]?\s/)
  if (leadingInt) return parseInt(leadingInt[1], 10) * 10

  // ── Tier 2: Rule/Section/Article/Part + roman numeral ────────────────────
  const romanMatch = t.match(
    /\b(?:rule|section|part|article|chapter|annex)\s+(I{1,3}|IV|VI{0,3}|IX|XI{0,2}|XIV|XVI{0,3}|XIX|XX)\b/i
  )
  if (romanMatch) return romanToInt(romanMatch[1]) * 10 + 100

  // ── Tier 3: Rule/Section/Article/Part + arabic numeral ───────────────────
  const arabicMatch = t.match(
    /\b(?:rule|section|part|article|chapter|annex)\s+(\d+)/i
  )
  if (arabicMatch) return parseInt(arabicMatch[1], 10) * 10 + 200

  // ── Tier 4: Decree/Act number (PD, RA, BP, EO, LOI, RIRR) ───────────────
  // Lower decree numbers generally predate higher ones → use as sort key but
  // offset into tier 4 range (3000+) so explicit Rule/Section numbers win.
  const decreeMatch = t.match(
    /\b(?:PD|RA|BP|EO|LOI|RIRR|IRR|ARCA)\s*(?:No\.?\s*)?(\d+)/i
  )
  if (decreeMatch) return 3000 + parseInt(decreeMatch[1], 10)

  // ── Tier 5: ordinal word ──────────────────────────────────────────────────
  const ordinalMatch = t.match(
    /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\b/i
  )
  if (ordinalMatch) return ordinalWordToInt(ordinalMatch[1]) * 10 + 400

  // ── Tier 6: alphabetical fallback ────────────────────────────────────────
  // Map first char to 5000–6000 range to keep below terminal tier
  return 5000 + lower.charCodeAt(0)
}

/**
 * Sort a list of articles by their title sort key.
 * Articles with identical sort keys fall back to localeCompare on title.
 */
function sortByTitle(articles: ArticleMapping[]): ArticleMapping[] {
  return [...articles].sort((a, b) => {
    const ka = deriveSortKey(a.title)
    const kb = deriveSortKey(b.title)
    if (ka !== kb) return ka - kb
    return a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true })
  })
}

/**
 * For mixed-state nodes: preserve the relative order of already-sequenced
 * articles, then interleave unsequenced articles at positions determined
 * by their sort key relative to the anchors.
 */
function mergeWithAnchors(articles: ArticleMapping[]): ArticleMapping[] {
  const anchored = articles.filter((a) => a.sort_order > 0).sort((a, b) => a.sort_order - b.sort_order)
  const floating = articles.filter((a) => a.sort_order === 0)

  // Build combined sorted list: sort floating by title key, then merge
  // into anchor sequence at positions that maintain relative key order.
  const sortedFloating = sortByTitle(floating)
  const result: ArticleMapping[] = []

  let fi = 0 // floating pointer
  for (const anchor of anchored) {
    const anchorKey = deriveSortKey(anchor.title)
    // Drain all floating articles whose key is less than the anchor's key
    while (fi < sortedFloating.length && deriveSortKey(sortedFloating[fi].title) < anchorKey) {
      result.push(sortedFloating[fi++])
    }
    result.push(anchor)
  }
  // Append any remaining floating articles after the last anchor
  while (fi < sortedFloating.length) {
    result.push(sortedFloating[fi++])
  }

  return result
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═════════════════════════════════════════════════════════════════════')
  console.log('  SEQUENCE ARTICLES — Wiki Article Reading Order Normalization')
  console.log('═════════════════════════════════════════════════════════════════════\n')

  // ══ PHASE 1: Audit ══════════════════════════════════════════════════════════
  console.log('══════════════════════════════════════════════')
  console.log('  PHASE 1 — Schema Introspection & Audit')
  console.log('══════════════════════════════════════════════\n')

  // Fetch ALL taxonomy nodes that have article mappings (leaf AND non-leaf)
  const { data: leafNodes, error: leafErr } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, level, is_leaf')

  if (leafErr || !leafNodes) {
    console.error('FATAL: Could not fetch leaf taxonomy nodes:', leafErr?.message)
    process.exit(1)
  }

  console.log(`  Leaf taxonomy nodes found: ${leafNodes.length}`)

  // Fetch all article mappings for these nodes in chunks (avoid URL length limits)
  const nodeIds = leafNodes.map((n: TaxonomyNode) => n.node_id)
  const CHUNK_SIZE = 50

  const allMappings: Array<{
    article_id: string
    node_id: string
    sort_order: number
    wiki_articles: { article_id: string; title: string } | null
  }> = []

  for (let i = 0; i < nodeIds.length; i += CHUNK_SIZE) {
    const chunk = nodeIds.slice(i, i + CHUNK_SIZE)
    const { data, error } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id, node_id, sort_order, wiki_articles(article_id, title)')
      .in('node_id', chunk)

    if (error) {
      console.error(`FATAL: Could not fetch article mappings for chunk ${i}–${i + CHUNK_SIZE}:`, error.message)
      process.exit(1)
    }
    allMappings.push(...(data ?? []))
  }

  console.log(`  Total article-taxonomy mappings: ${allMappings.length}`)

  // Build flat ArticleMapping list (skip mappings with no article data)
  const flatMappings: ArticleMapping[] = []
  let skippedOrphans = 0
  for (const m of allMappings) {
    if (!m.wiki_articles) {
      skippedOrphans++
      continue
    }
    flatMappings.push({
      article_id: m.article_id,
      node_id: m.node_id,
      sort_order: m.sort_order ?? 0,
      title: m.wiki_articles.title,
    })
  }
  if (skippedOrphans > 0) {
    console.warn(`  ⚠  Skipped ${skippedOrphans} orphaned mappings (article not found in wiki_articles)`)
  }

  // Group by node_id
  const nodeMap = new Map<string, TaxonomyNode>(leafNodes.map((n: TaxonomyNode) => [n.node_id, n]))
  const groupsByNode = new Map<string, ArticleMapping[]>()
  for (const m of flatMappings) {
    const arr = groupsByNode.get(m.node_id) ?? []
    arr.push(m)
    groupsByNode.set(m.node_id, arr)
  }

  // Classify each node
  const nodeGroups: NodeGroup[] = []
  let allZeroCount = 0
  let mixedCount = 0
  let cleanCount = 0
  let emptyCount = 0

  for (const [nodeId, articles] of groupsByNode) {
    const node = nodeMap.get(nodeId)
    if (!node) continue

    if (articles.length === 0) {
      emptyCount++
      continue
    }

    const hasNonZero = articles.some((a) => a.sort_order > 0)
    const hasZero = articles.some((a) => a.sort_order === 0)

    // Check for duplicates
    const orderSet = new Set(articles.filter((a) => a.sort_order > 0).map((a) => a.sort_order))
    const hasDuplicates = orderSet.size < articles.filter((a) => a.sort_order > 0).length

    let state: NodeGroup['state']
    if (!hasNonZero) {
      state = 'all-zero'
      allZeroCount++
    } else if (hasZero || hasDuplicates) {
      state = 'mixed'
      mixedCount++
    } else {
      state = 'clean'
      cleanCount++
    }

    nodeGroups.push({ node, articles, state })
  }

  console.log('\n  ┌─ Audit Classification ──────────────────────────────┐')
  console.log(`  │  all-zero  (full sequencing required)  : ${String(allZeroCount).padStart(4)}      │`)
  console.log(`  │  mixed     (gap-filling required)      : ${String(mixedCount).padStart(4)}      │`)
  console.log(`  │  clean     (already sequenced, skip)   : ${String(cleanCount).padStart(4)}      │`)
  console.log(`  │  empty     (no articles, skip)         : ${String(emptyCount).padStart(4)}      │`)
  console.log(`  └─────────────────────────────────────────────────────┘\n`)

  const flaggedGroups = nodeGroups.filter((g) => g.state !== 'clean')
  if (flaggedGroups.length === 0) {
    console.log('✅ No flagged nodes — database is already fully sequenced. Exiting.')
    process.exit(0)
  }

  // ══ PHASE 2: Contextual Analysis & Sorting ══════════════════════════════════
  console.log('══════════════════════════════════════════════')
  console.log('  PHASE 2 — Contextual Analysis & Sorting')
  console.log('══════════════════════════════════════════════\n')

  const updateQueue: UpdateRecord[] = []

  for (const group of flaggedGroups) {
    const { node, articles, state } = group

    // Determine sorted order
    const sorted =
      state === 'mixed' ? mergeWithAnchors(articles) : sortByTitle(articles)

    // Assign 1-based sequential integers
    sorted.forEach((article, idx) => {
      updateQueue.push({
        article_id: article.article_id,
        node_id: node.node_id,
        new_order: idx + 1,
        title: article.title,
        node_name: node.name,
      })
    })

    console.log(`  [${state.toUpperCase().padEnd(8)}] ${node.name} (${articles.length} articles)`)
    sorted.forEach((a, idx) => {
      const prev = a.sort_order > 0 ? ` (was ${a.sort_order})` : ''
      console.log(`             ${String(idx + 1).padStart(3)}.  ${a.title}${prev}`)
    })
    console.log()
  }

  console.log(`  ── Total update records queued: ${updateQueue.length}\n`)

  // ══ PHASE 3: Batch Database Mutation ════════════════════════════════════════
  console.log('══════════════════════════════════════════════')
  console.log('  PHASE 3 — Batch Database Mutation')
  console.log('══════════════════════════════════════════════\n')

  let successCount = 0
  let failCount = 0
  const failures: { article_id: string; node_id: string; title: string; error: string }[] = []

  // Process in batches to keep output readable
  const BATCH_SIZE = 20
  for (let i = 0; i < updateQueue.length; i += BATCH_SIZE) {
    const batch = updateQueue.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (rec) => {
        const { error } = await supabase
          .from('wiki_article_taxonomy')
          .update({ sort_order: rec.new_order })
          .eq('article_id', rec.article_id)
          .eq('node_id', rec.node_id)

        if (error) {
          console.error(`  [FAIL] [${rec.article_id}] "${rec.title}": ${error.message}`)
          failures.push({
            article_id: rec.article_id,
            node_id: rec.node_id,
            title: rec.title,
            error: error.message,
          })
          failCount++
        } else {
          successCount++
        }
      })
    )

    // Progress indicator every batch
    const pct = Math.round(((i + batch.length) / updateQueue.length) * 100)
    process.stdout.write(`\r  Progress: ${i + batch.length}/${updateQueue.length} (${pct}%)  `)
  }

  console.log('\n')

  // ══ PHASE 4: System Verification & Closure ══════════════════════════════════
  console.log('══════════════════════════════════════════════')
  console.log('  PHASE 4 — System Verification & Closure')
  console.log('══════════════════════════════════════════════\n')

  // Check 1: Zero unsequenced articles
  const { data: unsequenced, error: unseqErr } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, node_id')
    .eq('sort_order', 0)

  if (unseqErr) {
    console.error('  ⚠  Verification query 1 failed:', unseqErr.message)
  } else if ((unsequenced ?? []).length > 0) {
    console.error(`  ✗ VERIFICATION FAILED: ${unsequenced!.length} article(s) still have sort_order = 0`)
    unsequenced!.forEach((r: any) =>
      console.error(`      article_id=${r.article_id}  node_id=${r.node_id}`)
    )
  } else {
    console.log('  ✅ CHECK 1 PASSED — Zero articles with sort_order = 0')
  }

  // Check 2: No duplicate sort_order within a subtopic
  // We do this client-side from the full mapping
  const { data: allFinal, error: finalErr } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, node_id, sort_order')

  let dupCount = 0
  if (finalErr) {
    console.error('  ⚠  Verification query 2 failed:', finalErr.message)
  } else {
    const byNode = new Map<string, number[]>()
    for (const row of allFinal ?? []) {
      const arr = byNode.get(row.node_id) ?? []
      arr.push(row.sort_order)
      byNode.set(row.node_id, arr)
    }
    for (const [nid, orders] of byNode) {
      const unique = new Set(orders)
      if (unique.size < orders.length) {
        const nodeName = nodeMap.get(nid)?.name ?? nid
        console.error(`  ✗ DUPLICATE sort_order detected in node: "${nodeName}" [${nid}]`)
        dupCount++
      }
    }
    if (dupCount === 0) {
      console.log('  ✅ CHECK 2 PASSED — No duplicate sort_order values within any subtopic')
    }
  }

  // ── Final Execution Report ─────────────────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════════════════')
  console.log('  EXECUTION REPORT')
  console.log('═════════════════════════════════════════════════════════════════════')
  console.log(`  Total mappings in DB      : ${flatMappings.length}`)
  console.log(`  Nodes requiring update    : ${flaggedGroups.length}  (${allZeroCount} all-zero, ${mixedCount} mixed)`)
  console.log(`  Records queued            : ${updateQueue.length}`)
  console.log(`  Successfully updated      : ${successCount}`)
  console.log(`  Failed updates            : ${failCount}`)
  console.log(`  Nodes already clean       : ${cleanCount} (skipped)`)
  console.log(`  Duplicate-order violations: ${dupCount}`)

  if (flaggedGroups.length > 0) {
    console.log('\n  ── Breakdown by subtopic ─────────────────────────────────────────────')
    const byNode = new Map<string, UpdateRecord[]>()
    for (const rec of updateQueue) {
      const arr = byNode.get(rec.node_id) ?? []
      arr.push(rec)
      byNode.set(rec.node_id, arr)
    }
    for (const [nodeId, recs] of byNode) {
      const nodeName = nodeMap.get(nodeId)?.name ?? nodeId
      const failed = recs.filter((r) =>
        failures.some((f) => f.article_id === r.article_id && f.node_id === r.node_id)
      ).length
      const ok = recs.length - failed
      const status = failed === 0 ? '✓' : '✗'
      console.log(`    [${status}]  ${nodeName}`)
      console.log(`         ${ok} updated${failed > 0 ? `, ${failed} failed` : ''}`)
    }
  }

  if (failures.length > 0) {
    console.log('\n  ── Failed records ────────────────────────────────────────────────────')
    failures.forEach((f) => {
      console.log(`    [FAIL] "${f.title}"`)
      console.log(`           article_id=${f.article_id}  node_id=${f.node_id}`)
      console.log(`           reason: ${f.error}`)
    })
  }

  console.log('═════════════════════════════════════════════════════════════════════')

  if (failCount > 0 || dupCount > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
