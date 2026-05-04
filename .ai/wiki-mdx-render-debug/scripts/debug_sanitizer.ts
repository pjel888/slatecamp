// Direct debug: check what sanitizeMDX does to these 3 articles
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

for (const slug of ['topography-and-slope-analysis', 'lea-dsgn-008-01-core-concept', 'bp-344-accessible-washrooms']) {
  const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(slug))
  if (!dir) continue
  
  const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
  const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
  const processed = injectEIPrompts(cleaned, [])
  const sanitized = sanitizeMDX(processed)
  
  console.log(`\n=== ${slug} ===`)
  console.log(`AM in processed: ${processed.includes('<ArticleMedia')}`)
  console.log(`AM in sanitized: ${sanitized.includes('<ArticleMedia')}`)
  
  if (!sanitized.includes('<ArticleMedia')) {
    // Find where it went wrong
    const idx = processed.indexOf('<ArticleMedia')
    if (idx >= 0) {
      const tagEnd = processed.indexOf('/>', idx) + 2
      const origTag = processed.substring(idx, tagEnd)
      console.log(`Original tag: ${origTag.substring(0, 200).replace(/\n/g, '\\n')}...`)
    }
    
    // Search for parts of the tag in sanitized output
    const tagContent = processed.substring(processed.indexOf('<ArticleMedia'), processed.indexOf('/>', processed.indexOf('<ArticleMedia')) + 2)
    const words = tagContent.split(/\s+/).filter(w => w.length > 5)
    for (const word of words.slice(1, 5)) {
      if (sanitized.includes(word)) {
        console.log(`  Fragment found: "${word}"`)
      }
    }
  }
}
