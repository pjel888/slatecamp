// Find the 7 remaining fallback articles
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  
  for (const dir of dirs) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    const content = readFileSync(normPath, 'utf-8')
    if (!content.includes('<ArticleMedia')) continue
    
    const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    try {
      const result = await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      if (!String(result).includes('ArticleMedia')) {
        console.log(`FALLBACK: ${slug} — ArticleMedia missing from primary compile output`)
      }
    } catch (e: any) {
      const msg = (e.message || '').substring(0, 150)
      console.log(`FALLBACK: ${slug} — ${msg}`)
      
      // Show 3 lines of context around error
      const lineMatch = msg.match(/\((\d+)/)
      if (lineMatch) {
        const lineNum = parseInt(lineMatch[1])
        const lines = sanitized.split('\n')
        for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 2); i++) {
          console.log(`  ${i+1}: ${lines[i].substring(0, 120)}`)
        }
      }
    }
  }
}

main().catch(console.error)
