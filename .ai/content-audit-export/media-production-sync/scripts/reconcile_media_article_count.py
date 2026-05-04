#!/usr/bin/env python3
"""
Phase 1 — Reconcile the 374 vs 567 article count.
Finds every production article missing a final media status.
"""
import json, os, re, hashlib
from datetime import datetime, timezone

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
OUTPUT_DIR = f"{BASE}/.ai/content-audit-export/media-production-sync"

def find_article_media_tags(content):
    """Find all ArticleMedia tags in content (any format)."""
    # Self-closing
    self_closing = re.findall(r'<ArticleMedia\s+([^>]*?)\s*/>', content)
    # Non-self-closing with children
    non_self = re.findall(r'<ArticleMedia\s+([^>]*?)>', content)
    return len(self_closing) + len(non_self)

def main():
    print("=" * 70)
    print("MEDIA CORPUS RECONCILIATION")
    print("=" * 70)
    
    # Get all article directories
    folders = sorted([d for d in os.listdir(ARTICLES_DIR) 
                      if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")])
    
    print(f"\nTotal article directories: {len(folders)}")
    
    # Load manifest
    manifest_path = f"{BASE}/.ai/content-audit-export/media-placeholder-manifest.json"
    manifest_entries = set()
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path) as f:
                manifest = json.load(f)
            for entry in manifest.get("entries", []):
                if entry.get("articleId"):
                    manifest_entries.add(entry["articleId"])
        except:
            pass
    
    ledger = []
    
    for folder in folders:
        article_id = folder.split("--")[-1] if "--" in folder else folder
        slug = folder.split("--")[0] if "--" in folder else folder
        
        # Get metadata
        meta_path = os.path.join(ARTICLES_DIR, folder, "article-metadata.json")
        title = slug
        if os.path.exists(meta_path):
            try:
                with open(meta_path) as f:
                    meta = json.load(f)
                title = meta.get("title", title)
                slug = meta.get("slug", slug)
            except:
                pass
        
        # Check normalized.md for ArticleMedia
        nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
        media_count = 0
        if os.path.exists(nm_path):
            with open(nm_path, encoding="utf-8") as f:
                content = f.read()
            media_count = find_article_media_tags(content)
        
        # Check candidate.md for ArticleMedia
        candidate_path = os.path.join(ARTICLES_DIR, folder, "candidate.md")
        candidate_media = 0
        if os.path.exists(candidate_path):
            with open(candidate_path, encoding="utf-8") as f:
                content = f.read()
            candidate_media = find_article_media_tags(content)
        
        # Determine media status
        if media_count > 0:
            status = "media-enhanced"
        elif candidate_media > 0:
            status = "media-enhanced"  # Only in candidate (needs compose)
        else:
            status = "media-unreviewed"
        
        in_manifest = article_id in manifest_entries
        
        # Determine category
        slug_lower = slug.lower()
        if slug_lower.startswith("lea-prac"): cat = "prof_practice"
        elif slug_lower.startswith("lea-hist"): cat = "history"
        elif slug_lower.startswith("lea-theo"): cat = "theory"
        elif slug_lower.startswith("lea-dsgn"): cat = "design"
        elif slug_lower.startswith("lea-strc"): cat = "structures"
        elif slug_lower.startswith("lea-matl"): cat = "materials"
        elif slug_lower.startswith("lea-util"): cat = "utilities"
        elif slug_lower.startswith("lea-plan"): cat = "planning"
        elif slug_lower.startswith("overview") or slug_lower.startswith("mastery"): cat = "overview"
        elif "test" in slug_lower or "playwright" in slug_lower or "owner-smoke" in slug_lower: cat = "test"
        else: cat = "named_other"
        
        ledger.append({
            "folder": folder,
            "article_id": article_id,
            "slug": slug,
            "title": title,
            "category": cat,
            "media_count_normalized": media_count,
            "media_count_candidate": candidate_media,
            "in_manifest": in_manifest,
            "status": status
        })
    
    # Summarize
    total = len(ledger)
    enhanced = sum(1 for l in ledger if l["media_count_normalized"] > 0)
    in_candidate_only = sum(1 for l in ledger if l["media_count_normalized"] == 0 and l["media_count_candidate"] > 0)
    unreviewed = sum(1 for l in ledger if l["media_count_normalized"] == 0 and l["media_count_candidate"] == 0)
    test_articles = sum(1 for l in ledger if l["category"] == "test")
    
    print(f"\nArticles with ArticleMedia in normalized.md: {enhanced}")
    print(f"Articles with ArticleMedia only in candidate.md: {in_candidate_only}")
    print(f"Articles without any ArticleMedia (unreviewed): {unreviewed}")
    print(f"Test/non-production articles: {test_articles}")
    print(f"\nUnreviewed by category:")
    
    unreviewed_by_cat = {}
    for l in ledger:
        if l["media_count_normalized"] == 0 and l["media_count_candidate"] == 0 and l["category"] != "test":
            cat = l["category"]
            unreviewed_by_cat.setdefault(cat, 0)
            unreviewed_by_cat[cat] += 1
    
    for cat, count in sorted(unreviewed_by_cat.items()):
        print(f"  {cat}: {count}")
    
    # Write reconciliation report
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_articles": total,
        "articles_with_media_normalized": enhanced,
        "articles_with_media_candidate_only": in_candidate_only,
        "articles_unreviewed": unreviewed,
        "test_articles_excluded": test_articles,
        "true_unreviewed": unreviewed - test_articles,
        "unreviewed_by_category": unreviewed_by_cat,
        "ratio_processed": f"{enhanced}/{total} = {enhanced/total*100:.1f}%"
    }
    
    # Write full ledger JSON
    with open(f"{OUTPUT_DIR}/media-production-sync-ledger.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    # Write markdown ledger
    with open(f"{OUTPUT_DIR}/media-production-sync-ledger.md", "w") as f:
        f.write(f"# Media Production Sync Ledger\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"## Summary\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"|--------|:-----:|\n")
        f.write(f"| Total production articles | {total} |\n")
        f.write(f"| With ArticleMedia (normalized.md) | {enhanced} |\n")
        f.write(f"| With ArticleMedia (candidate.md only) | {in_candidate_only} |\n")
        f.write(f"| Without ArticleMedia (unreviewed) | {unreviewed} |\n")
        f.write(f"| Test/non-production articles | {test_articles} |\n")
        f.write(f"| True unreviewed production articles | {unreviewed - test_articles} |\n\n")
        
        f.write(f"## Unreviewed by Category\n\n")
        for cat, count in sorted(unreviewed_by_cat.items()):
            f.write(f"- **{cat}**: {count} articles\n")
    
    # Write unprocessed articles queue
    unprocessed = [l for l in ledger if l["media_count_normalized"] == 0 and l["media_count_candidate"] == 0 and l["category"] != "test"]
    with open(f"{OUTPUT_DIR}/media-unprocessed-articles-queue.json", "w") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "count": len(unprocessed),
            "entries": [{
                "folder": l["folder"],
                "slug": l["slug"],
                "title": l["title"],
                "category": l["category"]
            } for l in unprocessed]
        }, f, indent=2, default=str)
    
    # Write media corpus reconciliation
    with open(f"{OUTPUT_DIR}/media-corpus-reconciliation.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    with open(f"{OUTPUT_DIR}/media-corpus-reconciliation.md", "w") as f:
        f.write(f"# Media Corpus Reconciliation\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"## Discrepancy Analysis\n\n")
        f.write(f"- Reported processed (~374): {enhanced}\n")
        f.write(f"- Verified production corpus: {total}\n")
        f.write(f"- Gap: {total - enhanced} articles\n")
        f.write(f"- Test articles excluded: {test_articles}\n")
        f.write(f"- True gap (production articles needing review): {total - enhanced - test_articles}\n")
    
    print(f"\nWritten: media-corpus-reconciliation.md")
    print(f"Written: media-unprocessed-articles-queue.json")
    print(f"\nUnprocessed articles to review: {len(unprocessed)}")
    
    return unprocessed

if __name__ == "__main__":
    main()
