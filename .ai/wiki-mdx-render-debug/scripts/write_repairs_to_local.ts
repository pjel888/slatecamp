/**
 * FINAL fix: write content repairs back to local article copies
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

function fixContent(content: string): string {
  // 1. Fix spurious 'a' before type attribute
  content = content.replace(/(<ArticleMedia[^>]*?)\s+a\s+type=/g, '$1 type=')
  
  // 2. Fix description= -> alt= (not a valid ArticleMedia prop)
  content = content.replace(/(<ArticleMedia[^>]*?)\s+description="([^"]*)"/g, '$1 alt="$2"')
  
  // 3. Fix name= -> id= (not a valid ArticleMedia prop)
  content = content.replace(/(<ArticleMedia[^>]*?)\s+name="([^"]*)"/g, '$1 id="media-$2"')
  
  // 4. Fix ALL backslash-escaped quotes inside JSX tags
  content = content.replace(/<ArticleMedia[\s\S]*?\/>/g, (tag: string) => {
    if (tag.includes('\\"')) {
      return tag.replace(/\\"/g, '"')
    }
    return tag
  })
  
  return content
}

const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })

for (const dir of dirs) {
  const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
  const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
  const candPath = join(ARTICLES_DIR, dir.name, 'candidate.md')
  
  // Check if this article needs repair
  for (const filePath of [normPath, candPath]) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const fixed = fixContent(content)
      if (content !== fixed) {
        writeFileSync(filePath, fixed, 'utf-8')
        console.log(`✅ Fixed: ${slug} — ${filePath.endsWith('normalized.md') ? 'normalized' : 'candidate'}`)
      }
    } catch {}
  }
}

console.log('\nAll repairs written.')
