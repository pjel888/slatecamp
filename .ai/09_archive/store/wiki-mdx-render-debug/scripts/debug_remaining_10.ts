// Debug the remaining 10 failures to see the pattern
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

const remainingSlugs = [
  'lea-hist-002-02-core-concept',
  'lea-hist-002-01-core-concept',
  'lea-hist-001-05-core-concept',
  'lea-hist-001-06-core-concept',
  'lea-hist-002-06-core-concept',
  'lea-hist-001-01-core-concept',
  'lea-hist-002-05-core-concept',
  'lea-hist-002-03-core-concept',
  'lea-hist-001-04-core-concept',
  'lea-hist-002-04-core-concept',
]

const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })

for (const slug of remainingSlugs) {
  const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
  if (!dir) continue
  
  const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
  const content = readFileSync(normPath, 'utf-8')
  
  // Find all ArticleMedia tags
  let idx = 0
  let tagNum = 0
  while (true) {
    idx = content.indexOf('<ArticleMedia', idx)
    if (idx < 0) break
    tagNum++
    const end = content.indexOf('/>', idx) + 2
    const tag = content.substring(idx, end)
    
    // Check for backslash patterns
    const hasBackslash = tag.includes('\\')
    const backslashContext: string[] = []
    if (hasBackslash) {
      for (let i = 0; i < tag.length; i++) {
        if (tag[i] === '\\') {
          const ctx = tag.substring(Math.max(0, i-40), Math.min(tag.length, i+40))
          backslashContext.push(ctx.replace(/\n/g, '\\n'))
        }
      }
    }
    
    console.log(`\n=== ${slug} Tag ${tagNum} ===`)
    console.log(`  Length: ${tag.length}`)
    console.log(`  Has \\": ${hasBackslash}`)
    if (backslashContext.length > 0) {
      for (const ctx of backslashContext) {
        console.log(`  Backslash ctx: ...${ctx}...`)
      }
    }
    console.log(`  First 100: ${tag.substring(0, 100).replace(/\n/g, '\\n')}`)
    console.log(`  Last 100: ${tag.substring(tag.length-100).replace(/\n/g, '\\n')}`)
    
    idx = end
  }
}
