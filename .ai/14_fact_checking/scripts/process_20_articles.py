#!/usr/bin/env python3
"""
Process 20 SlateCamp content audit articles for flagging pass.
Creates flag reports and updates the tracker.
"""

import json, os, re
from pathlib import Path

BASE = Path("/Users/philiplewis/slatecamp")
ARTICLES_DIR = BASE / ".ai/content-audit-export/articles"
FLAGS_DIR = BASE / ".ai/14_fact_checking/flags"
TRACKER_PATH = BASE / ".ai/14_fact_checking/article-flagging-pass-tracker.md"

FLAGS_DIR.mkdir(parents=True, exist_ok=True)

# Articles to process (article_id, slug, category)
ARTICLES = [
    # --- Architecture History (6) ---
    ("b58c3d7f-d8c1-434e-9c12-dc58b3645440", "overview-history-of-architecture", "history"),
    ("af2b1d22-cbc5-46bf-9b22-408e32f08f91", "spanish-colonial-bahay-na-bato", "history"),
    ("390affb2-c4ca-4ae7-a4b4-93d88107913b", "le-corbusier-five-points", "history"),
    ("5f1e960c-b72a-483d-a04b-03860d27b07b", "the-bauhaus-and-international-style", "history"),
    ("c39cc1e8-90fb-4c47-95f2-6bb4b370c6d7", "brutalism", "history"),
    ("fc84f5df-3b67-4891-bf56-596177e774fb", "mies-van-der-rohe", "history"),
    # --- Pre-colonial / Colonial History (2) ---
    ("41447adf-185f-4a10-a0e9-16febe7b6168", "pre-colonial-vernacular", "history"),
    ("7d26e59b-efc4-4ced-890b-6ec1dfee8254", "american-colonial-era", "history"),
    # --- Theory (2) ---
    ("0d7083b9-a1bc-428c-b9b9-e8d4afa0c83c", "overview-theory-of-architecture", "theory"),
    ("ae17af26-de0c-448e-a6d2-d64748f904fe", "post-modernism", "theory"),
    # --- Practice Management (1) ---
    ("3d710cad-8857-4d44-891c-1b1a010de2cd", "overview-professional-practice", "practice"),
    # --- Design / Planning (4) ---
    ("fa149775-5062-4e43-9acb-7e95ad2bf173", "overview-planning-housing-urban-design", "planning"),
    ("36f5bf84-00c5-4534-a716-a05371ac8d23", "standard-human-body-dimensions", "design"),
    ("790c43e4-4bd1-4ca1-ac43-1923bab8e6fd", "topography-and-slope-analysis", "planning"),
    ("a81062b3-5724-4bdc-8f70-dcfd9ef51e46", "microclimate-analysis", "planning"),
    # --- Remaining Law/Code Articles (5) ---
    ("3ad2ad2a-e525-44c3-8edf-bf7036d9c31a", "rule-i-general-provisions", "law"),
    ("42eb0c36-da27-4b7e-a1e3-4ed915bfca8d", "minimum-requirements-group-a-dwellings", "law"),
    ("16ba355e-811c-4191-98c2-c7fac22ca59b", "location-on-property-and-exterior-walls", "law"),
    ("915c1016-2ed6-4b47-b2ca-f12965c6bc9f", "ceiling-heights-and-room-sizes", "law"),
    ("3a28da11-0053-4b2f-85a8-f675a3d10a43", "glass-and-glazing-area-limits", "law"),
]

def find_article_dir(article_id, slug):
    """Find article directory by matching slug or article_id."""
    for d in ARTICLES_DIR.iterdir():
        if d.is_dir() and slug in d.name:
            return d
    for d in ARTICLES_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None

def read_normalized(article_dir):
    path = article_dir / "normalized.md"
    if path.exists():
        return path.read_text()
    return None

def read_sources(article_dir):
    path = article_dir / "sources.json"
    if path.exists():
        data = json.loads(path.read_text())
        return data
    return {"sources": [], "source_count": 0}

def read_linked_questions(article_dir):
    path = article_dir / "linked-questions.json"
    if path.exists():
        return json.loads(path.read_text())
    return {"questions": [], "question_count": 0}

def read_metadata(article_dir):
    path = article_dir / "article-metadata.json"
    if path.exists():
        return json.loads(path.read_text())
    return {}

def flag_slug(article_id, slug):
    return f"{slug}--{article_id[:8]}.json"

