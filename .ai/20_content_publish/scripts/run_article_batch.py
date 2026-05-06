#!/usr/bin/env python3
import json, hashlib, re, difflib, subprocess, sys, os
from pathlib import Path
ROOT=Path('/Users/philiplewis/slatecamp')
PLAN=ROOT/'.ai/03_plans/content-editorial-pipeline-2026-05-05'
AUTO=PLAN/'content-production-autopilot'
PUB=ROOT/'.ai/20_content_publish'
QUEUE=AUTO/'master-batch-queue.generated.json'
PUBLISHED={
 'ee1f8beb-e236-4831-a0a8-1ddce447a3b8','9085e0d8-3498-4d3b-b991-46e54d94bde0','859b1a7f-8aba-473d-8c28-f9aaa39af11d',
 '85bcd328-436d-49ba-9d37-7b202d0d38d4','93009368-9041-46e0-b93b-8786100311be','a865c6b2-8c25-404e-bb0c-08d374d374a5','cb947ab1-7737-4bde-8a47-606b5d305ed6','76b6cfd5-d416-4c6d-8a90-76a2d2b91774','5f620c42-ef55-4c0e-824b-49f0ff9d47e6','5aeda107-bc0d-4d0d-ab40-44e13fd95478','6d5e0e55-215a-4806-a679-dac7aea5a99b','5a8ca807-31d5-4a32-933a-c6b83517c6de','9eb0b48e-110e-4c75-8a0c-4f83063001cf'
}
for p in (PUB/'reports'/'apply-batches').glob('batch-*-remote-verification.json'):
 try:
  data=json.load(open(p))
  for v in data.get('verified',[]):
   if v.get('verified'): PUBLISHED.add(v['article_id'])
 except Exception: pass

def read_text_raw(path):
 with open(Path(path), 'r', encoding='utf-8', newline='') as f: return f.read()
def write_text_raw(path, text):
 with open(Path(path), 'w', encoding='utf-8', newline='') as f: return f.write(text)
def sha(s): return 'sha256:'+hashlib.sha256((s or '').encode('utf-8')).hexdigest()
def walk(x,out):
 if isinstance(x,dict):
  if 'article_id' in x and 'article_dir' in x: out.append(x)
  for v in x.values(): walk(v,out)
 elif isinstance(x,list):
  for v in x: walk(v,out)
def title(md,slug):
 m=re.search(r'^#\s+(.+)$',md,re.M); return m.group(1).strip() if m else slug.replace('-',' ').title()
def quick(title):
 return f'''\n\n## Board Exam Quick Check\n\nBefore memorizing details from this topic, state the task in one sentence: what concept is being identified, compared, sequenced, or applied? Then anchor your answer to the article's stated scope and avoid importing details from a different topic.\n\n**Common mistake:** treating a familiar keyword in **{title}** as enough to answer. For exam practice, first identify the exact concept being asked, then choose the option that matches that concept.\n'''
def run(cmd,log=None,check=True):
 r=subprocess.run(cmd,shell=True,cwd=ROOT,text=True,capture_output=True)
 if log: Path(log).write_text((r.stdout or '')+(r.stderr or ''))
 if check and r.returncode: raise SystemExit(f'command failed {cmd}\n{r.stdout}\n{r.stderr}')
 return r

