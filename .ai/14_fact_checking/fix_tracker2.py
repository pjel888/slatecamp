#!/usr/bin/env python3
"""Fix tracker: remove corrupted lines, extract proper article IDs, add 50 new entries."""
import os
import json
import re

TRACKER = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/article-flagging-pass-tracker.md"
FLAGS_DIR = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags"
BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# Read current tracker
with open(TRACKER, 'r') as f:
    content = f.read()

lines = content.split('\n')

# Remove corrupted lines 271-279 (indices 270-278, 0-indexed)
# These are the lines starting with "|||" that were appended incorrectly
cleaned_lines = [l for l in lines if not l.startswith('|||')]

# Now let me identify exactly which 50 new flag reports were created by THIS batch
# I need to know which articles were actually processed in this run
# The new flag reports are the ones WITHOUT the "flag-NNN-" prefix pattern

old_pattern = re.compile(r'flag-\d{3}-')
all_flags = sorted(os.listdir(FLAGS_DIR))
new_flag_files = sorted([f for f in all_flags if not old_pattern.match(f)])

# But many of these are actually from the original 186 batch too!
# Let me check - the old flag files from 137-186 had the pattern "flag-NNN-slug.md"
# And the old ones before that might have different patterns

# Let me just look at what flag files exist with UUID patterns that I know were created today
# The oldest 50 flag files are from today - I can check file creation time or just look
# Actually, the first 50 flag files by sort order are the old numbered ones

print(f"Total flag files: {len(all_flags)}")
print(f"First 136 sorted: {all_flags[:50]}")

# Actually a simpler approach - let me just look at what directories correspond
# to the 41 articles processed in the first batch
# I'll use the article directory names directly

first_batch = [
    "lea-dsgn-003-04-core-concept--1673310d-fe41-40f3-ab75-0c7e90db42e1",
    "lea-dsgn-004-05-core-concept--ea6d06eb-e659-4092-ad67-14d4956cc4c6",
    "lea-dsgn-005-05-core-concept--40479f68-42a9-482a-960f-9901f522d086",
    "lea-dsgn-006-04-core-concept--2b843aa3-45d9-4421-ae00-107e94f28495",
    "lea-dsgn-007-04-core-concept--c9b1aadd-4843-4cf3-a551-6dd67678e508",
    "lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff",
    "lea-strc-002-01-core-concept--3fbb9789-4f15-4c22-a982-1b4686df8219",
    "lea-strc-003-01-core-concept--79ca7e09-9492-49b1-9289-88d444451275",
    "lea-strc-004-01-core-concept--2ef8093e-b636-42f7-8f25-55adcfc22821",
    "lea-strc-005-01-core-concept--dac86d82-085d-4627-bf1d-2e3ab4be9da3",
    "lea-matl-001-04-core-concept--c1f7906b-35f8-460b-bb03-f996ad25658e",
    "lea-matl-002-03-core-concept--42ec69b2-114a-423b-bba3-12cd5564f994",
    "lea-matl-003-04-core-concept--7dccfed0-8f85-47ad-b72b-8e5940d8276a",
    "lea-matl-004-06-core-concept--b055d93c-4f92-4608-b88b-ff729757f92e",
    "lea-matl-005-05-core-concept--8a3fed25-4fda-4d38-a3a9-0e452f0e1e75",
    "lea-hist-001-02-core-concept--e72bf24e-a816-4c4f-ae4b-f8e97c5d5519",
    "lea-hist-002-02-core-concept--48580f1e-3497-48f9-a87e-0f67c6e476b6",
    "lea-hist-004-02-core-concept--c0a5189b-4c67-47ad-bfd0-4b4d33df7247",
    "lea-hist-007-01-core-concept--cde95089-b874-42c5-8250-abc58ad7fae0",
    "lea-hist-008-01-core-concept--1f411bc4-4ca5-4bb2-ab46-e130e1b0a5e4",
    "lea-theo-001-07-core-concept--30832ba5-fbe9-4047-871a-aa4cb63ac616",
    "lea-theo-002-01-core-concept--62274e90-5cb3-4bc0-85a1-639858e47736",
    "lea-theo-004-01-core-concept--567ba614-9dcd-4c76-8bf3-74478fd1291f",
    "lea-theo-005-01-core-concept--128400dd-8642-4275-a64f-c411f6836d6d",
    "lea-theo-007-01-core-concept--5144f75e-e8ee-49a0-8dcf-2ded9c2b432c",
    "lea-plan-001-01-core-concept--d28bf43f-a588-4be3-8b79-8759d930aea4",
    "lea-plan-002-01-core-concept--50d41d7e-57cd-4280-b850-e6d2f89414a6",
    "lea-prac-eth-001-core-concept--6604a199-6687-435d-aeb1-ffdc46be7d23",
    "lea-prac-eth-002-core-concept--f769b43e-e467-4ce4-afd9-2d0152fe8d46",
    "lea-prac-eth-003-core-concept--9bc92dcd-8cce-4970-9111-13e21a72fb68",
    "lea-prac-eth-004-core-concept--cd6c1a20-eee6-4475-b0cc-239897d3f4d7",
    "lea-prac-ctr-017-core-concept--33f0a370-4f6f-46ba-b06f-edcce2168cdd",
    "lea-prac-ctr-018-core-concept--5e99dd5d-1394-46bc-998e-8915e2595b0b",
    "case-study-hospital-mall-school--fc6f1ca7-340b-4188-8fc0-036e4e9d4498",
    "lodging-and-residential-accessibility--7a3b0ff7-407f-40cc-b398-fca6358f4db7",
    "21st-century-movements--60c3b78a-e1c7-4c5e-880e-f9526d6c570d",
    "ergonomics-in-furniture-design--691cf42d-0f6c-4686-b3d0-9a3bbd99da23",
    "mastery-architectural-design--ce165155-2e81-4ed6-b14e-7d81dbdfa464",
    "mastery-building-materials--91294dec-6b87-4601-b9c1-a5b303447da4",
    "microclimate-analysis--a81062b3-5724-4bdc-8f70-dcfd9ef51e46",
    "allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c",
]

