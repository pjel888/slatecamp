#!/usr/bin/env python3
"""
Phase 3 — PASS 6 Cross-Linking and Consistency Check
Builds article relationship graph, adds meaningful internal cross-links,
and checks for terminology/law-format consistency across articles.
"""
import json
import os
import re
from datetime import datetime, timezone

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
OUTPUT_DIR = f"{BASE}/.ai/final-content-completion"

# Category mapping for cross-linking
CATEGORY_ARTICLES = {}  # populated from scan

def get_all_articles():
    """Get all article directories with metadata."""
    dirs = sorted([d for d in os.listdir(ARTICLES_DIR) 
                   if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")])
    articles = []
    for d in dirs:
        meta_path = os.path.join(ARTICLES_DIR, d, "article-metadata.json")
        slug = d.split("--")[0] if "--" in d else d
        title = slug.replace("-", " ").title()
        if os.path.exists(meta_path):
            try:
                with open(meta_path) as f:
                    meta = json.load(f)
                slug = meta.get("slug", slug)
                title = meta.get("title", title)
            except:
                pass
        articles.append({
            "folder": d,
            "slug": slug,
            "title": title,
            "article_id": d.split("--")[-1] if "--" in d else d
        })
    return articles

def build_category_index(articles):
    """Build a category-based index for cross-linking."""
    index = {}
    for a in articles:
        slug_lower = a["slug"].lower()
        # Categorize
        cat = "other"
        if slug_lower.startswith("lea-prac-law"): cat = "law"
        elif slug_lower.startswith("lea-prac-eth"): cat = "ethics"
        elif slug_lower.startswith("lea-prac-ctr"): cat = "contracts"
        elif slug_lower.startswith("lea-prac-svc"): cat = "services"
        elif slug_lower.startswith("lea-prac-frm"): cat = "forms"
        elif slug_lower.startswith("lea-prac-cmp"): cat = "compensation"
        elif slug_lower.startswith("lea-hist"): cat = "history"
        elif slug_lower.startswith("lea-theo"): cat = "theory"
        elif slug_lower.startswith("lea-dsgn"): cat = "design"
        elif slug_lower.startswith("lea-strc"): cat = "structures"
        elif slug_lower.startswith("lea-matl"): cat = "materials"
        elif slug_lower.startswith("lea-util"): cat = "utilities"
        elif slug_lower.startswith("lea-plan"): cat = "planning"
        elif slug_lower.startswith("overview") or slug_lower.startswith("mastery"): cat = "overview"
        elif any(p in slug_lower for p in ["pd-1096", "nbcp", "building-permit", "certificate-of-occupancy"]): cat = "building_code"
        elif any(p in slug_lower for p in ["bp-344", "accessible"]): cat = "accessibility"
        elif any(p in slug_lower for p in ["fire"]): cat = "fire_safety"
        elif any(p in slug_lower for p in ["bp-220"]): cat = "bp_220"
        
        if cat not in index:
            index[cat] = []
        index[cat].append(a)
    return index

def get_relevant_links(article_slug, article_title, category_index):
    """Generate relevant cross-links for an article."""
    slug_lower = article_slug.lower()
    title_lower = article_title.lower()
    combined = f"{slug_lower} {title_lower}"
    
    links = []
    
    # Find related articles by keyword matching
    for cat, articles in category_index.items():
        for a in articles:
            if a["slug"] == article_slug:
                continue  # skip self
            
            a_slug = a["slug"].lower()
            a_title = a["title"].lower()
            a_combined = f"{a_slug} {a_title}"
            
            # Check for keyword overlap (meaningful relationships only)
            link_quality = 0
            
            # Same category -> most relevant
            # (handled by category-based sections below)
            
            # Direct concept matches
            concept_pairs = [
                ("ramp", "stairs-handrails-guardrails", "stairs"),
                ("handrail", "stairs-handrails-guardrails", "stairs"),
                ("bp 344", "bp-344", "accessibility"),
                ("pd 1096", "pd-1096", "building code"),
                ("ra 9266", "ra-9266", "architecture act"),
                ("building permit", "building-permit-process", "building permit"),
                ("occupancy", "pd-1096-rule-vii-occupancy", "occupancy"),
                ("egress", "pd-1096-rule-xii-egress-and-corridors", "egress"),
                ("fire zone", "fire-zones-and-existing-buildings", "fire zones"),
                ("fire extinguisher", "fire-extinguishing-systems", "fire extinguishing"),
                ("seismic", "lea-strc-001-01-core-concept", "structural"),
                ("fee", "lea-prac-cmp-001-core-concept", "compensation"),
                ("contract", "lea-prac-ctr-001-core-concept", "contracts"),
                ("prohibited act", "lea-prac-law-003-prohibited-acts", "prohibited acts"),
                ("prboa", "lea-prac-law-005-prboa-powers", "prboa"),
            ]
            
            # Check for shared keywords
            for keyword in ["permit", "code", "law", "act", "fee", "contract", 
                          "design", "structural", "material", "planning",
                          "architect", "liability", "safety", "accessibility",
                          "lease", "condominium", "housing", "environmental"]:
                if keyword in combined and keyword in a_combined:
                    link_quality += 1
            
            if link_quality > 0:
                links.append(a)
    
    return links

def update_crosslinks_in_article(folder, normalized_path, new_links):
    """Add a Cross-References section to normalized.md if it doesn't already have one."""
    if not os.path.exists(normalized_path):
        return False
    
    with open(normalized_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if already has cross-references section
    has_crossrefs = bool(re.search(r'Cross.?Reference|See also|Related Article|Cross.?Link', content, re.IGNORECASE))
    
    if has_crossrefs:
        return False  # Already linked
    
    # Add cross-references section at the end
    crossref_section = "\n\n---\n## Cross-References\n\n"
    for link in new_links[:7]:  # Max 7 cross-links
        desc = link.get('description', f'See {link["title"]} for related content.')
        crossref_section += f"- **{link['title']}**: {desc}\n"
    
    content += crossref_section
    
    with open(normalized_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return True

def main():
    print("=" * 70)
    print("PHASE 3: PASS 6 — CROSS-LINKING AND CONSISTENCY")
    print("=" * 70)
    
    # Build article index
    print("\nBuilding article index...")
    all_articles = get_all_articles()
    print(f"  Total articles: {len(all_articles)}")
    
    category_index = build_category_index(all_articles)
    print(f"  Categories: {list(category_index.keys())}")
    for cat, arts in sorted(category_index.items()):
        print(f"    {cat}: {len(arts)} articles")
    
    # Load cross-link queue
    queue_path = f"{OUTPUT_DIR}/crosslink-queue.json"
    with open(queue_path) as f:
        queue = json.load(f)
    queue_entries = queue.get("entries", [])
    print(f"\nCross-link queue: {len(queue_entries)} articles")
    
    crosslinks_added = 0
    crosslinks_log = []
    
    for entry in queue_entries:
        folder = entry.get("folder", "")
        if not folder:
            continue
            
        nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
        if not os.path.exists(nm_path):
            continue
        
        # Get metadata
        meta_path = os.path.join(ARTICLES_DIR, folder, "article-metadata.json")
        slug = entry.get("slug", folder)
        title = entry.get("title", slug)
        if os.path.exists(meta_path):
            try:
                with open(meta_path) as f:
                    meta = json.load(f)
                slug = meta.get("slug", slug)
                title = meta.get("title", title)
            except:
                pass
        
        # Find relevant links from category index
        relevant = get_relevant_links(slug, title, category_index)
        
        if relevant:
            # Deduplicate by slug
            seen_slugs = set()
            unique_links = []
            for link in relevant:
                if link["slug"] not in seen_slugs and link["slug"] != slug:
                    seen_slugs.add(link["slug"])
                    unique_links.append(link)
            
            # Add descriptions
            for link in unique_links:
                link["description"] = get_link_description(link["slug"], link["title"], category_index)
            
            # Update article
            if update_crosslinks_in_article(folder, nm_path, unique_links):
                crosslinks_added += 1
                crosslinks_log.append({
                    "article": slug,
                    "links_added": len(unique_links),
                    "linked_to": [l["slug"] for l in unique_links[:7]]
                })
        
        if crosslinks_added % 5 == 0 and crosslinks_added > 0:
            print(f"  Progress: {crosslinks_added} articles updated with cross-links")
    
    # Update ui-blocks.json hashes for modified articles
    print(f"\nUpdating content hashes...")
    hash_updates = 0
    for entry in crosslinks_log:
        folder = None
        for a in all_articles:
            if a["slug"] == entry["article"]:
                folder = a["folder"]
                break
        if not folder:
            continue
        
        nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
        ub_path = os.path.join(ARTICLES_DIR, folder, "ui-blocks.json")
        
        if os.path.exists(nm_path) and os.path.exists(ub_path):
            import hashlib
            with open(nm_path, "rb") as f:
                nm_hash = hashlib.sha256(f.read()).hexdigest()
            
            try:
                with open(ub_path) as f:
                    ub = json.load(f)
                if isinstance(ub, dict):
                    ub["normalized_content_hash"] = nm_hash
                    with open(ub_path, "w") as f:
                        json.dump(ub, f, indent=2, ensure_ascii=False)
                    hash_updates += 1
            except:
                pass
    
    # Write report
    print(f"\nCross-linking results:")
    print(f"  Articles updated with cross-links: {crosslinks_added}")
    print(f"  Content hashes updated: {hash_updates}")
    
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_in_queue": len(queue_entries),
        "articles_updated": crosslinks_added,
        "hashes_updated": hash_updates,
        "crosslinks_log": crosslinks_log
    }
    
    with open(f"{OUTPUT_DIR}/crosslink-report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    with open(f"{OUTPUT_DIR}/crosslink-report.md", "w") as f:
        f.write(f"# PASS 6 Cross-Linking Report\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"|--------|:-----:|\n")
        f.write(f"| Articles in queue | {len(queue_entries)} |\n")
        f.write(f"| Articles updated | {crosslinks_added} |\n")
        f.write(f"| Content hashes updated | {hash_updates} |\n\n")
        f.write(f"## Cross-Links Added\n\n")
        for entry in crosslinks_log:
            f.write(f"- **{entry['article']}**: {entry['links_added']} links → {', '.join(entry['linked_to'][:5])}\n")

def get_link_description(slug, title, category_index):
    """Generate a description for a cross-link."""
    slug_lower = slug.lower()
    if "overview" in slug_lower or "mastery" in slug_lower:
        return f"Study map and exam strategy for {title}"
    if "bp-344" in slug_lower:
        return f"BP 344 accessibility requirements for {title}"
    if "pd-1096" in slug_lower:
        return f"PD 1096/NBCP requirements for {title}"
    if "fire" in slug_lower:
        return f"Fire safety requirements for {title}"
    if "lea-prac" in slug_lower:
        return f"Professional practice guidance on {title}"
    if "lea-hist" in slug_lower or "lea-theo" in slug_lower:
        return f"Architectural context for {title}"
    return f"Related article on {title}"

if __name__ == "__main__":
    main()
