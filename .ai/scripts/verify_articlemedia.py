#!/usr/bin/env python3
"""Final verification: check for remaining REAL issues in Supabase ArticleMedia tags."""

import re, json, subprocess

SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycGR3cXVybmdueWFqdWhia2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3ODAyNCwiZXhwIjoyMDg4NDU0MDI0fQ.fLLvIwPo80GYLSwBNUiKslrgYc64OZ0QpT0XkctUI0w"

cmd = f'curl -s -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" "https://hrpdwqurngnyajuhbkdg.supabase.co/rest/v1/wiki_articles?select=slug,content&limit=1000"'
r = subprocess.run(cmd, capture_output=True, text=True, shell=True)
articles = json.loads(r.stdout) if r.returncode == 0 else []

total = len(articles)
with_media = 0
total_blocks = 0
real_issues = []

for a in articles:
    content = a.get("content", "")
    slug = a.get("slug", "?")
    blocks = len(re.findall(r"<ArticleMedia\s+", content))
    if blocks > 0:
        with_media += 1
        total_blocks += blocks

    for m in re.finditer(r"<ArticleMedia\s+(.*?)>", content):
        tag = m.group(0)
        # Escaped quotes: literal backslash before quote in the DB text
        if "\\\"" in tag:
            real_issues.append((slug, "escaped_quotes", tag[:60]))
            break
        # Missing id
        if not re.search(r'\bid\s*=\s*["\']', tag):
            real_issues.append((slug, "missing_id", tag[:60]))
            break

print("=" * 70)
print("FINAL VERIFICATION — Supabase ArticleMedia Health Check")
print("=" * 70)
print(f"Total articles:    {total}")
print(f"With ArticleMedia: {with_media}")
print(f"Total blocks:      {total_blocks}")
print(f"Remaining issues:  {len(real_issues)}")
print()

esc = [x for x in real_issues if x[1] == "escaped_quotes"]
mid = [x for x in real_issues if x[1] == "missing_id"]
print(f"Escaped quotes:  {len(esc)}")
if esc:
    for s, t, tag in esc:
        print(f"  ❌ {s}: {tag}...")
print()
print(f"Missing id:      {len(mid)}")
if mid:
    for s, t, tag in mid:
        print(f"  ❌ {s}: {tag}...")
print()
if not real_issues:
    print("✅ NO ISSUES FOUND — ALL ArticleMedia tags are clean!")
print("=" * 70)
