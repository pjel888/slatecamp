/**
 * Audit 76 fallback articles — captures exact compile error for each.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

interface FallbackAuditEntry {
  slug: string
  dir: string
  hasArticleMedia: boolean
  articleMediaCount: number
  compileError: string
  errorCategory: string
  errorLineHint: string
  repairable: boolean
  repairAction: string
}

async function auditArticle(slug: string, dirPath: string): Promise<FallbackAuditEntry> {
  const normPath = join(dirPath, 'normalized.md')
  const entry: FallbackAuditEntry = {
    slug,
    dir: dirPath,
    hasArticleMedia: false,
    articleMediaCount: 0,
    compileError: '',
    errorCategory: 'unknown',
    errorLineHint: '',
    repairable: false,
    repairAction: '',
  }

  if (!existsSync(normPath)) return entry

  const rawContent = readFileSync(normPath, 'utf-8')

  // Check for ArticleMedia
  entry.articleMediaCount = (rawContent.match(/<ArticleMedia/g) || []).length
  entry.hasArticleMedia = entry.articleMediaCount > 0
  if (!entry.hasArticleMedia) return entry

  // Run full pipeline
  const cleaned = rawContent
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  const processedContent = injectEIPrompts(cleaned, [])
  const sanitizedContent = sanitizeMDX(processedContent)

  // Try primary compile
  try {
    await compile(sanitizedContent, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
    // If we get here, it doesn't need fallback — unexpected
    entry.compileError = 'NO_ERROR'
    entry.errorCategory = 'no-error'
    return entry
  } catch (err: any) {
    const msg = err.message || String(err)
    entry.compileError = msg.substring(0, 500)

    // Categorize the error
    if (msg.includes('Unexpected character')) {
      entry.errorCategory = 'invalid-jsx-syntax'
    } else if (msg.includes('Expected a closing tag')) {
      entry.errorCategory = 'unclosed-tag'
    } else if (msg.includes('Could not parse expression with acorn')) {
      entry.errorCategory = 'acorn-parse-error'
    } else if (msg.includes('Could not parse') || msg.includes('SyntaxError')) {
      entry.errorCategory = 'syntax-error'
    } else if (msg.includes('Unexpected token')) {
      entry.errorCategory = 'unexpected-token'
    } else if (msg.includes('expected a value for the attribute')) {
      entry.errorCategory = 'invalid-attribute'
    } else if (msg.includes('Can\'t resolve') || msg.includes('Cannot find module')) {
      entry.errorCategory = 'module-resolution'
    } else if (msg.includes('not defined') || msg.includes('is not defined')) {
      entry.errorCategory = 'undefined-variable'
    } else if (msg.includes('JSX')) {
      entry.errorCategory = 'jsx-error'
    } else if (msg.includes('EOL')) {
      entry.errorCategory = 'line-ending'
    } else {
      entry.errorCategory = 'other'
    }

    // Try to extract line number
    const lineMatch = msg.match(/\((\d+):(\d+)\)/)
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1])
      entry.errorLineHint = sanitizedContent.split('\n').slice(Math.max(0, lineNum - 3), lineNum + 2).join('\n').substring(0, 300)
    }

    // Determine if repairable
    if (
      entry.errorCategory === 'unclosed-tag' ||
      entry.errorCategory === 'invalid-jsx-syntax' ||
      entry.errorCategory === 'unexpected-token' ||
      entry.errorCategory === 'acorn-parse-error' ||
      entry.errorCategory === 'invalid-attribute'
    ) {
      entry.repairable = true
      entry.repairAction = 'normalize MDX syntax or fix component boundary'
    }
  }

  return entry
}

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({
      slug: d.name.replace(/--[a-f0-9-]+$/, ''),
      path: join(ARTICLES_DIR, d.name),
    }))

  console.log(`Auditing ${dirs.length} articles for fallback causes...`)

  // First pass: find all articles with ArticleMedia that trigger fallback
  const results: FallbackAuditEntry[] = []

  for (const dir of dirs) {
    const result = await auditArticle(dir.slug, dir.path)
    if (result.hasArticleMedia && result.compileError !== 'NO_ERROR') {
      results.push(result)
    }
  }

  // Categorize
  const categoryCounts: Record<string, number> = {}
  for (const r of results) {
    categoryCounts[r.errorCategory] = (categoryCounts[r.errorCategory] || 0) + 1
  }

  console.log(`\n=== FALLBACK AUDIT RESULTS ===`)
  console.log(`Total ArticleMedia articles triggering fallback: ${results.length}`)
  console.log(`\nBy category:`)
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`)
  }

  // Detailed report
  const report = {
    audit_date: new Date().toISOString(),
    total_fallback_articles: results.length,
    category_breakdown: categoryCounts,
    articles: results.map(r => ({
      slug: r.slug,
      article_media_count: r.articleMediaCount,
      error_category: r.errorCategory,
      error_preview: r.compileError.substring(0, 200),
      repairable: r.repairable,
      repair_action: r.repairAction,
    })),
    repairable_count: results.filter(r => r.repairable).length,
    unrepairable_count: results.filter(r => !r.repairable).length,
  }

  // Write JSON
  const jsonPath = join(OUTPUT_DIR, 'fallback-76-audit.json')
  writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  console.log(`\nWrote: ${jsonPath}`)

  // Write MD
  const mdLines: string[] = []
  mdLines.push('# Fallback 76 ArticleMedia Audit')
  mdLines.push('')
  mdLines.push(`**Audit date:** ${new Date().toISOString()}`)
  mdLines.push(`**Total ArticleMedia articles triggering fallback:** ${results.length}`)
  mdLines.push('')
  mdLines.push('## Category Breakdown')
  mdLines.push('')
  mdLines.push('| Category | Count |')
  mdLines.push('|----------|-------|')
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    mdLines.push(`| ${cat} | ${count} |`)
  }
  mdLines.push('')
  mdLines.push(`**Repairable:** ${report.repairable_count}`)
  mdLines.push(`**Unrepairable / Acceptable fallback:** ${report.unrepairable_count}`)
  mdLines.push('')
  mdLines.push('## Articles')
  mdLines.push('')
  for (const article of report.articles) {
    mdLines.push(`### ${article.slug}`)
    mdLines.push(`- ArticleMedia: ${article.article_media_count}`)
    mdLines.push(`- Category: \`${article.error_category}\``)
    mdLines.push(`- Repairable: ${article.repairable}`)
    mdLines.push(`- Error: \`${article.error_preview}\``)
    if (article.repair_action) {
      mdLines.push(`- Repair: ${article.repair_action}`)
    }
    mdLines.push('')
  }

  const mdPath = join(OUTPUT_DIR, 'fallback-76-audit.md')
  writeFileSync(mdPath, mdLines.join('\n'))
  console.log(`Wrote: ${mdPath}`)
}

main().catch(console.error)
