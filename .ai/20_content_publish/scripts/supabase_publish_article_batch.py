#!/usr/bin/env python3
import json, os, sys, hashlib, datetime, urllib.parse, subprocess
from pathlib import Path
ROOT=Path('/Users/philiplewis/slatecamp'); PUB=ROOT/'.ai/20_content_publish'
BATCH=sys.argv[1] if len(sys.argv)>1 else 'batch-002'
INPUT=PUB/f'publish-ready-articles-{BATCH}.generated.json'
REPORTS=PUB/'reports'; BACKUPS=PUB/'backups'; DIFFS=PUB/'diffs'; APPLY=REPORTS/'apply-batches'; ROLLBACK=PUB/'rollback'
for p in [REPORTS,BACKUPS,DIFFS,APPLY,ROLLBACK]: p.mkdir(parents=True,exist_ok=True)
def dotenv(p):
 d={}
 if p.exists():
  for line in p.read_text(errors='ignore').splitlines():
   s=line.strip()
   if not s or s.startswith('#') or '=' not in s: continue
   if s.startswith('export '): s=s[7:]
   k,v=s.split('=',1); v=v.strip().strip('"\'')
   d[k.strip()]=v
 return d
ENV=dotenv(ROOT/'.env.local')
def eget(k): return os.environ.get(k) or ENV.get(k) or ''
URL=(eget('SUPABASE_URL') or eget('NEXT_PUBLIC_SUPABASE_URL')).rstrip('/'); KEY=eget('SUPABASE_SERVICE_ROLE_KEY') or eget('SUPABASE_SERVICE_KEY')
if not URL or not KEY: print('MISSING_CREDENTIALS'); sys.exit(2)
def sha(s): return 'sha256:'+hashlib.sha256((s or '').encode()).hexdigest()
def rest(method,path,body=None,prefer=None):
 cmd=['curl','--silent','--show-error','--max-time','60','--write-out','\n%{http_code}','--request',method,'--header',f'apikey: {KEY}','--header',f'Authorization: Bearer {KEY}','--header','Content-Type: application/json','--header','Accept: application/json']
 if prefer: cmd+=['--header',f'Prefer: {prefer}']
 if body is not None: cmd+=['--data-binary',json.dumps(body,ensure_ascii=False)]
 cmd.append(URL+'/rest/v1/'+path)
 r=subprocess.run(cmd,text=True,capture_output=True); out=r.stdout or ''
 txt,code=(out.rsplit('\n',1) if '\n' in out else ('','000'))
 try: st=int(code.strip())
 except: st=0
 if r.returncode and not txt: txt=r.stderr[:500]
 return st,txt,{}
items=json.load(open(INPUT)); now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
backup=[]; safe=[]; mismatch=[]; baseline=[]
for a in items:
 st,txt,_=rest('GET','wiki_articles?select=*&article_id=eq.'+urllib.parse.quote(a['article_id'],safe=''))
 if st!=200:
  baseline.append({'article_id':a['article_id'],'slug':a['slug'],'status':'fetch_error','http_status':st}); continue
 rows=json.loads(txt)
 if len(rows)!=1:
  baseline.append({'article_id':a['article_id'],'slug':a['slug'],'status':'row_count_error','row_count':len(rows)}); continue
 row=rows[0]; backup.append(row); rh=sha(row.get('content','')); ok=rh==a['baseline_hash']
 rec={'article_id':a['article_id'],'slug':a['slug'],'remote_hash':rh,'expected_baseline_hash':a['baseline_hash'],'baseline_match':ok}
 baseline.append(rec); (safe if ok else mismatch).append((a,row,rec))
