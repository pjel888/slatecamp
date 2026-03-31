#!/usr/bin/env bun
/**
 * upload-spp-docs.ts
 *
 * Uploads the 11 Standards of Professional Practice (SPP) documents for
 * Philippine Architects to Supabase, linked to the existing taxonomy node
 * "Standards of Professional Practice (SPP Docs)".
 *
 * Run with: bun run scripts/upload-spp-docs.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// ─── Configuration ─────────────────────────────────────────────────────────

const SPP_DOCS_DIR = path.join(process.cwd(), 'SPP Docs')

/** Pre-existing taxonomy node for SPP Documents */
const SPP_NODE_ID = '1042b5a6-e01e-4e1c-b9e3-5c3b31042f64'

const SUBJECT_LABEL = 'ALE-PPJ · Professional Practice & Jurisprudence'

/** Exact file sequence as mandated by the directive */
const FILE_SEQUENCE = [
  'UAP SPP Doc Standards of Professional Practice for Philippine Architects.md',
  'SPP Doc 201 - Pre-Design Services.md',
  'SPP Doc 202 - Regular Design Services.md',
  'SPP Doc 203 - Specialized Architectural Services.md',
  'SPP Doc 204-A  - Fulltime Supervision Services.md',
  'SPP Doc 204-B  - Construction Management Services.md',
  'SPP Doc 205  - Post-Construction Services.md',
  'SPP Doc 206  - Comprehensive Architectural Services.md',
  'SPP Doc 207  - Design-Build Services.md',
  'SPP Doc 208  - Architectural Design Competition (ADC).md',
  'SPP Doc 209  - Architectural Consulting Services (PACS).md',
]

// ─── MDX Safety ────────────────────────────────────────────────────────────

/**
 * Escape bare `<digit` patterns that break MDX compilation.
 * e.g. <50% → &lt;50%, <1st → &lt;1st
 */
function escapeMdxTags(content: string): string {
  return content.replace(/<([0-9])/g, '&lt;$1')
}

// ─── Blockquote → Callout Transform ────────────────────────────────────────

/**
 * Transform markdown blockquotes into custom MDX Callout components.
 *
 * Pattern detected:
 *   > **Title Text**     (first content line is bold title)
 *   > body content...
 *
 * → <Callout variant="tip" title="Title Text">
 *   body content...
 *   </Callout>
 *
 * Plain blockquotes (no bold title on first line) are left as-is.
 */
function transformBlockquotes(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Start of a blockquote block
    if (line.startsWith('> ') || line === '>') {
      // Collect all consecutive blockquote lines
      const blockLines: string[] = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        blockLines.push(lines[i])
        i++
      }

      // Strip the '> ' prefix from each line
      const stripped = blockLines.map(l => l === '>' ? '' : l.slice(2))

      // Check if first non-empty line is a bold title: **Title**
      const firstContent = stripped.find(l => l.trim().length > 0) ?? ''
      const titleMatch = firstContent.match(/^\*\*([^*]+)\*\*\s*$/)

      if (titleMatch) {
        const title = titleMatch[1].trim()
        // Body = all lines after the first content line
        const firstContentIdx = stripped.findIndex(l => l.trim().length > 0)
        const bodyLines = stripped.slice(firstContentIdx + 1)
        // Drop leading blank line if present
        if (bodyLines.length > 0 && bodyLines[0].trim() === '') bodyLines.shift()
        const body = bodyLines.join('\n').trimEnd()

        result.push(`<Callout variant="tip" title="${title.replace(/"/g, '&quot;')}">`)
        if (body) {
          result.push('')
          result.push(body)
          result.push('')
        }
        result.push('</Callout>')
        result.push('')
      } else {
        // Plain blockquote — emit as-is
        result.push(...blockLines)
      }
    } else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

// ─── Metadata Extraction ───────────────────────────────────────────────────

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled'
}

