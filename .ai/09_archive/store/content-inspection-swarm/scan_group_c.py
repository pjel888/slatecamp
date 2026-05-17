#!/usr/bin/env python3
"""Scan Group C articles for content errors in candidate.md files."""

import json
import re
import os
import sys

# Paths
ARTICLES_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-C-articles.json"
EXPORT_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
OUTPUT_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-C-findings.json"

# Load article list
with open(ARTICLES_JSON, "r") as f:
    articles = json.load(f)

print(f"Loaded {len(articles)} articles")

findings = []
scanned = 0
issues_count = 0

# Known component prop names from ArticleMedia.tsx
ARTICLE_MEDIA_PROPS = {
    "id", "layout", "variant", "aspectRatio", "title", "description",
    "placementIntent", "type", "status", "src", "youtubeId", "embedUrl",
    "alt", "caption", "credit", "sourceUrl", "suggestedAsset", "carouselCount"
}

# Known paired component tags (open/close tags)
PAIRED_TAGS = [
    "Note", "Warn", "ExamTip", "Tip", "Example", "KeyValues",
    "Callout", "ArticleMedia", "WikiMistakeCard", "MermaidDiagram",
    "QuizQuestion", "Step", "Steps", "Accordion", "Tab", "Tabs"
]

# Self-closing tags
SELF_CLOSING_TAGS = [
    "ArticleMedia", "KeyValues", "WikiMistakeCard", "Callout"
]

# For tracking open/close tag pairs per file
def check_malformed_mdx(content, lines):
    """Check for malformed MDX tags."""
    issues = []
    
    # Pattern 1: Self-closing tags without proper closing slash: <Tag ...> instead of <Tag ... />
    # We specifically look at known self-closing components
    for tag in SELF_CLOSING_TAGS:
        # Find opening tags
        pattern_start = re.compile(rf'<{tag}\b', re.IGNORECASE)
        for m in pattern_start.finditer(content):
            pos = m.start()
            # Find the closing > of this tag
            close_pos = content.find('>', pos)
            if close_pos == -1:
                continue
            tag_content = content[pos:close_pos+1]
            # If it's self-closing, it should end with />
            if not tag_content.rstrip().endswith('/>'):
                # But check it's not a paired version (very unlikely but be safe)
                if not re.match(rf'<{tag}\b[^>]*>[^<]*</{tag}>', content[pos:pos+500], re.IGNORECASE | re.DOTALL):
                    line_num = content[:pos].count('\n') + 1
                    # Check if there's a closing tag later
                    closing_pattern = re.compile(rf'</{tag}\s*>', re.IGNORECASE)
                    if not closing_pattern.search(content, close_pos):
                        issues.append({
                            "type": "malformed_mdx",
                            "line": line_num,
                            "detail": f"Self-closing tag <{tag} ...> missing closing slash (should be <{tag} ... />)"
                        })
    
    # Pattern 2: Check for missing closing tags on paired components
    for tag in PAIRED_TAGS:
        # Count opening and closing tags
        open_count = len(re.findall(rf'<{tag}\b', content, re.IGNORECASE))
        # For self-closing tags, adjust
        if tag in SELF_CLOSING_TAGS:
            # Only count non-self-closing openings
            open_non_self = len(re.findall(rf'<{tag}\b(?:(?!/>)[^>])*>', content, re.IGNORECASE))
            actual_opens = open_non_self
        else:
            actual_opens = open_count
        
        close_count = len(re.findall(rf'</{tag}\s*>', content, re.IGNORECASE))
        
        if actual_opens != close_count:
            # Find line numbers of unmatched opens
            for m in re.finditer(rf'<{tag}\b', content, re.IGNORECASE):
                line_num = content[:m.start()].count('\n') + 1
                # Check if this specific tag has a closing pair
                # Simple approach: just report the imbalance
                pass
            
            if actual_opens > close_count:
                # Find a specific unclosed instance
                # Use a simple stack approach
                tag_stack = []
                # This is simplified - find the first line of an unmatched open
                for i, line in enumerate(lines, 1):
                    opens_in_line = len(re.findall(rf'<{tag}\b', line, re.IGNORECASE))
                    closes_in_line = len(re.findall(rf'</{tag}\s*>', line, re.IGNORECASE))
                    if tag in SELF_CLOSING_TAGS:
                        # Exclude self-closing
                        self_closing = len(re.findall(rf'<{tag}\b[^>]*/>', line, re.IGNORECASE))
                        opens_in_line -= self_closing
                    tag_stack.extend(['open'] * opens_in_line)
                    for _ in range(closes_in_line):
                        if tag_stack:
                            tag_stack.pop()
                    if tag_stack:
                        issues.append({
                            "type": "malformed_mdx",
                            "line": i,
                            "detail": f"Unclosed <{tag}> tag ({actual_opens} opens vs {close_count} closes)"
                        })
                        break
    
    # Pattern 3: Broken self-closing syntax like <Tag / (missing >)
    broken_self_close = re.finditer(r'<\w+ [^>]*/\s*(?=[\n\r]|$)', content)
    for m in broken_self_close:
        line_num = content[:m.start()].count('\n') + 1
        tag_text = m.group().strip()
        issues.append({
            "type": "malformed_mdx",
            "line": line_num,
            "detail": f"Broken self-closing syntax: '{tag_text}' — missing closing '>'"
        })
    
    return issues


