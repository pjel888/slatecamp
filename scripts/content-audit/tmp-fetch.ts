
import { createContentAuditSupabaseClient, sha256 } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
const supabase = createContentAuditSupabaseClient()
const result = await supabase.from('wiki_articles').select('content').eq('article_id', '265185c0-c1ac-4f40-8db0-bde23084f634').single()
console.log(JSON.stringify({ hash: sha256(result.data.content ?? ''), length: (result.data.content ?? '').length }))
