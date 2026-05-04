#!/usr/bin/env python3
"""
Fix ArticleMedia issues in Supabase production:
1. Fix escaped quotes (\") in attribute values → regular quotes
2. Add missing id attributes to tags that lack them
3. Push ArticleMedia from 12 articles that have it locally but missing from Supabase

Usage: python3 fix_articlemedia_issues.py
"""

import re
import json
import os
import subprocess
import sys
from urllib.parse import quote

# ── Config ──────────────────────────────────────────────
SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycGR3cXVybmdueWFqdWhia2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3ODAyNCwiZXhwIjoyMDg4NDU0MDI0fQ.fLLvIwPo80GYLSwBNUiKslrgYc64OZ0QpT0XkctUI0w"
SUPABASE_URL = "https://hrpdwqurngnyajuhbkdg.supabase.co"
ARTICLES_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
BACKUP_DIR = "/Users/philiplewis/slatecamp/.ai/fix-articlemedia-backups"

os.makedirs(BACKUP_DIR, exist_ok=True)


def supabase_get(path):
    cmd = f'curl -s -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" "{SUPABASE_URL}{path}"'
    r = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    if r.returncode != 0:
        print(f"  ERROR fetching: {r.stderr[:200]}")
        return None
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError as e:
        print(f"  ERROR parsing JSON: {e}")
        return None


def supabase_update(slug, new_content):
    """Update article content in Supabase via REST API."""
    # Encode slug for URL
    encoded_slug = quote(slug, safe="")
    payload = json.dumps({"content": new_content})

    cmd = [
        "curl", "-s", "-X", "PATCH",
        "-H", f"apikey: {SKEY}",
        "-H", f"Authorization: Bearer {SKEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: return=minimal",
        "-d", payload,
        f"{SUPABASE_URL}/rest/v1/wiki_articles?slug=eq.{encoded_slug}"
    ]

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0 and r.stdout.strip() == "":
        return True
    else:
        print(f"  PUSH ERROR: status={r.returncode}, stderr={r.stderr[:200]}")
        return False


def fix_escaped_quotes(content):
    """Fix \\\" → \" in ArticleMedia tags. Only touch the attribute values."""
    # Match entire ArticleMedia tags (self-closing or with children)
    def fix_tag(m):
        tag = m.group(0)
        # Replace \" → " but only within attribute value context
        # i.e. id=\"media-...\" → id="media-..."
        # Pattern: \\\"([^\"]*?)\\\" → "\1"
        fixed = re.sub(r'\\"([^"]*?)\\"', r'"\1"', tag)
        return fixed

    # Find all ArticleMedia tags
    content = re.sub(r'<ArticleMedia\s[^>]*?>', fix_tag, content)
    return content


def add_missing_id(content, slug):
    """Add id attribute to ArticleMedia tags that lack it."""
    def fix_tag(m):
        tag = m.group(0)
        # Already has id? Skip.
        if re.search(r'\bid\s*=\s*["\']', tag):
            return tag

        # Try to use name attribute as id
        name_m = re.search(r'\bname\s*=\s*["\']([^"\']+)["\']', tag)
        if name_m:
            name = name_m.group(1)
            # Insert id before the first attribute
            first_attr = re.search(r'\s+\w+\s*=', tag)
            if first_attr:
                pos = first_attr.start()
                return tag[:pos] + f' id="media-{name}"' + tag[pos:]

        # Generate id from slug + context (first type or just slug)
        type_m = re.search(r'\btype\s*=\s*["\']([^"\']+)["\']', tag)
        type_suffix = type_m.group(1) if type_m else "image"
        new_id = f'id="media-{slug}-{type_suffix}"'
        first_attr = re.search(r'\s+\w+\s*=', tag)
        if first_attr:
            pos = first_attr.start()
            return tag[:pos] + f' {new_id}' + tag[pos:]

        # Fallback: just put it at the start
        return f'<ArticleMedia {new_id} {tag[len("<ArticleMedia "):]}'

    content = re.sub(r'<ArticleMedia\s[^>]*?>', fix_tag, content)
    return content


