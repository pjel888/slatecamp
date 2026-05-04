// Test: simple \" -> ' replacement inside JSX tags
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

function testSanitize(content: string): string {
  // Inside any JSX tag (starts with <UpperCase), replace \" with '
  // This is safe because:
  // 1. \" in JSX attributes is never valid
  // 2. ' is a valid quote inside " delimited strings
  // 3. This only affects JSX tags
  return content
    .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>/g, (tag) => {
      // Don't modify if the tag doesn't have \" 
      if (!tag.includes('\\"')) return tag
      return tag.replace(/\\"/g, "'")
    })
    // Also handle the sanitizeMDX basics
    .replace(/<([0-9=])/g, '&lt;$1')
}

async function test() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  
  // Test all 53 invalid-jsx-syntax articles (lea-hist-* ones)
  const testSlugs = [
    'lea-hist-008-01-core-concept',
    'lea-hist-007-03-core-concept',
    'lea-dsgn-012-02-core-concept',
  ]
  
  for (const slug of testSlugs) {
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) continue
    
    const path = join(ARTICLES_DIR, dir.name, 'normalized.md')
    const content = readFileSync(path, 'utf-8')
    
    const sanitized = testSanitize(content)
    const hasArticleMedia = sanitized.includes('<ArticleMedia')
    
    // Check for remaining backslash issues
    const remaining = sanitized.match(/["']\\["']/g)
    
    console.log(`\n=== ${slug} ===`)
    console.log(`ArticleMedia in source: ${hasArticleMedia}`)
    
    try {
      const result = await compile(sanitized, {
        outputFormat: 'function-body',
        providerImportSource: undefined,
        development: false,
      })
      const code = String(result)
      console.log(`  ✅ COMPILE SUCCESS`)
      console.log(`  ArticleMedia in output: ${code.includes('ArticleMedia') ? '✅ YES' : '❌ NO'}`)
    } catch (e: any) {
      console.log(`  ❌ FAIL: ${e.message.substring(0, 200)}`)
    }
  }
}

test().catch(console.error)
