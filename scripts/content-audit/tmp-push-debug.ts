
import { createContentAuditSupabaseClient, sha256, nowIso } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
import * as fs from 'node:fs'
const supabase = createContentAuditSupabaseClient()
const articleId = '265185c0-c1ac-4f40-8db0-bde23084f634'
const articleDir = '.ai/content-audit-export/articles/lea-prac-eth-010-introduction--265185c0-c1ac-4f40-8db0-bde23084f634'
const original = fs.readFileSync(articleDir + '/original.md', 'utf8')
const candidate = fs.readFileSync(articleDir + '/candidate.md', 'utf8')

console.log('original hash:', sha256(original))
console.log('candidate hash:', sha256(candidate))
console.log('original length:', original.length)
console.log('candidate length:', candidate.length)

// Try the exact update the push script does
const updatePayload = {
  content: candidate,
  updated_at: nowIso(),
}

const result = await supabase
  .from('wiki_articles')
  .update(updatePayload)
  .eq('article_id', articleId)
  .eq('content', original)
  .select('article_id,updated_at')

console.log('Update result:', JSON.stringify(result, null, 2))
