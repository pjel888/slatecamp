#!/bin/bash
# Generate tracker rows for articles 467-567 - Fixed formatting
# Reads /tmp/batch_results.txt

counter=467
while IFS='|' read -r uuid slug status issues qs; do
  if [ -z "$uuid" ]; then continue; fi

  # Clean slug - truncate if too long
  slug_clean=$(echo "$slug" | sed 's/^`//;s/`$//')

  # Get plain status (strip existing ** markers)
  plain_status=$(echo "$status" | sed 's/\*\*//g')

  # Get linked questions count
  qs_count=$(echo "$qs" | grep -oE '^[0-9]+')
  if [ -z "$qs_count" ]; then qs_count="0"; fi

  # Format the issues description - handle pipe-separated issue list
  desc=""
  if [ "$plain_status" = "PASSED" ]; then
    desc="No issues found"
  else
    # Get the issues part (everything after status, before qs)
    issues_part=$(echo "$issues" | sed 's/^|//;s/|$//;s/|/, /g')
    # Also handle empty issues_part from when issues starts with |
    if [ -z "$issues_part" ]; then
      # Try to parse differently - the issues might be piped
      issues_part="$issues"
    fi
    desc="$issues_part"
  fi

  echo "|||| $counter | \`$uuid\` | \`$slug_clean\` | **$plain_status** | $desc | $qs_count Qs |"

  counter=$((counter + 1))
done < /tmp/batch_results.txt