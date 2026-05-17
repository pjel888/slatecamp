// Debug acorn parse errors - check for curly brace issues
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { normalizeWikiMdxComponentBlocks } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

const acornSlugs = [
  'lea-dsgn-007-07-core-concept',
  'overview-professional-practice',
  'wheelchair-maneuvering-and-parking-slots',
  'lea-util-001-09-core-concept',
  'bp-344-ramp-slope-tiers',
]

const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })

for (const slug of acornSlugs) {
  const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
  if (!dir) continue
  
  const path = join(ARTICLES_DIR, dir.name, 'normalized.md')
  const content = readFileSync(path, 'utf-8')
  
  // Find curly braces with context
  const braces: string[] = []
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      const ctx = content.substring(Math.max(0, i-40), Math.min(content.length, i+80)).replace(/\n/g, '\\n')
      braces.push(ctx)
      if (braces.length >= 10) break
    }
  }
  
  console.log(`\n=== ${slug} ===`)
  console.log(`  Content length: ${content.length}`)
  console.log(`  First 3 curly braces:`)
  for (const ctx of braces.slice(0, 3)) {
    console.log(`    ...${ctx}...`)
  }
  
  // Try to compile to see full error
  try {
    const normalized = normalizeWikiMdxComponentBlocks(content)
    const cleaned = normalized
      .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
    
    // Try to find the specific acorn error
    await compile(cleaned, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
  } catch (e: any) {
    const msg = e.message || ''
    // Extract position info
    console.log(`  Error: ${msg.substring(0, 250)}`)
    
    // Try with different subsets to narrow down
    // Check if it's in an ArticleMedia tag
    const media = content.match(/<ArticleMedia[\s\S]*?\/>/g)
    if (media) {
      for (let i = 0; i < media.length; i++) {
        if (media[i].includes('{') || media[i].includes('}')) {
          console.log(`  Tag ${i+1} has braces: ${media[i].substring(0, 100)}...`)
        }
      }
    }
  }
}
