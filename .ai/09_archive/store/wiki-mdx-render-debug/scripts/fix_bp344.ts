/**
 * Fix bp-344-accessible-washrooms — the `-` error likely comes from
 * a markdown table or list that's being confused with JSX.
 * Fix: escape `<` that appears before `-` in table/list context.
 */
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
  
  // Try: what if the issue is a bare < followed by dash or letters outside JSX?
  // Add < escaping for dashes too
  const sanitized = sanitizeMDX(processed)
  
  // Also try: escape <\- patterns in text
  const fixed = sanitized.replace(/<\s*-/g, '&lt;-')
  
  try {
    const result = await compile(fixed, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
    const code = String(result)
    console.log(`✅ COMPILE SUCCESS`)
    console.log(`ArticleMedia in output: ${code.includes('ArticleMedia') ? '✅ YES' : '❌ NO'}`)
  } catch (e: any) {
    console.log(`❌ ${(e.message || '').substring(0, 200)}`)
    
    // Try finding exact line
    const msg = e.message || ''
    // Show lines containing < on their own
    const lines = fixed.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().match(/^<\s*-/)) {
        console.log(`Line ${i+1}: ${lines[i].substring(0, 120)}`)
      }
    }
  }
}

main().catch(console.error)
