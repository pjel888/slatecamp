#!/usr/bin/env bun
/**
 * enrich-spp-docs.ts
 *
 * Post-processes the 11 SPP documents already in Supabase, applying:
 *   1. Strip inline footnote citations [^N]
 *   2. Strip the ## References section (web URLs, not exam content)
 *   3. Wrap standalone markdown tables in <ComparisonTable>
 *   4. MDX safety escaping (<digit → &lt;digit)
 *   5. Blockquote → <Callout> transform (re-applied from source)
 *   6. Inject <Callout variant="authority"> after "Legal and Regulatory Basis" headings
 *   7. Inject <Callout variant="ale-watch"> for key exam traps (per-doc, curated)
 *
 * Run with: bun run scripts/enrich-spp-docs.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// ─── Configuration ─────────────────────────────────────────────────────────

const SPP_DOCS_DIR = path.join(process.cwd(), 'SPP Docs')

/** Article IDs captured from the upload run */
const ARTICLES = [
  {
    file: 'UAP SPP Doc Standards of Professional Practice for Philippine Architects.md',
    article_id: 'f2c105fd-51fc-4b48-b53a-77242dbb91b0',
  },
  {
    file: 'SPP Doc 201 - Pre-Design Services.md',
    article_id: '16bb270e-6887-4bbe-a62e-eace6c4d3fdb',
  },
  {
    file: 'SPP Doc 202 - Regular Design Services.md',
    article_id: '24b0a3db-e6bc-45d0-a9a1-d83009112efb',
  },
  {
    file: 'SPP Doc 203 - Specialized Architectural Services.md',
    article_id: '9a800f21-b26e-4e3e-94c8-2f4127eccd42',
  },
  {
    file: 'SPP Doc 204-A  - Fulltime Supervision Services.md',
    article_id: 'c534d94f-967a-48bb-babf-419fa6d35ec7',
  },
  {
    file: 'SPP Doc 204-B  - Construction Management Services.md',
    article_id: 'f5ed9c09-3191-4cd4-b1b0-9e6364212c36',
  },
  {
    file: 'SPP Doc 205  - Post-Construction Services.md',
    article_id: '875396fa-1704-47b7-abb5-29f49c75fc78',
  },
  {
    file: 'SPP Doc 206  - Comprehensive Architectural Services.md',
    article_id: 'f74f79a0-1477-481f-9050-fa43d82f18bd',
  },
  {
    file: 'SPP Doc 207  - Design-Build Services.md',
    article_id: 'f76bad6c-4bdf-4d2c-bdfb-a3381c42e320',
  },
  {
    file: 'SPP Doc 208  - Architectural Design Competition (ADC).md',
    article_id: 'fba5f537-2da9-4fb3-b6eb-696d1937a92a',
  },
  {
    file: 'SPP Doc 209  - Architectural Consulting Services (PACS).md',
    article_id: 'f7861b5b-0833-4cd3-a634-0dfb9f53891c',
  },
]

// ─── Per-doc ALE Watch callouts ─────────────────────────────────────────────
// Injected immediately after the specified heading (case-insensitive match)

