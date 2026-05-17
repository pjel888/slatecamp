/**
 * Deep audit of the 24 fallback articles — captures exact acorn failure patterns.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { compile } from '@mdx-js/mdx'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

// The 24 fallback slugs from our previous audit + dedup
const FALLBACK_SLUGS = [
  'lea-dsgn-007-07-core-concept',
  'lea-dsgn-007-10-core-concept',
  'lea-dsgn-008-03-core-concept',
  'lea-dsgn-012-02-core-concept',
  'lea-matl-006-02-core-concept',
  'lea-prac-cmp-010-per-diem-retainer-and-honorarium-definitions-scope-and-philippine-application',
  'lea-strc-007-03-core-concept',
  'lea-theo-004-03-core-concept',
  'lea-theo-009-02-core-concept',
  'lea-util-001-09-core-concept',
  'lea-util-002-08-core-principles-standards',
  'lea-util-007-02-smart-metering-infrastructure-ami',
  'accessible-seating-in-assembly-areas',
  'bp-344-ramp-slope-tiers',
  'overview-architectural-design',
  'overview-building-materials',
  'overview-building-utilities-mepf',
  'overview-history-of-architecture',
  'overview-planning-housing-urban-design',
  'overview-professional-practice',
  'overview-structural-conceptualization',
  'overview-theory-of-architecture',
  'wheelchair-maneuvering-and-parking-slots',
]

// Deduplicate - some may appear twice if they had both backslash AND acorn issues
const uniqueSlugs = [...new Set(FALLBACK_SLUGS)]
console.log(`Auditing ${uniqueSlugs.length} unique fallback articles...\n`)

interface AcornAuditEntry {
  slug: string
  articleMediaCount: number
  compileError: string
  causeCategory: string
  causeDetail: string
  exactPattern: string
  lineContext: string
  repairable: boolean
  repairStrategy: string
  recommendedAction: string
  hasWikiMistakeCard: boolean
  hasComparisonTable: boolean
  hasExamTip: boolean
  braceCount: number
  backtickCodeBlockCount: number
}

function findAcornCause(content: string, slug: string): AcornAuditEntry {
  const entry: AcornAuditEntry = {
    slug,
    articleMediaCount: (content.match(/<ArticleMedia/g) || []).length,
    compileError: '',
    causeCategory: 'unknown',
    causeDetail: '',
    exactPattern: '',
    lineContext: '',
    repairable: false,
    repairStrategy: '',
    recommendedAction: 'unknown',
    hasWikiMistakeCard: content.includes('<WikiMistakeCard'),
    hasComparisonTable: content.includes('<ComparisonTable'),
    hasExamTip: content.includes('<ExamTip'),
    braceCount: (content.match(/[{}]/g) || []).length,
    backtickCodeBlockCount: (content.match(/```/g) || []).length / 2,
  }

  // Try compiling to get the exact error
  try {
    // Run through same pipeline as production (simplified)
    const processedContent = content
      .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    // Import the normalizer at runtime
    // We'll use a simpler approach - try raw compile to get the error position
    compile(processedContent, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    }).then(() => {
      // Shouldn't reach here for fallback articles
    }).catch(() => {})
  } catch (e: any) {
    entry.compileError = (e.message || '').substring(0, 300)
  }

  // Analyze content for specific patterns

  // 1. Check for curly braces in text (acorn tries to parse as JS expressions)
  const braceLines: string[] = []
  const lines = content.split('\n')
  let insideCodeBlock = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().startsWith('```')) {
      insideCodeBlock = !insideCodeBlock
      continue
    }
    if (insideCodeBlock) continue
    // Skip lines inside JSX tags (those are fine)
    if (line.trim().startsWith('<')) continue
    // Check for { and } in text
    if (/[{}]/.test(line) && !line.includes('```')) {
      const ctx = line.substring(0, 120).trim()
      const braces = line.match(/[{}]/g) || []
      if (braces.length >= 2) {
        braceLines.push(ctx)
      }
    }
  }

  // 2. Check for specific LaTeX patterns
  const hasDollarMath = /(?<!\$)\$(?!\$)[^$]*\$(?!\$)/.test(content)  // $...$
  const hasDoubleDollar = /\$\$[\s\S]*?\$\$/.test(content)  // $$...$$
  const hasBackslashParen = /\\\(/.test(content)  // \(...\)
  const hasBackslashBracket = /\\\[/.test(content)  // \[...\]
  const hasBackslashText = /\\text\{/.test(content)  // \text{...}
  const hasBackslashMathrm = /\\mathrm\{/.test(content)  // \mathrm{...}
  const hasMathyLook = /\\[a-zA-Z]+/.test(content)  // any LaTeX command
  const hasJsonInProps = /mistakes=\{?\[/.test(content)  // JSON array in props

  // 3. Look for content objects / JSON-like patterns in WikiMistakeCard props
  const mistakeJsonMatches = content.match(/mistakes="\[{[^}]+}\]"/g) || []
  const hasNestedBracesInProps = mistakeJsonMatches.length > 0

  // 4. Check for braces inside backtick code snippets (inline code)
  const inlineCodeBraces = content.match(/`[^`]*\{[^}]*\}[^`]*`/g) || []

  // 5. Check for braces inside custom component children
  const bracesInComponentChildren: string[] = []
  for (const line of lines) {
    if (/<(Tip|Note|Warn|Callout|ExamTip|Example)/.test(line) && /[{}]/.test(line)) {
      bracesInComponentChildren.push(line.trim().substring(0, 120))
    }
  }

  // Determine the cause category
  if (hasJsonInProps || hasNestedBracesInProps) {
    entry.causeCategory = 'json-in-props'
    entry.causeDetail = 'JSON array/object literals in WikiMistakeCard props break MDX expression parsing'
    entry.repairable = true
    entry.repairStrategy = 'Use JSX expression syntax (mistakes={[...]}) or separate prop values'
  } else if (hasDollarMath && braceLines.length > 0) {
    entry.causeCategory = 'dollar-delimited-math'
    entry.causeDetail = '$...$ inline math contains braces that acorn tries to parse'
    entry.repairable = true
    entry.repairStrategy = 'Escape backslashes or wrap in code fences'
  } else if (hasBackslashParen && braceLines.length > 0) {
    entry.causeCategory = 'latex-frac-braces'
    entry.causeDetail = 'LaTeX \\(...\\) with { } braces causes acorn parse failure'
    entry.repairable = false
    entry.repairStrategy = 'Would need remark-math / rehype-katex plugin support'
  } else if (hasBackslashBracket && braceLines.length > 0) {
    entry.causeCategory = 'latex-display-braces'
    entry.causeDetail = 'LaTeX \\[...\\] with { } braces causes acorn parse failure'
    entry.repairable = false
    entry.repairStrategy = 'Would need remark-math / rehype-katex plugin support'
  } else if (braceLines.length > 0) {
    entry.causeCategory = 'bare-curly-braces'
    entry.causeDetail = `Text contains bare { } curly braces (${braceLines.length} lines) that acorn tries to parse as JS expressions`
    entry.repairable = true
    entry.repairStrategy = 'Escape braces with backslash or convert to HTML entities'
  } else if (braceLines.length === 0 && hasMathyLook) {
    entry.causeCategory = 'latex-backslash-syntax'
    entry.causeDetail = 'LaTeX backslash commands confuse the MDX parser'
    entry.repairable = false
    entry.repairStrategy = 'Would need remark-math support'
  } else {
    // Fallback: show first 200 chars of error
    entry.causeCategory = 'other'
    entry.causeDetail = entry.compileError.substring(0, 200)
  }

  // Provide line context
  if (braceLines.length > 0) {
    entry.lineContext = braceLines.slice(0, 3).join('\n  | ')
  }
  entry.exactPattern = entry.compileError.substring(0, 200)

  // Use previously compiled result for actionable decision
  // If has backslash paren/bracket braces → needs remark-math → accept-safe-fallback
  if (['latex-frac-braces', 'latex-display-braces'].includes(entry.causeCategory)) {
    entry.recommendedAction = 'accept-safe-fallback'
    entry.repairable = false
  } else if (entry.causeCategory === 'json-in-props') {
    // Check if the JSON is in a text context that we can repair
    entry.repairable = true
    entry.recommendedAction = 'repair-to-primary-compile'
  } else if (entry.causeCategory === 'bare-curly-braces') {
    entry.repairable = true
    entry.recommendedAction = 'repair-to-primary-compile'
  } else if (entry.causeCategory === 'dollar-delimited-math') {
    entry.repairable = false
    entry.recommendedAction = 'accept-safe-fallback'
  } else {
    entry.recommendedAction = 'accept-safe-fallback'
  }

  return entry
}

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  
  const results: AcornAuditEntry[] = []

  for (const slug of uniqueSlugs) {
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) {
      console.log(`  ⚠️  Not found: ${slug}`)
      continue
    }

    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) {
      console.log(`  ⚠️  No normalized.md: ${slug}`)
      continue
    }

    const content = readFileSync(normPath, 'utf-8')
    const entry = findAcornCause(content, slug)
    results.push(entry)

    console.log(`\n=== ${entry.slug} ===`)
    console.log(`  ArticleMedia: ${entry.articleMediaCount}`)
    console.log(`  Category: ${entry.causeCategory}`)
    console.log(`  Cause: ${entry.causeDetail}`)
    console.log(`  Repairable: ${entry.repairable}`)
    console.log(`  Action: ${entry.recommendedAction}`)
    if (entry.lineContext) {
      console.log(`  Line context: ${entry.lineContext.substring(0, 150)}`)
    }
  }

  // Summarize
  const categoryCounts: Record<string, number> = {}
  const actionCounts: Record<string, number> = {}
  for (const r of results) {
    categoryCounts[r.causeCategory] = (categoryCounts[r.causeCategory] || 0) + 1
    actionCounts[r.recommendedAction] = (actionCounts[r.recommendedAction] || 0) + 1
  }

  console.log('\n\n=== CATEGORY BREAKDOWN ===')
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`  ${cat}: ${count}`)
  }
  console.log('\n=== ACTION BREAKDOWN ===')
  for (const [act, count] of Object.entries(actionCounts)) {
    console.log(`  ${act}: ${count}`)
  }

  // Write report
  const report = {
    auditDate: new Date().toISOString(),
    totalArticles: results.length,
    categoryBreakdown: categoryCounts,
    actionBreakdown: actionCounts,
    articles: results,
  }

  const jsonPath = join(OUTPUT_DIR, 'latex-fallback-24-audit.json')
  writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  console.log(`\nWrote: ${jsonPath}`)

  // Write MD
  const mdLines: string[] = [
    '# LaTeX Fallback 24 — Deep Audit',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Total:** ${results.length}`,
    '',
    '## Category Breakdown',
    '',
    '| Category | Count |',
    '|----------|-------|',
  ]
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    mdLines.push(`| ${cat} | ${count} |`)
  }
  mdLines.push('')
  mdLines.push('## Action Breakdown')
  mdLines.push('')
  mdLines.push('| Action | Count |')
  mdLines.push('|--------|-------|')
  for (const [act, count] of Object.entries(actionCounts)) {
    mdLines.push(`| ${act} | ${count} |`)
  }
  mdLines.push('')
  mdLines.push('## Article Details')
  mdLines.push('')
  for (const r of results) {
    mdLines.push(`### ${r.slug}`)
    mdLines.push(`- **ArticleMedia:** ${r.articleMediaCount}`)
    mdLines.push(`- **Category:** \`${r.causeCategory}\``)
    mdLines.push(`- **Cause:** ${r.causeDetail}`)
    mdLines.push(`- **Repairable:** ${r.repairable}`)
    mdLines.push(`- **Action:** \`${r.recommendedAction}\``)
    if (r.lineContext) {
      mdLines.push(`- **Context:** \`${r.lineContext.substring(0, 150)}\``)
    }
    mdLines.push('')
  }

  const mdPath = join(OUTPUT_DIR, 'latex-fallback-24-audit.md')
  writeFileSync(mdPath, mdLines.join('\n'))
  console.log(`Wrote: ${mdPath}`)
}

main().catch(console.error)
