#!/usr/bin/env python3
"""
Reconcile final ArticleMedia counts from Supabase, local files, and manifests.
"""
import json, re, os, subprocess, hashlib
from pathlib import Path
from collections import defaultdict

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
MANIFEST_PATH = f"{BASE}/.ai/content-audit-export/media-placeholder-manifest.json"
OUTPUT_DIR = f"{BASE}/.ai/content-audit-export/media-production-sync"
SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycGR3cXVybmdueWFqdWhia2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3ODAyNCwiZXhwIjoyMDg4NDU0MDI0fQ.fLLvIwPo80GYLSwBNUiKslrgYc64OZ0QpT0XkctUI0w"

def supabase_get(path):
    cmd = f'curl -s -H "apikey: {SKEY}" -H "Authorization: Bearer {SKEY}" "https://hrpdwqurngnyajuhbkdg.supabase.co{path}"'
    r = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    if r.returncode != 0: return []
    try: return json.loads(r.stdout)
    except: return []

def count_articlemedia_local(content):
    """Count <ArticleMedia ... /> tags in local content."""
    return len(re.findall(r'<ArticleMedia\s+', content))

def count_articlemedia_supabase(content):
    """Count <ArticleMedia ... /> tags in Supabase content."""
    return len(re.findall(r'<ArticleMedia\s+', content))

def categorize_article(slug, folder):
    slug_l = slug.lower() if slug else ""
    if slug_l.startswith("lea-prac-law"): return "law"
    if slug_l.startswith("lea-prac-eth"): return "ethics"
    if slug_l.startswith("lea-prac-ctr"): return "contracts"
    if slug_l.startswith("lea-prac-svc"): return "services"
    if slug_l.startswith("lea-prac-frm"): return "forms"
    if slug_l.startswith("lea-prac-cmp"): return "compensation"
    if slug_l.startswith("lea-hist"): return "history"
    if slug_l.startswith("lea-theo"): return "theory"
    if slug_l.startswith("lea-dsgn"): return "design"
    if slug_l.startswith("lea-strc"): return "structures"
    if slug_l.startswith("lea-matl"): return "materials"
    if slug_l.startswith("lea-util"): return "utilities"
    if slug_l.startswith("lea-plan"): return "planning"
    if any(p in slug_l for p in ["overview","mastery"]): return "overview"
    if any(p in slug_l for p in ["pd-1096","nbcp","building-permit","certificate-of-occupancy","change-of-use"]): return "building_code"
    if any(p in slug_l for p in ["bp-344","accessible"]): return "accessibility"
    if any(p in slug_l for p in ["fire"]): return "fire_safety"
    if any(p in slug_l for p in ["bp-220"]): return "bp_220"
    if any(p in slug_l for p in ["owner-smoke","playwright"]): return "test"
    return "other_named"

