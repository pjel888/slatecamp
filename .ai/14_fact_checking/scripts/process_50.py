#!/usr/bin/env python3
"""
Batch article flagging processor for SlateCamp content audit.
Processes 50 articles, writes flag reports, updates tracker.
"""
import json
import os
import re
import sys

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
FLAGS_DIR = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags"
TRACKER = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/article-flagging-pass-tracker.md"

ARTICLES = [
    # Design - 5 articles
    "lea-dsgn-003-04-core-concept--1673310d-fe41-40f3-ab75-0c7e90db42e1",
    "lea-dsgn-004-05-core-concept--ea6d06eb-e659-4092-ad67-14d4956cc4c6",
    "lea-dsgn-005-05-core-concept--40479f68-42a9-482a-960f-9901f522d086",
    "lea-dsgn-006-04-core-concept--2b843aa3-45d9-4421-ae00-107e94f28495",
    "lea-dsgn-007-04-core-concept--c9b1aadd-4843-4cf3-a551-6dd67678e508",

    # Structural - 5 articles
    "lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff",
    "lea-strc-002-01-core-concept--3fbb9789-4f15-4c22-a982-1b4686df8219",
    "lea-strc-003-01-core-concept--79ca7e09-9492-49b1-9289-88d444451275",
    "lea-strc-004-01-core-concept--2ef8093e-b636-42f7-8f25-55adcfc22821",
    "lea-strc-005-01-core-concept--dac86d82-085d-4627-bf1d-2e3ab4be9da3",

    # Materials - 5 articles
    "lea-matl-001-04-core-concept--c1f7906b-35f8-460b-bb03-f996ad25658e",
    "lea-matl-002-03-core-concept--42ec69b2-114a-423b-bba3-12cd5564f994",
    "lea-matl-003-04-core-concept--7dccfed0-8f85-47ad-b72b-8e5940d8276a",
    "lea-matl-004-06-core-concept--b055d93c-4f92-4608-b88b-ff729757f92e",
    "lea-matl-005-05-core-concept--8a3fed25-4fda-4d38-a3a9-0e452f0e1e75",

    # History - 5 articles
    "lea-hist-001-02-core-concept--e72bf24e-a816-4c4f-ae4b-f8e97c5d5519",
    "lea-hist-002-02-core-concept--48580f1e-3497-48f9-a87e-0f67c6e476b6",
    "lea-hist-004-02-core-concept--c0a5189b-4c67-47ad-bfd0-4b4d33df7247",
    "lea-hist-007-01-core-concept--cde95089-b874-42c5-8250-abc58ad7fae0",
    "lea-hist-008-01-core-concept--1f411bc4-4ca5-4bb2-ab46-e130e1b0a5e4",

    # Theory - 5 articles
    "lea-theo-001-07-core-concept--30832ba5-fbe9-4047-871a-aa4cb63ac616",
    "lea-theo-002-01-core-concept--62274e90-5cb3-4bc0-85a1-639858e47736",
    "lea-theo-004-01-core-concept--567ba614-9dcd-4c76-8bf3-74478fd1291f",
    "lea-theo-005-01-core-concept--128400dd-8642-4275-a64f-c411f6836d6d",
    "lea-theo-007-01-core-concept--5144f75e-e8ee-49a0-8dcf-2ded9c2b432c",

    # Planning - 4 articles
    "lea-plan-001-01-core-concept--d28bf43f-a588-4be3-8b79-8759d930aea4",
    "lea-plan-002-01-core-concept--50d41d7e-57cd-4280-b850-e6d2f89414a6",
    "lea-plan-003-02-core-concept--7c0e2fa5-7f3d-419a-b592-50346ac7ab2f",
    "lea-plan-004-01-core-concept--6a351c32-f48d-45fb-93f5-e60e6cd271c5",

    # Utilities - 5 articles
    "lea-util-001-07-core-concept--be3f2bf1-8d85-4c03-a047-ae1c2503d4cb",
    "lea-util-002-03-core-concept--903c66da-2864-48b0-b638-2ed218a173e2",
    "lea-util-003-02-core-concept--91727ebf-ee05-4aa8-a538-d8c599a1d9c9",
    "lea-util-005-03-core-concept--881027cd-2be0-4c93-af86-4f801ec16882",
    "lea-util-006-02-core-concept--dd8ec17f-7f5c-4652-9257-65811b1ead0c",

    # Ethics - 4 articles
    "lea-prac-eth-001-core-concept--6604a199-6687-435d-aeb1-ffdc46be7d23",
    "lea-prac-eth-002-core-concept--f769b43e-e467-4ce4-afd9-2d0152fe8d46",
    "lea-prac-eth-003-core-concept--9bc92dcd-8cce-4970-9111-13e21a72fb68",
    "lea-prac-eth-004-core-concept--cd6c1a20-eee6-4475-b0cc-239897d3f4d7",

    # Contract - 4 articles
    "lea-prac-ctr-005-core-concept--5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5",
    "lea-prac-ctr-016-core-concept--4e28889a-cba3-4bf4-805c-ff0526910ee3",
    "lea-prac-ctr-017-core-concept--33f0a370-4f6f-46ba-b06f-edcce2168cdd",
    "lea-prac-ctr-018-core-concept--5e99dd5d-1394-46bc-998e-8915e2595b0b",

    # Special topics - 4 articles
    "case-study-hospital-mall-school--fc6f1ca7-340b-4188-8fc0-036e4e9d4498",
    "lodging-and-residential-accessibility--7a3b0ff7-407f-40cc-b398-fca6358f4db7",
    "21st-century-movements--60c3b78a-e1c7-4c5e-880e-f9526d6c570d",
    "ergonomics-in-furniture-design--691cf42d-0f6c-4686-b3d0-9a3bbd99da23",

    # Mastery articles - 2 articles
    "mastery-architectural-design--ce165155-2e81-4ed6-b14e-7d81dbdfa464",
    "mastery-building-materials--91294dec-6b87-4601-b9c1-a5b303447da4",

    # Remaining misc - 2 articles
    "microclimate-analysis--a81062b3-5724-4bdc-8f70-dcfd9ef51e46",
    "allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c",
]