def fix_single_article(slug):
    """Fix all issues for one article and push to Supabase."""
    # Get current content from Supabase
    data = supabase_get(f"/rest/v1/wiki_articles?select=article_id,slug,content&slug=eq.{quote(slug, safe='')}")
    if not data or len(data) == 0:
        return {"slug": slug, "status": "not_found_in_supabase", "changes": []}

    content = data[0].get("content", "")
    original = content
    changes = []

    # 1. Fix escaped quotes
    content = fix_escaped_quotes(content)
    if content != original:
        changes.append("fixed_escaped_quotes")

    # 2. Add missing id
    content = add_missing_id(content, slug)
    if content != original and "fixed_escaped_quotes" not in changes:
        changes.append("added_missing_id")
    elif content != original:
        # Already modified by step 1
        orig2 = fix_escaped_quotes(original)
        if content != orig2:
            changes.append("added_missing_id")

    # 3. Check for any remaining issues
    has_tags = bool(re.search(r'<ArticleMedia\s+', content))
    if has_tags:
        changes.append("has_articlemedia")

    return {
        "slug": slug,
        "content": content,
        "original": original,
        "changes": changes
    }


def push_article_from_local(slug, folder):
    """Push ArticleMedia tags from local normalized.md to Supabase."""
    nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
    if not os.path.exists(nm_path):
        return {"slug": slug, "status": "local_file_not_found"}

    with open(nm_path, encoding="utf-8") as f:
        local_content = f.read()

    # Get the ArticleMedia tags from local
    local_tags = re.findall(r'<ArticleMedia\s[^>]*?>', local_content)
    if not local_tags:
        return {"slug": slug, "status": "no_local_tags"}

    # Get Supabase content
    data = supabase_get(f"/rest/v1/wiki_articles?select=article_id,slug,content&slug=eq.{quote(slug, safe='')}")
    if not data or len(data) == 0:
        return {"slug": slug, "status": "not_found_in_supabase", "local_tags": len(local_tags)}

    content = data[0].get("content", "")
    # Check if tags are already there
    if '<ArticleMedia' in content:
        return {"slug": slug, "status": "already_has_tags", "local_tags": len(local_tags)}

    # Find where to insert tags — before first ## or at end
    # Simple approach: append before the last line
    lines = content.split("\n")
    # Find the best insertion point — after the main content, before any metadata
    # Try to find ## References or similar
    insert_before_idx = len(lines)
    for i, line in enumerate(lines):
        if line.strip().startswith("## ") and "reference" in line.lower():
            insert_before_idx = i
            break

    # Insert tags line by line
    for tag in local_tags:
        lines.insert(insert_before_idx, f"\n{tag}\n")
        insert_before_idx += 2

    new_content = "\n".join(lines)

    # Push
    success = supabase_update(slug, new_content)
    return {
        "slug": slug,
        "status": "pushed" if success else "push_failed",
        "local_tags": len(local_tags),
        "inserted_at": insert_before_idx
    }


