// Debug bp-344 more deeply
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  const dir = dirs.find(d => d.isDirectory() && d.name.startsWith('bp-344-accessible-washrooms'))
  if (!dir) return
  
  const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
  const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
  const processed = injectEIPrompts(cleaned, [])
  const sanitized = sanitizeMDX(processed)
  
  // Try to narrow down with subsets
  // Try first 50 lines
  const lines = sanitized.split('\n')
  
  // Find lines containing < that might be HTML/JSX-like with dashes
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    if (/<[^>]*\-\-/.test(lines[i]) || /<[^>]*\s\-/.test(lines[i])) {
      console.log(`Line ${i+1}: ${lines[i].substring(0, 150)}`)
    }
  }
  
  // Find all component-looking things
  console.log("\n=== Search for angle brackets near dashes ===")
  for (let i = 15; i < Math.min(lines.length, 50); i++) {
    if (/<[a-zA-Z]/.test(lines[i]) && /-/.test(lines[i])) {
      console.log(`Line ${i+1}: ${lines[i].substring(0, 150)}`)
    }
  }
  
  // Try compiling different sections to narrow down
  for (let end = 100; end <= 500; end += 100) {
    try {
      await compile(lines.slice(0, end).join('\n'), { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      console.log(`First ${end} lines: OK`)
    } catch (e: any) {
      console.log(`First ${end} lines: FAIL at line ${end-100}-${end}`)
      break
    }
  }
}

main().catch(console.error)
