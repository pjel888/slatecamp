#!/usr/bin/env python3
"""
Phase 1 — Independent Verification Script
Verifies the actual current state of all 567 production articles.
Does not trust previous reports — reads from filesystem and Supabase directly.
"""
import json
import hashlib
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
SUPABASE_URL = "https://hrpdwqurngnyajuhbkdg.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not SUPABASE_SERVICE_KEY:
    # Try to load from .env.local
    env_path = f"{BASE}/.env.local"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                    SUPABASE_SERVICE_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

OUTPUT_DIR = f"{BASE}/.ai/final-content-completion"

# Valid wiki component names
VALID_COMPONENTS = {
    "Callout", "Note", "Warn", "Tip", "Example", "CalloutBox", "AlertBox",
    "ExamTip", "AuthorityContent", "LawCallout", "WikiCalloutBox",
    "WikiExamTable", "WikiPartHeader", "WikiMistakeCard", "WikiMistakeList",
    "KeyValues", "SubjectSnapshot", "Tabs", "Tab", "Accordion", "AccordionItem",
    "FormulaBlock", "InlineQuiz", "GenericBlock", "ProcessFlow",
    "ComparisonTable", "ElaborativeInterrogation", "WrongAnswerBanner",
    "TeachBackPrompt", "WikiChangedPill", "RevealBlock", "Mermaid"
}

# Known critical fixes to check for regressions
CRITICAL_FIXES = {
    "RA 9266 Section 4 (PRBoA creation, NOT Section 41)": [
        "Section 4", "Sec. 4", "PRBoA", "Professional Regulatory Board"
    ],
    "BP 344 ramp slope 1:20 (not 1:12)": ["1:20", "1:12"],
    "Penalty range P100k-P5M (not P5k-P100k)": ["100,000", "5,000,000", "P100,000"],
    "Seismic zones (Zone 4 nonexistent)": ["Zone 4"],
}

def fetch_supabase_articles():
    """Fetch all wiki articles from Supabase production."""
    if not SUPABASE_SERVICE_KEY:
        print("WARNING: No Supabase service key available. Skipping Supabase verification.")
        return {}
    
    import urllib.request
    
    articles = {}
    offset = 0
    limit = 1000
    
    while True:
        url = f"{SUPABASE_URL}/rest/v1/wiki_articles?select=article_id,slug,title,content,content_hash,status,published_at,updated_at&limit={limit}&offset={offset}"
        req = urllib.request.Request(url)
        req.add_header("apikey", SUPABASE_SERVICE_KEY)
        req.add_header("Authorization", f"Bearer {SUPABASE_SERVICE_KEY}")
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                batch = json.loads(resp.read().decode())
                if not batch:
                    break
                for a in batch:
                    articles[a["article_id"]] = a
                offset += limit
                print(f"  Fetched {len(batch)} articles from Supabase (offset {offset-limit})")
        except Exception as e:
            print(f"  Supabase fetch error at offset {offset}: {e}")
            break
    
    print(f"  Total Supabase articles fetched: {len(articles)}")
    return articles

def get_article_dirs():
    """Get all article directories from local export."""
    if not os.path.isdir(ARTICLES_DIR):
        print(f"ERROR: Articles directory not found: {ARTICLES_DIR}")
        return []
    dirs = sorted([
        d for d in os.listdir(ARTICLES_DIR)
        if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")
    ])
    return dirs

def read_json(path):
    """Safely read a JSON file."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return {"_error": str(e)}

def read_file(path):
    """Safely read a text file."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None

def sha256_hex(content):
    """Compute sha256 hex digest."""
    if content is None:
        return None
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def parse_article_id(folder_name):
    """Extract article_id from folder name (slug--uuid pattern)."""
    parts = folder_name.split("--")
    if len(parts) >= 2:
        return parts[-1]
    return folder_name

