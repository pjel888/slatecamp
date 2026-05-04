
import { createContentAuditSupabaseClient, nowIso } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
import * as fs from 'node:fs'
const supabase = createContentAuditSupabaseClient()
const candidate = fs.readFileSync('.ai/content-audit-export/articles/allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c/candidate.md', 'utf8')
const result = await supabase
  .from('wiki_articles')
  .update({ content: candidate, updated_at: nowIso() })
  .eq('article_id', '9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c')
  .select('article_id,updated_at')
console.log(JSON.stringify(result))
