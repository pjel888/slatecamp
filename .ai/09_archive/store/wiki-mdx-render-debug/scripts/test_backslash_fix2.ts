// Debug: test removing backslash before quotes inside JSX tag attributes
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
import { readdirSync } from 'fs'

function testSanitize(content: string): string {
  // Remove backslash before " AND backslash before ' INSIDE JSX tags
  // This fixes content like: alt="principles.\" caption=\"text\"" 
  // The \" breaks JSX parsing because JSX attributes don't support backslash escaping.
  return content
    // Clean up backslash-quote inside JSX tag attribute values
    // Match: <Tag ... "text\" ... >  ->  <Tag ... "text" ... >
    // Use a step-by-step approach:
    .replace(/(<[A-Z][a-zA-Z0-9]*[\s\S]*?>)/g, (tag: string) => {
      // Inside a JSX tag: remove \ before " and '
      return tag
        .replace(/(=\s*"[^"]*?)\\(?=")/g, '$1')     // \" right before end of attr value
        .replace(/(=\s*"[^"]*?)\\(?=\s)/g, '$1')     // \" followed by space
        .replace(/(=\s*"[^"]*)\\"([^"]*")/g, '$1$2') // \" inside attr value
        .replace(/\\'/g, "'")                         // also fix \' inside tags
        .replace(/\\`/g, '`')                         // and \`
    })
}

async function test() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  
  // Test the specific failing article
  const slug = 'lea-hist-008-01-core-concept'
  const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
  if (!dir) { console.log('Not found'); return }
  
  const path = join(ARTICLES_DIR, dir.name, 'normalized.md')
  const content = readFileSync(path, 'utf-8')
  
  const sanitized = testSanitize(content)
  
  // Show the problematic part
  const idx = sanitized.indexOf('<ArticleMedia')
  if (idx >= 0) {
    const end = sanitized.indexOf('>', idx) + 1
    // Find the third ArticleMedia tag
    let third = -1, count = 0, pos = 0
    while (count < 3) {
      pos = sanitized.indexOf('<ArticleMedia', pos + 1)
      if (pos < 0) break
      count++
    }
    if (pos >= 0) {
      const tagEnd = sanitized.indexOf('/>', pos) + 2
      console.log("Third ArticleMedia tag (sanitized):")
      console.log(sanitized.substring(pos, tagEnd))
    }
  }
  
  // Check for remaining backslash-quote
  const remaining = sanitized.match(/\\["']/g)
  console.log(`\nRemaining \\" or \\' in content: ${remaining?.length || 0}`)
  
  // Try to compile
  try {
    const result = await compile(sanitized, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
    const code = String(result)
    console.log(`\n✅ COMPILE SUCCESS`)
    console.log(`ArticleMedia in output: ${code.includes('ArticleMedia') ? '✅ YES' : '❌ NO'}`)
  } catch (e: any) {
    console.log(`\n❌ COMPILE FAIL: ${e.message.substring(0, 200)}`)
  }
  
  // Now test the old sanitizeMDX to compare
  console.log('\n--- Also testing with normalizeWikiMdxComponentBlocks + sanitizeMDX ---')
  // Import the actual functions
  const { sanitizeMDX, normalizeWikiMdxComponentBlocks } = await import('../../../src/lib/wiki-markdown')
  const oldSanitized = sanitizeMDX(content)
  try {
    const result = await compile(oldSanitized, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
    console.log(`✅ COMPILE SUCCESS`)
  } catch (e: any) {
    console.log(`❌ COMPILE FAIL: ${e.message.substring(0, 200)}`)
  }
}

test().catch(console.error)
