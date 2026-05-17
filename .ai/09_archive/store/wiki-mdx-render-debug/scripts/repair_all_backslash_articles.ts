/**
 * Repair ALL backslash-escaped attribute patterns in ArticleMedia tags.
 * 
 * Pattern A: alt="text...\" caption=\"text\" suggestedAsset=\"text\" placementIntent=\"text\"
 *   -> Separate the embedded attributes properly.
 * 
 * Pattern B: id=\"value\" layout=\"value\" etc.  (ALL attributes are \"-delimited)
 *   -> Remove all backslashes before quotes inside the tag.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

function repairArticleMedia(content: string): string {
  // Pattern A: alt="legit text...\" caption=\"text\" suggestedAsset=\"text\" placementIntent=\"text\"
  // The alt attribute value contains embedded \"-escaped pseudo-attributes.
  let fixed = content.replace(
    /(<ArticleMedia[\s\S]*?"[^"]*?)\\"\s+caption=\\"([^"]*?)\\"\s+suggestedAsset=\\"([^"]*?)\\"\s+placementIntent=\\"([^"]*?)\\"\s*\/>/g,
    (match, altPrefix, caption, suggestedAsset, placementIntent) => {
      return `${altPrefix}" caption="${caption}" suggestedAsset="${suggestedAsset}" placementIntent="${placementIntent}" />`
    }
  )

  // Pattern B: Any ArticleMedia tag where attributes are \"-delimited
  // e.g. id=\"value\" layout=\"value\" type=\"value\"
  // Fix: remove backslash before every quote within the tag
  fixed = fixed.replace(/<ArticleMedia[\s\S]*?\/>/g, (tag: string) => {
    if (tag.includes('\\"')) {
      return tag.replace(/\\"/g, '"')
    }
    return tag
  })

  return fixed
}

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  
  let corrected = 0
  let stillBroken = 0
  let totalWithIssue = 0
  const details: any[] = []
  
  for (const dir of dirs) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    const content = readFileSync(normPath, 'utf-8')
    
    // Check for backslash-escaped ArticleMedia tags
    if (!/<ArticleMedia[\s\S]*?\\"[\s\S]*?\/>/.test(content)) continue
    
    totalWithIssue++
    const repaired = repairArticleMedia(content)
    
    // Normalize + compile
    const { normalizeWikiMdxComponentBlocks } = await import('../../../src/lib/wiki-markdown')
    const normalized = normalizeWikiMdxComponentBlocks(repaired)
    
    let compiled = false
    let error = ''
    try {
      await compile(normalized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      compiled = true
      corrected++
    } catch (e: any) {
      error = e.message?.substring(0, 150) || ''
      stillBroken++
    }
    
    details.push({
      slug,
      total_tags: (content.match(/<ArticleMedia/g) || []).length,
      repaired_tags: (repaired.match(/<ArticleMedia/g) || []).length,
      compiled,
      error: compiled ? null : error,
    })
    
    console.log(`${compiled ? '✅' : '❌'} ${slug}: compiled=${compiled}`)
  }
  
  console.log(`\n=== RESULTS ===`)
  console.log(`Articles with backslash-escaped ArticleMedia: ${totalWithIssue}`)
  console.log(`Repaired successfully: ${corrected}`)
  console.log(`Still broken: ${stillBroken}`)
  
  writeFileSync(
    join(OUTPUT_DIR, 'articlemedia-backslash-repair-report.json'),
    JSON.stringify({ total: totalWithIssue, corrected, stillBroken, details }, null, 2)
  )
}

main().catch(console.error)
