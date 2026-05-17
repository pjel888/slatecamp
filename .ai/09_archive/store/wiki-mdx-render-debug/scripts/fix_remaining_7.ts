/**
 * Fix remaining 7 fallback articles with targeted content repairs.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

// Targeted repairs
function fixArticleMediaTags(content: string): string {
  let fixed = content

  // 1. Fix spurious 'a' before type="image" attribute
  // Pattern: <ArticleMedia id="..." a type="image"
  fixed = fixed.replace(/(<ArticleMedia[^>]*?)\s+a\s+type=/g, '$1 type=')

  // 2. Fix 'description=' attribute (not a valid ArticleMedia prop)
  // Replace description="..." with alt="..."
  fixed = fixed.replace(/(<ArticleMedia[^>]*?)\s+description="([^"]*)"/g, '$1 alt="$2"')

  // 3. Fix 'name=' attribute (not a valid ArticleMedia prop)
  // Replace name="..." with id="..."
  fixed = fixed.replace(/(<ArticleMedia[^>]*?)\s+name="([^"]*)"/g, '$1 id="media-$2"')

  // 4. Fix backslash-escaped ArticleMedia tags (all attributes are \" delimited)
  // Pattern: <ArticleMedia id=\"value\" layout=\"value\" ...
  fixed = fixed.replace(/<ArticleMedia[\s\S]*?\/>/g, (tag: string) => {
    if (tag.includes('\\"')) {
      return tag.replace(/\\"/g, '"')
    }
    return tag
  })

  return fixed
}

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  
  const slugs = [
    'lea-hist-002-01-core-concept',
    'lea-hist-002-05-core-concept',
    'topography-and-slope-analysis',
    'lea-hist-001-04-core-concept',
    'lea-dsgn-008-01-core-concept',
    'bp-344-accessible-washrooms',
    'lea-hist-002-04-core-concept',
  ]
  
  const results: any[] = []
  
  for (const slug of slugs) {
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) continue
    
    const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
    const fixed = fixArticleMediaTags(content)
    
    // Test through pipeline
    const cleaned = fixed.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    const hasMedia = sanitized.includes('<ArticleMedia')
    
    try {
      const result = await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      const code = String(result)
      const mediaInOutput = code.includes('ArticleMedia')
      
      // What was fixed?
      const fixes: string[] = []
      if (content !== fixed) {
        if (content.match(/\s+a\s+type=/)) fixes.push('spurious-a')
        if (content.match(/description="/)) fixes.push('description->alt')
        if (content.match(/name="/)) fixes.push('name->id')
        if (content.match(/\\"/)) fixes.push('backslash-quotes')
      }
      
      results.push({
        slug, 
        status: 'repaired',
        articleMediaInOutput: mediaInOutput,
        fixes: fixes.join(', '),
      })
      console.log(`✅ ${slug}: PASS - media=${mediaInOutput} (${fixes.join(', ') || 'no changes needed'})`)
    } catch (e: any) {
      results.push({
        slug,
        status: 'still-failing',
        error: (e.message || '').substring(0, 150),
      })
      console.log(`❌ ${slug}: ${(e.message || '').substring(0, 120)}`)
    }
  }
  
  writeFileSync(join(OUTPUT_DIR, 'remaining-7-repair-report.json'), JSON.stringify(results, null, 2))
  console.log(`\nReport written.`)
}

main().catch(console.error)
