
import { createContentAuditSupabaseClient, nowIso } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
import * as fs from 'node:fs'

const supabase = createContentAuditSupabaseClient()

// Try with a small article first
const articleId = '9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c'
const articleDir = '.ai/content-audit-export/articles/allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c'
const candidate = fs.readFileSync(articleDir + '/candidate.md', 'utf8')
const original = fs.readFileSync(articleDir + '/original.md', 'utf8')

console.log('Attempt 1: vanilla update with .eq("content", original)')
const { data: data1, error: error1 } = await supabase
  .from('wiki_articles')
  .update({ content: candidate, updated_at: nowIso() })
  .eq('article_id', articleId)
  .eq('content', original)
  .select('article_id,updated_at')
console.log('Data:', JSON.stringify(data1))
console.log('Error:', JSON.stringify(error1))

// Now try without the content filter  
console.log('\nAttempt 2: update without content.eq filter')
const { data: data2, error: error2 } = await supabase
  .from('wiki_articles')
  .update({ content: candidate, updated_at: nowIso() })
  .eq('article_id', articleId)
  .select('article_id,updated_at')
console.log('Data:', JSON.stringify(data2))
console.log('Error:', JSON.stringify(error2))
