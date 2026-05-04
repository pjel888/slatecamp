#!/usr/bin/env python3
"""Push ArticleMedia from 12 local articles into Supabase using real slugs from article-metadata.json."""

import re, json, os, subprocess, time
from urllib.parse import quote

SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycGR3cXVybmdueWFqdWhia2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3ODAyNCwiZXhwIjoyMDg4NDU0MDI0fQ.fLLvIwPo80GYLSwBNUiKslrgYc64OZ0QpT0XkctUI0w"
BASE = "https://hrpdwqurngnyajuhbkdg.supabase.co"
ARTICLES_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

folder_slugs = [
    ("lea-prac-eth-006", "lea-prac-eth-006-obligations-to-fellow-architects-non-poaching-non-interference-and-professional-cou--bceaa05b-1eaa-4369-a29c-fbd8aef6937b"),
    ("lea-prac-frm-014", "lea-prac-frm-014-bim-in-philippine-architectural-practice-status-obligations-and-practice-implicatio--8b263a7c-5e3e-4157-a18b-146f5b12f521"),
    ("lea-prac-frm-015", "lea-prac-frm-015-data-privacy-act-ra-10173-the-architect-s-obligations-when-handling-client-informat--bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4"),
    ("lea-prac-frm-017", "lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-20--e61e81a9-c0e3-4e60-ab5e-6b3fe3026004"),
    ("lea-prac-frm-019", "lea-prac-frm-019-project-management-in-an-architectural-firm-scope-schedule-budget-and-communication--85529595-d219-4b10-9bd9-383d125da8c3"),
    ("lea-prac-frm-020", "lea-prac-frm-020-technical-specifications-writing-csi-masterformat-specification-types-and-the-archi--47317c8d-e2d6-4d17-b18a-3c469b73080c"),
    ("lea-prac-frm-021", "lea-prac-frm-021-quantity-surveying-and-cost-estimation-the-architect-s-role-vs-the-qs-professional---303f8a75-b42b-4405-8c39-082b4d7b6322"),
    ("lea-prac-law-011", "lea-prac-law-011-architect-of-record-vs-architect-in-charge-of-construction-liability-and-accountabi--17b95df0-6bea-43c6-ab03-2b82a358caa6"),
    ("lea-prac-law-017", "lea-prac-law-017-the-signing-sealing-prohibition-direct-supervision-delegation-and-disciplinary-expo--16e972e5-378d-426c-9269-d716204c52de"),
    ("lea-prac-svc-005", "lea-prac-svc-005-phase-1-schematic-design-deliverables-decisions-and-fee-earnedschematic-design-is-t--b3d5ae5b-09a9-426c-9feb-00932e5555aa"),
    ("lea-prac-svc-018", "lea-prac-svc-018-building-condition-assessment-adaptive-reuse-and-heritage-conservation-as-practice---75ef7a25-2d9d-455d-8d89-e6eb0b691240"),
    ("lea-prac-svc-020", "lea-prac-svc-020-design-build-by-administration-vs-design-build-by-guaranteed-maximum-cost-the-criti--ecf888fd-c314-4d20-87e6-4841f84b71a0"),
]

def supabase_get(path):
    cmd = f'curl -s -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" "{BASE}{path}"'
    r = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    try: return json.loads(r.stdout)
    except: return None

def supabase_update(slug, new_content):
    encoded = quote(slug, safe="")
    payload = json.dumps({"content": new_content})
    cmd = f'curl -s -X PATCH -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d {quote(payload)} "{BASE}/rest/v1/wiki_articles?slug=eq.{encoded}"'
    r = subprocess.run(cmd, capture_output=True, text=True, shell=True, timeout=15)
    return r.returncode == 0

print("=" * 70)
print("PUSH 12 MISSING ARTICLES — using article-metadata.json real slugs")
print("=" * 70)

pushed = 0
failed = 0
skipped = 0

for prefix, folder in folder_slugs:
    dir_path = os.path.join(ARTICLES_DIR, folder)

    # Get real slug from metadata
    meta_path = os.path.join(dir_path, "article-metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)
        real_slug = meta.get("slug", prefix)
    else:
        # Fallback: use LIKE query
        real_slug = prefix

    # Read local normalized.md
    nm_path = os.path.join(dir_path, "normalized.md")
    if not os.path.exists(nm_path):
        print(f"  ⏭️  {prefix}: no normalized.md")
        skipped += 1
        continue

    with open(nm_path, encoding="utf-8") as f:
        local_content = f.read()

    local_tags = re.findall(r'<ArticleMedia\s[^>]*?>', local_content)
    if not local_tags:
        print(f"  ⏭️  {prefix}: no ArticleMedia in local")
        skipped += 1
        continue

    # Get Supabase content
    data = supabase_get(f"/rest/v1/wiki_articles?select=slug,content&slug=eq.{quote(real_slug, safe='')}")
    if not data or len(data) == 0:
        # Try LIKE query
        data = supabase_get(f"/rest/v1/wiki_articles?select=slug,content&slug=like.{prefix}*")
        if not data or len(data) == 0:
            print(f"  ❌ {prefix}: not found in Supabase (tried '{real_slug}' and '{prefix}*')")
            failed += 1
            continue
        real_slug = data[0]["slug"]

    content = data[0].get("content", "")

    if '<ArticleMedia' in content:
        print(f"  ⏭️  {prefix}: already has ArticleMedia tags")
        skipped += 1
        continue

    # Insert tags at the best spot
    lines = content.split("\n")
    insert_idx = len(lines)
    for i, line in enumerate(lines):
        if line.strip().startswith("## ") and "reference" in line.lower():
            insert_idx = i
            break

    for tag in local_tags:
        lines.insert(insert_idx, f"\n{tag}\n")
        insert_idx += 2

    new_content = "\n".join(lines)

    if supabase_update(real_slug, new_content):
        pushed += 1
        print(f"  ✅ {real_slug}: pushed {len(local_tags)} tags")
    else:
        failed += 1
        print(f"  ❌ {real_slug}: push failed")

    time.sleep(0.3)

print()
print(f"Pushed: {pushed}, Skipped: {skipped}, Failed: {failed}")
print("=" * 70)
