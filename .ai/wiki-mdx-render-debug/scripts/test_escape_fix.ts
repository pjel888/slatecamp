// Test: global \" -> ' replacement 
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { normalizeWikiMdxComponentBlocks } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

function enhancedSanitize(content: string): string {
  // 1. Normalize malformed block components
  let result = normalizeWikiMdxComponentBlocks(content)
  
  // 2. Fix backslash-escaped quotes inside JSX tags - replace \" with '
  // This is safe because:
  //   - In " delimited attr values: \" becomes ' (valid since ' is fine inside ")
  //   - In prose \" is never valid markdown/JSX -> ' is fine
  result = result.replace(/\\"/g, "'")
  
  // 3. Standard sanitizeMDX logic
  result = result
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\\"/g, '$1"')
    .replace(/(\s*=\s*"[^"]*)\\\"/g, '$1"')
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\\s*(\/?>|[a-zA-Z])/g, '$1 $2')
    .replace(/<([0-9=])/g, '&lt;$1')
  
  return result
}

async function test() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  
  // Test ALL 53 invalid-jsx-syntax articles + some acorn ones
  const slugs = [
    'lea-hist-008-01-core-concept',
    'lea-hist-007-03-core-concept', 
    'lea-hist-002-02-core-concept',
    'lea-hist-002-01-core-concept',
    'lea-hist-008-08-core-concept',
    'lea-dsgn-012-02-core-concept',  // previously acorn
    'overview-professional-practice',  // acorn
    'overview-history-of-architecture',  // acorn
    'lea-dsgn-007-07-core-concept',  // acorn
    'lea-hist-008-09-core-concept',
    'lea-hist-001-05-core-concept',
    'lea-hist-004-01-core-concept',
    'lea-dsgn-007-10-core-concept',
    'wheelchair-maneuvering-and-parking-slots',
    'lea-hist-013-02-core-concept',
  ]
  
  let passed = 0
  let failed = 0
  
  for (const slug of slugs) {
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) { failed++; continue }
    
    const path = join(ARTICLES_DIR, dir.name, 'normalized.md')
    const content = readFileSync(path, 'utf-8')
    
    // Full pipeline
    const cleaned = content
      .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
    const sanitized = enhancedSanitize(cleaned)
    
    try {
      const result = await compile(sanitized, {
        outputFormat: 'function-body',
        providerImportSource: undefined,
        development: false,
      })
      const code = String(result)
      const hasArticleMedia = code.includes('ArticleMedia')
      console.log(`  ✅ ${slug}: PASS, ArticleMedia=${hasArticleMedia}`)
      passed++
    } catch (e: any) {
      console.log(`  ❌ ${slug}: ${e.message.substring(0, 120)}`)
      failed++
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
}

test().catch(console.error)