def check_visibility_issues(content, lines):
    """Check for component prop name issues."""
    issues = []
    
    # Check ArticleMedia for unknown props
    for m in re.finditer(r'<ArticleMedia\b([^>]*?)(?:>|/>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        
        # Extract attribute names
        attr_names = re.findall(r'\b(\w+)\s*=', attrs_text)
        for attr in attr_names:
            if attr not in ARTICLE_MEDIA_PROPS:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"ArticleMedia uses unknown prop '{attr}' (known props: {sorted(ARTICLE_MEDIA_PROPS)})"
                })
    
    # Check WikiMistakeCard for prop names
    for m in re.finditer(r'<WikiMistakeCard\b([^>]*?)(?:>|/>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        # This component likely uses 'mistake' prop - let's check what's there
        attr_names = re.findall(r'\b(\w+)\s*=', attrs_text)
        # Common known props for WikiMistakeCard
        known_wmc_props = {"mistake", "fix", "id", "variant", "category"}
        for attr in attr_names:
            if attr not in known_wmc_props:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"WikiMistakeCard uses prop '{attr}' — verify against component (known: {sorted(known_wmc_props)})"
                })
    
    # Check Callout for prop names
    for m in re.finditer(r'<Callout\b([^>]*?)(?:>|/>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        attr_names = re.findall(r'\b(\w+)\s*=', attrs_text)
        known_callout_props = {"variant", "title", "id", "icon"}
        for attr in attr_names:
            if attr not in known_callout_props:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"Callout uses prop '{attr}' — verify against component (known: {sorted(known_callout_props)})"
                })
    
    return issues


def check_broken_markdown(content, lines):
    """Check for orphaned markdown formatting markers."""
    issues = []
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Skip code blocks
        if stripped.startswith('```'):
            continue
        
        # Check for orphaned ** markers (odd count on a line with no closing)
        bold_count = stripped.count('**')
        if bold_count % 2 != 0:
            # Could be intentional start/end spanning lines, so only flag if it looks orphaned
            # Check if it's at end of line followed by nothing
            if stripped.endswith('**') and not stripped[:-2].endswith('**'):
                # Check if next line has closing **
                if i < len(lines) and '**' not in lines[i]:
                    issues.append({
                        "type": "broken_markdown",
                        "line": i,
                        "detail": f"Orphaned '**' marker at end of line — possible broken bold formatting"
                    })
            elif '**' in stripped and stripped.count('**') == 1:
                issues.append({
                    "type": "broken_markdown",
                    "line": i,
                    "detail": f"Single '**' marker — possible broken bold formatting"
                })
        
        # Check for orphaned __ markers
        underscore_bold = re.findall(r'(?<!\w)__(\w)', stripped)
        if underscore_bold:
            # Check for closing __
            if stripped.count('__') % 2 != 0 and stripped.count('__') == 1:
                issues.append({
                    "type": "broken_markdown",
                    "line": i,
                    "detail": f"Single '__' marker — possible broken bold formatting"
                })
        
        # Check for orphaned backtick
        backtick_count = stripped.count('`')
        if backtick_count == 1 and not stripped.startswith('```'):
            issues.append({
                "type": "broken_markdown",
                "line": i,
                "detail": f"Single backtick '`' — possible broken inline code formatting"
            })
        
        # Check for broken link syntax [text](url without closing )
        if '[' in stripped and '](' in stripped:
            # Find all link patterns
            link_starts = [j for j, c in enumerate(stripped) if c == '[']
            for start in link_starts:
                end_bracket = stripped.find('](', start)
                if end_bracket != -1:
                    paren_start = end_bracket + 2
                    paren_end = stripped.find(')', paren_start)
                    if paren_end == -1:
                        issues.append({
                            "type": "broken_markdown",
                            "line": i,
                            "detail": f"Broken link syntax — missing closing ')' in [{stripped[start:end_bracket]}](...)"
                        })
                        break
        
        # Check for broken image syntax ![alt](url without closing )
        if '![' in stripped:
            for m in re.finditer(r'!\[([^\]]*)\]\(([^)]*)$', stripped):
                issues.append({
                    "type": "broken_markdown",
                    "line": i,
                    "detail": f"Broken image syntax — missing closing ')'"
                })
    
    return issues


