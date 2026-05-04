#!/usr/bin/env python3
"""Final SAFE verification: check for escaped quotes using byte-level comparison."""

import json, subprocess, re

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

    # Byte-level scan for ArticleMedia tags with escaped quotes
    # We search for: backslash (0x5c) followed by double-quote (0x22) in tag context
    for m in re.finditer(r"<ArticleMedia\s+(.*?)>", content):
        tag = m.group(0)
        # Direct character check — no escaping tricks
        has_escaped = False
        for i in range(len(tag) - 1):
            if tag[i] == chr(92) and tag[i + 1] == chr(34):
                has_escaped = True
                break
        if has_escaped:
            real_issues.append((slug, "escaped_quotes"))
            continue
        # Missing id (no id= after the tag open)
        if not re.search(r'\bid\s*=\s*["\']', tag):
            real_issues.append((slug, "missing_id"))

print("=" * 70)
print("FINAL VERIFICATION — clean byte-level check")
print("=" * 70)
print(f"Total articles:    {total}")
print(f"With ArticleMedia: {with_media}")
print(f"Total blocks:      {total_blocks}")
print()

esc = [s for s, t in real_issues if t == "escaped_quotes"]
mid = [s for s, t in real_issues if t == "missing_id"]
print(f"Escaped quotes:  {len(esc)}")
print(f"Missing id:      {len(mid)}")
print(f"Total issues:    {len(real_issues)}")

if esc:
    print("\nEscaped quote articles:")
    for s in esc[:5]:
        print(f"  - {s}")
if mid:
    print("\nMissing ID articles:")
    for s in mid:
        print(f"  - {s}")

if not real_issues:
    print("\n✅ ALL CLEAN — No ArticleMedia issues found!")
print("=" * 70)
