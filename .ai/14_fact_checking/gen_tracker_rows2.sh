#!/bin/bash
# Generate tracker rows for articles 467-567
# Reads /tmp/batch_results.txt

counter=467
while IFS='|' read -r uuid slug status issues qs; do
  if [ -z "$uuid" ]; then continue; fi

  # Clean slug
  slug_clean=$(echo "$slug" | sed 's/^`//;s/`$//' | cut -c1-70)

  # Format issues
  if [ "$status" = "**PASSED**" ]; then
    desc="No issues found"
  else
    desc=$(echo "$issues" | sed 's/^|//;s/|$//;s/|/, /g')
    # Clean up double pipe artifacts
    desc=$(echo "$desc" | sed 's/^, //')
  fi

  # Get linked questions count
  qs_count=$(echo "$qs" | grep -oE '^[0-9]+')
  if [ -z "$qs_count" ]; then qs_count="0"; fi

  echo "|||| $counter | \`$uuid\` | \`$slug_clean\` | **$status** | $desc | $qs_count Qs |"

  counter=$((counter + 1))
done < /tmp/batch_results.txt