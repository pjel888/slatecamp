import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  BLOCK_WIKI_COMPONENTS,
  REGISTERED_WIKI_COMPONENTS,
  SELF_CLOSING_WIKI_COMPONENTS,
} from '../../../../src/lib/wiki-component-registry'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

interface ScanResult {
  slug: string
  filePath: string
  issues: MalformedIssue[]
  hasAnyIssue: boolean
}

interface MalformedIssue {
  type: string
  description: string
  lineNumber: number
  snippet: string
}

function scanArticle(slug: string, dirPath: string): ScanResult {
  const result: ScanResult = {
    slug,
    filePath: dirPath,
    issues: [],
    hasAnyIssue: false,
  }

  const normalizedPath = join(dirPath, 'normalized.md')
  if (!existsSync(normalizedPath)) return result

  const content = readFileSync(normalizedPath, 'utf-8')
  const lines = content.split('\n')

  // Track open/close pairs
  const openStack: { name: string; line: number }[] = []
  let insideCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Track code fences
    if (trimmed.startsWith('```')) {
      insideCodeBlock = !insideCodeBlock
      continue
    }
    if (insideCodeBlock) continue

    // Check for same-line paired block components: <Component>content</Component>
    for (const componentName of BLOCK_WIKI_COMPONENTS) {
      const sameLinePattern = new RegExp(
        `<${componentName}(?:\\s[^>]*)?>[^\\n]+</${componentName}>`
      )
      if (sameLinePattern.test(trimmed)) {
        result.issues.push({
          type: 'same-line-paired',
          description: `${componentName} has content on the same line as both opening and closing tags`,
          lineNumber: i + 1,
          snippet: trimmed.substring(0, 120),
        })
      }
    }

    // Check for missing blank line after opening tag
    // Pattern: <Component> + non-blank-line content (but not self-closing)
    const openMatch = trimmed.match(
      new RegExp(`^<(${Array.from(BLOCK_WIKI_COMPONENTS).join('|')})(\\s[^>]*)?>$`)
    )
    if (openMatch) {
      const compName = openMatch[1]
      // Check next line - skip blank lines, check if there's content
      let nextNonBlank = i + 1
      while (nextNonBlank < lines.length && lines[nextNonBlank].trim() === '') {
        nextNonBlank++
      }
      if (nextNonBlank < lines.length) {
        const nextContent = lines[nextNonBlank].trim()
        // If next content starts another tag or is prose, there's no blank line separation
        // Actually the key check is: is there AT LEAST one blank line between the tag and content?
        if (nextNonBlank === i + 1) {
          // No blank lines at all
          result.issues.push({
            type: 'missing-blank-after-open',
            description: `${compName} opening tag at line ${i+1} has no blank line before content at line ${nextNonBlank+1}`,
            lineNumber: i + 1,
            snippet: trimmed.substring(0, 80) + ' ... ' + nextContent.substring(0, 80),
          })
        }
      }
      openStack.push({ name: compName, line: i })
    }

    // Check for closed tags matching
    const closeMatch = trimmed.match(
      new RegExp(`^</(${Array.from(REGISTERED_WIKI_COMPONENTS).join('|')})>$`)
    )
    if (closeMatch) {
      const closeName = closeMatch[1]
      if (openStack.length > 0 && openStack[openStack.length - 1].name === closeName) {
        openStack.pop()
      } else {
        // Mismatched or extra closing tag
        result.issues.push({
          type: 'mismatched-close',
          description: `Unexpected closing tag </${closeName}> — no matching open tag`,
          lineNumber: i + 1,
          snippet: trimmed.substring(0, 80),
        })
      }
    }

    // Check for broken self-closing tags
    const selfCloseMatch = trimmed.match(
      new RegExp(`^<(${Array.from(REGISTERED_WIKI_COMPONENTS).join('|')})(\\s[^>]*)?\\s*\\/?>$`)
    )
    if (selfCloseMatch) {
      const compName = selfCloseMatch[1]
      const hasSelfClose = trimmed.includes('/>')
      if (hasSelfClose && SELF_CLOSING_WIKI_COMPONENTS.has(compName)) {
        // Valid self-closing tag
      } else if (!hasSelfClose && BLOCK_WIKI_COMPONENTS.has(compName)) {
        // Paired component - handled by open/close tracking above
      }
    }
  }

  // Report unclosed tags
  while (openStack.length > 0) {
    const unclosed = openStack.pop()!
    result.issues.push({
      type: 'unclosed-tag',
      description: `${unclosed.name} opened at line ${unclosed.line + 1} is never closed`,
      lineNumber: unclosed.line + 1,
      snippet: `</${unclosed.name}> never found`,
    })
  }

  result.hasAnyIssue = result.issues.length > 0
  return result
}