backup_file=BACKUPS/f'articles-backup-{BATCH}-{now}.json'; backup_file.write_text(json.dumps({'created_at':now,'batch':BATCH,'table':'wiki_articles','rows':backup},indent=2,ensure_ascii=False))
(REPORTS/f'{BATCH}-remote-baseline-hash-report.md').write_text('# Remote Baseline Hash Report\n\n'+f'Batch: {BATCH}\nRequested: {len(items)}\nMatches: {len(safe)}\nMismatches: {len(mismatch)}\n\n'+'\n'.join(f"- `{b['article_id']}` / {b['slug']} / "+('MATCH' if b.get('baseline_match') else b.get('status','MISMATCH')) for b in baseline)+'\n')
(REPORTS/f'{BATCH}-baseline-mismatch-quarantine.md').write_text('# Baseline Mismatch Quarantine\n\n'+('None.\n' if not mismatch else '\n'.join(f"- `{a['article_id']}` / {a['slug']}" for a,_,__ in mismatch)+'\n'))
(DIFFS/f'articles-{BATCH}-dry-run-diff.md').write_text('# Articles Dry-Run Diff\n\n'+f'Batch: {BATCH}\nTarget rows: {len(safe)}\nExact filter: wiki_articles.article_id per row.\nRollback backup exists: yes.\nQuarantined IDs included: 0.\n\n'+'\n'.join(f"- `{a['article_id']}` / {a['slug']}` {rec['remote_hash']} -> {a['proposed_content_hash']}" for a,_,rec in safe)+'\n')
(REPORTS/f'{BATCH}-publish-dry-run-report.md').write_text('# Publish Dry-Run Report\n\n'+f'Batch: {BATCH}\nSafe rows: {len(safe)}\nSkipped mismatches: {len(mismatch)}\nStatus: '+('PASS' if safe else 'NO_SAFE_ROWS')+'\n')
if not safe: print('NO_SAFE_ROWS'); sys.exit(3)
apply=[]; verified=[]; failed=[]
for a,row,rec in safe:
 st,txt,_=rest('PATCH','wiki_articles?article_id=eq.'+urllib.parse.quote(a['article_id'],safe=''),{'content':a['proposed_content']},'return=representation')
 try: rows=json.loads(txt) if txt else []
 except: rows=[]
 apply.append({'article_id':a['article_id'],'slug':a['slug'],'http_status':st,'returned_rows':len(rows) if isinstance(rows,list) else None})
 if st not in (200,204) or not isinstance(rows,list) or len(rows)!=1:
  failed.append({'article_id':a['article_id'],'reason':'apply_status_or_row_count','http_status':st,'body_preview':txt[:300]}); continue
 post=sha(rows[0].get('content','')); ok=post==a['proposed_content_hash']
 verified.append({'article_id':a['article_id'],'slug':a['slug'],'remote_hash':post,'intended_hash':a['proposed_content_hash'],'verified':ok})
 if not ok: failed.append({'article_id':a['article_id'],'reason':'post_hash_mismatch'})
(APPLY/f'{BATCH}-remote-verification.json').write_text(json.dumps({'created_at':now,'batch':BATCH,'apply_results':apply,'verified':verified,'failed':failed},indent=2,ensure_ascii=False))
md='# Apply Report\n\n'+f'Batch: {BATCH}\nApplied attempts: {len(apply)}\nVerified: {sum(1 for v in verified if v["verified"])}\nFailures: {len(failed)}\n\n'+'\n'.join(f"- `{v['article_id']}` / {v['slug']} / verified={v['verified']}" for v in verified)+'\n'
(APPLY/f'{BATCH}-apply-report.md').write_text(md); (REPORTS/f'{BATCH}-remote-verification-report.md').write_text(md)
(ROLLBACK/f'rollback-manifest-{BATCH}.generated.json').write_text(json.dumps({'created_at':now,'batch':BATCH,'backup_file':str(backup_file),'applied_article_ids':[x['article_id'] for x in apply],'failed':failed,'rollback_available':True},indent=2))
if failed:
 by={r.get('article_id'):r for r in backup}
 rb=[]
 for r in apply:
  old=by.get(r['article_id'])
  if old:
   st,txt,_=rest('PATCH','wiki_articles?article_id=eq.'+urllib.parse.quote(r['article_id'],safe=''),{'content':old.get('content','')},'return=representation')
   rb.append({'article_id':r['article_id'],'http_status':st})
 (REPORTS/f'{BATCH}-rollback-report.md').write_text(json.dumps({'rollback':rb,'failed':failed},indent=2))
 print('FAILED_ROLLED_BACK'); sys.exit(4)
print(json.dumps({'status':'PUBLISHED_VERIFIED','batch':BATCH,'verified':len(verified),'backup_file':str(backup_file)},indent=2))