def main():
    print("=" * 70)
    print("ARTICLEDIA FIX: Escaped Quotes + Missing IDs + Missing Articles")
    print("=" * 70)
    print()

    # Step 1: Identify all articles needing fixes
    all_data = supabase_get("/rest/v1/wiki_articles?select=article_id,slug,content&limit=1000")
    if not all_data:
        print("ERROR: Could not fetch articles from Supabase")
        sys.exit(1)

    print(f"Fetched {len(all_data)} articles from Supabase")

    # Build slug→content map
    sb_map = {a["slug"]: a for a in all_data}

    # Find issues
    escaped_slugs = []
    missing_id_slugs = []
    for a in all_data:
        content = a.get("content", "")
        slug = a.get("slug", "?")
        for m in re.finditer(r"<ArticleMedia\s+(.*?)>", content):
            tag_body = m.group(0)
            if re.search(r'\\"', tag_body):
                if slug not in escaped_slugs:
                    escaped_slugs.append(slug)
            has_id = bool(re.search(r'\bid\s*=\s*["\']', tag_body))
            if not has_id and slug not in escaped_slugs:
                # Only count as missing_id if no other issue
                if slug not in missing_id_slugs:
                    missing_id_slugs.append(slug)

    # Find 12 missing articles (local has tags, Supabase doesn't)
    missing_articles = []
    folders = sorted(
        [
            d
            for d in os.listdir(ARTICLES_DIR)
            if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")
        ]
    )
    for folder in folders:
        slug = folder.split("--")[0]
        nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
        if not os.path.exists(nm_path):
            continue
        with open(nm_path, encoding="utf-8") as f:
            local_content = f.read()
        local_has = bool(re.search(r"<ArticleMedia\s+", local_content))
        sb_content = sb_map.get(slug, {}).get("content", "")
        sb_has = bool(re.search(r"<ArticleMedia\s+", sb_content))
        if local_has and not sb_has:
            # Check if it's already in the other fix lists
            missing_articles.append((slug, folder))

    print()
    print(f"Articles with escaped quotes:  {len(escaped_slugs)}")
    print(f"Articles with missing id:      {len(missing_id_slugs)}")
    print(f"Articles missing from Supabase:{len(missing_articles)}")
    print()

    # Step 2: Fix escaped quotes + missing IDs in Supabase
    all_fix_slugs = list(dict.fromkeys(escaped_slugs + missing_id_slugs))  # deduplicate maintaining order
    fixed_count = 0
    fail_count = 0
    batch_size = 5

    if all_fix_slugs:
        print(f"Fixing {len(all_fix_slugs)} articles...")
        for i, slug in enumerate(all_fix_slugs):
            result = fix_single_article(slug)
            if result["changes"]:
                content = result["content"]
                # Backup
                with open(f"{BACKUP_DIR}/{slug.replace('/', '-')}.bak.json", "w") as f:
                    json.dump({"slug": slug, "original": result["original"]}, f)

                # Push
                success = supabase_update(slug, content)
                if success:
                    fixed_count += 1
                    change_str = ", ".join(result["changes"])
                    print(f"  ✅ [{i+1}/{len(all_fix_slugs)}] {slug}: {change_str}")
                else:
                    fail_count += 1
                    print(f"  ❌ [{i+1}/{len(all_fix_slugs)}] {slug}: PUSH FAILED")

                # Rate limiting: 1 per 300ms
                import time
                time.sleep(0.3)
            else:
                print(f"  ⏭️  [{i+1}/{len(all_fix_slugs)}] {slug}: no changes needed")
    else:
        print("No escaped quote / missing ID articles to fix.")

    print()
    print(f"Fixed: {fixed_count}, Failed: {fail_count}")

    # Step 3: Push 12 missing articles
    if missing_articles:
        print(f"\nPushing {len(missing_articles)} articles missing from Supabase...")
        pushed = 0
        for j, (slug, folder) in enumerate(missing_articles):
            result = push_article_from_local(slug, folder)
            if result["status"] == "pushed":
                pushed += 1
                print(f"  ✅ [{j+1}/{len(missing_articles)}] {slug}: pushed {result['local_tags']} tags")
            else:
                print(f"  ⏭️  [{j+1}/{len(missing_articles)}] {slug}: {result['status']}")
            import time
            time.sleep(0.3)
        print(f"Pushed: {pushed}/{len(missing_articles)}")
    else:
        print("\nNo missing articles to push.")

    # Summary
    print()
    print("=" * 70)
    print("COMPLETE")
    print(f"  Fixed quotes/IDs: {fixed_count}")
    print(f"  Pushed missing:   {len([x for x in missing_articles if True])}")
    print(f"  Failed:           {fail_count}")
    print(f"  Backups in:       {BACKUP_DIR}/")
    print("=" * 70)


if __name__ == "__main__":
    main()