// --- Main ---
const articleDirs = existsSync(ARTICLES_DIR)
  ? readFileSync(join(ARTICLES_DIR, '..', 'manifest.json'), 'utf-8')
  : null

let slugs: string[] = []

if (articleDirs) {
  try {
    const manifest = JSON.parse(articleDirs)
    slugs = manifest.articles?.map((a: any) => a.slug) || []
  } catch {
    slugs = []
  }
}

// Fallback: read from filesystem
if (slugs.length === 0) {
  const entries = readFileSync('/dev/stdin', 'utf-8').trim().split('\n')
  for (const entry of entries) {
    const slug = entry.replace(/--[a-f0-9-]+$/, '').trim()
    if (slug) slugs.push(slug)
  }
}

// Actually just read the dirs
slugs = []

import { readdirSync } from 'fs'
const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
for (const dir of dirs) {
  if (dir.isDirectory()) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    slugs.push(slug)
  }
}

console.log(`Scanning ${slugs.length} articles...`)

const allResults: ScanResult[] = []
let articlesWithIssues = 0
let totalIssues = 0

const issueCounts: Record<string, number> = {}

for (const slug of slugs) {
  // Find the actual directory
  const dirEntry = readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .find(d => d.name.startsWith(slug))

  if (!dirEntry) continue

  const result = scanArticle(slug, join(ARTICLES_DIR, dirEntry.name))
  allResults.push(result)

  if (result.hasAnyIssue) {
    articlesWithIssues++
    totalIssues += result.issues.length
    for (const issue of result.issues) {
      issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1
    }
  }
}

// Write JSON report
const report = {
  scanDate: new Date().toISOString(),
  totalArticles: slugs.length,
  articlesWithIssues,
  totalIssues,
  issueTypeBreakdown: issueCounts,
  articles: allResults.filter(r => r.hasAnyIssue).map(r => ({
    slug: r.slug,
    issueCount: r.issues.length,
    issues: r.issues,
  })),
}

const jsonPath = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug/malformed-mdx-component-scan.json'
const mdPath = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug/malformed-mdx-component-scan.md'

// Ensure dirs exist
import { mkdirSync } from 'fs'
mkdirSync('/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug', { recursive: true })

writeFileSync(jsonPath, JSON.stringify(report, null, 2))
console.log(`Wrote JSON report to ${jsonPath}`)

// Write MD report
const mdLines: string[] = []
mdLines.push('# Malformed MDX Component Scan Report')
mdLines.push('')
mdLines.push(`**Scan date:** ${new Date().toISOString()}`)
mdLines.push(`**Total articles scanned:** ${slugs.length}`)
mdLines.push(`**Articles with issues:** ${articlesWithIssues}`)
mdLines.push(`**Total issues found:** ${totalIssues}`)
mdLines.push('')
mdLines.push('## Issue Type Breakdown')
mdLines.push('')
mdLines.push('| Type | Count |')
mdLines.push('|------|-------|')
for (const [type, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
  mdLines.push(`| ${type} | ${count} |`)
}
mdLines.push('')
mdLines.push('## Articles with Issues')
mdLines.push('')
for (const article of report.articles) {
  mdLines.push(`### ${article.slug}`)
  mdLines.push(`**Issues:** ${article.issueCount}`)
  mdLines.push('')
  for (const issue of article.issues) {
    mdLines.push(`- **[${issue.type}]** Line ${issue.lineNumber}: ${issue.description}`)
    mdLines.push(`  \`${issue.snippet}\``)
  }
  mdLines.push('')
}

writeFileSync(mdPath, mdLines.join('\n'))
console.log(`Wrote MD report to ${mdPath}`)

// Print summary
console.log('\n=== SUMMARY ===')
console.log(`Total articles: ${slugs.length}`)
console.log(`Articles with issues: ${articlesWithIssues}`)
console.log(`Total issues: ${totalIssues}`)
console.log('\nIssue type breakdown:')
for (const [type, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`)
}
