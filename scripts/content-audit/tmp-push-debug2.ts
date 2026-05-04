
import { createContentAuditSupabaseClient, nowIso } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
import * as fs from 'node:fs'
const supabase = createContentAuditSupabaseClient()
const articleId = '265185c0-c1ac-4f40-8db0-bde23084f634'
const articleDir = '.ai/content-audit-export/articles/lea-prac-eth-010-introduction--265185c0-c1ac-4f40-8db0-bde23084f634'
const candidate = fs.readFileSync(articleDir + '/candidate.md', 'utf8')

// Try WITHOUT the .eq('content', ...) filter
const result = await supabase
  .from('wiki_articles')
  .update({ content: candidate, updated_at: nowIso() })
  .eq('article_id', articleId)
  .select('article_id,updated_at')

console.log('Update without content filter:', JSON.stringify(result, null, 2))
