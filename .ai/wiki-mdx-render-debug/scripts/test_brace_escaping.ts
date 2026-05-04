/**
 * Test the 15 repairable (bare-curly-braces) articles with the new sanitizeMDX brace escaping.
 */
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts, normalizeWikiMdxComponentBlocks } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

const BARE_BRACE_SLUGS = [
  'lea-prac-cmp-010-per-diem-retainer-and-honorarium-definitions-scope-and-philippine-application',
  'lea-theo-004-03-core-concept',
  'lea-theo-009-02-core-concept',
  'lea-util-001-09-core-concept',
  'lea-util-002-08-core-principles-standards',
  'lea-util-007-02-smart-metering-infrastructure-ami',
  'accessible-seating-in-assembly-areas',
  'overview-architectural-design',
  'overview-building-materials',
  'overview-building-utilities-mepf',
  'overview-history-of-architecture',
  'overview-planning-housing-urban-design',
  'overview-professional-practice',
  'overview-structural-conceptualization',
  'overview-theory-of-architecture',
]

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  let passed = 0
  let failed = 0
  
  for (const slug of BARE_BRACE_SLUGS) {
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) { failed++; continue }
    
    const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
    const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    const hasMedia = sanitized.includes('<ArticleMedia')
    
    try {
      const result = await compile(sanitized, {
        outputFormat: 'function-body',
        providerImportSource: undefined,
        development: false,
      })
      const code = String(result)
      const mediaInOutput = code.includes('ArticleMedia')
      console.log(`  ✅ ${slug}: PASS, ArticleMedia=${mediaInOutput}`)
      passed++
    } catch (e: any) {
      console.log(`  ❌ ${slug}: ${(e.message || '').substring(0, 120)}`)
      failed++
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  
  // Also test that the remaining 8 latex articles still work via fallback
  console.log('\n--- Remaining 8 (should still use fallback) ---')
  const latexSlugs = [
    'lea-dsgn-007-07-core-concept',
    'lea-dsgn-007-10-core-concept',
    'lea-dsgn-008-03-core-concept',
    'lea-dsgn-012-02-core-concept',
    'lea-matl-006-02-core-concept',
    'lea-strc-007-03-core-concept',
    'bp-344-ramp-slope-tiers',
    'wheelchair-maneuvering-and-parking-slots',
  ]
  
  const { createMdxFallbackSource } = await import('../../../src/lib/wiki-markdown')
  
  for (const slug of latexSlugs) {
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) continue
    
    const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
    const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    const hasMedia = sanitized.includes('<ArticleMedia')
    
    // Try primary compile
    let primaryOk = false
    try {
      await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      primaryOk = true
    } catch {}
    
    // Check fallback preserves ArticleMedia
    const fallback = createMdxFallbackSource(processed)
    const mediaInFallback = fallback.includes('<ArticleMedia')
    
    console.log(`  ${primaryOk ? '✅' : '↪️'} ${slug}: primary=${primaryOk}, ArticleMedia=${hasMedia}, fallbackMedia=${mediaInFallback}`)
  }
}

main().catch(console.error)