def main():
    print("=" * 70)
    print("FINAL MEDIA COUNT RECONCILIATION")
    print("=" * 70)
    
    # 1. Fetch ALL Supabase articles
    print("\nFetching Supabase articles...")
    supabase_articles = supabase_get("/rest/v1/wiki_articles?select=article_id,slug,content&limit=1000")
    print(f"  Supabase: {len(supabase_articles)} articles")
    
    # Build slug→article map
    sb_map = {}
    for a in supabase_articles:
        sb_map[a["slug"]] = a
    
    # 2. Scan local articles
    print("\nScanning local articles...")
    if not os.path.isdir(ARTICLES_DIR):
        print(f"ERROR: {ARTICLES_DIR} not found")
        return
    
    folders = sorted([d for d in os.listdir(ARTICLES_DIR) 
                      if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")])
    print(f"  Local folders: {len(folders)}")
    
    # 3. Gather data per article
    categories = defaultdict(lambda: {"local": 0, "supabase": 0, "count": 0})
    layouts = defaultdict(int)
    types = defaultdict(int)
    
    local_articlemedia_articles = 0
    supabase_articlemedia_articles = 0
    local_total_blocks = 0
    supabase_total_blocks = 0
    no_media_articles = 0
    test_articles = 0
    
    for folder in folders:
        dir_path = os.path.join(ARTICLES_DIR, folder)
        
        # Get slug from metadata
        slug = folder.split("--")[0]
        meta_path = os.path.join(dir_path, "article-metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path) as f:
                    meta = json.load(f)
                slug = meta.get("slug", slug)
            except: pass
        
        cat = categorize_article(slug, folder)
        if cat == "test":
            test_articles += 1
            categories[cat]["count"] += 1
            continue
        
        # Read local normalized.md
        nm_path = os.path.join(dir_path, "normalized.md")
        local_content = ""
        if os.path.exists(nm_path):
            with open(nm_path, encoding="utf-8") as f:
                local_content = f.read()
        
        local_blocks = count_articlemedia_local(local_content)
        
        # Get Supabase content
        supabase_content = ""
        if slug in sb_map:
            supabase_content = sb_map[slug].get("content", "")
        
        supabase_blocks = count_articlemedia_supabase(supabase_content)
        
        if local_blocks > 0:
            local_articlemedia_articles += 1
            local_total_blocks += local_blocks
            categories[cat]["local"] += 1
        
        if supabase_blocks > 0:
            supabase_articlemedia_articles += 1
            supabase_total_blocks += supabase_blocks
            categories[cat]["supabase"] += 1
        
        if local_blocks == 0:
            no_media_articles += 1
        
        categories[cat]["count"] += 1
        categories[cat]["local_blocks"] = categories[cat].get("local_blocks", 0) + local_blocks
        categories[cat]["supabase_blocks"] = categories[cat].get("supabase_blocks", 0) + supabase_blocks
        
        # Count layouts and types
        for m in re.finditer(r'<ArticleMedia\s+', local_content):
            # Find the full tag to extract layout and type
            tag_end = local_content.find("/>", m.end())
            if tag_end > 0:
                tag = local_content[m.start():tag_end+2]
                layout_m = re.search(r'layout="([^"]+)"', tag)
                if layout_m: layouts[layout_m.group(1)] += 1
                type_m = re.search(r'type="([^"]+)"', tag)
                if type_m: types[type_m.group(1)] += 1
    
    # 4. Print reconciliation
    print(f"\n{'='*70}")
    print("RECONCILIATION REPORT")
    print(f"{'='*70}")
    print(f"\nArticle Counts:")
    print(f"  Local folders:               {len(folders)}")
    print(f"  Supabase articles:           {len(supabase_articles)}")
    print(f"  Test/non-production:         {test_articles}")
    print(f"  Production articles:         {len(folders) - test_articles}")
    
    print(f"\nArticles with ArticleMedia:")
    print(f"  Local normalized.md:         {local_articlemedia_articles}")
    print(f"  Supabase content:            {supabase_articlemedia_articles}")
    print(f"  No media (Level 0):          {no_media_articles - test_articles}")
    
    print(f"\nTotal ArticleMedia blocks:")
    print(f"  Local:                       {local_total_blocks}")
    print(f"  Supabase:                    {supabase_total_blocks}")
    
    print(f"\nBy Layout:")
    for layout, count in sorted(layouts.items()):
        print(f"  {layout:20s}: {count}")
    
    print(f"\nBy Type:")
    for t, count in sorted(types.items()):
        print(f"  {t:20s}: {count}")
    
    print(f"\nBy Category:")
    print(f"  {'Category':25s} {'Total':>6s} {'Local AM':>8s} {'SB AM':>6s} {'Local Blk':>9s} {'SB Blk':>6s}")
    print(f"  {'-'*25} {'-'*6} {'-'*8} {'-'*6} {'-'*9} {'-'*6}")
    for cat, data in sorted(categories.items()):
        print(f"  {cat:25s} {data['count']:6d} {data.get('local',0):8d} {data.get('supabase',0):6d} {data.get('local_blocks',0):9d} {data.get('supabase_blocks',0):6d}")
    
    # 5. Identify mismatches
    mismatches = []
    if local_articlemedia_articles != supabase_articlemedia_articles:
        mismatches.append(f"Article count mismatch: local={local_articlemedia_articles}, supabase={supabase_articlemedia_articles}")
    if local_total_blocks != supabase_total_blocks:
        mismatches.append(f"Block count mismatch: local={local_total_blocks}, supabase={supabase_total_blocks}")
    
    # Check individual articles
    local_only = []
    for folder in folders:
        slug = folder.split("--")[0]
        meta_path = os.path.join(ARTICLES_DIR, folder, "article-metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path) as f:
                    meta = json.load(f)
                slug = meta.get("slug", slug)
            except: pass
        nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
        local_c = ""
        if os.path.exists(nm_path):
            with open(nm_path, encoding="utf-8") as f:
                local_c = f.read()
        local_b = count_articlemedia_local(local_c)
        sb_b = count_articlemedia_supabase(sb_map.get(slug, {}).get("content", ""))
        if local_b > 0 and sb_b == 0:
            local_only.append(slug)
    
    if local_only:
        mismatches.append(f"Articles with ArticleMedia locally but NOT in Supabase: {len(local_only)}")
        for s in local_only[:10]:
            mismatches.append(f"  - {s}")
    
    print(f"\nMISMATCHES: {len(mismatches)}")
    for m in mismatches:
        print(f"  {'⚠️" if "MISMATCH" in m else "  "} {m}')
    
    # 6. Write report
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_local_folders": len(folders),
        "total_supabase_articles": len(supabase_articles),
        "test_articles": test_articles,
        "production_articles": len(folders) - test_articles,
        "articles_with_articlemedia_local": local_articlemedia_articles,
        "articles_with_articlemedia_supabase": supabase_articlemedia_articles,
        "no_media_articles": no_media_articles - test_articles,
        "total_blocks_local": local_total_blocks,
        "total_blocks_supabase": supabase_total_blocks,
        "by_layout": dict(layouts),
        "by_type": dict(types),
        "by_category": {k: dict(v) for k, v in categories.items()},
        "mismatches": mismatches,
        "local_only_articles": local_only[:30]
    }
    
    # Write JSON
    with open(f"{OUTPUT_DIR}/final-media-count-reconciliation.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    # Write MD
    with open(f"{OUTPUT_DIR}/final-media-count-reconciliation.md", "w") as f:
        f.write("# Final Media Count Reconciliation\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write("## Summary\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"|--------|:-----:|\n")
        f.write(f"| Local folders | {len(folders)} |\n")
        f.write(f"| Supabase articles | {len(supabase_articles)} |\n")
        f.write(f"| Test/non-production excluded | {test_articles} |\n")
        f.write(f"| Production articles | {len(folders) - test_articles} |\n")
        f.write(f"| Articles with ArticleMedia (local) | {local_articlemedia_articles} |\n")
        f.write(f"| Articles with ArticleMedia (Supabase) | {supabase_articlemedia_articles} |\n")
        f.write(f"| No-media-needed articles | {no_media_articles - test_articles} |\n")
        f.write(f"| Total ArticleMedia blocks (local) | {local_total_blocks} |\n")
        f.write(f"| Total ArticleMedia blocks (Supabase) | {supabase_total_blocks} |\n")
        f.write(f"\n## Mismatches\n\n")
        if mismatches:
            for m in mismatches:
                f.write(f"- {m}\n")
        else:
            f.write("None found.\n")
    
    print(f"\nWritten to {OUTPUT_DIR}/")
    
    return report

from datetime import datetime, timezone
if __name__ == "__main__":
    main()
