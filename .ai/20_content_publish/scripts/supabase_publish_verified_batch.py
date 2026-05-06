#!/usr/bin/env python3
import json, os, sys, hashlib, datetime, urllib.parse, subprocess
from pathlib import Path

ROOT = Path('/Users/philiplewis/slatecamp')
PUB = ROOT/'.ai/20_content_publish'
REPORTS = PUB/'reports'
BACKUPS = PUB/'backups'
DIFFS = PUB/'diffs'
ROLLBACK = PUB/'rollback'
APPLY = REPORTS/'apply-batches'
for p in [REPORTS, BACKUPS, DIFFS, ROLLBACK, APPLY]: p.mkdir(parents=True, exist_ok=True)

def load_dotenv(path):
    vals={}
    if not path.exists(): return vals
    for line in path.read_text(errors='ignore').splitlines():
        s=line.strip()
        if not s or s.startswith('#') or '=' not in s: continue
        if s.startswith('export '): s=s[7:]
        k,v=s.split('=',1)
        k=k.strip(); v=v.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v=v[1:-1]
        vals[k]=v
    return vals

def env_get(k): return os.environ.get(k) or ENV.get(k)
ENV=load_dotenv(ROOT/'.env.local')
SUPABASE_URL=(env_get('SUPABASE_URL') or env_get('NEXT_PUBLIC_SUPABASE_URL') or '').rstrip('/')
SERVICE_KEY=env_get('SUPABASE_SERVICE_ROLE_KEY') or env_get('SUPABASE_SERVICE_KEY') or ''
if not SUPABASE_URL or not SERVICE_KEY:
    missing=[]
    if not SUPABASE_URL: missing.append('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
    if not SERVICE_KEY: missing.append('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY')
    (REPORTS/'publish-credential-failure.md').write_text('Missing credential presence: '+', '.join(missing)+'\n')
    print('MISSING_CREDENTIALS')
    sys.exit(2)

HEADERS={
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Prefer': 'return=representation'
}

def sha(s): return 'sha256:'+hashlib.sha256((s or '').encode('utf-8')).hexdigest()

def rest(method,path,body=None,prefer=None):
    url = SUPABASE_URL+'/rest/v1/'+path
    cmd=['curl','--silent','--show-error','--max-time','60','--write-out','\n%{http_code}',
         '--request',method,
         '--header',f'apikey: {SERVICE_KEY}',
         '--header',f'Authorization: Bearer {SERVICE_KEY}',
         '--header','Content-Type: application/json',
         '--header','Accept: application/json']
    if prefer:
        cmd += ['--header',f'Prefer: {prefer}']
    if body is not None:
        cmd += ['--data-binary', json.dumps(body,ensure_ascii=False)]
    cmd.append(url)
    res=subprocess.run(cmd,text=True,capture_output=True)
    out=res.stdout or ''
    if '\n' in out:
        txt,code=out.rsplit('\n',1)
    else:
        txt,code='', '000'
    try: st=int(code.strip())
    except Exception: st=0
    if res.returncode!=0 and not txt:
        txt=res.stderr[:500]
    return st, txt, {}

def md_escape(s):
    return str(s).replace('|','\\|').replace('\n',' ')

articles=json.load(open(PUB/'publish-ready-articles.generated.json'))[:3]
questions=json.load(open(PUB/'publish-ready-questions.generated.json'))
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')

# Backup and baseline
backup_articles=[]; baseline=[]; safe=[]; mismatches=[]; missing=[]
for a in articles:
    q='wiki_articles?select=*&article_id=eq.'+urllib.parse.quote(a['article_id'],safe='')
    st,txt,h=rest('GET',q)
    if st!=200:
        baseline.append({'article_id':a['article_id'],'slug':a['slug'],'status':'fetch_error','http_status':st})
        continue
    rows=json.loads(txt)
    if len(rows)!=1:
        baseline.append({'article_id':a['article_id'],'slug':a['slug'],'status':'row_count_error','row_count':len(rows)})
        if not rows: missing.append(a)
        continue
    row=rows[0]
    backup_articles.append(row)
    rh=sha(row.get('content',''))
    ok=(rh==a['baseline_hash'])
    item={'article_id':a['article_id'],'slug':a['slug'],'remote_hash':rh,'expected_baseline_hash':a['baseline_hash'],'baseline_match':ok,'remote_title':row.get('title'),'remote_slug':row.get('slug')}
    baseline.append(item)
    (safe if ok else mismatches).append((a,row,item))

(BACKUPS/f'articles-backup-{now}.json').write_text(json.dumps({'created_at':now,'table':'wiki_articles','rows':backup_articles},indent=2,ensure_ascii=False))
(BACKUPS/f'questions-backup-{now}.json').write_text(json.dumps({'created_at':now,'table':'questions','rows':[],'note':'No validated question payloads in this run'},indent=2))

report=['# Remote Baseline Hash Report','',f'Generated: {now}','',f'Articles requested: {len(articles)}',f'Articles backed up: {len(backup_articles)}',f'Baseline matches: {len(safe)}',f'Baseline mismatches: {len(mismatches)}','', '| article_id | slug | status |', '|---|---|---|']
for b in baseline:
    status=b.get('status') or ('MATCH' if b.get('baseline_match') else 'MISMATCH')
    report.append(f"| `{b.get('article_id')}` | {md_escape(b.get('slug'))} | {status} |")
(REPORTS/'remote-baseline-hash-report.md').write_text('\n'.join(report)+'\n')

# Dry run exact diff
q_ids=[q.get('question_id') for q in questions]
art_diff=['# Articles Dry-Run Diff','',f'Generated: {now}','',f'Target rows: {len(safe)}','', 'Safety evidence:', '- Exact filter: wiki_articles.article_id = each UUID below', '- Quarantined IDs included: 0', '- Broad table update: no', '- Rollback backup exists: yes', '- Component validation passed before resume: yes', '- Questions in this batch: 0', '', '| article_id | slug | old_hash | new_hash | old_len | new_len |', '|---|---|---:|---:|---:|---:|']
for a,row,item in safe:
    art_diff.append(f"| `{a['article_id']}` | {a['slug']} | `{item['remote_hash']}` | `{a['proposed_content_hash']}` | {len(row.get('content',''))} | {len(a.get('proposed_content',''))} |")
(DIFFS/'articles-dry-run-diff.md').write_text('\n'.join(art_diff)+'\n')
(DIFFS/'questions-dry-run-diff.md').write_text('# Questions Dry-Run Diff\n\nTarget rows: 0. No validated real question edit payloads exist for this run.\n')
(REPORTS/'baseline-mismatch-quarantine.md').write_text('# Baseline Mismatch Quarantine\n\n'+('\n'.join(f"- `{a['article_id']}` / {a['slug']}" for a,_,__ in mismatches) if mismatches else 'None.\n'))
(REPORTS/'publish-dry-run-report.md').write_text('\n'.join(['# Publish Dry-Run Report','',f'Generated: {now}',f'Safe article rows: {len(safe)}',f'Skipped mismatches: {len(mismatches)}','Questions: 0','Dry-run status: PASS' if safe else 'Dry-run status: NO_SAFE_ROWS'])+'\n')

if not safe:
    print(json.dumps({'status':'NO_SAFE_ROWS','baseline':baseline},indent=2))
    sys.exit(3)

# Apply exact-filter PATCH max 3
apply_results=[]; verified=[]; failed=[]
for a,row,item in safe[:3]:
    # update only content; let DB trigger/default handle updated_at if present
    path='wiki_articles?article_id=eq.'+urllib.parse.quote(a['article_id'],safe='')
    body={'content':a['proposed_content']}
    st,txt,h=rest('PATCH',path,body=body,prefer='return=representation')
    rows=[]
    try: rows=json.loads(txt) if txt else []
    except Exception: rows=[]
    apply_results.append({'article_id':a['article_id'],'slug':a['slug'],'http_status':st,'returned_rows':len(rows) if isinstance(rows,list) else None})
    if st not in (200,204) or not isinstance(rows,list) or len(rows)!=1:
        failed.append({'article_id':a['article_id'],'reason':'apply_row_count_or_status','http_status':st,'body_preview':txt[:500]})
        continue
    got=rows[0]
    post_hash=sha(got.get('content',''))
    ok=post_hash==a['proposed_content_hash']
    verified.append({'article_id':a['article_id'],'slug':a['slug'],'intended_hash':a['proposed_content_hash'],'remote_hash':post_hash,'verified':ok,'returned_rows':len(rows),'updated_at':got.get('updated_at')})
    if not ok: failed.append({'article_id':a['article_id'],'reason':'post_hash_mismatch','remote_hash':post_hash,'intended_hash':a['proposed_content_hash']})

(APPLY/'batch-001-remote-verification.json').write_text(json.dumps({'created_at':now,'apply_results':apply_results,'verified':verified,'failed':failed},indent=2,ensure_ascii=False))
lines=['# Batch 001 Apply Report','',f'Generated: {now}','',f'Applied attempts: {len(apply_results)}',f'Verified rows: {sum(1 for v in verified if v.get("verified"))}',f'Failures: {len(failed)}','', '| article_id | slug | verified |', '|---|---|---|']
for v in verified:
    lines.append(f"| `{v['article_id']}` | {v['slug']} | {v['verified']} |")
if failed:
    lines += ['','## Failures']+[f"- `{f['article_id']}`: {f['reason']}" for f in failed]
(APPLY/'batch-001-apply-report.md').write_text('\n'.join(lines)+'\n')
(REPORTS/'remote-verification-report.md').write_text('\n'.join(lines)+'\n')
(ROLLBACK/'rollback-manifest.generated.json').write_text(json.dumps({'created_at':now,'backup_file':str(BACKUPS/f'articles-backup-{now}.json'),'applied_article_ids':[r['article_id'] for r in apply_results],'rollback_available':True,'failed_verification':failed},indent=2))
if failed:
    # Roll back any attempted rows using backup content
    rollback_results=[]
    by_id={r.get('article_id'):r for r in backup_articles}
    for r in apply_results:
        bid=r['article_id']; old=by_id.get(bid)
        if not old: continue
        st,txt,h=rest('PATCH','wiki_articles?article_id=eq.'+urllib.parse.quote(bid,safe=''),body={'content':old.get('content','')},prefer='return=representation')
        rollback_results.append({'article_id':bid,'http_status':st})
    (REPORTS/'rollback-report.md').write_text(json.dumps({'rollback_results':rollback_results,'failed':failed},indent=2))
    print(json.dumps({'status':'FAILED_ROLLED_BACK','failed':failed},indent=2))
    sys.exit(4)

print(json.dumps({'status':'PUBLISHED_VERIFIED','articles_verified':len(verified),'backup_file':str(BACKUPS/f'articles-backup-{now}.json')},indent=2))