function fileToSlug(fileName: string): string {
  return fileName
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function estimateReadTime(content: string): string {
  const wordCount = content.split(/\s+/).length
  return `~${Math.max(1, Math.round(wordCount / 200))} min`
}

function extractAleTestsYou(content: string): string {
  // First non-empty paragraph after the H1
  const lines = content.split('\n')
  let pastH1 = false
  for (const line of lines) {
    if (!pastH1 && line.startsWith('# ')) { pastH1 = true; continue }
    if (pastH1 && line.trim().length > 0 && !line.startsWith('#') && !line.startsWith('>')) {
      return line.trim().replace(/\*\*/g, '').slice(0, 200)
    }
  }
  return ''
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify connection
  const { error: pingError } = await supabase.from('wiki_articles').select('article_id').limit(1)
  if (pingError) {
    console.error('❌ Database connection failed:', pingError.message)
    process.exit(1)
  }

  // Load existing slugs to avoid collisions
  const { data: existing } = await supabase.from('wiki_articles').select('slug')
  const existingSlugs = new Set((existing ?? []).map(r => r.slug as string))

  const results: { position: number; file: string; slug: string; article_id: string }[] = []
  const errors: { position: number; file: string; error: string }[] = []

  console.log(`\n📚 Starting SPP Documents upload — ${FILE_SEQUENCE.length} files\n`)

  for (let pos = 0; pos < FILE_SEQUENCE.length; pos++) {
    const fileName = FILE_SEQUENCE[pos]
    const filePath = path.join(SPP_DOCS_DIR, fileName)
    const position = pos + 1

    try {
      // ── Read file ──────────────────────────────────────────────────────
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }
      const rawContent = fs.readFileSync(filePath, 'utf-8')

      // ── Transform content ──────────────────────────────────────────────
      let content = escapeMdxTags(rawContent)
      content = transformBlockquotes(content)

      // ── Extract metadata ───────────────────────────────────────────────
      const title = extractTitle(rawContent)
      let slug = fileToSlug(fileName)

      // Deduplicate slug if needed
      if (existingSlugs.has(slug)) {
        let n = 2
        while (existingSlugs.has(`${slug}-${n}`)) n++
        slug = `${slug}-${n}`
      }
      existingSlugs.add(slug)

      const readTime = estimateReadTime(rawContent)
      const aleTestsYou = extractAleTestsYou(rawContent)

      // ── Build payload ──────────────────────────────────────────────────
      const payload = {
        title,
        slug,
        content,
        status: 'published',
        subject_label: SUBJECT_LABEL,
        difficulty_label: 'Intermediate',
        read_time: readTime,
        ale_tests_you: aleTestsYou,
        updated_note: 'SPP IRR 2010 (RA 9266)',
      }

      // ── Insert article ─────────────────────────────────────────────────
      const { data: articleData, error: articleError } = await supabase
        .from('wiki_articles')
        .insert([payload])
        .select('article_id')
        .single()

      if (articleError) throw new Error(articleError.message)

      const articleId = articleData.article_id

      // ── Insert taxonomy link ───────────────────────────────────────────
      const { error: taxError } = await supabase
        .from('wiki_article_taxonomy')
        .insert([{ article_id: articleId, node_id: SPP_NODE_ID, is_primary: true }])

      if (taxError) throw new Error(`Taxonomy link failed: ${taxError.message}`)

      results.push({ position, file: fileName, slug, article_id: articleId })
      console.log(`  ✓ [${position}/11] ${title}`)
      console.log(`        slug: ${slug}`)
      console.log(`        id:   ${articleId}`)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push({ position, file: fileName, error: msg })
      console.error(`  ✗ [${position}/11] ${fileName}`)
      console.error(`        Error: ${msg}`)
    }
  }

  // ── Final report ─────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60))
  console.log('📋 FINAL EXECUTION REPORT')
  console.log('─'.repeat(60))
  console.log(`  Taxonomy node: Standards of Professional Practice (SPP Docs)`)
  console.log(`  Node ID:       ${SPP_NODE_ID}`)
  console.log(`  ✓ Successfully uploaded: ${results.length} / ${FILE_SEQUENCE.length}`)

  if (errors.length > 0) {
    console.log(`  ✗ Failed: ${errors.length}`)
    for (const e of errors) {
      console.log(`    [${e.position}] ${e.file}: ${e.error}`)
    }
  } else {
    console.log(`  ✗ Failed: 0`)
  }

  console.log('\n  Upload sequence:')
  for (const r of results) {
    console.log(`    [${r.position}] ${r.slug}`)
  }
  console.log('─'.repeat(60))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
