// Find all 3 remaining fallback articles
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { compile } from '@mdx-js/mdx'
import { sanitizeMDX, injectEIPrompts } from '../../../src/lib/wiki-markdown'

const ARTICLES_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'

async function main() {
  const dirs = readdirSync(ARTICLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  
  for (const dir of dirs) {
    const slug = dir.name.replace(/--[a-f0-9-]+$/, '')
    const normPath = join(ARTICLES_DIR, dir.name, 'normalized.md')
    if (!existsSync(normPath)) continue
    
    const content = readFileSync(normPath, 'utf-8')
    if (!content.includes('<ArticleMedia')) continue
    
    const cleaned = content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '').replace(/<!--[\s\S]*?-->/g, '')
    const processed = injectEIPrompts(cleaned, [])
    const sanitized = sanitizeMDX(processed)
    
    const hasArticleMedia = sanitized.includes('<ArticleMedia')
    
    try {
      const result = await compile(sanitized, { outputFormat: 'function-body', providerImportSource: undefined, development: false })
      if (!String(result).includes('ArticleMedia')) {
        console.log(`❌ ${slug}: compiled BUT ArticleMedia missing. Raw AM present: ${hasArticleMedia}`)
      }
    } catch (e: any) {
      const msg = (e.message || '').substring(0, 150)
      console.log(`❌ ${slug}: compile FAILED — ${msg}`)
    }
  }
  
  console.log('Done.')
}

main().catch(console.error)