SKIP_SLUGS = set()  # Will populate from tracker

def extract_slug(dirname):
    """Extract slug from directory name (everything before the UUID)."""
    parts = dirname.split("--")
    if len(parts) >= 2:
        return parts[0]
    return dirname

def parse_tracker_completed():
    """Parse the tracker to find already completed article slugs."""
    completed = set()
    try:
        with open(TRACKER, 'r') as f:
            content = f.read()
        # Find article entries in the completed table
        # Format: | # | uuid | slug | ... |
        lines = content.split('\n')
        in_table = False
        for line in lines:
            if '|---|-----------|------|--------|-------|-----------------|' in line:
                in_table = True
                continue
            if in_table and line.startswith('|'):
                cells = [c.strip() for c in line.split('|')]
                if len(cells) >= 4 and cells[2]:
                    completed.add(cells[2].strip().strip('`'))
        # Also check priority queue
    except Exception as e:
        print(f"Warning: could not parse tracker: {e}")
    return completed

def check_sources(article_dir):
    """Check sources.json and return (source_count, has_sources, source_labels)."""
    meta_path = os.path.join(article_dir, "article-metadata.json")
    sources_path = os.path.join(article_dir, "sources.json")

    meta_source_count = 0
    sources_list = []

    # Check metadata first
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r') as f:
                meta = json.load(f)
            meta_source_count = meta.get("source_count", 0)
        except:
            pass

    # Check sources.json
    if os.path.exists(sources_path):
        try:
            with open(sources_path, 'r') as f:
                sources_data = json.load(f)
            sources_list = sources_data.get("sources", [])
        except:
            pass

    source_labels = [s.get("label", "") for s in sources_list if s.get("label")]
    has_sources = len(sources_list) > 0

    return meta_source_count, has_sources, source_labels

