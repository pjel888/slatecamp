#!/usr/bin/env python3
"""Generate tracker rows for articles 467-567 with proper formatting."""
import json
import os
import re

art_dir = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
flags_dir = "/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags"

# Read the remaining UUIDs
with open("/tmp/remaining_with_slugs.txt") as f:
    articles = []
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.split(None, 1)
        uuid = parts[0]
        slug = parts[1] if len(parts) > 1 else ""
        articles.append((uuid, slug))

# Read the batch results info
results = {}
with open("/tmp/batch_results.txt") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Parse: uuid|`slug`|**STATUS**|issues|Qs
        # Use regex since | is a delimiter
        match = re.match(r'^([0-9a-f-]+)\|`([^`]+)`\|\*\*([A-Z]+)\*\*\|(.*)\|(\d+)\s*Qs\s*\|?$', line)
        if match:
            uuid = match.group(1)
            status = match.group(3)
            issues_raw = match.group(4)
            q_count = match.group(5)
            results[uuid] = (status, issues_raw, q_count)
        else:
            # Try alternative parse - maybe issues has pipes
            parts = line.split('|')
            if len(parts) >= 5:
                uuid = parts[0]
                status_match = re.search(r'\*\*([A-Z]+)\*\*', line)
                status = status_match.group(1) if status_match else "FLAGGED"
                qs_match = re.search(r'(\d+)\s*Qs', line)
                q_count = qs_match.group(1) if qs_match else "0"

                # Reconstruct issues from line
                # Remove uuid part and slug and status
                remaining = re.sub(r'^[0-9a-f-]+\|`[^`]+`\|\*\*[A-Z]+\*\*\|', '', line)
                # Remove trailing Qs count
                remaining = re.sub(r'\|?\d+\s*Qs\s*$', '', remaining)
                # Remove trailing |
                remaining = remaining.strip().rstrip('|').lstrip('|')
                results[uuid] = (status, remaining, q_count)

counter = 467
output_rows = []

for uuid, slug in articles:
    if uuid in results:
        status, issues_raw, q_count = results[uuid]
    else:
        status = "PASSED"
        issues_raw = ""
        q_count = "0"

    # Clean issues
    if status == "PASSED" or not issues_raw:
        desc = "No issues found"
    else:
        # Clean up the issues string
        desc = issues_raw.strip().lstrip('|').rstrip('|')

    # Truncate slug for display
    if len(slug) > 65:
        slug = slug[:65]

    output_rows.append(f"|||| {counter} | `{uuid}` | `{slug}` | **{status}** | {desc} | {q_count} Qs |")
    counter += 1

for row in output_rows:
    print(row)

# Also print summary
print(f"\n# SUMMARY: {len(output_rows)} rows generated (articles 467-{counter-1})")
passed = sum(1 for r in results.values() if r[0] == "PASSED")
flagged = sum(1 for r in results.values() if r[0] == "FLAGGED")
print(f"Passed: {passed}, Flagged: {flagged}")
