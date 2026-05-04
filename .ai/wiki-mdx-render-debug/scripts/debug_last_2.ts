// Check lea-dsgn-008-01 and bp-344
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { sanitizeMDX, injectEIPrompts, normalizeWikiMdxComponentBlocks } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

for (const slug of ['lea-dsgn-008-01-core-concept', 'bp-344-accessible-washrooms']) {
  const dir = readdirSync(ARTICLES_DIR, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(slug))
  if (!dir) continue
  
  const content = readFileSync(join(ARTICLES_DIR, dir.name, 'normalized.md'), 'utf-8')
  const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
  const processed = injectEIPrompts(cleaned, [])
  
  console.log(`\n=== ${slug} ===`)
  console.log(`AM in processed: ${processed.includes('<ArticleMedia')}`)
  
  // Step through sanitizeMDX
  let r = normalizeWikiMdxComponentBlocks(cleaned)
  console.log(`  After normalize: AM=${r.includes('<ArticleMedia')}`)
  
  // Tip/Note separator
  r = r.replace(/<((?:Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox)(?:\s[^>]*)?)>(?=[*_#>-])/g, '<$1>\n\n')
  
  // Quote fix  
  r = r.replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\\"/g, '$1"')
  r = r.replace(/(\s*=\s*"[^"]*)\\\"/g, '$1"')
  
  // Backslash cleanup
  r = r.replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>/g, (tag) => {
    if (tag.includes('\\"')) return tag.replace(/\\"/g, "'")
    return tag
  })
  
  // Line continuation fix
  r = r.replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\\s*(\/?>|[a-zA-Z])/g, '$1 $2')
  
  // < escaping
  r = r.replace(/<(?=\d|[=\-])(?![^>]*>)/g, (match, offset, str) => {
    const before = str.substring(0, offset)
    const lastOpen = before.lastIndexOf('<')
    const lastClose = before.lastIndexOf('>')
    if (lastOpen > lastClose && lastOpen >= 0) return match
    return '&lt;'
  })
  
  console.log(`  After < escaping: AM=${r.includes('<ArticleMedia')}`)
  
  // Code fence protection  
  const protectedCodeFences: string[] = []
  let insideFence = false
  const lines = r.split('\n')
  const processedLines: string[] = []
  for (const line of lines) {
    const fenceMatch = line.trimStart().match(/^(```+)(\s*[a-zA-Z]*)?\s*$/)
    if (fenceMatch && fenceMatch[1].length >= 3) {
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
  console.log(`  After fence protection: AM=${r.includes('<ArticleMedia')}`)
  
  if (!r.includes('<ArticleMedia')) {
    console.log(`  FENCE COUNT: ${protectedCodeFences.length} fences, isOpen=${insideFence}`)
    // Find lines with ```
    const rawLines = processed.split('\n')
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].includes('\`\`\`') && !rawLines[i].trim().match(/^(```+)(\s*[a-zA-Z]*)?\s*$/)) {
        console.log(`  Line ${i+1} has triple-backtick but doesn't match fence pattern: ${rawLines[i].substring(0, 100)}`)
      }
    }
  }
}
