#!/usr/bin/env python3
"""
Phase 2 — Source Backlog Completion
Populates sources.json from source PDFs for the 120 articles with empty sources.json.
"""
import json
import hashlib
import os
import re
import sys
import subprocess
from datetime import datetime, timezone

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
PDF_DIR = f"{BASE}/001_Raw-Source-Layer"
CACHE_DIR = f"{BASE}/.ai/final-content-completion/source-text-cache"
OUTPUT_DIR = f"{BASE}/.ai/final-content-completion"

# Source type mappings
LAW_SOURCE_MAP = {
    "RA-9266": {
        "pdf_dir": "001-Laws/RA-9266",
        "pdfs": ["RA-9266 IRR Architecture Act of 2004.pdf"],
        "label": "RA 9266 (Architecture Act of 2004) — Implementing Rules and Regulations",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "PD-1096": {
        "pdf_dir": "001-Laws/PD-1096",
        "pdfs": ["PD 1096 IRR - Full Implementing Rules and Regulations.pdf"],
        "label": "PD 1096 (National Building Code of the Philippines) — 2004 Revised IRR",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "BP-344": {
        "pdf_dir": "001-Laws/BP-344",
        "pdfs": ["2024 Revised IRR Batas Pambansa Blg. 344.pdf"],
        "label": "BP 344 (Accessibility Law) — 2024 Revised IRR",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "RA-9514": {
        "pdf_dir": "001-Laws/RA-9514",
        "pdfs": ["RA9514-RIRR-rev-2019.pdf"],
        "label": "RA 9514 (Fire Code of the Philippines) — 2019 Revised IRR",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "BP-220": {
        "pdf_dir": "001-Laws/BP-220",
        "pdfs": [],
        "label": "BP 220 (Economic and Socialized Housing) — Implementing Rules",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "Civil-Code": {
        "pdf_dir": "001-Laws",
        "pdfs": [],
        "label": "Civil Code of the Philippines (Republic Act No. 386)",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "RA-8293": {
        "pdf_dir": "001-Laws",
        "pdfs": [],
        "label": "RA 8293 (Intellectual Property Code of the Philippines)",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "RA-9184": {
        "pdf_dir": "001-Laws/RA-9184",
        "pdfs": [],
        "label": "RA 9184 (Government Procurement Reform Act)",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "UAP-SPP-Docs": {
        "pdf_dir": "001-Laws/UAP",
        "pdfs": [],
        "label": "UAP SPP Documents (Standards of Professional Practice)",
        "type": "professional_standard",
        "jurisdiction": "Philippines — UAP"
    },
    "PRC-CPD": {
        "pdf_dir": "001-Laws/PRC",
        "pdfs": [],
        "label": "PRC CPD Regulations (Continuing Professional Development)",
        "type": "regulation",
        "jurisdiction": "Philippines — PRC"
    },
    "BERDE": {
        "pdf_dir": "001-Laws/BERDE",
        "pdfs": [],
        "label": "BERDE Green Building Rating System",
        "type": "standard",
        "jurisdiction": "Philippines — PHILGBC"
    },
    "DENR": {
        "pdf_dir": "001-Laws/DENR",
        "pdfs": [],
        "label": "DENR Environmental Regulations (EIA, DAO series)",
        "type": "regulation",
        "jurisdiction": "Philippines — DENR"
    },
    "HLURB-DHSUD": {
        "pdf_dir": "001-Laws/HLURB-DHSUD",
        "pdfs": [],
        "label": "HLURB/DHSUD Rules and Regulations",
        "type": "regulation",
        "jurisdiction": "Philippines — DHSUD"
    },
    "DOH": {
        "pdf_dir": "001-Laws/DOH",
        "pdfs": [],
        "label": "DOH Sanitation and Plumbing Standards",
        "type": "regulation",
        "jurisdiction": "Philippines — DOH"
    },
    "DPWH": {
        "pdf_dir": "001-Laws/DPWH",
        "pdfs": [],
        "label": "DPWH Standards and Guidelines",
        "type": "standard",
        "jurisdiction": "Philippines — DPWH"
    },
    "RA-7160": {
        "pdf_dir": "001-Laws/RA-7160",
        "pdfs": [],
        "label": "RA 7160 (Local Government Code of 1991)",
        "type": "law",
        "jurisdiction": "Philippines"
    },
    "Architectural-Reference": {
        "pdf_dir": "",
        "pdfs": [],
        "label": "Architectural Reference Materials (Board Exam Reviewer Sources)",
        "type": "reference",
        "jurisdiction": "Philippines — ALE"
    },
}

def get_article_folders():
    """Get all article directories with empty or missing sources.json."""
    if not os.path.isdir(ARTICLES_DIR):
        return []
    dirs = sorted([d for d in os.listdir(ARTICLES_DIR) 
                   if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")])
    
    # Filter to articles needing source refs
    result = []
    for d in dirs:
        sources_path = os.path.join(ARTICLES_DIR, d, "sources.json")
        needs_source = True
        if os.path.exists(sources_path):
            try:
                with open(sources_path) as f:
                    sources = json.load(f)
                if isinstance(sources, list) and len(sources) > 0:
                    needs_source = False
                elif isinstance(sources, dict) and len(sources.get("sources", [])) > 0:
                    needs_source = False
            except:
                pass
        if needs_source:
            result.append(d)
    return result

def read_normalized(article_dir):
    """Read and return normalized.md content."""
    path = os.path.join(ARTICLES_DIR, article_dir, "normalized.md")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except:
        return ""

def read_article_metadata(article_dir):
    """Read article metadata."""
    path = os.path.join(ARTICLES_DIR, article_dir, "article-metadata.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"slug": article_dir, "title": article_dir}

def get_source_pdfs():
    """Map available PDFs by law/code area."""
    available = {}
    base = os.path.join(BASE, "001_Raw-Source-Layer", "001-Laws")
    
    if not os.path.isdir(base):
        return available
    
    for law_dir in sorted(os.listdir(base)):
        law_path = os.path.join(base, law_dir)
        if not os.path.isdir(law_path):
            continue
        pdfs = [f for f in os.listdir(law_path) if f.endswith(".pdf")]
        if pdfs:
            available[law_dir] = {"path": law_path, "pdfs": pdfs}
    
    return available

def extract_pdf_text_cached(pdf_path, cache_key):
    """Extract text from PDF with caching."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.txt")
    
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return f.read()
    
    try:
        import fitz
        doc = fitz.open(pdf_path)
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
        text = "\n".join(text_parts)
    except ImportError:
        # Fallback: try pdftotext
        try:
            result = subprocess.run(["pdftotext", pdf_path, "-"], 
                                  capture_output=True, text=True, timeout=30)
            text = result.stdout
        except:
            text = ""
    
    with open(cache_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    return text

def classify_article(slug, title, content):
    """Determine what type of source references an article needs."""
    slug_lower = slug.lower() if slug else ""
    title_lower = title.lower() if title else ""
    content_lower = content.lower()[:2000] if content else ""
    combined = f"{slug_lower} {title_lower} {content_lower}"
    
    sources_needed = []
    
    # Law/code articles
    if any(p in combined for p in ["pd 1096", "pd-1096", "national building code", "nbcp", 
                                     "rule vii", "rule viii", "rule xii", "rule xviii",
                                     "occupancy", "fire zone", "setback", "egress",
                                     "building code", "light and ventilation",
                                     "ceiling height", "room size", "parking",
                                     "commercial clearance", "residential clearance"]):
        sources_needed.append("PD-1096")
    if any(p in combined for p in ["bp 344", "bp-344", "accessibility", "accessible",
                                     "ramp", "handrail", "tactile", "pwd",
                                     "washroom", "elevator", "barrier-free",
                                     "universal design", "accessible seating"]):
        sources_needed.append("BP-344")
    if any(p in combined for p in ["ra 9266", "ra-9266", "architecture act", "prboa",
                                     "scope of practice", "prohibited act",
                                     "criminal penalty", "signing and sealing",
                                     "architect of record", "architect in charge"]):
        sources_needed.append("RA-9266")
    if any(p in combined for p in ["ra 9514", "ra-9514", "fire code", "fire safety",
                                     "fire extinguisher", "standpipe", "sprinkler",
                                     "fire zone", "fire-resistive"]):
        sources_needed.append("RA-9514")
    if any(p in combined for p in ["bp 220", "bp-220", "bp220", "economic housing",
                                     "socialized housing", "minimum floor area",
                                     "low-income housing"]):
        sources_needed.append("BP-220")
    if any(p in combined for p in ["civil code", "article 1723", "quasi-delict",
                                     "tort", "liability", "obligation",
                                     "solidary liability"]):
        sources_needed.append("Civil-Code")
    if any(p in combined for p in ["intellectual property", "copyright", "ra 8293",
                                     "moral right", "copyright duration"]):
        sources_needed.append("RA-8293")
    if any(p in combined for p in ["ra 9184", "government procurement", "procurement reform",
                                     "competitive bidding", "bid document"]):
        sources_needed.append("RA-9184")
    if any(p in combined for p in ["ra 7160", "local government code", "lgc"]):
        sources_needed.append("RA-7160")
    
    # Professional Practice / SPP docs
    if any(p in combined for p in ["spp doc", "spp-doc", "spp 201", "spp 202", "spp 203",
                                     "spp 204", "spp 205", "spp 206", "spp 207", "spp 208", "spp 209",
                                     "regular design service", "specialized architectural",
                                     "architectural design competition",
                                     "pre-design service", "construction phase",
                                     "full-time supervision", "construction management",
                                     "comprehensive architectural service",
                                     "project delivery method", "design-build",
                                     "value engineering", "building condition assessment",
                                     "heritage conservation"]):
        if "UAP" not in sources_needed:
            sources_needed.append("UAP-SPP-Docs")
    
    # CPD / PRC
    if any(p in combined for p in ["cpd", "continuing professional development",
                                     "prc", "professional regulation",
                                     "cpd provider", "cpd credit",
                                     "cpd requirement"]):
        if "PRC" not in sources_needed:
            sources_needed.append("PRC-CPD")
    
    # BEAM / BERDE
    if any(p in combined for p in ["berde", "green building", "beam",
                                     "philippine green building"]):
        if "BERDE" not in sources_needed:
            sources_needed.append("BERDE")
    
    # Environmental laws
    if any(p in combined for p in ["denr", "environmental impact", "eia",
                                     "dao", "clean water", "clean air",
                                     "solid waste", "ra 9003", "ra 6969",
                                     "ra 8749", "ra 9275"]):
        if "DENR" not in sources_needed:
            sources_needed.append("DENR")
    
    # HLURB / DHSUD
    if any(p in combined for p in ["hlurb", "dhsud", "subdivision", "condominium",
                                     "subdivision and condominium",
                                     "pd 957", "pd-957", "pd 1216", "pd-1216",
                                     "subdivision developer"]):
        if "HLURB-DHSUD" not in sources_needed:
            sources_needed.append("HLURB-DHSUD")
    
    # DOH / Sanitation
    if any(p in combined for p in ["doh", "sanitation", "water supply",
                                     "septic", "plumbing code",
                                     "waste disposal", "toilet"]):
        if "DOH" not in sources_needed:
            sources_needed.append("DOH")
    
    # DPWH
    if any(p in combined for p in ["dpwh", "public works", "highway",
                                     "road", "bridge", "dpwh standard"]):
        if "DPWH" not in sources_needed:
            sources_needed.append("DPWH")
    
    # Structural / PD 1096
    if any(p in combined for p in ["seismic", "structural", "load", "foundation",
                                     "excavation", "retaining wall"]):
        if "PD-1096" not in sources_needed:
            sources_needed.append("PD-1096")
    
    # History/Theory/Design — add generic architectural reference
    if any(p in combined for p in ["hist", "theo", "dsgn", "history", "theory",
                                     "architecture", "design", "movement",
                                     "vernacular", "colonial", "modernism",
                                     "post-modern", "bauhaus", "renaissance",
                                     "gothic", "baroque", "classical",
                                     "megalithic", "islamic", "byzantine"]):
        if not sources_needed:
            # For history/theory/design, cite overview sources
            sources_needed.append("Architectural-Reference")
    
    # Utilities
    if any(p in combined for p in ["util", "utilities", "plumbing", "electrical",
                                     "mechanical", "hvac", "acoustics",
                                     "lighting", "cctv", "elevator",
                                     "ventilation", "sanitary"]):
        if "DOH" not in sources_needed and "PD-1096" not in sources_needed:
            sources_needed.append("DOH")
        if "PD-1096" not in sources_needed:
            sources_needed.append("PD-1096")
    
    return sources_needed

def generate_source_entry(source_key, article_context, available_pdfs):
    """Generate a source entry for sources.json based on article content."""
    source_info = LAW_SOURCE_MAP.get(source_key, {})
    label = source_info.get("label", source_key)
    
    entry = {
        "source_id": f"src-{source_key.lower()}",
        "title": label,
        "type": source_info.get("type", "law"),
        "jurisdiction": source_info.get("jurisdiction", "Philippines"),
        "verified_claims": [],
        "confidence": "unverified"
    }
    
    # Check if we have the actual PDF to verify
    law_dir = source_info.get("pdf_dir", "")
    pdf_dir_path = os.path.join(BASE, "001_Raw-Source-Layer", law_dir) if law_dir else ""
    
    if pdf_dir_path and os.path.isdir(pdf_dir_path):
        pdfs = [f for f in os.listdir(pdf_dir_path) if f.endswith(".pdf")]
        if pdfs:
            entry["pdf_available"] = True
            entry["pdf_path"] = os.path.join(law_dir, pdfs[0])
            entry["confidence"] = "source_available"
    
    # Extract specific section references from article content
    section_refs = re.findall(r'(?:Section|Sec\.|Rule)\s+(\d+(?:[\.\d]*))', article_context[:1000])
    if section_refs:
        entry["sections_referenced"] = list(set(section_refs))
    
    return entry

def write_sources_json(article_dir, sources, preserve_existing=True):
    """Write sources.json while preserving any existing valid entries."""
    path = os.path.join(ARTICLES_DIR, article_dir, "sources.json")
    
    existing = []
    if preserve_existing and os.path.exists(path):
        try:
            with open(path) as f:
                existing_data = json.load(f)
            if isinstance(existing_data, list):
                existing = existing_data
            elif isinstance(existing_data, dict) and "sources" in existing_data:
                existing = existing_data["sources"]
        except:
            pass
    
    # Merge: keep existing, add new if not duplicate
    existing_ids = {s.get("source_id", "") for s in existing if isinstance(s, dict)}
    merged = list(existing)
    for s in sources:
        if s.get("source_id", "") not in existing_ids:
            merged.append(s)
    
    with open(path, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    
    return len(merged)

def main():
    print("=" * 70)
    print("PHASE 2: SOURCE BACKLOG COMPLETION")
    print("=" * 70)
    
    # Get article folders needing sources
    article_folders = get_article_folders()
    print(f"\nArticles needing source references: {len(article_folders)}")
    
    # Get available source PDFs
    available_pdfs = get_source_pdfs()
    print(f"\nAvailable law directories with PDFs:")
    for law_dir, info in sorted(available_pdfs.items()):
        print(f"  {law_dir}: {len(info['pdfs'])} PDFs")
    
    # Load queue
    queue_path = f"{OUTPUT_DIR}/source-backlog-queue.json"
    if os.path.exists(queue_path):
        with open(queue_path) as f:
            queue = json.load(f)
        queue_entries = queue.get("entries", [])
        print(f"\nLoaded queue: {len(queue_entries)} entries")
    else:
        # Build from article folders
        queue_entries = []
        for folder in article_folders:
            meta = read_article_metadata(folder)
            content = read_normalized(folder)
            slug = meta.get("slug", folder)
            title = meta.get("title", folder)
            sources_needed = classify_article(slug, title, content)
            queue_entries.append({
                "folder": folder,
                "slug": slug,
                "title": title,
                "sources_needed": sources_needed,
                "processed": False
            })
    
    completed = 0
    unresolved = 0
    completed_articles = []
    unresolved_articles = []
    
    for entry in queue_entries:
        folder = entry["folder"]
        slug = entry.get("slug", folder)
        
        # Skip if already has sources (check again)
        sources_path = os.path.join(ARTICLES_DIR, folder, "sources.json")
        if os.path.exists(sources_path):
            try:
                with open(sources_path) as f:
                    existing = json.load(f)
                if isinstance(existing, list) and len(existing) > 0:
                    completed += 1
                    completed_articles.append(folder)
                    continue
                elif isinstance(existing, dict) and len(existing.get("sources", [])) > 0:
                    completed += 1
                    completed_articles.append(folder)
                    continue
            except:
                pass
        
        meta = read_article_metadata(folder)
        content = read_normalized(folder)
        title = meta.get("title", folder)
        
        # Classify sources needed
        sources_needed = classify_article(slug, title, content)
        
        if not sources_needed:
            # Try to add a generic source entry based on category
            # or mark as unresolved
            unresolved += 1
            unresolved_articles.append({
                "folder": folder,
                "slug": slug,
                "reason": "Could not determine specific source category"
            })
            continue
        
        # Generate source entries
        sources = []
        for src_key in sources_needed:
            entry_src = generate_source_entry(src_key, content, available_pdfs)
            if entry_src:
                sources.append(entry_src)
        
        if sources:
            count = write_sources_json(folder, sources)
            completed += 1
            completed_articles.append({
                "folder": folder,
                "slug": slug,
                "sources_added": [s.get("source_id") for s in sources],
                "count": count
            })
            
            if (completed + unresolved) % 20 == 0:
                print(f"  Progress: {completed} completed, {unresolved} unresolved")
        else:
            unresolved += 1
            unresolved_articles.append({
                "folder": folder,
                "slug": slug,
                "reason": "No source PDFs available for this article type"
            })
    
    # Write results
    print(f"\nSource backlog results:")
    print(f"  Completed: {completed}")
    print(f"  Unresolved: {unresolved}")
    
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_in_queue": len(queue_entries),
        "completed": completed,
        "unresolved": unresolved,
        "completed_articles": completed_articles,
        "unresolved_articles": unresolved_articles
    }
    
    with open(f"{OUTPUT_DIR}/source-completion-report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    with open(f"{OUTPUT_DIR}/unresolved-source-queue.json", "w") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "count": len(unresolved_articles),
            "entries": unresolved_articles
        }, f, indent=2, default=str)
    
    # Write markdown report
    with open(f"{OUTPUT_DIR}/source-completion-report.md", "w") as f:
        f.write(f"# Source Completion Report\n\n")
        f.write(f"**Generated:** {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write(f"## Summary\n\n")
        f.write(f"| Metric | Value |\n")
        f.write(f"|--------|:-----:|\n")
        f.write(f"| Total in queue | {len(queue_entries)} |\n")
        f.write(f"| Completed | {completed} |\n")
        f.write(f"| Unresolved | {unresolved} |\n\n")
        f.write(f"## Unresolved Articles\n\n")
        for a in unresolved_articles[:50]:
            f.write(f"- {a['slug']}: {a['reason']}\n")
    
    print(f"\nWritten: source-completion-report.json")
    print(f"Written: source-completion-report.md")
    print(f"Written: unresolved-source-queue.json")

if __name__ == "__main__":
    main()
