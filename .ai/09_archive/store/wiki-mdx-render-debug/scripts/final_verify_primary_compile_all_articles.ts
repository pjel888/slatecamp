/**
 * Final pipeline verification: all 567 articles with repairs applied.
 * Tests each article through the full pipeline and reports results.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts, normalizeWikiMdxComponentBlocks, createMdxFallbackSource } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

// Repair function for ArticleMedia backslash-escaped tags
function repairArticleMedia(content: string): string {
  let fixed = content.replace(
    /(<ArticleMedia[\s\S]*?"[^"]*?)\\"\s+caption=\\"([^"]*?)\\"\s+suggestedAsset=\\"([^"]*?)\\"\s+placementIntent=\\"([^"]*?)\\"\s*\/>/g,
    (_, p1, c, s, pi) => `${p1}" caption="${c}" suggestedAsset="${s}" placementIntent="${pi}" />`
  )
  fixed = fixed.replace(/<ArticleMedia[\s\S]*?\/>/g, (tag: string) => {
    if (tag.includes('\\"')) return tag.replace(/\\"/g, '"')
    return tag
  })
  return fixed
}

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  
  console.log(`Testing ${dirs.length} articles through full pipeline...\n`)
  
  let withMedia = 0
  let primaryPass = 0
  let fallbackUsed = 0
  let fallbackPreservesMedia = 0
  let mediaLost = 0
  let totalFallback = 0
  const fallbackDetails: { slug: string; reason: string }[] = []
  
  for (const dir of dirs) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    let content = readFileSync(normPath, 'utf-8')
    
    // Apply ArticleMedia repairs
    content = repairArticleMedia(content)
    
    // Count ArticleMedia tags
    const mediaCount = (content.match(/<ArticleMedia/g) || []).length
    if (mediaCount === 0) continue
    withMedia++
    
    // Full pipeline
    const cleaned = content
      .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    // Check fallback source for ArticleMedia preservation
    const fallbackSource = createMdxFallbackSource(processed)
    const mediaInFallback = (fallbackSource.match(/<ArticleMedia/g) || []).length > 0
    
    // Primary compile
    let primaryCompiled = false
    try {
      const result = await compile(sanitized, {
        outputFormat: 'function-body',
        providerImportSource: undefined,
        development: false,
      })
      const code = String(result)
      primaryCompiled = code.includes('ArticleMedia')
      
      if (primaryCompiled) {
        primaryPass++
      } else {
        mediaLost++
        fallbackDetails.push({ slug, reason: 'primary-compile-succeeded-but-no-articlemedia' })
      }
    } catch (err: any) {
      if (mediaInFallback) {
        fallbackUsed++
        fallbackPreservesMedia++
        // Categorize the reason
        const msg = (err.message || '').substring(0, 100)
        totalFallback++
        const reason = msg.includes('acorn') ? 'acorn-parse-error' : 
                       msg.includes('Unexpected character') ? 'backslash-jsx' :
                       msg.includes('Unexpected end of file') ? 'unclosed-string' : 'other'
        fallbackDetails.push({ slug, reason })
      } else {
        mediaLost++
        fallbackDetails.push({ slug, reason: 'fallback-strips-articlemedia' })
      }
    }
  }
  
  // Write report
  const report = {
    verification_date: new Date().toISOString(),
    total_articles_scanned: dirs.length,
    articles_with_articlemedia: withMedia,
    primary_compile_pass: primaryPass,
    fallback_used: fallbackUsed,
    fallback_preserves_articlemedia: fallbackPreservesMedia,
    articlemedia_lost: mediaLost,
    fallback_details: fallbackDetails,
  }
  
  const jsonPath = join(OUTPUT_DIR, 'final-primary-compile-verification.json')
  writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  
  const mdLines = [
    '# Final Primary Compile Verification',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Total articles scanned:** ${dirs.length}`,
    `**Articles with ArticleMedia:** ${withMedia}`,
    '',
    '## Results',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    `| Primary compile + ArticleMedia in output | ${primaryPass} |`,
    `| Fallback used, ArticleMedia preserved | ${fallbackPreservesMedia} |`,
    `| ArticleMedia lost | ${mediaLost} |`,
    `| Total fallback | ${fallbackUsed} |`,
    '',
    '## Fallback Breakdown',
    '',
    '| Reason | Count |',
    '|--------|-------|',
  ]
  
  const reasonCounts: Record<string, number> = {}
  for (const d of fallbackDetails) {
    reasonCounts[d.reason] = (reasonCounts[d.reason] || 0) + 1
  }
  for (const [reason, count] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) {
    mdLines.push(`| ${reason} | ${count} |`)
  }
  mdLines.push('')
  mdLines.push('## Fallback Article Details')
  mdLines.push('')
  for (const d of fallbackDetails) {
    mdLines.push(`- \`${d.slug}\`: ${d.reason}`)
  }
  mdLines.push('')
  mdLines.push('## Summary')
  mdLines.push('')
  mdLines.push(`- **${withMedia}** articles with ArticleMedia`)
  mdLines.push(`- **${primaryPass}** primary compile success (${Math.round(primaryPass/withMedia*100)}%)`)
  mdLines.push(`- **${fallbackPreservesMedia}** fallback with ArticleMedia preserved (${Math.round(fallbackPreservesMedia/withMedia*100)}%)`)
  mdLines.push(`- **${mediaLost}** ArticleMedia lost (${Math.round(mediaLost/withMedia*100)}%)`)
  mdLines.push(`- **Total with ArticleMedia intact: ${primaryPass + fallbackPreservesMedia} (${Math.round((primaryPass+fallbackPreservesMedia)/withMedia*100)}%)**`)
  
  writeFileSync(join(OUTPUT_DIR, 'final-primary-compile-verification.md'), mdLines.join('\n'))
  
  console.log(`\n=== FINAL PIPELINE VERIFICATION ===`)
  console.log(`Articles with ArticleMedia: ${withMedia}`)
  console.log(`Primary compile + ArticleMedia: ${primaryPass}`)
  console.log(`Fallback with ArticleMedia preserved: ${fallbackPreservesMedia}`)
  console.log(`ArticleMedia lost: ${mediaLost}`)
  console.log(`Total ArticleMedia intact: ${primaryPass + fallbackPreservesMedia}/${withMedia} (${Math.round((primaryPass+fallbackPreservesMedia)/withMedia*100)}%)`)
  console.log(`\nWrote reports to: ${OUTPUT_DIR}/final-primary-compile-verification.*`)
}

main().catch(console.error)
