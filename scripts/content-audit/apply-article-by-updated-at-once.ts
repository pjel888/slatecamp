import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createContentAuditSupabaseClient, loadEnvLocal } from './lib'

const articleId = process.argv[2]
const note = process.argv.slice(3).join(' ') || null
if (!articleId) throw new Error('Usage: bun scripts/content-audit/apply-article-by-updated-at-once.ts <article_id> [note]')

const root = join(process.cwd(), '.ai/content-audit-export/articles')
const { readdirSync } = await import('node:fs')
const folderName = readdirSync(root).find((name) => name.endsWith(`--${articleId}`))
if (!folderName) throw new Error(`Article folder not found for ${articleId}`)
const folder = join(root, folderName)
const candidate = readFileSync(join(folder, 'candidate.md'), 'utf8')
const candidateHash = 'sha256:' + createHash('sha256').update(candidate).digest('hex')

loadEnvLocal()
const supabase = createContentAuditSupabaseClient()
const { data: before, error: fetchError } = await supabase
  .from('wiki_articles')
  .select('article_id,content,updated_at')
  .eq('article_id', articleId)
  .maybeSingle()
if (fetchError) throw fetchError
if (!before) throw new Error('Remote article not found')
const beforeHash = 'sha256:' + createHash('sha256').update(before.content ?? '').digest('hex')
const placeholderCount = (candidate.match(/\[SLATECAMP_UI_BLOCK:/g) ?? []).length
if (placeholderCount) throw new Error(`candidate has ${placeholderCount} raw placeholders`)

const payload: Record<string, unknown> = { content: candidate, updated_at: new Date().toISOString() }
if (note) payload.updated_note = note
const { data: updated, error: updateError } = await supabase
  .from('wiki_articles')
  .update(payload)
  .eq('article_id', articleId)
  .eq('updated_at', before.updated_at)
  .select('article_id,content,updated_at')
if (updateError) throw updateError
if (!updated || updated.length !== 1) throw new Error(`CAS update affected ${updated?.length ?? 0} rows`)
const afterHash = 'sha256:' + createHash('sha256').update(updated[0].content ?? '').digest('hex')
const result = { article_id: articleId, before_hash: beforeHash, candidate_hash: candidateHash, after_hash: afterHash, matches: afterHash === candidateHash, raw_placeholders_after: ((updated[0].content ?? '').match(/\[SLATECAMP_UI_BLOCK:/g) ?? []).length, updated_at_before: before.updated_at, updated_at_after: updated[0].updated_at }
writeFileSync(join(folder, 'updated-at-apply-result.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
if (!result.matches || result.raw_placeholders_after !== 0) process.exit(1)
