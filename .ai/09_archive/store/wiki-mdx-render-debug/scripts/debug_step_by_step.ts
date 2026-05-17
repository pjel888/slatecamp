// Debug: what's between the process() output and sanitizeMDX input
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

const slug = 'topography-and-slope-analysis'
const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(slug))

const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
const processed = injectEIPrompts(cleaned, [])

// Find ArticleMedia
const idx = processed.indexOf('<ArticleMedia')
console.log(`ArticleMedia at index ${idx}`)
console.log(`\n5 lines before:`)
const lines = processed.split('\n')
let lineNum = 0
for (let i = 0; i < lines.length; i++) {
  if (processed.indexOf(lines[i], processed.indexOf('<ArticleMedia') - 500) >= 0) {
    lineNum = i
    break
  }
}
for (let i = Math.max(0, lineNum - 5); i <= lineNum; i++) {
  console.log(`${i+1}: ${lines[i].substring(0, 120)}`)
}

// Manually check each step of sanitizeMDX
console.log(`\nStep by step:`)
let result = processed
  .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')

// Step 0: Normalize
const { normalizeWikiMdxComponentBlocks } = await import('../../../src/lib/wiki-markdown')
result = normalizeWikiMdxComponentBlocks(result)
console.log(`After normalize: AM present=${result.includes('<ArticleMedia')}`)

// Build the replacements step by step
let stepResult = result
  .replace(/<((?:Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox)(?:\s[^>]*)?)>(?=[*_#>-])/g, '<$1>\n\n')
console.log(`After Tip/Note separator: AM present=${stepResult.includes('<ArticleMedia')}`)

stepResult = stepResult
  .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\\"/g, '$1"')
  .replace(/(\s*=\s*"[^"]*)\\\"/g, '$1"')
console.log(`After quote fix: AM present=${stepResult.includes('<ArticleMedia')}`)

stepResult = stepResult
  .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>/g, (tag) => {
    if (tag.includes('\\"')) return tag.replace(/\\"/g, "'")
    return tag
  })
console.log(`After backslash cleanup: AM present=${stepResult.includes('<ArticleMedia')}`)

stepResult = stepResult
  .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\\s*(\/?>|[a-zA-Z])/g, '$1 $2')
console.log(`After cont fix: AM present=${stepResult.includes('<ArticleMedia')}`)

// The new < escaping
stepResult = stepResult.replace(/<(?=\d|[=\-])(?![^>]*>)/g, (match, offset, str) => {
  const before = str.substring(0, offset)
  const lastOpen = before.lastIndexOf('<')
  const lastClose = before.lastIndexOf('>')
  if (lastOpen > lastClose && lastOpen >= 0) return match
  return '&lt;'
})
console.log(`After < escaping: AM present=${stepResult.includes('<ArticleMedia')}`)

// Now check what each step does to the ArticleMedia tag
console.log(`\nFull sanitized output (first 200 chars around ArticleMedia):`)
const finalResult = sanitizeMDX(processed)
const amIdx = finalResult.indexOf('<ArticleMedia')
if (amIdx >= 0) {
  console.log(finalResult.substring(Math.max(0, amIdx-50), Math.min(finalResult.length, amIdx+200)))
} else {
  console.log('NO ArticleMedia in final output')
  // Show what happened to the area
  const origAmIdx = processed.indexOf('<ArticleMedia')
  console.log(`Area around original position ${origAmIdx}:`)
  console.log(finalResult.substring(Math.max(0, origAmIdx-10), Math.min(finalResult.length, origAmIdx+20)))
}