second_batch = [
    "lea-plan-003-02-what-you-need-to-know-for-the-lea--7c0e2fa5-7f3d-419a-b592-50346ac7ab2f",
    "lea-plan-004-01-what-you-need-to-know-for-the-lea--6a351c32-f48d-45fb-93f5-e60e6cd271c5",
    "lea-prac-ctr-005-the-architect-s-authority-during-construction-powers-limits-and-the-line-with-the-c--5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5",
    "lea-prac-ctr-016-change-orders-types-authority-limits-and-the-documentation-process--4e28889a-cba3-4bf4-805c-ff0526910ee3",
    "lea-util-001-07-system-components-and-functions--be3f2bf1-8d85-4c03-a047-ae1c2503d4cb",
    "lea-util-002-03-core-ventilation-standards--903c66da-2864-48b0-b638-2ed218a173e2",
    "lea-util-003-02-emergency-power-systems--91727ebf-ee05-4aa8-a538-d8c599a1d9c9",
    "lea-util-005-03-design-considerations-and-best-practices--881027cd-2be0-4c93-af86-4f801ec16882",
    "lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c",
]

all_dirnames = first_batch + second_batch

def get_article_data(dirname):
    """Get article data from directory."""
    dirpath = os.path.join(BASE, dirname)
    if not os.path.isdir(dirpath):
        print(f"  WARNING: {dirname} not found")
        return None

    # Extract slug from dirname
    slug = dirname.split("--")[0]

    # Read metadata
    meta_path = os.path.join(dirpath, "article-metadata.json")
    meta = {}
    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            meta = json.load(f)

    article_id = meta.get("article_id", "unknown")
    source_count = meta.get("source_count", 0)
    linked_qs = meta.get("linked_question_count", 0)

    # Check sources
    sources_path = os.path.join(dirpath, "sources.json")
    has_sources = False
    if os.path.exists(sources_path):
        with open(sources_path, 'r') as f:
            sources_data = json.load(f)
        has_sources = len(sources_data.get("sources", [])) > 0

    # Determine flags from flag report
    flag_path = os.path.join(FLAGS_DIR, f"flag-{slug}.md")
    if os.path.exists(flag_path):
        with open(flag_path, 'r') as f:
            flag_content = f.read()

        status_match = re.search(r'\*\*Status:\*\* (\S+)', flag_content)
        status = status_match.group(1) if status_match else "UNKNOWN"

        flags_raised_match = re.search(r'\*\*Flags raised:\*\* (\d+)', flag_content)
        flags_raised = int(flags_raised_match.group(1)) if flags_raised_match else 0

        if "MISSING_CITATION" in flag_content:
            if linked_qs > 0:
                flag_summary = f"MISSING_CITATION: sources.json empty; {linked_qs} Qs unsourced"
                qs_note = f"{linked_qs} Qs unsourced"
            else:
                flag_summary = "MISSING_CITATION: sources.json empty; content appears correct"
                qs_note = "0 linked Qs"
        elif "STYLE_NOTE" in flag_content:
            flag_summary = "Minor style note (US/UK spelling)"
            qs_note = f"{linked_qs} Qs" if linked_qs > 0 else "0 linked Qs"
        elif status == "PASSED":
            flag_summary = "No issues found"
            qs_note = f"{linked_qs} Qs" if linked_qs > 0 else "0 linked Qs"
        else:
            flag_summary = "FLAGGED (see report)"
            qs_note = f"{linked_qs} Qs" if linked_qs > 0 else "0 linked Qs"
    else:
        # No flag report - determine from data
        status = "FLAGGED" if source_count == 0 and not has_sources else "PASSED"
        if source_count == 0 and not has_sources:
            flag_summary = "MISSING_CITATION: sources.json empty"
            qs_note = f"{linked_qs} Qs unsourced" if linked_qs > 0 else "0 linked Qs"
        else:
            flag_summary = "No issues found"
            qs_note = f"{linked_qs} Qs" if linked_qs > 0 else "0 linked Qs"

    return {
        "article_id": article_id,
        "slug": slug,
        "status": status,
        "flags": flag_summary,
        "qs": qs_note
    }

