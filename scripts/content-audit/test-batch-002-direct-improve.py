#!/usr/bin/env python3
"""
Direct SlateCamp test-batch content improvement helper.
Human-supervised deterministic edits only. Does not apply to Supabase.
"""
import json, re, hashlib, subprocess, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT/'.ai/content-audit-export/test-batch-002-content-improvement-3.json'
REPORT = ROOT/'.ai/content-audit-export/test-batch-002-content-improvement-report-2026-05-10.md'

TYPO_FIXES = {
    'prevleance': 'prevalence',
    'equivleant': 'equivalent',
    'wall/celling': 'wall/ceiling',
    'TRAP LEART': 'TRAP ALERT',
    'VA T': 'VAT',
}

def run(cmd, timeout=180):
    p = subprocess.run(cmd, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout)
    return p.returncode, p.stdout

def word_count(s):
    return len(re.findall(r"\b[\w’'-]+\b", s))

def has_real_world(s):
    return bool(re.search(r'^##\s+Real[- ]World Application', s, re.I|re.M))

def insert_before_cross_refs(text, section):
    m = re.search(r'\n##\s+Cross[\- ]?References\b', text, re.I)
    if m:
        return text[:m.start()] + '\n' + section.strip() + '\n' + text[m.start():]
    return text.rstrip() + '\n\n' + section.strip() + '\n'

def improve(slug, text):
    notes=[]
    out=text
    for a,b in TYPO_FIXES.items():
        if a in out:
            out=out.replace(a,b); notes.append(f'typo {a}->{b}')
    if slug == 'plastics-in-construction' and not has_real_world(out):
        section = '''
## Real-World Application

Suppose an architect is reviewing a proposed neighborhood commercial building in Iloilo with translucent plastic skylights over the retail concourse and plastic light diffusers along the corridor ceiling. The first move is not to approve the material because it looks lightweight or economical. The architect must identify the specific plastic use: skylight, diffuser, veneer, or interior finish. Each use has a different fire-safety limit under Rule XVI, so the drawing notes should separate the areas and show the tested flame-spread, smoke, and toxicity data supplied by the manufacturer. If the skylight area pushes the aggregate roof-plastic limit, the architect coordinates with the fire-protection designer instead of hiding the issue in a generic materials schedule. The board-exam lesson is the same: classify the plastic application first, then test the area, separation, height, and protection requirement. Do not answer from the word “plastic” alone.
'''
        out=insert_before_cross_refs(out, section); notes.append('added real-world application scenario')
    elif slug == 'lea-prac-eth-010-introduction' and not has_real_world(out):
        section = '''
## Real-World Application

Suppose a young architect in Cebu is asked by a relative to “just sign” a small commercial fit-out prepared by an unlicensed drafter. The ethical problem is not only family pressure. The architect must decide whether the documents were prepared under responsible professional control, whether the scope is honestly represented, and whether signing would mislead the client, the building official, or the public. A proper response is to review the work, identify missing code and coordination checks, explain what professional responsibility requires, and either take over the work lawfully or refuse the signature. In LEA questions, this kind of situation usually tests the difference between loyalty to a client and duty to the public. When the choices look personal, translate them into professional obligations: competence, honesty, accountability, and protection of life, health, and property.
'''
        out=insert_before_cross_refs(out, section); notes.append('added real-world application scenario')
    elif slug == 'rule-i-general-provisions' and not has_real_world(out):
        section = '''
## Real-World Application

Suppose an architect is preparing a permit set for a two-storey mixed-use building in a provincial city. Before checking stair widths, fire-resistive ratings, or sanitation details, the architect first asks whether the project is within the scope of the National Building Code and which authority will evaluate compliance. Rule I matters because it frames the code as a public-safety instrument, not a private design preference. In practice, that means the drawings, specifications, and professional seals must support the Building Official’s review instead of leaving essential compliance decisions for construction. For the board exam, treat Rule I as the orientation rule: identify the purpose of the code, the authority administering it, and the basic obligation to comply before jumping to later technical tables. Many wrong answers fail because they quote a later rule while missing the basic scope and enforcement logic.
'''
        out=insert_before_cross_refs(out, section); notes.append('added real-world application scenario')
    return out, notes

items=json.loads(MANIFEST.read_text())
rows=[]
for it in items:
    path=ROOT/it['path']; nm=path/'normalized.md'
    text=nm.read_text()
    before_hash=hashlib.sha256(text.encode()).hexdigest()
    improved, notes=improve(it['slug'], text)
    if improved != text:
        nm.write_text(improved)
    after_hash=hashlib.sha256(improved.encode()).hexdigest()
    compose=run(['bun','run','content-audit:compose','--','--article-id',it['article_id'],'--overwrite'])
    validate=run(['bun','run','content-audit:validate','--','--article-id',it['article_id'],'--dry-run','--summary'])
    diff=run(['bun','run','content-audit:diff','--','--article-id',it['article_id'],'--dry-run','--summary'])
    push=run(['bun','run','content-audit:push:dry-run','--','--article-id',it['article_id'],'--repair-placeholders'])
    cand=(path/'candidate.md').read_text() if (path/'candidate.md').exists() else ''
    status='READY_FOR_APPLY' if all(x[0]==0 for x in [compose,validate,diff,push]) and '[SLATECAMP_UI_BLOCK:' not in cand and notes else 'PARKED'
    rows.append({
        'article_id':it['article_id'],'slug':it['slug'],'status':status,'notes':notes,
        'before_hash':before_hash,'after_hash':after_hash,'candidate_hash':'sha256:'+hashlib.sha256(cand.encode()).hexdigest() if cand else 'n/a',
        'candidate_raw_placeholders': cand.count('[SLATECAMP_UI_BLOCK:'),
        'word_count':word_count(improved),'has_real_world':has_real_world(improved),
        'compose_exit':compose[0], 'validate_exit':validate[0], 'diff_exit':diff[0], 'push_dry_exit':push[0],
        'push_tail':push[1][-500:]
    })

lines=['# Test Batch 002 Content Improvement Report - 2026-05-10','',f'Generated: {datetime.datetime.now().isoformat()}','', '## Summary','']
lines.append(f'- Articles in test batch: {len(rows)}')
lines.append(f'- Ready for apply after improvement gates: {sum(r["status"]=="READY_FOR_APPLY" for r in rows)}')
lines.append(f'- Parked: {sum(r["status"]=="PARKED" for r in rows)}')
lines.append('- Supabase apply: not run by this helper. Apply requires explicit per-article final gate after review of this report.')
lines.append('')
for r in rows:
    lines += [f'## {r["slug"]}', '', f'- Status: {r["status"]}', f'- Article ID: `{r["article_id"]}`', f'- Word count: {r["word_count"]}', f'- Real-World Application present: {r["has_real_world"]}', f'- Notes: {", ".join(r["notes"]) if r["notes"] else "none"}', f'- Candidate hash: `{r["candidate_hash"]}`', f'- Candidate raw placeholders: {r["candidate_raw_placeholders"]}', f'- Gates: compose={r["compose_exit"]}, validate={r["validate_exit"]}, diff={r["diff_exit"]}, push-dry={r["push_dry_exit"]}', f'- Push dry-run tail: `{r["push_tail"].strip().replace(chr(10)," ")}`', '']
REPORT.write_text('\n'.join(lines))
print(REPORT)
print(json.dumps(rows, indent=2))
