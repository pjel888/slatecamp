// Debug bp-344-accessible-washrooms
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
  
  // Try compile and show error context
  try {
    await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
    console.log("UNEXPECTED: compile succeeded")
  } catch (e: any) {
    const msg = e.message || ''
    const lineMatch = msg.match(/\((\d+):(\d+)\)/)
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1])
      const lines = sanitized.split('\n')
      console.log(`Error at line ${lineNum}`)
      for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 2); i++) {
        const marker = i === lineNum - 1 ? '>' : ' '
        console.log(`${marker} ${i+1}: ${lines[i].substring(0, 150)}`)
      }
    } else {
      console.log(msg.substring(0, 300))
    }
  }
}

main().catch(console.error)
