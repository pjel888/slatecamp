#!/bin/bash
# Batch process remaining 101 articles for content audit flagging
# Usage: bash .ai/14_fact_checking/batch_process_remaining.sh

ARTICLES_DIR="/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
FLAGS_DIR="/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags"
mkdir -p "$FLAGS_DIR"

RESULTS_FILE="/tmp/batch_results.txt"
> "$RESULTS_FILE"

total=0
flagged=0
passed=0

while read -r uuid slug rest; do
  if [ -z "$uuid" ]; then continue; fi
  total=$((total + 1))

  folder=$(ls -d "$ARTICLES_DIR/"*--"$uuid" 2>/dev/null | head -1)
  if [ -z "$folder" ]; then
    echo "$uuid|$slug|ERROR|No folder found|0" >> "$RESULTS_FILE"
    continue
  fi

  # Read metadata for topic
  topic=""
  if [ -f "$folder/article-metadata.json" ]; then
    topic=$(python3 -c "import json; d=json.load(open('$folder/article-metadata.json')); print(d.get('topic','').get('label','') or d.get('topic','') or '')" 2>/dev/null)
  fi

  # Get linked questions count
  q_count=0
  if [ -f "$folder/linked-questions.json" ]; then
    q_count=$(python3 -c "import json; d=json.load(open('$folder/linked-questions.json')); print(len(d.get('linked_questions',d.get('questions',[]))))" 2>/dev/null || echo 0)
  fi

  # Check sources.json
  sources_empty=false
  if [ ! -f "$folder/sources.json" ]; then
    sources_empty=true
  else
    sz=$(wc -c < "$folder/sources.json")
    if [ "$sz" -le 4 ]; then
      sources_empty=true
    else
      src_count=$(python3 -c "import json; d=json.load(open('$folder/sources.json')); print(len(d.get('sources',[])))" 2>/dev/null)
      if [ "$src_count" = "0" ]; then
        sources_empty=true
      fi
    fi
  fi

  # Scan normalized.md for typos
  issues=""
  nmd="$folder/normalized.md"

  if [ "$sources_empty" = true ]; then
    issues="MISSING_CITATION"
  fi

  if [ -f "$nmd" ]; then
    # Check for common typos
    if grep -q '\bsclea\b' "$nmd" 2>/dev/null; then
      count=$(grep -c '\bsclea\b' "$nmd" 2>/dev/null || echo 1)
      issues="$issues|SCLEA_TYPO(x$count)"
    fi
    if grep -q 'equivleant' "$nmd" 2>/dev/null; then
      count=$(grep -c 'equivleant' "$nmd" 2>/dev/null || echo 1)
      issues="$issues|EQUIVLEANT_TYPO(x$count)"
    fi
    if grep -q 'rationlea' "$nmd" 2>/dev/null; then
      issues="$issues|RATIONLEA_TYPO"
    fi
    if grep -q 'large-sclea' "$nmd" 2>/dev/null; then
      issues="$issues|LARGE_SCLEA_TYPO"
    fi
    if grep -q 'RUnder' "$nmd" 2>/dev/null; then
      issues="$issues|RUNDER_ARTIFACT"
    fi
  fi

  if [ -n "$issues" ]; then
    flagged=$((flagged + 1))
    # Write flag file
    flag_file="$FLAGS_DIR/${uuid}.md"
    slug_short=$(echo "$slug" | cut -c1-60)
    {
      echo "# Flag Report: $slug_short"
      echo "**UUID:** $uuid"
      echo "**Status:** FLAGGED"
      echo "**Topic:** $topic"
      echo "**Linked Questions:** $q_count"
      echo ""
      echo "## Issues Found"
      echo ""
      IFS='|' read -ra ISSUE_LIST <<< "$issues"
      for issue in "${ISSUE_LIST[@]}"; do
        if [ -n "$issue" ]; then
          echo "- $issue"
        fi
      done
      echo ""
      echo "---"
      echo "*Auto-generated during content audit flagging pass — batch 101*"
    } > "$flag_file"

    echo "$uuid|\`$slug\`|**FLAGGED**|$issues|$q_count Qs" >> "$RESULTS_FILE"
  else
    passed=$((passed + 1))
    echo "$uuid|\`$slug\`|**PASSED**|No issues found|$q_count Qs" >> "$RESULTS_FILE"
  fi

  # Progress
  if [ $((total % 10)) -eq 0 ]; then
    echo "Progress: $total/101 processed ($flagged flagged, $passed passed)"
  fi

done < /tmp/remaining_with_slugs.txt

echo ""
echo "=== FINAL SUMMARY ==="
echo "Total processed: $total"
echo "Flagged: $flagged"
echo "Passed: $passed"
echo "Results saved to: /tmp/batch_results.txt"