const ALE_WATCH: Record<string, Array<{ afterHeading: string; content: string }>> = {
  'SPP Doc 201 - Pre-Design Services.md': [
    {
      afterHeading: 'Method of Compensation',
      content:
        'Pre-Design Services use **cost-based methods** (MDPE, Lump Sum, Per Diem) — NOT percentage of Project Construction Cost (PCC). PCC doesn\'t exist yet at this stage. The ALE frequently tests whether candidates know which documents use PCC vs. cost-based fees.',
    },
    {
      afterHeading: 'Complete List of SPP 201 Services at a Glance',
      content:
        'The ALE tests the **12 specific service categories** under SPP 201 (2.1 Consultation through 2.12 Promotional Services). Know the mnemonic from the 1979 UAP Doc. 201: **EPASSSSP** — Economic Feasibility, Project Financing, Architectural Programming, Site Selection, Site Utilization, Space Planning, Space Management, Promotional Services.',
    },
  ],
  'SPP Doc 202 - Regular Design Services.md': [
    {
      afterHeading: 'Method of Compensation',
      content:
        'SPP 202 uses **percentage of Project Construction Cost (PCC)** — this is the only major SPP document that ties fees directly to PCC. The ALE tests the exact percentage ranges and which project types (private vs. government) command different rates.',
    },
  ],
  'SPP Doc 204-A  - Fulltime Supervision Services.md': [
    {
      afterHeading: 'Scope of Services',
      content:
        '**SPP 204-A (Fulltime Supervision)** vs. **SPP 204-B (Construction Management)** is a classic ALE trap. 204-A means the architect is physically on-site full-time and is personally liable for construction quality. 204-B is a management/coordination role — the architect does not directly supervise tradesmen.',
    },
  ],
  'SPP Doc 204-B  - Construction Management Services.md': [
    {
      afterHeading: 'Scope of Services',
      content:
        '**Construction Management (204-B)** is NOT the same as Fulltime Supervision (204-A). In CM, the architect coordinates contractors and manages the project schedule, budget, and quality — but is NOT personally directing workers on-site. The ALE tests the liability differences between these two modes.',
    },
  ],
  'SPP Doc 206  - Comprehensive Architectural Services.md': [
    {
      afterHeading: 'Scope of Comprehensive Services',
      content:
        'SPP 206 **bundles all SPP documents (201–205 + 207–209)** into a single contract. When a client engages an architect for Comprehensive Services, there is NO need for separate contracts for each SPP document. The ALE tests what is and isn\'t included in the comprehensive package.',
    },
  ],
  'SPP Doc 208  - Architectural Design Competition (ADC).md': [
    {
      afterHeading: 'Competition Requirements',
      content:
        'An **Architectural Design Competition (ADC)** under SPP 208 requires a **Board of Jurors** that includes at least one Registered and Licensed Architect. The ALE tests the composition of the jury, the anonymity requirement for entries, and the legal ownership of winning designs.',
    },
  ],
}

// ─── MDX Safety ────────────────────────────────────────────────────────────

function escapeMdxTags(content: string): string {
  return content.replace(/<([0-9])/g, '&lt;$1')
}

// ─── Strip Footnote Refs ───────────────────────────────────────────────────

function stripFootnoteRefs(content: string): string {
  // Remove inline [^1], [^2], [^1][^2][^3] etc.
  return content.replace(/(\[\^[0-9]+\])+/g, '')
}

// ─── Strip References Section ─────────────────────────────────────────────

function stripReferencesSection(content: string): string {
  // Remove everything from a top-level "## References" or "---\n\n## References" to end of file
  return content.replace(/\n---\n\n## References[\s\S]*$/, '')
    .replace(/\n## References[\s\S]*$/, '')
}

// ─── Wrap Tables in ComparisonTable ────────────────────────────────────────

/**
 * Find contiguous groups of markdown table lines (lines starting with |)
 * and wrap them in <ComparisonTable> with blank-line padding so MDX
 * processes the inner markdown correctly.
 */
function wrapTablesInComparisonTable(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trimStart().startsWith('|')) {
      // Collect all table lines
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }

      result.push('<ComparisonTable>')
      result.push('')
      result.push(...tableLines)
      result.push('')
      result.push('</ComparisonTable>')
      result.push('')
    } else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

// ─── Blockquote → Callout Transform ────────────────────────────────────────

function transformBlockquotes(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('> ') || line === '>') {
      const blockLines: string[] = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        blockLines.push(lines[i])
        i++
      }

      const stripped = blockLines.map(l => (l === '>' ? '' : l.slice(2)))
      const firstContent = stripped.find(l => l.trim().length > 0) ?? ''
      const titleMatch = firstContent.match(/^\*\*([^*]+)\*\*\s*$/)

      if (titleMatch) {
        const title = titleMatch[1].trim()
        const firstContentIdx = stripped.findIndex(l => l.trim().length > 0)
        const bodyLines = stripped.slice(firstContentIdx + 1)
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
        // Plain blockquote → note callout
        const body = stripped.join('\n').trim()
        if (body) {
          result.push('<Callout variant="note">')
          result.push('')
          result.push(body)
          result.push('')
          result.push('</Callout>')
          result.push('')
        }
      }
    } else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