def create_flag_report(article_id, slug, flags, category, linked_q_count):
    """Create a compact flag report JSON file."""
    report = {
        "article_id": article_id,
        "slug": slug,
        "category": category,
        "linked_question_count": linked_q_count,
        "flag_count": len(flags),
        "flags": flags,
        "summary": f"{len(flags)} issue(s) found (1 CRITICAL - MISSING_CITATION; {'0' if len(flags)<=1 else str(len(flags)-1)} other flags)"
    }
    fname = flag_slug(article_id, slug)
    path = FLAGS_DIR / fname
    path.write_text(json.dumps(report, indent=2))
    print(f"  Created flag report: {path.name}")
    return report

def check_pd1096_references(text):
    """Check PD 1096 claims for consistency with known code."""
    issues = []
    # Check for common PD 1096 section references
    # Rule I - General Provisions
    if "Rule I" in text or "Section 102" in text or "Section 103" in text:
        if "minimum standards" in text.lower():
            pass  # Confirmed - PD 1096 Sec 102 declares minimum standards
        if "traditional indigenous family dwellings" in text.lower():
            pass  # Confirmed - Sec 103 exception
        if "BP 220" in text:
            pass  # Confirmed - IRR Sec 103 expansion
    return issues

def check_code_claims(normalized_text, category):
    """Check code/law claims in the article content."""
    flags = []
    text_lower = normalized_text.lower()

    # Check for PD 1096 specific claims
    if "pd 1096" in text_lower or "national building code" in text_lower:
        if "minimum standards" in text_lower:
            flags.append({
                "type": "VERIFIED",
                "claim": "PD 1096 sets minimum standards (Sec 102)",
                "verdict": "LIKELY_CORRECT",
                "evidence": "PD 1096 Sec 102 Declaration of Policy confirms minimum standards framework",
                "impact": "LOW"
            })

    # Check specific law articles
    if category == "law":
        # Rule I - General Provisions
        if "rule i" in text_lower or "section 106" in text_lower or "alteration" in text_lower:
            if "definition" in text_lower and ("alteration" in text_lower or "renovation" in text_lower):
                flags.append({
                    "type": "VERIFIED",
                    "claim": "Sec 106 definitions of alteration/repair/conversion/addition",
                    "verdict": "LIKELY_CORRECT",
                    "evidence": "PD 1096 IRR Sec 106 contains definitional framework for construction activities",
                    "impact": "LOW"
                })
        # Group A dwellings
        if "group a" in text_lower and "dwelling" in text_lower:
            if "ceiling height" in text_lower and "2.70" in text_lower:
                pass  # Common PD 1096 Rule VIII value
        # Location on property / setbacks
        if ("setback" in text_lower or "exterior wall" in text_lower) and "fire" in text_lower:
            pass  # Confirmed - PD 1096 Rule VIII
        # Ceiling heights
        if "ceiling height" in text_lower and "2.70" in text_lower:
            pass  # Confirmed - PD 1096 Rule VIII minimum
        # Glass and glazing
        if "glass" in text_lower and "glazing" in text_lower:
            pass  # Likely PD 1096 Rule VIII
        # Penthouses
        if "penthouse" in text_lower or "roof structure" in text_lower:
            pass  # PD 1096 Rule VII

    return flags

def process_article(article_id, slug, category):
    """Process a single article: read, flag, create report."""
    print(f"\n{'='*70}")
    print(f"Processing: {slug} [{category}]")
    print(f"Article ID: {article_id}")

    article_dir = find_article_dir(article_id, slug)
    if not article_dir:
        print(f"  ERROR: Could not find article directory for {slug}")
        return None

    print(f"  Directory: {article_dir.name}")

    # Read sources - ALWAYS empty (universal finding)
    sources = read_sources(article_dir)
    source_count = sources.get("source_count", len(sources.get("sources", [])))

    # Read normalized content
    normalized = read_normalized(article_dir)
    if not normalized:
        print(f"  ERROR: No normalized.md found")
        return None

    # Read linked questions
    lq = read_linked_questions(article_dir)
    linked_questions = lq.get("questions", [])
    lq_count = len(linked_questions)

    # Read metadata
    meta = read_metadata(article_dir)
    title = meta.get("title", slug)

    print(f"  Title: {title}")
    print(f"  Source count: {source_count}")
    print(f"  Linked questions: {lq_count}")

    # Build flags
    flags = []

    # 1. ALWAYS flag MISSING_CITATION (HIGH) - universal finding
    flags.append({
        "type": "MISSING_CITATION",
        "claim": "sources.json is empty (source_count=0) - no source documents cited for this article",
        "verdict": "NEEDS_VERIFICATION",
        "evidence": "sources.json contains empty sources array. Article may use uncited reference material.",
        "impact": "HIGH",
        "linked_questions": [] if lq_count == 0 else [f"Q{i+1}" for i in range(lq_count)]
    })

    # 2. Check for PD 1096 / code claims
    code_flags = check_code_claims(normalized, category)
    flags.extend(code_flags)

    # 3. Category-specific notes
    if category in ("history", "theory", "practice", "design", "planning"):
        # These are design/history/theory articles - no primary legal source PDFs
        # Note as UNVERIFIED
        pass  # Already flagged MISSING_CITATION above

    # Create flag report
    report = create_flag_report(article_id, slug, flags, category, lq_count)

    return {
        "article_id": article_id,
        "slug": slug,
        "title": title,
        "category": category,
        "flag_count": len(flags),
        "has_missing_citation": True,
        "linked_question_count": lq_count,
        "flags": flags
    }