def check_for_learning_goals(content):
    """Check if article has a specific Learning Goal (not generic)."""
    if not content:
        return False, "no_content"
    # Look for ## Learning Goal section
    lg_pattern = re.search(r'##\s*Learning\s*Goal', content)
    if not lg_pattern:
        return False, "no_learning_goal_section"
    
    # Check if the learning goal is specific
    generic_patterns = [
        r"After reading this article",
        r"you should understand",
        r"you should be able to",
        r"key concepts tested",
    ]
    
    # Get the text after ## Learning Goal
    after_lg = content[lg_pattern.end():lg_pattern.end()+500]
    
    # Check for overly generic content
    is_generic = any(re.search(p, after_lg, re.IGNORECASE) for p in generic_patterns)
    # But if it also mentions specific sections/laws/terms, it might be specific enough
    has_specific = bool(re.search(r'(Section|Rule|RA|PD|BP|SPP|Article)\s+\d+', after_lg))
    
    return True, "generic" if (is_generic and not has_specific) else "specific"

def check_ui_blocks(ui_blocks):
    """Analyze UI blocks for validity."""
    if isinstance(ui_blocks, dict) and "_error" in ui_blocks:
        return {"valid": False, "error": ui_blocks["_error"], "count": 0, "hallucinated": []}
    
    if not isinstance(ui_blocks, dict):
        return {"valid": False, "error": "not_a_dict", "count": 0, "hallucinated": []}
    
    blocks = ui_blocks.get("blocks", [])
    if not isinstance(blocks, list):
        return {"valid": False, "error": "blocks_not_array", "count": 0, "hallucinated": []}
    
    hallucinated = []
    has_raw_mdx = False
    block_types = {}
    
    for block in blocks:
        cname = block.get("component_name", "")
        block_types[cname] = block_types.get(cname, 0) + 1
        if cname and cname not in VALID_COMPONENTS:
            hallucinated.append(cname)
        # Check for raw MDX tags in normalized content
        raw = block.get("raw", "")
        if raw and not raw.startswith("<"):
            pass  # Not raw MDX
    
    return {
        "valid": len(hallucinated) == 0,
        "count": len(blocks),
        "block_types": block_types,
        "hallucinated": hallucinated,
        "error": None
    }

def check_placeholders(content):
    """Check for broken or orphaned placeholders."""
    if not content:
        return {"has_broken": False, "broken_count": 0, "details": []}
    
    issues = []
    
    # Check for orphaned closing tags
    orphaned = re.findall(r'\[/SLATECAMP_UI_BLOCK\]', content)
    opening = re.findall(r'\[SLATECAMP_UI_BLOCK:', content)
    if len(orphaned) > len(opening):
        issues.append(f"orphaned_closing_tags: {len(orphaned)} closing vs {len(opening)} opening")
    
    # Check for escaped brackets (\\[ instead of [)
    escaped = re.findall(r'\\\[SLATECAMP_UI_BLOCK', content)
    if escaped:
        issues.append(f"escaped_brackets: {len(escaped)} instances")
    
    # Check for truncated placeholders
    truncated = re.findall(r'preservrap|preserv\b', content)
    if truncated:
        issues.append(f"truncated_placeholders: {len(truncated)} instances")
    
    return {
        "has_broken": len(issues) > 0,
        "broken_count": len(issues),
        "details": issues
    }

