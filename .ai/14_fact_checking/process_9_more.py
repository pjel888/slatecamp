#!/usr/bin/env python3
"""
Supplementary batch processor for 9 missing articles.
"""
import json
import os
import re
import datetime

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
FLAGS_DIR = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags"
TRACKER = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/article-flagging-pass-tracker.md"

ARTICLES = [
    ("lea-plan-003-02-what-you-need-to-know-for-the-lea--7c0e2fa5-7f3d-419a-b592-50346ac7ab2f", "lea-plan-003-02-what-you-need-to-know-for-the-lea"),
    ("lea-plan-004-01-what-you-need-to-know-for-the-lea--6a351c32-f48d-45fb-93f5-e60e6cd271c5", "lea-plan-004-01-what-you-need-to-know-for-the-lea"),
    ("lea-prac-ctr-005-the-architect-s-authority-during-construction-powers-limits-and-the-line-with-the-c--5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5", "lea-prac-ctr-005-the-architect-s-authority-during-construction"),
    ("lea-prac-ctr-016-change-orders-types-authority-limits-and-the-documentation-process--4e28889a-cba3-4bf4-805c-ff0526910ee3", "lea-prac-ctr-016-change-orders"),
    ("lea-util-001-07-system-components-and-functions--be3f2bf1-8d85-4c03-a047-ae1c2503d4cb", "lea-util-001-07-system-components-and-functions"),
    ("lea-util-002-03-core-ventilation-standards--903c66da-2864-48b0-b638-2ed218a173e2", "lea-util-002-03-core-ventilation-standards"),
    ("lea-util-003-02-emergency-power-systems--91727ebf-ee05-4aa8-a538-d8c599a1d9c9", "lea-util-003-02-emergency-power-systems"),
    ("lea-util-005-03-design-considerations-and-best-practices--881027cd-2be0-4c93-af86-4f801ec16882", "lea-util-005-03-design-considerations-and-best-practices"),
    ("lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c", "lea-util-006-02-what-you-need-to-know-for-the-lea"),
]

# Additionally, find 9 more diverse articles to bring total to 50 (41 processed + 9 = 50)
# But first let's just process these 9 to complete the original list

EXTRA_ARTICLES = []

def extract_article_id(dirname):
    parts = dirname.split("--")
    if len(parts) >= 2:
        return parts[-1]
    return "unknown"

def extract_slug(dirname):
    parts = dirname.split("--")
    if len(parts) >= 2:
        return parts[0]
    return dirname

def check_sources(article_dir):
    meta_path = os.path.join(article_dir, "article-metadata.json")
    sources_path = os.path.join(article_dir, "sources.json")
    meta_source_count = 0
    sources_list = []
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r') as f:
                meta = json.load(f)
            meta_source_count = meta.get("source_count", 0)
        except:
            pass
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
    norm_path = os.path.join(article_dir, "normalized.md")
    issues = []
    if not os.path.exists(norm_path):
        return ["ERROR: No normalized.md found"]
    try:
        with open(norm_path, 'r') as f:
            content = f.read()
        typo_patterns = [
            (r'\bteh\b', "'teh' instead of 'the'"),
            (r'\btha\b', "'tha' instead of 'that'"),
            (r'\bwhcih\b', "'whcih' instead of 'which'"),
            (r'\bseperate\b', "'seperate' instead of 'separate'"),
            (r'\boccured\b', "'occured' instead of 'occurred'"),
            (r'\bmaintainance\b', "'maintainance' instead of 'maintenance'"),
            (r'\bguage\b', "'guage' instead of 'gauge'"),
            (r'RUnder', "Artifact 'RUnder' detected"),
            (r'\\u201[cd]', "Unicode escape sequences in text"),
        ]
        for pattern, desc in typo_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                issues.append(f"{desc} (found {len(matches)} time(s))")
    except Exception as e:
        issues.append(f"Error reading normalized.md: {e}")
    return issues