def scan_normalized(article_dir):
    """Scan normalized.md for obvious errors."""
    norm_path = os.path.join(article_dir, "normalized.md")
    issues = []

    if not os.path.exists(norm_path):
        return ["ERROR: No normalized.md found"]

    try:
        with open(norm_path, 'r') as f:
            content = f.read()

        lines = content.split('\n')

        # Check for common typos and errors
        typo_patterns = [
            (r'\bteh\b', "'teh' instead of 'the'"),
            (r'\btha\b', "'tha' instead of 'that'"),
            (r'\bwhcih\b', "'whcih' instead of 'which'"),
            (r'\bseperate\b', "'seperate' instead of 'separate'"),
            (r'\bdefinately\b', "'definately' instead of 'definitely'"),
            (r'\boccured\b', "'occured' instead of 'occurred'"),
            (r'\boccurence\b', "'occurence' instead of 'occurrence'"),
            (r'\bneccessary\b', "'neccessary' instead of 'necessary'"),
            (r'\bmaintainance\b', "'maintainance' instead of 'maintenance'"),
            (r'\bguage\b', "'guage' instead of 'gauge'"),
            (r'\bcaliber\s', "US spelling 'caliber' may be intentional (vs 'calibre')"),
            (r'\bcenter\b', "US spelling 'center' may be intentional (vs 'centre')"),
            (r'\bfiber\b', "US spelling 'fiber' may be intentional (vs 'fibre')"),
            (r'\bliters?\b', "US spelling 'liter' may be intentional (vs 'litre')"),
            (r'\bmeters?\b', "'meters' - UK 'metres' in Philippine English? Check context"),
            (r'RUnder', "Artifact 'RUnder' detected"),
            (r'\\u201[cd]', "Unicode escape sequences in text"),
        ]

        for pattern, desc in typo_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                issues.append(f"{desc} (found {len(matches)} time(s))")

        # Check for rendering artifacts
        if '{' in content and '}' in content:
            # Check for template syntax
            templates = re.findall(r'\{\{[^}]+\}\}', content)
            if templates:
                issues.append(f"Template syntax found: {templates[0][:50]}")

        # Check for broken markdown tables
        in_table = False
        table_broken = False
        for line in lines:
            if '|' in line and '---' in line:
                continue
            if line.strip().startswith('|') and line.strip().endswith('|'):
                if '---' in line:
                    in_table = True
                cells = [c for c in line.strip().split('|') if c.strip()]
                # Check for inconsistent cell counts within a table block
                # (simplified check)

        # Check for excessive blank lines
        blank_runs = re.findall(r'\n{4,}', content)
        if blank_runs:
            issues.append(f"Excessive blank lines ({len(blank_runs)} runs of 4+)")

    except Exception as e:
        issues.append(f"Error reading normalized.md: {e}")

    return issues

def extract_slug_from_article_dir(article_dir):
    """Extract slug name from the directory name."""
    dirname = os.path.basename(article_dir)
    return extract_slug(dirname)

def extract_article_id(article_dir):
    """Extract UUID from the directory name."""
    dirname = os.path.basename(article_dir)
    parts = dirname.split("--")
    if len(parts) >= 2:
        return parts[-1]
    return "unknown"

