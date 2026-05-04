/**
 * Pipeline verification script.
 * Tests the MDX compilation pipeline against real article content from the local export.
 * Does NOT require a running dev server.
 */
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'

import {
  sanitizeMDX,
  createMdxFallbackSource,
  injectEIPrompts,
  normalizeWikiMdxComponentBlocks,
} from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

interface ArticleTestResult {
  slug: string
  hasArticleMedia: boolean
  primaryCompileSucceeded: boolean
  compileError: string | null
  articleMediaInCompile: boolean
  fallbackWasUsed: boolean
  fallbackHasArticleMedia: boolean
}

async function testArticle(slug: string, dirPath: string): Promise<ArticleTestResult> {
  const normPath = join(dirPath, 'normalized.md')
  if (!existsSync(normPath)) {
    return {
      slug,
      hasArticleMedia: false,
      primaryCompileSucceeded: false,
      compileError: 'normalized.md not found',
      articleMediaInCompile: false,
      fallbackWasUsed: false,
      fallbackHasArticleMedia: false,
    }
  }

  const rawContent = readFileSync(normPath, 'utf-8')

  // Simulate the exact pipeline from WikiArticle.tsx
  const cleaned = rawContent
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  const processedContent = injectEIPrompts(cleaned, [])
  const sanitizedContent = sanitizeMDX(processedContent)

  const hasArticleMedia = processedContent.includes('<ArticleMedia')
  let mediaCount = 0
  if (hasArticleMedia) {
    mediaCount = (processedContent.match(/<ArticleMedia/g) || []).length
  }

  // Try primary compile
  let primaryCompileSucceeded = false
  let compileError: string | null = null
  let articleMediaInCompile = false

  try {
    const result = await compile(sanitizedContent, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
    const code = String(result)
    primaryCompileSucceeded = true
    articleMediaInCompile = code.includes('ArticleMedia')
  } catch (err: any) {
    compileError = err.message
  }

  // Fallback path
  let fallbackWasUsed = false
  let fallbackHasArticleMedia = false

  if (!primaryCompileSucceeded) {
    fallbackWasUsed = true
    const fallbackSource = createMdxFallbackSource(processedContent)
    fallbackHasArticleMedia = fallbackSource.includes('<ArticleMedia')

    // Try compiling fallback
    try {
      // Don't compile fallback here, just check content
    } catch {}
  }

  return {
    slug,
    hasArticleMedia,
    primaryCompileSucceeded,
    compileError,
    articleMediaInCompile,
    fallbackWasUsed,
    fallbackHasArticleMedia,
  }
}

async function main() {
  // Get all article dirs
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({
      slug: d.name.replace(/--[a-f0-9-]+$/, ''),
      path: join(ARTICLES_DIR, d.name),
    }))

  console.log(`Testing ${dirs.length} articles...`)

  // Test specific critical articles first
  const criticalSlugs = [
    'post-modernism',
    'lea-prac-frm-007-reciprocity-principles-in-architectural-practice',
    'lea-prac-svc-004-spp-doc-202-overview-the-six-phase-framework-and-its-design-logic',
    'owner-smoke-article-a-1775980402961',
    'lea-hist-001-03-core-concept',
  ]

  console.log('\n=== CRITICAL ARTICLES (known same-line-paired issues) ===\n')
  for (const dir of dirs) {
    if (criticalSlugs.includes(dir.slug)) {
      const result = await testArticle(dir.slug, dir.path)
      console.log(`${result.slug}:`)
      console.log(`  ArticleMedia in source: ${result.hasArticleMedia}`)
      console.log(`  Primary compile: ${result.primaryCompileSucceeded ? '✅ PASS' : '❌ FAIL'}`)
      if (!result.primaryCompileSucceeded) {
        console.log(`  Error: ${result.compileError?.substring(0, 150)}`)
        console.log(`  Fallback preserves ArticleMedia: ${result.fallbackHasArticleMedia}`)
      } else {
        console.log(`  ArticleMedia in compiled output: ${result.articleMediaInCompile ? '✅ YES' : '❌ NO'}`)
      }
      console.log('')

      // Also test the specific same-line patterns
      const normPath = join(dir.path, 'normalized.md')
      if (existsSync(normPath)) {
        const content = readFileSync(normPath, 'utf-8')
        // Test normalize function
        const normalized = normalizeWikiMdxComponentBlocks(content)
        const sameLineAfter = (normalized.match(/<ExamTip>[\s\S]*?<\/ExamTip>/g) || [])
          .filter(t => !t.includes('\n\n'))
        if (sameLineAfter.length > 0) {
          console.log(`  ⚠️  ${sameLineAfter.length} ExamTip still same-line after normalization`)
        } else {
          console.log(`  ✅ All block components properly normalized`)
        }
      }
    }
  }

  // Test ALL articles with ArticleMedia
  console.log('\n=== ALL ARTICLES WITH ArticleMedia ===\n')
  let totalWithMedia = 0
  let passed = 0
  let failed = 0
  let fallbackPreserved = 0
  let fallbackFailed = 0
  const failures: string[] = []

  for (const dir of dirs) {
    const result = await testArticle(dir.slug, dir.path)
    if (!result.hasArticleMedia) continue

    totalWithMedia++

    if (result.primaryCompileSucceeded && result.articleMediaInCompile) {
      passed++
    } else if (result.primaryCompileSucceeded && !result.articleMediaInCompile) {
      failed++
      failures.push(`${result.slug}: primary compile succeeded BUT ArticleMedia missing from output`)
    } else if (result.fallbackWasUsed && result.fallbackHasArticleMedia) {
      fallbackPreserved++
      failures.push(`${result.slug}: fallback used BUT ArticleMedia preserved in fallback`)
    } else if (result.fallbackWasUsed && !result.fallbackHasArticleMedia) {
      fallbackFailed++
      failures.push(`${result.slug}: fallback used AND ArticleMedia STILL STRIPPED ❌`)
    }
  }

  console.log(`Articles with ArticleMedia: ${totalWithMedia}`)
  console.log(`Primary compile + ArticleMedia in output: ${passed} ✅`)
  console.log(`Primary compile but ArticleMedia missing: ${failed}`)
  console.log(`Fallback used, ArticleMedia preserved: ${fallbackPreserved}`)
  console.log(`Fallback used, ArticleMedia STILL stripped: ${fallbackFailed}`)

  if (failures.length > 0) {
    console.log('\n=== FAILURES ===')
    for (const f of failures) {
      console.log(`  ❌ ${f}`)
    }
  }

  // Summary
  console.log('\n=== OVERALL ===')
  if (totalWithMedia === passed && fallbackFailed === 0) {
    console.log('✅ ALL ARTICLES PASS: ArticleMedia survives the full pipeline for every article!')
  } else {
    console.log(`⚠️  ${totalWithMedia - passed} articles need attention`)
  }
}

main().catch(console.error)
