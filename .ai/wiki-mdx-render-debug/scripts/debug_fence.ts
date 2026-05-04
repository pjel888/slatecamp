// Debug code fence protection issue
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const slug = 'topography-and-slope-analysis'
const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(slug))

const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')

const { normalizeWikiMdxComponentBlocks } = await import('../../../src/lib/wiki-markdown')

let r = normalizeWikiMdxComponentBlocks(cleaned)

// Find where the ArticleMedia tag is
const amIdx = r.indexOf('<ArticleMedia')
console.log(`ArticleMedia starts at char ${amIdx}`)

// Find what line it's on and nearby lines
const lines = r.split('\n')
let lineStartingAt = 0
for (let i = 0; i < lines.length; i++) {
  const lineEnd = lineStartingAt + lines[i].length + 1 // +1 for \n
  if (lineStartingAt <= amIdx && amIdx < lineEnd) {
    console.log(`ArticleMedia is on line ${i+1}`)
    console.log(`Line content: ${lines[i].substring(0, 200)}`)
    console.log(`Line starts with backtick: ${lines[i].trimStart().startsWith('````')}`)
    
    // Check if ANY line in content starts with ```
    const badLines: number[] = []
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].trimStart().startsWith('```')) {
        badLines.push(j + 1)
      }
    }
    console.log(`Lines starting with \`\`\`: ${badLines.length}`)
    if (badLines.length > 0 && badLines.length % 2 !== 0) {
      console.log(`UNEVEN fence count! Unclosed fence somewhere. Lines: ${badLines.slice(0, 10).join(', ')}...`)
      
      // Show the context around each fence
      for (const bl of badLines.slice(0, 4)) {
        console.log(`  Fence line ${bl}: ${lines[bl-1].substring(0, 100)}`)
      }
    }
    break
  }
  lineStartingAt = lineEnd
}