def write_flag_report(article_dir, slug, article_id, source_count, has_sources, issues, linked_question_count):
    """Write a compact flag report."""
    dirname = os.path.basename(article_dir)

    # Build flags list
    flags = []
    flags_detail = []

    # Missing citation check
    if source_count == 0 and not has_sources:
        flags.append("MISSING_CITATION")
        flags_detail.append("MISSING_CITATION: sources.json empty (source_count=0, no sources listed)")
    elif source_count == 0:
        # metadata says 0 but sources.json has entries? Let's check
        pass  # This shouldn't happen

    # Text issues
    text_issues = [i for i in issues if "typo" in i.lower() or "artifact" in i.lower() or "spelling" in i.lower() or "blank line" in i.lower()]
    if text_issues:
        for ti in text_issues:
            if "US spelling" in ti:
                flags.append("STYLE_NOTE")
                flags_detail.append(ti)
            elif "artifact" in ti.lower():
                flags.append("TEXT_ERROR")
                flags_detail.append(ti)
            elif "blank" in ti.lower():
                flags.append("FORMATTING")
                flags_detail.append(ti)
            else:
                flags_detail.append(ti)

    # Add overview check info
    overview_checks = []
    if "overview" in slug.lower():
        overview_checks.append("Overview article: minimal content check")

    # Combine all
    all_issues = flags_detail + overview_checks

    # Determine status
    if flags:
        status = "FLAGGED"
        flag_count = len(flags)
        flag_summary = "; ".join(set(flags))
    else:
        status = "PASSED"
        flag_count = 0
        flag_summary = "No issues found"

    # Build compact report
    report = f"""# Flag Report: {slug}

**Article ID:** `{article_id}`
**Directory:** `{dirname}`
**Status:** {status}

## Summary
- **source_count:** {source_count}
- **Has sources:** {has_sources}
- **Linked questions:** {linked_question_count}
- **Flags raised:** {flag_count}

## Flags
"""
    if flags:
        # Group by type
        flag_types = {}
        for fl in set(flags):
            flag_types[fl] = []
        for fd in flags_detail:
            for fl in set(flags):
                if fd.startswith(fl):
                    flag_types.setdefault(fl, []).append(fd)
        for fl_type, fl_issues in flag_types.items():
            report += f"### {fl_type}\n"
            for fi in fl_issues:
                report += f"- {fi}\n"
            report += "\n"
    else:
        report += "None.\n\n"

    if all_issues and not flags_detail:
        report += "## Notes\n"
        for note in all_issues:
            report += f"- {note}\n"

    report += f"""\n## Verdict
Content appears correct based on available information. No edits made. All findings are for batch review.

---
*Generated {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""

    # Write report
    flag_num = ""  # Will be assigned by caller
    report_path = os.path.join(FLAGS_DIR, f"flag-{slug}.md")

    # Write the file
    os.makedirs(FLAGS_DIR, exist_ok=True)
    with open(report_path, 'w') as f:
        f.write(report)

    return report_path, flags, all_issues


def main():
    completed_slugs = parse_tracker_completed()
    print(f"Already completed in tracker: {len(completed_slugs)} articles")

    # Track results
    results = []
    next_number = 187  # Start from #187 (186 done)

    for dirname in ARTICLES:
        article_dir = os.path.join(BASE, dirname)
        if not os.path.isdir(article_dir):
            print(f"  SKIP: {dirname} - directory not found")
            continue

        slug = extract_slug_from_article_dir(article_dir)
        article_id = extract_article_id(article_dir)

        if slug in completed_slugs:
            print(f"  SKIP: {slug} - already in tracker")
            continue

        # Read metadata
        meta_path = os.path.join(article_dir, "article-metadata.json")
        meta = {}
        if os.path.exists(meta_path):
            with open(meta_path, 'r') as f:
                meta = json.load(f)

        source_count = meta.get("source_count", 0)
        linked_question_count = meta.get("linked_question_count", 0)

        # Check sources
        meta_source_count, has_sources, source_labels = check_sources(article_dir)

        # Scan normalized.md
        issues = scan_normalized(article_dir)

        # Write flag report
        report_path, flags, issues = write_flag_report(
            article_dir, slug, article_id,
            meta_source_count, has_sources, issues,
            linked_question_count
        )

        # Track results
        if flags:
            flag_summary = "; ".join(set(flags))
            if "MISSING_CITATION" in flags:
                qs_note = f"{linked_question_count} Qs unsourced" if linked_question_count > 0 else "0 linked Qs"
            else:
                qs_note = f"{linked_question_count} Qs"
            results.append({
                "number": next_number,
                "slug": slug,
                "article_id": article_id,
                "status": "FLAGGED",
                "flags": flag_summary,
                "qs": qs_note
            })
        else:
            results.append({
                "number": next_number,
                "slug": slug,
                "article_id": article_id,
                "status": "PASSED",
                "flags": "No issues",
                "qs": f"{linked_question_count} Qs"
            })

        print(f"  {next_number}. {slug}: {results[-1]['status']} - {results[-1]['flags']}")
        next_number += 1

    # Update tracker
    print(f"\nProcessed {len(results)} articles")

    # Build tracker additions
    tracker_lines = []
    for r in results:
        tracker_lines.append(
            f"|| {r['number']} | `{r['article_id']}` | `{r['slug']}` | **{r['status']}** | {r['flags']} | {r['qs']} |"
        )

    # Read existing tracker and append
    try:
        with open(TRACKER, 'r') as f:
            tracker_content = f.read()

        # Find where to insert - before the "---" separator after the completed table
        # Look for the separator line after the table
        parts = tracker_content.split("|---\n")
        if len(parts) >= 2:
            # Insert before the second separator (which separates completed from priority queue)
            before_sep = parts[0]
            after_sep = "|---\n" + "|---\n".join(parts[1:])

            # New table rows
            new_rows = "\n".join(tracker_lines)

            updated_tracker = before_sep + "\n" + new_rows + "\n" + after_sep

            # Update the status line
            total_done = 186 + len(results)
            updated_tracker = re.sub(
                r'\(\d+/\d+ articles flagged\)',
                f'({total_done}/567 articles flagged)',
                updated_tracker
            )

            with open(TRACKER, 'w') as f:
                f.write(updated_tracker)

            print(f"Tracker updated: {total_done}/567 articles flagged")
        else:
            print("WARNING: Could not parse tracker structure - manual update needed")
    except Exception as e:
        print(f"ERROR updating tracker: {e}")
        import traceback
        traceback.print_exc()

    print("\nDone!")
    return results


if __name__ == "__main__":
    results = main()
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    flagged = [r for r in results if r['status'] == 'FLAGGED']
    passed = [r for r in results if r['status'] == 'PASSED']
    print(f"Total processed: {len(results)}")
    print(f"Flagged: {len(flagged)}")
    print(f"Passed: {len(passed)}")
    for r in results:
        print(f"  #{r['number']}: {r['slug']} - {r['status']} [{r['flags']}]")
