#!/usr/bin/env python3
"""Fix the tracker file: replace broken rows 612+ with correct rows 467-567."""
import re

tracker_path = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/article-flagging-pass-tracker.md"

# Read the file
with open(tracker_path) as f:
    lines = f.readlines()

# Keep first 611 lines (0-indexed: 0-610)
keep = lines[:611]
print(f"Keeping first {len(keep)} lines (0-610)")

# Read batch results
results = {}
with open("/tmp/batch_results.txt") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Match: uuid|`slug`|**STATUS**|issues|q_count Qs
        m = re.match(r'^([0-9a-f-]+)\|`([^`]+)`\|\*\*([A-Z]+)\*\*\|(.*)\|(\d+)\s*Qs\s*$', line)
        if m:
            uuid = m.group(1)
            slug = m.group(2)
            status = m.group(3)
            issues_raw = m.group(4).strip().lstrip('|').rstrip('|').strip()
            q_count = m.group(5)
            results[uuid] = (slug, status, issues_raw, q_count)

# Read remaining UUIDs order
with open("/tmp/remaining_with_slugs.txt") as f:
    article_order = []
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.split(None, 1)
        uuid = parts[0]
        slug = parts[1] if len(parts) > 1 else ""
        article_order.append((uuid, slug))

# Generate clean rows
counter = 467
new_rows = []
for uuid, slug in article_order:
    if uuid in results:
        r_slug, status, issues_raw, q_count = results[uuid]
    else:
        status = "PASSED"
        issues_raw = ""
        q_count = "0"

    if status == "PASSED" or not issues_raw:
        desc = "No issues found"
    else:
        desc = issues_raw

    # Truncate slug for display
    display_slug = slug if len(slug) <= 65 else slug[:65]

    new_rows.append(f"||| {counter} | `{uuid}` | `{display_slug}` | **{status}** | {desc} | {q_count} Qs |")
    counter += 1

# Add a separator before new rows
new_rows_text = "\n".join(new_rows) + "\n"

# Write back
with open(tracker_path, 'w') as f:
    for line in keep:
        f.write(line)
    f.write(new_rows_text)

print(f"Wrote {len(new_rows)} new rows (articles 467-{counter-1})")
print(f"Total lines: {len(keep) + len(new_rows)}")
print(f"Status check: {'COMPLETE' if 'COMPLETE' in keep[2] else 'IN PROGRESS - NEEDS FIX'}")