// ─── Inject Authority Callout ──────────────────────────────────────────────

/**
 * After the "Legal and Regulatory Basis" heading, inject an authority callout
 * summarising the RA 9266 basis for this SPP document.
 */
function injectAuthorityCallout(content: string): string {
  const authorityBlock = `
<Callout variant="authority" title="Legal Authority: R.A. No. 9266 — The Architecture Act of 2004">

This SPP document is promulgated as part of the Supplemental Implementing Rules and Regulations (IRR) of **Republic Act No. 9266**, approved 27 July 2010. Compliance is mandatory for all Registered and Licensed Architects (RLAs) and Architectural Firms (AFs) in the Philippines.

</Callout>
`

  // Only inject if the heading exists and callout hasn't been injected already
  if (
    content.includes('## Legal and Regulatory Basis') &&
    !content.includes('Legal Authority: R.A. No. 9266')
  ) {
    return content.replace(
      /## Legal and Regulatory Basis\n/,
      `## Legal and Regulatory Basis\n${authorityBlock}`,
    )
  }
  return content
}

// ─── Inject ALE Watch Callouts ─────────────────────────────────────────────

function injectAleWatchCallouts(
  content: string,
  watches: Array<{ afterHeading: string; content: string }>,
): string {
  let result = content

  for (const watch of watches) {
    const callout = `
<Callout variant="ale-watch">

${watch.content}

</Callout>
`
    // Match ## or ### heading containing the afterHeading text (case-insensitive)
    const escapedHeading = watch.afterHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const headingRegex = new RegExp(`(#{2,3}\\s+[^\\n]*${escapedHeading}[^\\n]*\\n)`, 'i')

    if (headingRegex.test(result) && !result.includes(watch.content.slice(0, 40))) {
      result = result.replace(headingRegex, `$1${callout}`)
    }
  }

  return result
}

// ─── Full Pipeline ─────────────────────────────────────────────────────────

function enrichContent(rawContent: string, fileName: string): string {
  let c = rawContent

  // 1. Strip footnote inline refs
  c = stripFootnoteRefs(c)

  // 2. Strip References section
  c = stripReferencesSection(c)

  // 3. Wrap tables before blockquote transform (tables have their own lines)
  c = wrapTablesInComparisonTable(c)

  // 4. MDX safety
  c = escapeMdxTags(c)

  // 5. Blockquotes → Callout
  c = transformBlockquotes(c)

  // 6. Authority callout for RA 9266
  c = injectAuthorityCallout(c)

  // 7. Per-doc ALE Watch callouts
  const watches = ALE_WATCH[fileName] ?? []
  c = injectAleWatchCallouts(c, watches)

  return c
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { error: pingError } = await supabase.from('wiki_articles').select('article_id').limit(1)
  if (pingError) {
    console.error('❌ Database connection failed:', pingError.message)
    process.exit(1)
  }

  console.log(`\n✨ Enriching ${ARTICLES.length} SPP Documents\n`)

  const results: { file: string; article_id: string }[] = []
  const errors: { file: string; error: string }[] = []

  for (const { file, article_id } of ARTICLES) {
    const filePath = path.join(SPP_DOCS_DIR, file)

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      const raw = fs.readFileSync(filePath, 'utf-8')
      const enriched = enrichContent(raw, file)

      const { error } = await supabase
        .from('wiki_articles')
        .update({ content: enriched })
        .eq('article_id', article_id)

      if (error) throw new Error(error.message)

      results.push({ file, article_id })
      console.log(`  ✓ ${file}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push({ file, error: msg })
      console.error(`  ✗ ${file}`)
      console.error(`      ${msg}`)
    }
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`  ✓ Enriched: ${results.length} / ${ARTICLES.length}`)
  if (errors.length > 0) {
    console.log(`  ✗ Failed:   ${errors.length}`)
    for (const e of errors) console.log(`    ${e.file}: ${e.error}`)
  } else {
    console.log(`  ✗ Failed:   0`)
  }
  console.log('─'.repeat(60))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