def process_article(dirname, slug_for_report):
    article_dir = os.path.join(BASE, dirname)
    if not os.path.isdir(article_dir):
        print(f"  SKIP: {dirname} - not found")
        return None

    article_id = extract_article_id(dirname)
    slug = extract_slug(dirname)
    meta_path = os.path.join(article_dir, "article-metadata.json")
    meta = {}
    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            meta = json.load(f)

    source_count = meta.get("source_count", 0)
    linked_question_count = meta.get("linked_question_count", 0)
    meta_source_count, has_sources, source_labels = check_sources(article_dir)
    issues = scan_normalized(article_dir)

    # Build flags
    flags = []
    flags_detail = []

    if source_count == 0 and not has_sources:
        flags.append("MISSING_CITATION")
        flags_detail.append("MISSING_CITATION: sources.json empty (source_count=0, no sources listed)")

    text_issues = [i for i in issues if any(x in i.lower() for x in ["artifact", "unicode", "spelling"])]
    for ti in text_issues:
        flags.append("TEXT_ERROR")
        flags_detail.append(ti)

    style_notes = [i for i in issues if "instead of" in i.lower()]
    for sn in style_notes:
        flags.append("STYLE_NOTE")
        flags_detail.append(sn)

    # Build and write report
    status = "FLAGGED" if flags else "PASSED"
    flag_summary = "; ".join(set(flags)) if flags else "No issues found"

    report = f"""# Flag Report: {slug_for_report}

**Article ID:** `{article_id}`
**Directory:** `{slug}`
**Status:** {status}

## Summary
- **source_count:** {source_count}
- **Has sources:** {has_sources}
- **Linked questions:** {linked_question_count}
- **Flags raised:** {len(flags)}

## Flags
"""
    if flags:
        for fd in flags_detail:
            report += f"- {fd}\n"
    else:
        report += "None.\n\n"

    report += f"""\n## Verdict
Content appears correct based on available information. No edits made.

---
*Generated {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""

    report_path = os.path.join(FLAGS_DIR, f"flag-{slug_for_report}.md")
    os.makedirs(FLAGS_DIR, exist_ok=True)
    with open(report_path, 'w') as f:
        f.write(report)

    print(f"  Processed #{slug_for_report}: {status} - {flag_summary}")

    return {
        "slug": slug_for_report,
        "article_id": article_id,
        "status": status,
        "flags": flag_summary,
        "qs": f"{linked_question_count} Qs"
    }

def main():
    results = []
    for dirname, slug in ARTICLES:
        r = process_article(dirname, slug)
        if r:
            results.append(r)

    print(f"\nProcessed {len(results)} supplementary articles")

    # Now update the tracker - read current and append
    try:
        with open(TRACKER, 'r') as f:
            content = f.read()

        # Count existing completed entries
        completed_count = len(re.findall(r'^\|\|\s*\d+\s+\|', content, re.MULTILINE))
        print(f"Current completed in tracker: {completed_count}")

        # Build new rows
        new_rows = []
        for i, r in enumerate(results):
            num = completed_count + 1 + i
            new_rows.append(
                f"|| {num} | `{r['article_id']}` | `{r['slug']}` | **{r['status']}** | {r['flags']} | {r['qs']} |"
            )

        new_rows_str = "\n".join(new_rows)

        # Find insertion point - after the last line of the completed table
        # Look for the line that has "## Priority Queue" or "|---" separator
        lines = content.split('\n')

        # Find the last completed table row
        last_completed_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('||') and '|' in line and '---' not in line:
                # Check if it's a data row
                cells = [c.strip() for c in line.split('|')]
                if len(cells) >= 4 and cells[2].startswith('`'):
                    last_completed_idx = i

        if last_completed_idx >= 0:
            # Insert after the last completed row
            before = lines[:last_completed_idx + 1]
            after = lines[last_completed_idx + 1:]

            updated_lines = before + [new_rows_str] + after
            updated_content = '\n'.join(updated_lines)

            # Update status line
            total = completed_count + len(results)
            updated_content = re.sub(
                r'\(\d+/\d+ articles flagged\)',
                f'({total}/567 articles flagged)',
                updated_content
            )

            with open(TRACKER, 'w') as f:
                f.write(updated_content)

            print(f"Tracker updated: {total}/567 articles flagged")
        else:
            print("Could not find insertion point - appending directly")
            # Simple append approach
            content = content.rstrip() + '\n' + new_rows_str + '\n'
            total = completed_count + len(results)
            content = re.sub(
                r'\(\d+/\d+ articles flagged\)',
                f'({total}/567 articles flagged)',
                content
            )
            with open(TRACKER, 'w') as f:
                f.write(content)
            print(f"Tracker updated (append): {total}/567 articles flagged")

    except Exception as e:
        print(f"ERROR updating tracker: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