def check_empty_components(content, lines):
    """Check for component tags with no children or props that would render empty."""
    issues = []
    
    # Pattern: self-closing tags that require content but are empty
    # <Note /> is suspicious (should have content)
    for tag in ["Note", "Warn", "ExamTip", "Tip", "Example"]:
        for m in re.finditer(rf'<{tag}\s*/>\s*\n', content, re.IGNORECASE):
            line_num = content[:m.start()].count('\n') + 1
            issues.append({
                "type": "empty_component",
                "line": line_num,
                "detail": f"Self-closing <{tag} /> with no content — component would render empty"
            })
    
    # Pattern: paired tags with no content between them
    for tag in PAIRED_TAGS:
        if tag in SELF_CLOSING_TAGS:
            continue
        for m in re.finditer(rf'<{tag}\b[^>]*>\s*</{tag}\s*>', content, re.IGNORECASE):
            line_num = content[:m.start()].count('\n') + 1
            issues.append({
                "type": "empty_component",
                "line": line_num,
                "detail": f"Empty <{tag}>...</{tag}> with no content — component would render empty"
            })
    
    return issues


def check_placeholders(content, lines):
    """Check for remaining [SLATECAMP_UI_BLOCK:...] placeholders."""
    issues = []
    
    for i, line in enumerate(lines, 1):
        if '[SLATECAMP_UI_BLOCK:' in line:
            issues.append({
                "type": "placeholder",
                "line": i,
                "detail": f"Orphaned UI block placeholder: {line.strip()}"
            })
    
    return issues


# Process each article
for article in articles:
    dir_name = article["dir"]
    slug = article["slug"]
    cand_path = os.path.join(EXPORT_DIR, dir_name, "candidate.md")
    
    if not os.path.exists(cand_path):
        findings.append({
            "article_dir": dir_name,
            "slug": slug,
            "issues": [{
                "type": "missing_file",
                "line": 0,
                "detail": f"candidate.md not found at {cand_path}"
            }]
        })
        issues_count += 1
        scanned += 1
        continue
    
    try:
        with open(cand_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        findings.append({
            "article_dir": dir_name,
            "slug": slug,
            "issues": [{
                "type": "read_error",
                "line": 0,
                "detail": f"Failed to read {cand_path}: {e}"
            }]
        })
        issues_count += 1
        scanned += 1
        continue
    
    lines = content.split('\n')
    
    all_issues = []
    all_issues.extend(check_malformed_mdx(content, lines))
    all_issues.extend(check_visibility_issues(content, lines))
    all_issues.extend(check_broken_markdown(content, lines))
    all_issues.extend(check_empty_components(content, lines))
    all_issues.extend(check_placeholders(content, lines))
    
    # Deduplicate by (type, line, detail)
    seen = set()
    unique_issues = []
    for issue in all_issues:
        key = (issue["type"], issue["line"], issue["detail"])
        if key not in seen:
            seen.add(key)
            unique_issues.append(issue)
    
    if unique_issues:
        findings.append({
            "article_dir": dir_name,
            "slug": slug,
            "issues": unique_issues
        })
        issues_count += 1
    
    scanned += 1
    
    if scanned % 50 == 0:
        print(f"  Scanned {scanned}/{len(articles)}...")

print(f"\nDone scanning {scanned} articles.")
print(f"Articles with issues: {issues_count}")

# Build summary
issue_type_counts = {}
for f_entry in findings:
    for issue in f_entry["issues"]:
        t = issue["type"]
        issue_type_counts[t] = issue_type_counts.get(t, 0) + 1

# Write output
output = {
    "group": "C",
    "articles_scanned": scanned,
    "articles_with_issues": issues_count,
    "issue_type_summary": issue_type_counts,
    "findings": findings
}

with open(OUTPUT_JSON, "w") as f:
    json.dump(output, f, indent=2)

print(f"\nIssue type summary:")
for t, c in sorted(issue_type_counts.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")

print(f"\nFindings written to: {OUTPUT_JSON}")
print(f"Total findings entries: {len(findings)}")