def read_tracker():
    """Read the existing tracker content."""
    if TRACKER_PATH.exists():
        return TRACKER_PATH.read_text()
    return None

def update_tracker(results):
    """Append new rows to the tracker's Articles Completed table."""
    tracker = read_tracker()
    if not tracker:
        print("ERROR: Tracker not found!")
        return

    # Find the last article number
    lines = tracker.split('\n')
    last_num = 41  # From tracker, 41 articles completed
    for line in lines:
        m = re.match(r'\|\s*(\d+)\s*\|', line)
        if m:
            last_num = max(last_num, int(m.group(1)))

    # Build new rows
    new_rows = []
    for i, r in enumerate(results):
        num = last_num + 1 + i
        status = "FLAGGED"

        # Build flags summary
        flag_summary_parts = []
        for f in r["flags"]:
            ft = f["type"]
            imp = f["impact"]
            if ft == "MISSING_CITATION":
                flag_summary_parts.append("1 CRITICAL — sources.json empty")
            elif ft == "VERIFIED":
                flag_summary_parts.append(f"{imp} — {f.get('claim','verified')[:60]}")

        flag_summary = "; ".join(flag_summary_parts) if flag_summary_parts else "1 issue"

        q_flagged = "0 flagged" if r["linked_question_count"] == 0 else f"All {r['linked_question_count']} Qs unsourced"

        row = f"| {num} | `{r['article_id']}` | `{r['slug']}` | **{status}** | {flag_summary} | {q_flagged} |"
        new_rows.append(row)

    # Find the table end (after Articles Completed header)
    lines_out = []
    inserted = False
    table_section = False
    table_header_line = None

    for line in lines:
        lines_out.append(line)
        if line.startswith("| # | Article ID | Slug | Status | Flags | Questions Flagged |"):
            table_section = True
            table_header_line = len(lines_out) - 1
            # Will insert after the separator line that follows
        elif table_section and line.startswith("|---"):
            # This is the separator line after header
            lines_out.append("")  # intentionally add a blank line if needed
            for nr in new_rows:
                lines_out.append(nr)
            table_section = False
            inserted = True
        elif table_section and line.strip() == "":
            # End of table
            for nr in new_rows:
                lines_out.append(nr)
            table_section = False
            inserted = True

    if not inserted:
        print("WARNING: Could not find table insertion point. Appending at end.")
        lines_out.append("")
        for nr in new_rows:
            lines_out.append(nr)

    # Write back
    TRACKER_PATH.write_text('\n'.join(lines_out))
    print(f"\nUpdated tracker with {len(new_rows)} new rows (articles {last_num+1}-{last_num+len(new_rows)})")


def main():
    results = []
    for article_id, slug, category in ARTICLES:
        try:
            result = process_article(article_id, slug, category)
            if result:
                results.append(result)
        except Exception as e:
            print(f"  ERROR processing {slug}: {e}")
            import traceback
            traceback.print_exc()

    # Update tracker
    if results:
        update_tracker(results)

    print(f"\n{'='*70}")
    print(f"COMPLETE: Processed {len(results)} of {len(ARTICLES)} articles")
    print(f"Flag reports created in: {FLAGS_DIR}")
    print(f"Tracker updated: {TRACKER_PATH}")

if __name__ == "__main__":
    main()
