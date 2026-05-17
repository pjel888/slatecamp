// Debug: find articles that regressed from primary to fallback after brace escaping
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  let regressed = 0
  
  // Find the first 10 articles that now fail primary compile unexpectedly
  // (Articles that don't have LaTeX and previously passed)
  for (const dir of dirs) {
    if (regressed >= 10) break
    
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    const content = readFileSync(normPath, 'utf-8')
    
    const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    try {
      await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
    } catch (e: any) {
      const msg = (e.message || '')
      // Only report if this doesn't look like a LaTeX article
      if (!msg.includes('acorn') && !content.includes('\\\\text') && !content.includes('\\\\frac')) {
        regressed++
        console.log(`\n=== ${slug} ===`)
        console.log(`Error: ${msg.substring(0, 200)}`)
        
        // Show the content around the problematic area
        const lineMatch = msg.match(/\((\d+):(\d+)\)/)
        if (lineMatch) {
          const lineNum = parseInt(lineMatch[1])
          const lines = sanitized.split('\n')
          for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 3); i++) {
            const marker = i === lineNum - 1 ? '>' : ' '
            console.log(`${marker} ${i + 1}: ${lines[i].substring(0, 150)}`)
          }
        }
      } else if (msg.includes('acorn')) {
        // Show the acorn error context too
        regressed++
        console.log(`\n=== ${slug} (acorn) ===`)
        console.log(`Error: ${msg.substring(0, 200)}`)
      }
    }
  }
}

main().catch(console.error)