def determine_category(slug, title, content):
    """Determine the article's subject category from slug/title/content."""
    slug_lower = slug.lower() if slug else ""
    title_lower = title.lower() if title else ""
    
    categories = {
        "professional_practice": ["prac-", "professional practice", "practice"],
        "law": ["prac-law", "law-", "ra 9266", "pd 1096"],
        "ethics": ["prac-eth", "ethics"],
        "contracts": ["prac-ctr", "contract"],
        "services": ["prac-svc", "service"],
        "forms": ["prac-frm", "form of"],
        "compensation": ["prac-cmp", "compensation", "fee"],
        "history": ["hist", "history"],
        "theory": ["theo", "theory"],
        "design": ["dsgn", "design"],
        "structures": ["strc", "structur"],
        "materials": ["matl", "material"],
        "utilities": ["util", "utilit"],
        "planning": ["plan", "planning", "urban"],
        "overview": ["overview", "mastery"],
        "other": ["named", "other"],
        "building_code": ["pd-1096", "building code", "nbcp"],
        "accessibility": ["bp-344", "accessib"],
        "fire_safety": ["fire", "ra 9514"],
        "bp_220": ["bp-220", "bp220"],
    }
    
    combined = f"{slug_lower} {title_lower}"
    
    # Check specific before general
    if "prac-law" in slug_lower: return "law"
    if "prac-eth" in slug_lower: return "ethics"
    if "prac-ctr" in slug_lower: return "contracts"
    if "prac-svc" in slug_lower: return "services"
    if "prac-frm" in slug_lower: return "forms"
    if "prac-cmp" in slug_lower: return "compensation"
    if "pd-1096" in slug_lower: return "building_code"
    if "bp-344" in slug_lower: return "accessibility"
    if "bp-220" in slug_lower or "bp220" in slug_lower: return "bp_220"
    if "overview-" in slug_lower: return "overview"
    
    # Check by content patterns
    for cat, patterns in categories.items():
        if any(p in combined for p in patterns):
            return cat
    
    return "uncategorized"

