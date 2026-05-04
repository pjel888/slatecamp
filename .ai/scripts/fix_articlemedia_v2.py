#!/usr/bin/env python3
"""
Fix remaining ArticleMedia tags in Supabase.
Real issue: some tags have literal backslash before closing quote:
  placementIntent=\"...period\\" /> (backslash + quote instead of just quote)
Fix: strip ALL backslash-before-quote within ArticleMedia tags.
"""

import json, subprocess, re
import time, os

SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycGR3cXVybmdueWFqdWhia2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3ODAyNCwiZXhwIjoyMDg4NDU0MDI0fQ.fLLvIwPo80GYLSwBNUiKslrgYc64OZ0QpT0XkctUI0w"
SUPABASE_URL = "https://hrpdwqurngnyajuhbkdg.supabase.co"
BACKUP_DIR = "/Users/philiplewis/slatecamp/.ai/articlemedia-fix-v2-backups"
os.makedirs(BACKUP_DIR, exist_ok=True)

def supabase_get(path):
    cmd = f'curl -s -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" "{SUPABASE_URL}{path}"'
    r = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    try: return json.loads(r.stdout)
    except: return None

def supabase_update(slug, new_content):
    import urllib.parse
    encoded = urllib.parse.quote(slug, safe="")
    payload = json.dumps({"content": new_content})
    cmd = f'curl -s -X PATCH -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d @- "{SUPABASE_URL}/rest/v1/wiki_articles?slug=eq.{encoded}"'
    r = subprocess.run(cmd, input=payload, capture_output=True, text=True, shell=True, timeout=15)
    return r.returncode == 0 and r.stdout.strip() == ""

# Fetch all articles
print("Fetching all articles from Supabase...")
articles = supabase_get("/rest/v1/wiki_articles?select=slug,content&limit=1000")
if not articles:
    print("ERROR: could not fetch articles")
    exit(1)
print(f"  {len(articles)} articles fetched")

# Find articles with REAL escaped quotes (backslash before double-quote in ArticleMedia)
# We search for: chr(92)+chr(34) inside or near any ArticleMedia tag
to_fix = []
for a in articles:
    content = a.get("content", "")
    slug = a.get("slug", "?")
    
    # Check if any ArticleMedia tag has backslash-quote anywhere in its vicinity
    idx = content.find("<ArticleMedia")
    while idx >= 0:
        # Find the end of this tag
        end = content.find(">", idx + 12)
        if end < 0:
            break
        tag = content[idx:end+1]
        
        # Check for backslash-quote in the tag
        for i in range(len(tag) - 1):
            if tag[i] == chr(92) and tag[i+1] == chr(34):
                to_fix.append((slug, idx, end))
                break
        else:
            # No issue in this tag, move on
            pass
        
        idx = content.find("<ArticleMedia", idx + 1)

# Deduplicate by slug
fix_slugs = list(dict.fromkeys([s for s, _, _ in to_fix]))
print(f"\nArticles needing fix: {len(fix_slugs)}")

if not fix_slugs:
    print("\n✅ NO ISSUES FOUND!")
    exit(0)

# Fix each article
fixed_count = 0
for i, slug in enumerate(fix_slugs):
    a = next((x for x in articles if x["slug"] == slug), None)
    if not a:
        continue
    
    original = a["content"]
    content = original
    
    # Replace ALL backslash-quote pairs within ArticleMedia tag context
    # Simple approach: find each ArticleMedia tag and clean it
    def clean_tag(m):
        tag = m.group(0)
        return tag.replace(chr(92) + chr(34), chr(34))  # \" -> "
    
    cleaned = re.sub(r'<ArticleMedia\s[^>]*?>', clean_tag, content)
    
    if cleaned == original:
        print(f"  ⏭️  [{i+1}/{len(fix_slugs)}] {slug}: no change after cleaning")
        continue
    
    # Backup
    with open(f"{BACKUP_DIR}/{slug.replace('/', '_')}.json", "w") as f:
        json.dump({"slug": slug, "original": original}, f)
    
    # Push
    success = supabase_update(slug, cleaned)
    if success:
        fixed_count += 1
        changes = sum(1 for i in range(len(original), len(cleaned)))  # rough
        print(f"  ✅ [{i+1}/{len(fix_slugs)}] {slug}: fixed")
    else:
        print(f"  ❌ [{i+1}/{len(fix_slugs)}] {slug}: PUSH FAILED")
    
    time.sleep(0.3)

print(f"\nFixed: {fixed_count}/{len(fix_slugs)}")
print(f"Backups: {BACKUP_DIR}/")
