// Quick scan for < - pattern in bp-344  
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith('bp-344-accessible-washrooms'))
if (!dir) process.exit(1)

const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
const lines = content.split('\n')

// Find lines where < appears before - outside of JSX
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  // Lines that look like table rows or list items with <
  if (/\|.*<\s*-/.test(line)) {
    console.log(`Line ${i+1}: ${line.substring(0, 150)}`)
  }
  if (/^\|.*-/.test(line)) {
    console.log(`Table ${i+1}: ${line.substring(0, 150)}`)
  }
}

// Also count total lines and show first 5 lines of context around the `-` issue
// by trying to compile increasingly large sections
console.log('\n--- Showing table sections ---')
let inTable = false
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('|')) {
    if (!inTable) {
      console.log(`\nTable starts at line ${i+1}:`)
      inTable = true
    }
    console.log(`  ${i+1}: ${lines[i].substring(0, 120)}`)
    // Show 5 lines max
  } else {
    inTable = false
  }
}