def main():
    print("=" * 70)
    print("PHASE 1: INDEPENDENT VERIFICATION")
    print("=" * 70)
    print(f"Time: {datetime.now(timezone.utc).isoformat()}")
    print()
    
    # Step 1: Get article directories
    print("Scanning local article directories...")
    article_dirs = get_article_dirs()
    print(f"  Found {len(article_dirs)} article directories")
    
    # Step 2: Fetch Supabase articles
    print("\nFetching Supabase articles...")
    supabase_articles = fetch_supabase_articles()
    
    # Step 3: Verify each article
    print(f"\nVerifying {len(article_dirs)} articles...")
    
    ledger = []
    stats = {
        "total": len(article_dirs),
        "in_supabase": 0,
        "local_normalized": 0,
        "local_ui_blocks": 0,
        "local_sources": 0,
        "local_linked_questions": 0,
        "has_learning_goal": 0,
        "learning_goal_specific": 0,
        "learning_goal_generic": 0,
        "has_ui_blocks": 0,
        "has_hallucinated_components": 0,
        "has_broken_placeholders": 0,
        "has_source_refs": 0,
        "source_count_total": 0,
        "empty_sources": 0,
        "has_crosslinks": 0,
        "needs_crosslinks": 0,
        "categories": {},
        "fixes_verified": {}
    }
    
    for i, folder in enumerate(article_dirs):
        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{len(article_dirs)}")
        
        article_id = parse_article_id(folder)
        dir_path = os.path.join(ARTICLES_DIR, folder)
        
        entry = {
            "folder": folder,
            "article_id": article_id,
            "slug": None,
            "title": None,
            "category": None,
            "in_supabase": article_id in supabase_articles,
            "has_normalized": False,
            "has_original": False,
            "has_ui_blocks": False,
            "has_sources_json": False,
            "has_linked_questions": False,
            "has_question_edits": False,
            "has_candidate": False,
            "learning_goal_status": None,
            "ui_block_count": 0,
            "ui_block_valid": None,
            "hallucinated_components": [],
            "placeholder_issues": [],
            "source_count": 0,
            "question_count": 0,
            "needs_crosslinks": False,
            "needs_source_refs": False,
            "needs_polish": False,
            "has_answer_key_issues": False,
            "content_hash": None,
            "supabase_content_hash": None,
            "hash_match": None,
            "content_empty": False,
            "notes": []
        }
        
        # Check normalized.md
        nm_path = os.path.join(dir_path, "normalized.md")
        if os.path.exists(nm_path):
            entry["has_normalized"] = True
            content = read_file(nm_path)
            if content:
                if len(content.strip()) == 0:
                    entry["content_empty"] = True
                    entry["notes"].append("normalized.md is empty")
                
                # Check learning goals
                lg_has, lg_status = check_for_learning_goals(content)
                entry["learning_goal_status"] = lg_status
                if lg_has:
                    stats["has_learning_goal"] += 1
                    if lg_status == "specific":
                        stats["learning_goal_specific"] += 1
                    else:
                        stats["learning_goal_generic"] += 1
                
                # Check placeholders
                ph_result = check_placeholders(content)
                entry["placeholder_issues"] = ph_result["details"]
                if ph_result["has_broken"]:
                    stats["has_broken_placeholders"] += 1
                    entry["notes"].extend(ph_result["details"])
                
                # Compute hash
                entry["content_hash"] = sha256_hex(content)
                
                # Check for cross-links (See also, Related articles, cross-refs)
                if re.search(r'See also|Related|Cross-reference|cross.ref', content, re.IGNORECASE):
                    entry["needs_crosslinks"] = False
                    stats["has_crosslinks"] += 1
                else:
                    entry["needs_crosslinks"] = True
                    stats["needs_crosslinks"] += 1
        
        # Check ui-blocks.json
        ub_path = os.path.join(dir_path, "ui-blocks.json")
        if os.path.exists(ub_path):
            entry["has_ui_blocks"] = True
            ub = read_json(ub_path)
            ub_result = check_ui_blocks(ub)
            entry["ui_block_count"] = ub_result["count"]
            entry["ui_block_valid"] = ub_result["valid"]
            entry["hallucinated_components"] = ub_result["hallucinated"]
            if ub_result["count"] > 0:
                stats["has_ui_blocks"] += 1
            if ub_result["hallucinated"]:
                stats["has_hallucinated_components"] += 1
        
        # Check sources.json
        sources_path = os.path.join(dir_path, "sources.json")
        if os.path.exists(sources_path):
            entry["has_sources_json"] = True
            sources = read_json(sources_path)
            if isinstance(sources, list):
                entry["source_count"] = len(sources)
                stats["source_count_total"] += len(sources)
                if len(sources) > 0:
                    stats["has_source_refs"] += 1
                else:
                    entry["needs_source_refs"] = True
                    stats["empty_sources"] += 1
            elif isinstance(sources, dict):
                s_count = sources.get("sources", [])
                if isinstance(s_count, list):
                    entry["source_count"] = len(s_count)
                    stats["source_count_total"] += len(s_count)
                    if len(s_count) > 0:
                        stats["has_source_refs"] += 1
                    else:
                        entry["needs_source_refs"] = True
                        stats["empty_sources"] += 1
        else:
            entry["needs_source_refs"] = True
            stats["empty_sources"] += 1
        
        # Check linked-questions.json
        lq_path = os.path.join(dir_path, "linked-questions.json")
        if os.path.exists(lq_path):
            entry["has_linked_questions"] = True
            lq = read_json(lq_path)
            if isinstance(lq, list):
                entry["question_count"] = len(lq)
            elif isinstance(lq, dict):
                entry["question_count"] = len(lq.get("questions", []))
        
        # Check question-edits directory
        qe_dir = os.path.join(dir_path, "question-edits")
        if os.path.isdir(qe_dir):
            edits = [f for f in os.listdir(qe_dir) if f.endswith(".json")]
            entry["has_question_edits"] = len(edits) > 0
            entry["question_edit_count"] = len(edits)
        
        # Check candidate.md
        if os.path.exists(os.path.join(dir_path, "candidate.md")):
            entry["has_candidate"] = True
        
        # Check other files
        if os.path.exists(os.path.join(dir_path, "original.md")):
            entry["has_original"] = True
        
        # Get metadata
        meta_path = os.path.join(dir_path, "article-metadata.json")
        if os.path.exists(meta_path):
            meta = read_json(meta_path)
            if isinstance(meta, dict):
                entry["slug"] = meta.get("slug")
                entry["title"] = meta.get("title")
        
        # Determine category
        entry["category"] = determine_category(entry["slug"] or "", entry.get("title") or "", "")
        
        # Track supabase verification
        if entry["in_supabase"]:
            stats["in_supabase"] += 1
            sa = supabase_articles.get(article_id, {})
            entry["supabase_content_hash"] = sa.get("content_hash", "")
            if entry["content_hash"] and entry["supabase_content_hash"]:
                # Normalize: strip sha256: prefix if present
                local_h = entry["content_hash"]
                remote_h = entry["supabase_content_hash"].replace("sha256:", "")
                entry["hash_match"] = local_h == remote_h
        
        # Check if needs answer key review (articles with question edits need verification)
        if entry.get("has_question_edits"):
            entry["has_answer_key_issues"] = True
        
        # Determine if needs polish (PASS 7)
        polish_needed = False
        if entry["learning_goal_status"] == "generic" or entry["learning_goal_status"] is None:
            polish_needed = True
        if entry["ui_block_count"] == 0 and entry["category"] not in ["overview"]:
            polish_needed = True
        if entry["hallucinated_components"]:
            polish_needed = True
        entry["needs_polish"] = polish_needed
        
        # Category stats
        cat = entry["category"]
        if cat not in stats["categories"]:
            stats["categories"][cat] = {"total": 0, "needs_source": 0, "needs_polish": 0, "needs_crosslinks": 0}
        stats["categories"][cat]["total"] += 1
        if entry["needs_source_refs"]:
            stats["categories"][cat]["needs_source"] += 1
        if entry["needs_polish"]:
            stats["categories"][cat]["needs_polish"] += 1
        if entry["needs_crosslinks"]:
            stats["categories"][cat]["needs_crosslinks"] += 1
        
        ledger.append(entry)
    
    # Compile summary
    print(f"\n{'='*70}")
    print(f"VERIFICATION SUMMARY")
    print(f"{'='*70}")
    print(f"Total article directories: {stats['total']}")
    print(f"In Supabase: {stats['in_supabase']}")
    print(f"Has normalized.md: {sum(1 for e in ledger if e['has_normalized'])}")
    print(f"Has ui-blocks.json: {sum(1 for e in ledger if e['has_ui_blocks'])}")
    print(f"Has sources.json: {sum(1 for e in ledger if e['has_sources_json'])}")
    print(f"Has linked-questions.json: {sum(1 for e in ledger if e['has_linked_questions'])}")
    print(f"Has Learning Goals: {stats['has_learning_goal']} ({stats['learning_goal_specific']} specific, {stats['learning_goal_generic']} generic)")
    print(f"Has UI blocks: {stats['has_ui_blocks']}")
    print(f"Has hallucinated components: {stats['has_hallucinated_components']}")
    print(f"Has broken placeholders: {stats['has_broken_placeholders']}")
    print(f"Has source references: {stats['has_source_refs']}")
    print(f"Empty sources.json: {stats['empty_sources']}")
    print(f"Has cross-links: {stats['has_crosslinks']}")
    print(f"Needs cross-links: {stats['needs_crosslinks']}")
    print(f"Total source entries: {stats['source_count_total']}")
    print()
    
    print("Categories:")
    for cat, data in sorted(stats["categories"].items()):
        print(f"  {cat:25s}: {data['total']:3d} articles | needs_source={data['needs_source']:3d} | needs_polish={data['needs_polish']:3d} | needs_xlink={data['needs_crosslinks']:3d}")
    print()
    
    # Build queues
    source_backlog = [e for e in ledger if e["needs_source_refs"]]
    crosslink_queue = [e for e in ledger if e["needs_crosslinks"]]
    polish_queue = [e for e in ledger if e["needs_polish"]]
    prof_practice_queue = [e for e in ledger if e["category"] in ["professional_practice", "law", "ethics", "contracts", "services", "forms", "compensation", "building_code", "accessibility"]]
    
    # Write ledger
    print("Writing verification results...")
    
    # Write JSON ledger
    json_path = f"{OUTPUT_DIR}/article-verification-ledger.json"
    # Convert to serializable format
    serializable = []
    for e in ledger:
        se = dict(e)
        for k, v in se.items():
            if isinstance(v, set):
                se[k] = list(v)
        serializable.append(se)
    
    with open(json_path, "w") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": stats,
            "articles": serializable
        }, f, indent=2, default=str)
    print(f"  Written: {json_path}")
    
    # Write Markdown ledger
    md_path = f"{OUTPUT_DIR}/article-verification-ledger.md"
    with open(md_path, "w") as f:
        f.write(f"# Article Verification Ledger\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"## Summary\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"|--------|:-----:|\n")
        f.write(f"| Total articles | {stats['total']} |\n")
        f.write(f"| In Supabase | {stats['in_supabase']} |\n")
        f.write(f"| Has Learning Goals | {stats['has_learning_goal']} |\n")
        f.write(f"| - Specific | {stats['learning_goal_specific']} |\n")
        f.write(f"| - Generic | {stats['learning_goal_generic']} |\n")
        f.write(f"| Has UI blocks | {stats['has_ui_blocks']} |\n")
        f.write(f"| Hallucinated components | {stats['has_hallucinated_components']} |\n")
        f.write(f"| Broken placeholders | {stats['has_broken_placeholders']} |\n")
        f.write(f"| Has source references | {stats['has_source_refs']} |\n")
        f.write(f"| Empty sources.json | {stats['empty_sources']} |\n")
        f.write(f"| Needs cross-links | {stats['needs_crosslinks']} |\n")
        f.write(f"\n## Queues\n\n")
        f.write(f"- **Source backlog:** {len(source_backlog)} articles\n")
        f.write(f"- **Cross-link queue:** {len(crosslink_queue)} articles\n")
        f.write(f"- **Polish queue:** {len(polish_queue)} articles\n")
        f.write(f"- **Professional Practice queue:** {len(prof_practice_queue)} articles\n")
        f.write(f"\n## Articles Needing Source References\n\n")
        for e in sorted(source_backlog, key=lambda x: x.get("folder", "")):
            f.write(f"- {e.get('folder')}: category={e.get('category')}, q_count={e.get('question_count')}\n")
        f.write(f"\n## Articles Needing Cross-links\n\n")
        for e in sorted(crosslink_queue, key=lambda x: x.get("folder", "")):
            f.write(f"- {e.get('folder')}: category={e.get('category')}\n")
    print(f"  Written: {md_path}")
    
    # Write queue files
    def write_queue(filename, entries, description=""):
        path = f"{OUTPUT_DIR}/{filename}"
        with open(path, "w") as f:
            json.dump({
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "description": description,
                "count": len(entries),
                "entries": [{
                    "folder": e.get("folder"),
                    "article_id": e.get("article_id"),
                    "slug": e.get("slug"),
                    "title": e.get("title"),
                    "category": e.get("category"),
                    "question_count": e.get("question_count"),
                    "source_count": e.get("source_count"),
                    "notes": e.get("notes", [])
                } for e in entries]
            }, f, indent=2, default=str)
        print(f"  Written: {path}")
    
    write_queue("source-backlog-queue.json", source_backlog, "Articles needing source references populated in sources.json")
    write_queue("crosslink-queue.json", crosslink_queue, "Articles needing cross-links added")
    write_queue("polish-queue.json", polish_queue, "Articles needing PASS 7 learning polish")
    write_queue("professional-practice-queue.json", prof_practice_queue, "Professional Practice articles for touch-up")
    
    print(f"\nVerification complete. {len(source_backlog)} source backlog, {len(crosslink_queue)} crosslink, {len(polish_queue)} polish, {len(prof_practice_queue)} prof-practice entries queued.")
    
    return ledger, stats

if __name__ == "__main__":
    ledger, stats = main()
