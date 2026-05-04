// Debug script to test the backslash fix
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

function enhancedSanitizeMDX(content: string): string {
  let result = content
  
  // Step 0: Remove backslash-escaped quotes inside JSX attribute values
  // Pattern: <Tag attr="text with \" embedded">
  // Also handle: attr="text with \"more text"
  // This is safe because JSX attributes in our content use "" (not '')
  // and backslash escaping isn't valid in JSX attribute values.
  result = result
    // Remove \ before " inside JSX double-quoted attribute values
    .replace(/(<[A-Z][a-zA-Z0-9]*[^>]*"[^"]*?)\\(?=[^"]*"[\s/>])/g, '$1')
    // Remove \ before " at end of attribute value: value\"
    .replace(/(<[A-Z][a-zA-Z0-9]*[^>]*?=\s*"[^"]*)\\"(?=\s)/g, '$1"')
    // Handle escaped quotes inside curly-brace expressions in JSX
    .replace(/{(['"`])[^}]*?\\(?=[^}]*\1)}/g, (m) => m.replace(/\\(?=[^}]*["'`])/g, ''))
  
  // Step 1: Existing sanitizeMDX logic
  result = result
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\\"/g, '$1"')
    .replace(/(\s*=\s*"[^"]*)\\\"/g, '$1"')
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\\s*(\/?>|[a-zA-Z])/g, '$1 $2')
    .replace(/<([0-9=])/g, '&lt;$1')
    // Normalize block components
    .replace(/<((?:Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox)(?:\s[^>]*)?)>(?=[*_#>-])/g, '<$1>\n\n')
  
  return result
}

async function testFix() {
  const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
  
  // Test the specific failing articles
  const testSlugs = [
    'lea-hist-008-01-core-concept',  // invalid-jsx-syntax (backslash)
    'overview-professional-practice',  // acorn-parse-error
  ]
  
  for (const slug of testSlugs) {
    // Find dir
    const { readdirSync } = await import('fs')
    const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
    const dir = dirs.find(d => d.isDirectory() && d.name.startsWith(slug))
    if (!dir) continue
    
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    const content = readFileSync(normPath, 'utf-8')
    const cleaned = content
      .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    
    // Test both sanitizers
    console.log(`\n=== ${slug} ===`)
    
    // Old sanitizeMDX
    const oldResult = sanitizeMDX(processed)
    let oldPass = false
    try {
      await compile(oldResult, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      oldPass = true
    } catch (e: any) {
      console.log(`  OLD sanitizeMDX: FAIL - ${e.message.substring(0, 120)}`)
    }
    
    // New enhanced sanitizeMDX
    const newResult = enhancedSanitizeMDX(processed)
    let newPass = false
    try {
      await compile(newResult, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      newPass = true
      console.log(`  NEW sanitizeMDX: ✅ PASS`)
    } catch (e: any) {
      console.log(`  NEW sanitizeMDX: FAIL - ${e.message.substring(0, 120)}`)
    }
    
    // Check ArticleMedia in compile output
    if (newPass) {
      const result = await compile(newResult, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      const code = String(result)
      console.log(`  ArticleMedia in output: ${code.includes('ArticleMedia') ? '✅ YES' : '❌ NO'}`)
    }
  }
}

testFix().catch(console.error)
