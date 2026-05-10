import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContentAuditSupabaseClient, loadEnvLocal } from './lib';

loadEnvLocal();
const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, '.ai/content-audit-export/test-batch-002-content-improvement-3.json'), 'utf8'));
const supabase = createContentAuditSupabaseClient();
const results:any[] = [];
for (const item of manifest) {
  const candidate = readFileSync(join(root, item.path, 'candidate.md'), 'utf8');
  const localHash = 'sha256:' + createHash('sha256').update(candidate).digest('hex');
  const { data, error } = await supabase.from('wiki_articles').select('article_id,slug,title,content').eq('article_id', item.article_id).single();
  if (error) throw error;
  const liveHash = 'sha256:' + createHash('sha256').update(data.content ?? '').digest('hex');
  results.push({ article_id:item.article_id, slug:item.slug, localHash, liveHash, matches: localHash===liveHash, rawPlaceholders:(data.content ?? '').match(/\[SLATECAMP_UI_BLOCK:/g)?.length ?? 0, hasRealWorld:/^##\s+Real[- ]World Application/im.test(data.content ?? '') });
}
const out = { generated_at: new Date().toISOString(), results };
writeFileSync(join(root,'.ai/content-audit-export/test-batch-002-live-verification-2026-05-10.json'), JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
