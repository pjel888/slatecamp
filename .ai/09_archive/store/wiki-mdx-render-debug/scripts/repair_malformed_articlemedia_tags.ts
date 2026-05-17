/**
 * Repair structurally malformed ArticleMedia tags in article content.
 * 
 * Issue: Some articles have an ArticleMedia tag where the 'alt' attribute contains
 * `\" caption=\"...\" suggestedAsset=\"...\" placementIntent=\"...\"` — the entire
 * remaining tag structure is embedded inside the alt value as \"-delimited text.
 * 
 * Fix: Extract the proper separate attributes from the malformed alt value.
 * 
 * Pattern detected:
 *   alt="Legitimate text...\" caption=\"Caption text\" suggestedAsset=\"Asset text\" placementIntent=\"Intent text\"
 * Should be:
 *   alt="Legitimate text..." caption="Caption text" suggestedAsset="Asset text" placementIntent="Intent text"
 * 
 * This only affects specific articles identified in the audit (lea-hist-008-* etc.)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const OUTPUT_DIR = '/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug'
mkdirSync(OUTPUT_DIR, { recursive: true })

interface RepairResult {
  slug: string
  hadIssue: boolean
  tagsRepaired: number
  compiledBefore: boolean
  compiledAfter: boolean
  articleMediaBefore: boolean
  articleMediaAfter: boolean
  errorBefore: string
}

function repairArticleMediaTags(content: string): string {
  // Pattern: <ArticleMedia ... alt="...\" caption=\"...\" suggestedAsset=\"...\" placementIntent=\"...\" />
  // The "" inside alt="" needs to be split into proper attributes
  return content.replace(
    /(<ArticleMedia[\s\S]*?alt="[^"]*?)\\"\s+caption=\\"([^"]*?)\\"\s+suggestedAsset=\\"([^"]*?)\\"\s+placementIntent=\\"([^"]*?)\\"\s*\/>/g,
    (match, altStart, caption, suggestedAsset, placementIntent) => {
      return `${altStart}" caption="${caption}" suggestedAsset="${suggestedAsset}" placementIntent="${placementIntent}" />`
    }
  )
}

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
  
  console.log(`\n=== Scanning for malformed ArticleMedia tags ===`)
  
  let found = 0
  const results: RepairResult[] = []
  
  for (const dir of dirs) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    const content = readFileSync(normPath, 'utf-8')
    
    // Check for the malformed pattern
    const pattern = /\\"\s+caption=\\"/g
    if (pattern.test(content)) {
      found++
      const repaired = repairArticleMediaTags(content)
      
      // Test compile before
      let compiledBefore = false
      let errorBefore = ''
      try {
        await compile(content, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
        compiledBefore = true
      } catch (e: any) {
        errorBefore = e.message?.substring(0, 150) || ''
      }
      
      // Test compile after
      let compiledAfter = false
      try {
        // Normalize + repair + try compile
        const { normalizeWikiMdxComponentBlocks } = await import('../../../src/lib/wiki-markdown')
        const normalized = normalizeWikiMdxComponentBlocks(repaired)
        await compile(normalized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
        compiledAfter = true
      } catch (e: any) {
        console.log(`  ❌ Still fails after repair: ${slug}: ${e.message?.substring(0, 100)}`)
      }
      
      results.push({
        slug,
        hadIssue: true,
        tagsRepaired: (content.match(/\\"\s+caption=\\"/g) || []).length,
        compiledBefore,
        compiledAfter,
        articleMediaBefore: content.includes('<ArticleMedia'),
        articleMediaAfter: repaired.includes('<ArticleMedia'),
        errorBefore,
      })
      
      console.log(`  ${slug}: Before=${compiledBefore} After=${compiledAfter}`)
    }
  }
  
  console.log(`\nFound ${found} articles with malformed alt attributes`)
  console.log(`Repaired successfully: ${results.filter(r => r.compiledAfter).length}`)
  console.log(`Still failing: ${results.filter(r => !r.compiledAfter).length}`)
  
  // Write report
  const report = {
    scan_date: new Date().toISOString(),
    total_found: found,
    repaired_ok: results.filter(r => r.compiledAfter).length,
    still_failing: results.filter(r => !r.compiledAfter).length,
    details: results,
  }
  
  writeFileSync(join(OUTPUT_DIR, 'articlemedia-tag-repair-report.json'), JSON.stringify(report, null, 2))
  console.log(`\nWrote report`)
  
  // Also write the repair instructions for Supabase
  // For now, just document the pattern
  console.log('\n=== REPAIR PATTERN ===')
  console.log('The malformed articles have ArticleMedia tags where `alt` contains')
  console.log('  `\\" caption=\\"...\\" suggestedAsset=\\"...\\" placementIntent=\\"...\\"`')
  console.log('embedded as a single attribute. The fix splits these into separate')
  console.log('proper attributes: alt, caption, suggestedAsset, placementIntent.')
  console.log('This is a content generation artifact. To fix in Supabase, run:')
  console.log()
  console.log('UPDATE wiki_articles SET content = regexp_replace(content,')
  console.log("  '<ArticleMedia([^>]*?)alt=\"([^\"]*?)\\\\\" caption=\\\\\"([^\"]*?)\\\\\" suggestedAsset=\\\\\"([^\"]*?)\\\\\" placementIntent=\\\\\"([^\"]*?)\\\\\"\\s*/>',")
  console.log("  '<ArticleMedia\\\\1alt=\"\\\\2\" caption=\"\\\\3\" suggestedAsset=\"\\\\4\" placementIntent=\"\\\\5\" />',")
  console.log("  'g')")
  console.log('WHERE content ~ \'<ArticleMedia[^>]*?alt=\"[^\"]*?\\\\\" caption=\\\\\"\'')
}

main().catch(console.error)
