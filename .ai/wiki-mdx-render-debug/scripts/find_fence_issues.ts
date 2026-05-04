// Find the stray fence pattern in lea-dsgn-008
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

for (const slug of ['lea-dsgn-008-01-core-concept', 'bp-344-accessible-washrooms']) {
  const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(slug))
  if (!dir) continue
  
  const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
  
  console.log(`\n=== ${slug} ===`)
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Lines with triple backtick that don't match real fence pattern
    if (line.includes('```')) {
      const fenceMatch = line.trim().match(/^(```+)(\s*[a-zA-Z]*)?\s*$/)
      console.log(`  Line ${i+1}: isFence=${!!fenceMatch} content=${line.substring(0, 120)}`)
    }
  }
}