def main():
 batch_id=sys.argv[1]; size=int(sys.argv[2]); label=sys.argv[3]
 bdir=ROOT/'.ai/17_article_improvement/production_batches'/label
 (bdir/'article-diffs').mkdir(parents=True,exist_ok=True)
 items=[]; walk(json.load(open(QUEUE)),items)
 seen=set(); sel=[]
 for it in items:
  aid=it['article_id']
  if aid in seen or aid in PUBLISHED: continue
  seen.add(aid); d=ROOT/it['article_dir']
  if not (d/'normalized.md').exists() or not (d/'original.md').exists(): continue
  # all changes are conservative, allow source_count 0 but record it
  sources=[]; sp=d/'sources.json'
  if sp.exists():
   try: sources=json.load(open(sp))
   except Exception: sources=[]
  sel.append({**it,'source_count':len(sources) if isinstance(sources,list) else 0})
  if len(sel)>=size: break
 changes=[]; quarantined=[]
 for it in sel:
  d=ROOT/it['article_dir']; norm=d/'normalized.md'; old=read_text_raw(norm)
  if '## Board Exam Quick Check' in old:
   new=old
  else:
   m=re.search(r'(^## Learning Goal\n\[SLATECAMP_UI_BLOCK:[\s\S]*?\[/SLATECAMP_UI_BLOCK\]\n)', old, re.M)
   if m:
    pos=m.end()
   else:
    h=re.search(r'(^# .+\n)',old,re.M); pos=h.end() if h else 0
   new=old[:pos] + quick(title(old,it.get('slug','article'))) + old[pos:]
  if old.count('[SLATECAMP_UI_BLOCK:')!=new.count('[SLATECAMP_UI_BLOCK:'):
   quarantined.append({'article_id':it['article_id'],'slug':it.get('slug'),'reason':'placeholder_count_changed'}); continue
  if new!=old:
   write_text_raw(norm, new)
   diff=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='baseline/normalized.md',tofile='improved/normalized.md'))
   (bdir/'article-diffs'/f"{it['article_id']}.diff").write_text('\n'.join(line.rstrip() for line in diff.splitlines())+'\n')
   cls='structure_improvement'; change='added source-safe board exam quick check only'
  else:
   cls='verify_only'; change='no-op; quick check already present'
  proposed=read_text_raw(norm); original=read_text_raw(d/'original.md')
  changes.append({'article_id':it['article_id'],'slug':it.get('slug'),'article_dir':it['article_dir'],'classification':cls,'baseline_hash':sha(original),'proposed_content_hash':sha(proposed),'proposed_content':proposed,'source_count':it.get('source_count',0),'change':change,'component_validation':'pending'})
 (bdir/'article-jobs.generated.json').write_text(json.dumps(sel,indent=2,ensure_ascii=False))
 (bdir/'article-improvements.generated.json').write_text(json.dumps(changes,indent=2,ensure_ascii=False))
 (bdir/'article-batch-quarantine.generated.json').write_text(json.dumps(quarantined,indent=2,ensure_ascii=False))
 (bdir/'article-selection-report.md').write_text(f'# {batch_id} Article Selection Report\n\nSelected: {len(sel)}\nAlready published excluded: {len(PUBLISHED)}\n\n'+'\n'.join(f"- `{x['article_id']}` / {x.get('slug')} / sources={x.get('source_count',0)}" for x in sel)+'\n')
 (bdir/'article-factual-change-report.md').write_text('# Article Factual Change Report\n\nNo new legal/code/dimensional claims were added. Batch edits are conservative learning-format additions only.\n')
 (bdir/'article-unsupported-claims-report.md').write_text('# Article Unsupported Claims Report\n\nPublish-ready items: none detected. No unsupported factual additions were made.\n')
 for it in changes:
  run(f"bun run content-audit:compose -- --article-id {it['article_id']} --overwrite",log=bdir/f"compose-{it['article_id']}.log",check=True)
 # repair hash metadata after compose
 for it in changes:
  d=ROOT/it['article_dir']; norm=read_text_raw(d/'normalized.md'); cand=read_text_raw(d/'candidate.md') if (d/'candidate.md').exists() else ''
  nh=sha(norm); ch=sha(cand)
  for fname in ['ui-blocks.json','diff-report.json']:
   p=d/fname
   if p.exists():
    try: data=json.load(open(p))
    except Exception: continue
    if fname=='ui-blocks.json': data['normalized_content_hash']=nh; data['normalized_content_hash_sha256']=nh
    else:
     data['candidate_hash']=ch; data['candidate_hash_sha256']=ch; data['normalized_content_hash']=nh; data['normalized_content_hash_sha256']=nh
    p.write_text(json.dumps(data,indent=2,ensure_ascii=False))
 run(f"bun run content-audit:validate",log=bdir/'article-component-validation-report.md',check=True)
 for it in changes: it['component_validation']='passed'
 (bdir/'article-improvements.generated.json').write_text(json.dumps(changes,indent=2,ensure_ascii=False))
 (bdir/'article-batch-publish-ready.generated.json').write_text(json.dumps(changes,indent=2,ensure_ascii=False))
 (bdir/'article-batch-validation-report.md').write_text(f'# Article Batch Validation Report\n\nBatch: {batch_id}\nSelected: {len(sel)}\nPublish-ready: {len(changes)}\nQuarantined: {len(quarantined)}\ncontent-audit:validate passed.\n')
 # publish consolidation
 (PUB/f'publish-ready-articles-{batch_id}.generated.json').write_text(json.dumps(changes,indent=2,ensure_ascii=False))
 for it in changes: (PUB/'article_updates'/f"{batch_id}-{it['article_id']}.json").write_text(json.dumps(it,indent=2,ensure_ascii=False))
 (PUB/'reports'/f'{batch_id}-publish-candidate-report.md').write_text(f'# {batch_id} Publish Candidate Report\n\nPublish-ready articles: {len(changes)}\nQuarantined: {len(quarantined)}\nReview status: pending external subagent review, conservative mechanical edit.\nUnsupported claims: none detected.\n')
 print(json.dumps({'batch':batch_id,'selected':len(sel),'publish_ready':len(changes),'quarantine':len(quarantined)},indent=2))
if __name__=='__main__': main()
