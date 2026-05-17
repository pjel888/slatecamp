#!/bin/bash
# Generate tracker rows for remaining 101 articles
# Reads /tmp/batch_results.txt and outputs formatted tracker rows

counter=367
while IFS='|' read -r uuid slug status issues qs; do
  if [ -z "$uuid" ]; then continue; fi

  # Format the issues description
  if [ "$status" = "**PASSED**" ]; then
    desc="No issues found"
  else
    # Clean up the issues format
    desc=$(echo "$issues" | sed 's/|/, /g' | sed 's/^, //')
  fi

  # Format slug for display (clean up)
  slug_display=$(echo "$slug" | sed 's/^`//;s/`$//')

  printf "|| %d | \`%s\` | \`%s\` | **%s** | %s | %s |\n" "$counter" "$uuid" "$slug_display" "$status" "$desc" "$qs"

  counter=$((counter + 1))
done < /tmp/batch_results.txt