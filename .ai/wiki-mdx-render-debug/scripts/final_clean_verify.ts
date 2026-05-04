/**
 * Final compile verification after brace escaping fix.
 * Tests ALL 567 articles for primary compile success with ArticleMedia.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts, createMdxFallbackSource } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  
  console.log(`Testing ALL ${dirs.length} articles...`)
  
  let total = 0, withMedia = 0
  let primaryPass = 0, fallbackPass = 0, mediaLost = 0
  
  for (const dir of dirs) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    total++
    let content = readFileSync(normPath, 'utf-8')
    
    // Count ArticleMedia
    const mediaCount = (content.match(/<ArticleMedia/g) || []).length
    if (mediaCount === 0) continue
    withMedia++
    
    // Pipeline
    const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    try {
      const result = await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      const code = String(result)
      if (code.includes('ArticleMedia')) {
        primaryPass++
      } else {
        // Check fallback
        const fallback = createMdxFallbackSource(processed)
        if (fallback.includes('<ArticleMedia')) {
          fallbackPass++
        } else {
          mediaLost++
        }
      }
    } catch {
      // Primary compile failed — check fallback
      const fallback = createMdxFallbackSource(processed)
      if (fallback.includes('<ArticleMedia')) {
        fallbackPass++
      } else {
        mediaLost++
      }
    }
  }
  
  const totalIntact = primaryPass + fallbackPass
  console.log(`\n=== FINAL VERIFICATION ===`)
  console.log(`Total articles: ${total}`)
  console.log(`With ArticleMedia: ${withMedia}`)
  console.log(`Primary compile: ${primaryPass} (${Math.round(primaryPass/withMedia*100)}%)`)
  console.log(`Fallback (ArticleMedia preserved): ${fallbackPass}`)
  console.log(`ArticleMedia lost: ${mediaLost}`)
  console.log(`Total intact: ${totalIntact}/${withMedia} (${Math.round(totalIntact/withMedia*100)}%)`)
  
  // Write report
  writeFileSync(join(OUTPUT_DIR, 'final-clean-compile-verification.json'), JSON.stringify({
    date: new Date().toISOString(),
    total,
    withMedia,
    primaryPass,
    fallbackPass,
    mediaLost,
    percentIntact: Math.round(totalIntact/withMedia*100),
  }, null, 2))
}

main().catch(console.error)
