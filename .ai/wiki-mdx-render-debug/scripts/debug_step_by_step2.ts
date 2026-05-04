// Full step-by-step trace
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const slug = 'topography-and-slope-analysis'
const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(slug))

const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')

// Import normalize
const { normalizeWikiMdxComponentBlocks } = await import('../../../src/lib/wiki-markdown')

let r = normalizeWikiMdxComponentBlocks(cleaned)
r = r.replace(/<((?:Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox)(?:\s[^>]*)?)>(?=[*_#>-])/g, '<$1>\n\n')
r = r.replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\\"/g, '$1"')
r = r.replace(/(\s*=\s*"[^"]*)\\\"/g, '$1"')
r = r.replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>/g, (tag) => {
  if (tag.includes('\\"')) return tag.replace(/\\"/g, "'")
  return tag
})
r = r.replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\\s*(\/?>|[a-zA-Z])/g, '$1 $2')
r = r.replace(/<(?=\d|[=\-])(?![^>]*>)/g, (match, offset, str) => {
  const before = str.substring(0, offset)
  const lastOpen = before.lastIndexOf('<')
  const lastClose = before.lastIndexOf('>')
  if (lastOpen > lastClose && lastOpen >= 0) return match
  return '&lt;'
})

console.log(`Before code fence protection: AM=${r.includes('<ArticleMedia')}`)

// Code fence protection
const protectedCodeFences: string[] = []
let insideFence = false
const lines = r.split('\n')
const processedLines: string[] = []
for (const line of lines) {
  if (line.trimStart().startsWith('```')) {
    if (!insideFence) {
      const idx = protectedCodeFences.length
      protectedCodeFences.push(line)
      processedLines.push(`\x00CODE_FENCE_${idx}_OPEN\x01`)
    } else {
      const idx = protectedCodeFences.length - 1
      protectedCodeFences[idx] += '\n' + line
      processedLines.push(`\x00CODE_FENCE_${idx}_CLOSE\x01`)
    }
    insideFence = !insideFence
  } else if (insideFence) {
    const idx = protectedCodeFences.length - 1
    protectedCodeFences[idx] += '\n' + line
  } else {
    processedLines.push(line)
  }
}
r = processedLines.join('\n')

console.log(`After code fence protection: AM=${r.includes('<ArticleMedia')}`)

// Brace escaping - JSX tag splitting
const segments = r.split(/(<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>)/g)
console.log(`Number of segments: ${segments.length}`)

// Find which segment has ArticleMedia
for (let i = 0; i < segments.length; i++) {
  if (segments[i].includes('<ArticleMedia')) {
    console.log(`Segment ${i} (is JSX tag: ${i % 2 === 1}): has ArticleMedia, length=${segments[i].length}`)
    // Check if the segment actually is the full tag
    if (!segments[i].includes('/>')) {
      console.log(`  WARNING: Segment does not contain /> — truncated!`)
      console.log(`  Last 50 chars: ${segments[i].slice(-50)}`)
    }
  }
}

// Apply brace escaping
const escaped = segments.map((seg, i) => {
  if (i % 2 === 1) return seg
  return seg.replace(/([{}])/g, '\\$1')
}).join('')

console.log(`After brace escaping: AM=${escaped.includes('<ArticleMedia')}`)

// Restore code fences
const restored = escaped
  .replace(/\x00CODE_FENCE_(\d+)_OPEN\x01/g, (_, idx) => protectedCodeFences[parseInt(idx)]?.split('\n')[0] || '```')
  .replace(/\x00CODE_FENCE_(\d+)_CLOSE\x01/g, (_, idx) => {
    const content = protectedCodeFences[parseInt(idx)]
    if (!content) return '```'
    const lines = content.split('\n')
    return lines[lines.length - 1] || '```'
  })

console.log(`After fence restore: AM=${restored.includes('<ArticleMedia')}`)