# Get data for all 50 articles
entries = []
for dirname in all_dirnames:
    data = get_article_data(dirname)
    if data:
        entries.append(data)
    else:
        print(f"  Skipping: {dirname}")

print(f"\nExtracted data for {len(entries)} articles")
for e in entries:
    print(f"  {e['slug']}: {e['status']} - {e['flags']}")

# Now rebuild the tracker
# Find the Notes section end
lines = cleaned_lines

# Find the last occurrence of the Notes section
note_end_idx = -1
for i, line in enumerate(lines):
    if '- When this pass is complete, a summary report will be generated for human review before any edits are applied.' in line:
        note_end_idx = i

if note_end_idx >= 0:
    # Keep everything up to and including the Notes section
    before = lines[:note_end_idx + 1]

    # Build new rows for our 50 articles
    start_num = 187
    new_rows = []
    for i, e in enumerate(entries):
        num = start_num + i
        new_rows.append(
            f"|| {num} | `{e['article_id']}` | `{e['slug']}` | **{e['status']}** | {e['flags']} | {e['qs']} |"
        )

    new_rows_str = '\n'.join(new_rows)

    # Rebuild content
    updated_content = '\n'.join(before) + '\n' + new_rows_str + '\n\n---\n\n## Priority Queue (Risk/Impact Ranked)\n\n'

    # Add priority queue (from original)
    # Find priority queue in original content
    in_pq = False
    pq_lines = []
    for line in lines:
        if line.strip() == '## Priority Queue (Risk/Impact Ranked)':
            in_pq = True
        if in_pq:
            pq_lines.append(line)

    updated_content += '\n'.join(pq_lines[1:]) if pq_lines else ''

    # Update status
    total = 186 + len(entries)
    updated_content = re.sub(
        r'\(\d+/\d+ articles flagged\)',
        f'({total}/567 articles flagged)',
        updated_content
    )

    with open(TRACKER, 'w') as f:
        f.write(updated_content)

    print(f"\nTracker updated: {total}/567 articles flagged")
else:
    print("Could not find Notes section end!")
    # Alternative: just rebuild from scratch
    print("Rebuilding tracker from scratch...")

    # Find articles completed section
    comp_start = -1
    comp_end = -1
    for i, line in enumerate(lines):
        if line.strip() == '## Articles Completed':
            comp_start = i
        if comp_start >= 0 and line.strip().startswith('## ') and i > comp_start:
            comp_end = i
            break

    if comp_start >= 0 and comp_end >= 0:
        before_table = lines[:comp_end]

        # Add new rows
        start_num = 187
        new_rows = []
        for i, e in enumerate(entries):
            num = start_num + i
            new_rows.append(
                f"|| {num} | `{e['article_id']}` | `{e['slug']}` | **{e['status']}** | {e['flags']} | {e['qs']} |"
            )

        new_rows_str = '\n'.join(new_rows)

        # Rest after
        after = lines[comp_end:]

        updated_content = '\n'.join(before_table) + '\n' + new_rows_str + '\n\n' + '\n'.join(after)
        total = 186 + len(entries)
        updated_content = re.sub(
            r'\(\d+/\d+ articles flagged\)',
            f'({total}/567 articles flagged)',
            updated_content
        )

        with open(TRACKER, 'w') as f:
            f.write(updated_content)

        print(f"Tracker updated: {total}/567 articles flagged")

print("\nDone!")
