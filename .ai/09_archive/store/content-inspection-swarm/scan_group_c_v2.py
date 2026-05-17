#!/usr/bin/env python3
"""Scan Group C articles for content errors in candidate.md files - v2 with better regex."""

import json
import re
import os

# Paths
ARTICLES_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-C-articles.json"
EXPORT_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
OUTPUT_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-C-findings.json"

# Load article list
with open(ARTICLES_JSON, "r") as f:
    articles = json.load(f)

print(f"Loaded {len(articles)} articles")

# Known component prop names from ArticleMedia.tsx
ARTICLE_MEDIA_PROPS = {
    "id", "layout", "variant", "aspectRatio", "title", "description",
    "placementIntent", "type", "status", "src", "youtubeId", "embedUrl",
    "alt", "caption", "credit", "sourceUrl", "suggestedAsset", "carouselCount"
}

# Known Props for WikiMistakeCard (inferred from common React patterns + task hints)
WIKI_MISTAKE_CARD_PROPS = {"mistake", "fix", "id", "variant", "category"}

# Known Props for Callout
CALLOUT_PROPS = {"variant", "title", "id", "icon"}

# Known Props for KeyValues
KEYVALUES_PROPS = {"items", "id", "variant", "title"}

# Self-closing component tags (always use <Tag ... />)
SELF_CLOSING_TAGS = {"ArticleMedia", "KeyValues"}

# Paired component tags
PAIRED_TAGS = {"Note", "Warn", "ExamTip", "Tip", "Example", "Callout", "WikiMistakeCard", "Steps", "Accordion", "Tab", "Tabs"}

def extract_jsx_attributes(tag_content):
    """
    Properly extract JSX attribute names from a tag opening.
    Returns list of attribute names.
    Handles: attr="...", attr='...', attr={...}, attr (boolean)
    """
    attrs = []
    # Remove the tag name
    tag_content = tag_content.strip()
    # Match attribute patterns: word followed by = then quote or brace
    # Avoid matching inside string values by using a simple state machine approach
    i = 0
    while i < len(tag_content):
        # Skip whitespace
        while i < len(tag_content) and tag_content[i] in ' \t\n\r':
            i += 1
        if i >= len(tag_content):
            break
        
        # Check if we're at start of an attribute name
        if tag_content[i].isalpha() or tag_content[i] == '_':
            start = i
            while i < len(tag_content) and (tag_content[i].isalnum() or tag_content[i] in '_-'):
                i += 1
            attr_name = tag_content[start:i]
            
            # Skip whitespace before = or end
            while i < len(tag_content) and tag_content[i] in ' \t\n\r':
                i += 1
            
            if i < len(tag_content) and tag_content[i] == '=':
                # This is an attribute with a value
                i += 1  # skip =
                # Skip whitespace
                while i < len(tag_content) and tag_content[i] in ' \t\n\r':
                    i += 1
                
                if i < len(tag_content):
                    if tag_content[i] == '"':
                        i += 1
                        while i < len(tag_content) and tag_content[i] != '"':
                            if tag_content[i] == '\\':
                                i += 1
                            i += 1
                        if i < len(tag_content):
                            i += 1  # skip closing "
                    elif tag_content[i] == "'":
                        i += 1
                        while i < len(tag_content) and tag_content[i] != "'":
                            if tag_content[i] == '\\':
                                i += 1
                            i += 1
                        if i < len(tag_content):
                            i += 1  # skip closing '
                    elif tag_content[i] == '{':
                        # JSX expression - find matching }
                        brace_depth = 0
                        while i < len(tag_content):
                            if tag_content[i] == '{':
                                brace_depth += 1
                            elif tag_content[i] == '}':
                                brace_depth -= 1
                                if brace_depth == 0:
                                    i += 1
                                    break
                            elif tag_content[i] in '"\'':
                                # skip string inside braces
                                quote = tag_content[i]
                                i += 1
                                while i < len(tag_content) and tag_content[i] != quote:
                                    if tag_content[i] == '\\':
                                        i += 1
                                    i += 1
                                if i < len(tag_content):
                                    i += 1
                                    continue
                            i += 1
                attrs.append(attr_name)
            else:
                # Boolean attribute (no value)
                attrs.append(attr_name)
        elif tag_content[i] == '/':
            # Self-closing slash
            i += 1
            break
        elif tag_content[i] == '>':
            break
        else:
            i += 1
    
    return attrs


def check_malformed_mdx(content, lines):
    """Check for malformed MDX tags."""
    issues = []
    
    # 1. Find all component tag instances
    all_tags = re.finditer(r'<(/?)(\w+)((?:\s[^>]*)?)\s*(/?)>', content)
    
    # Track tags per component type for mismatch detection
    tag_positions = {}  # component -> list of (line, is_open, is_self_close)
    
    for m in all_tags:
        slash_prefix = m.group(1)
        tag_name = m.group(2)
        attrs = m.group(3)
        self_close = m.group(4)
        
        # Only check known components
        if tag_name not in SELF_CLOSING_TAGS and tag_name not in PAIRED_TAGS:
            continue
        
        line_num = content[:m.start()].count('\n') + 1
        is_closing = (slash_prefix == '/')
        
        if tag_name not in tag_positions:
            tag_positions[tag_name] = []
        
        tag_positions[tag_name].append({
            "line": line_num,
            "is_closing": is_closing,
            "is_self_close": bool(self_close),
            "full_match": m.group(0)
        })
        
        # Check: self-closing tags without />
        if tag_name in SELF_CLOSING_TAGS and not is_closing and not self_close:
            issues.append({
                "type": "malformed_mdx",
                "line": line_num,
                "detail": f"Self-closing component <{tag_name}> missing closing slash — should be <{tag_name} ... />"
            })
    
    # Check for unbalanced paired tags
    for tag_name in PAIRED_TAGS:
        if tag_name not in tag_positions:
            continue
        
        positions = tag_positions[tag_name]
        opens = [p for p in positions if not p["is_closing"] and not p["is_self_close"]]
        closes = [p for p in positions if p["is_closing"]]
        self_closes = [p for p in positions if p["is_self_close"]]
        
        # Allow self-closing as valid (e.g. <Callout ... />)
        if len(opens) != len(closes):
            # Simple imbalance detection
            if len(opens) > len(closes):
                # Find an unclosed open - use stack simulation
                stack = []
                for p in positions:
                    if p["is_closing"]:
                        if stack:
                            stack.pop()
                    elif not p["is_self_close"]:
                        stack.append(p)
                    # self-closing doesn't affect stack
                
                if stack:
                    for p in stack:
                        issues.append({
                            "type": "malformed_mdx",
                            "line": p["line"],
                            "detail": f"Unclosed <{tag_name}> tag ({len(opens)} opens vs {len(closes)} closes) — missing </{tag_name}>"
                        })
            elif len(closes) > len(opens):
                # Extra closing tag
                for p in closes:
                    found = False
                    for o in opens:
                        if o["line"] < p["line"]:
                            found = True
                            break
                    if not found:
                        issues.append({
                            "type": "malformed_mdx",
                            "line": p["line"],
                            "detail": f"Orphaned closing </{tag_name}> without matching opening tag"
                        })
    
    return issues


def check_broken_self_close(content, lines):
    """Check for broken self-closing like <Tag / without >"""
    issues = []
    # Match <TagName ... /  followed by newline or end of string (no closing >)
    for m in re.finditer(r'<\w+[^>]*/(\s*)$', content, re.MULTILINE):
        line_num = content[:m.start()].count('\n') + 1
        tag_text = m.group(0).strip()
        issues.append({
            "type": "malformed_mdx",
            "line": line_num,
            "detail": f"Broken self-closing syntax: '{tag_text}' — missing closing '>'"
        })
    return issues


def check_visibility(content, lines):
    """Check for unknown prop names on known components."""
    issues = []
    
    # Find ArticleMedia tags and check props
    for m in re.finditer(r'<ArticleMedia\b([^>]*?)(?:/>|>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        attr_names = extract_jsx_attributes(attrs_text)
        for attr in attr_names:
            if attr not in ARTICLE_MEDIA_PROPS:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"<ArticleMedia> uses prop '{attr}' — verify against component definition (known: {sorted(ARTICLE_MEDIA_PROPS)})"
                })
    
    # Find WikiMistakeCard tags and check props
    for m in re.finditer(r'<WikiMistakeCard\b([^>]*?)(?:/>|>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        attr_names = extract_jsx_attributes(attrs_text)
        for attr in attr_names:
            if attr not in WIKI_MISTAKE_CARD_PROPS:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"<WikiMistakeCard> uses prop '{attr}' — verify against component definition"
                })
    
    # Find Callout tags and check props
    for m in re.finditer(r'<Callout\b([^>]*?)(?:/>|>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        attr_names = extract_jsx_attributes(attrs_text)
        for attr in attr_names:
            if attr not in CALLOUT_PROPS:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"<Callout> uses prop '{attr}' — verify against component definition"
                })
    
    # Find KeyValues tags and check props
    for m in re.finditer(r'<KeyValues\b([^>]*?)(?:/>|>)', content, re.IGNORECASE):
        attrs_text = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        attr_names = extract_jsx_attributes(attrs_text)
        for attr in attr_names:
            if attr not in KEYVALUES_PROPS:
                issues.append({
                    "type": "visibility",
                    "line": line_num,
                    "detail": f"<KeyValues> uses prop '{attr}' — verify against component definition"
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
        
        # Skip lines inside HTML/MDX tags (content between tags)
        if re.match(r'^\s*<[A-Z]\w*', stripped) or re.match(r'^\s*</[A-Z]\w*', stripped):
            continue
        
        # Check for orphaned ** markers
        bold_count = stripped.count('**')
        if bold_count % 2 != 0:
            if bold_count == 1:
                issues.append({
                    "type": "broken_markdown",
                    "line": i,
                    "detail": f"Single '**' marker — possible broken bold formatting"
                })
        
        # Check for orphaned __ markers (but not in URLs or file paths)
        # Filter out lines that look like they contain URLs
        if 'http' not in stripped and '://' not in stripped:
            underscore_count = len(re.findall(r'(?<!\w)__(?!\w)', stripped))
            # __ is also used in Python etc, so be conservative
            if underscore_count >= 1 and underscore_count % 2 != 0:
                issues.append({
                    "type": "broken_markdown",
                    "line": i,
                    "detail": f"Orphaned '__' marker — possible broken bold/underline formatting"
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
        bracket_pos = stripped.find('[')
        if bracket_pos != -1:
            closing_bracket = stripped.find('](', bracket_pos)
            if closing_bracket != -1:
                paren_start = closing_bracket + 2
                closing_paren = stripped.find(')', paren_start)
                if closing_paren == -1:
                    # Check if there's content after paren start
                    if paren_start < len(stripped):
                        issues.append({
                            "type": "broken_markdown",
                            "line": i,
                            "detail": f"Broken link syntax — missing closing ')' in link"
                        })
        
        # Check for broken image syntax
        if '![' in stripped:
            # Find image patterns
            img_start = stripped.find('![')
            if img_start != -1:
                alt_end = stripped.find('](', img_start)
                if alt_end != -1:
                    paren_start = alt_end + 2
                    closing_paren = stripped.find(')', paren_start)
                    if closing_paren == -1:
                        issues.append({
                            "type": "broken_markdown",
                            "line": i,
                            "detail": "Broken image syntax — missing closing ')'"
                        })
    
    return issues


def check_empty_components(content, lines):
    """Check for component tags with no content that would render empty."""
    issues = []
    
    # Self-closing paired tags: e.g. <Note /> (should have children)
    for tag in ["Note", "Warn", "ExamTip", "Tip", "Example", "Callout", "WikiMistakeCard"]:
        for m in re.finditer(rf'<{tag}\s*/>', content, re.IGNORECASE):
            line_num = content[:m.start()].count('\n') + 1
            issues.append({
                "type": "empty_component",
                "line": line_num,
                "detail": f"Self-closing <{tag} /> with no content — component would render empty (use <{tag}>...</{tag}>)"
            })
    
    # Paired tags with empty content
    for tag in PAIRED_TAGS:
        if tag in SELF_CLOSING_TAGS:
            continue
        for m in re.finditer(rf'<{tag}\b[^>]*>\s*</{tag}\s*>', content, re.IGNORECASE):
            line_num = content[:m.start()].count('\n') + 1
            issues.append({
                "type": "empty_component",
                "line": line_num,
                "detail": f"Empty <{tag}>...</{tag}> with no content between tags"
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
findings = []
scanned = 0
issues_count = 0

for article in articles:
    dir_name = article["dir"]
    slug = article["slug"]
    cand_path = os.path.join(EXPORT_DIR, dir_name, "candidate.md")
    
    if not os.path.exists(cand_path):
        findings.append({
            "article_dir": dir_name,
            "slug": slug,
            "issues": [{"type": "missing_file", "line": 0, "detail": f"candidate.md not found at {cand_path}"}]
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
            "issues": [{"type": "read_error", "line": 0, "detail": f"Failed to read {cand_path}: {e}"}]
        })
        issues_count += 1
        scanned += 1
        continue
    
    lines = content.split('\n')
    
    all_issues = []
    all_issues.extend(check_malformed_mdx(content, lines))
    all_issues.extend(check_broken_self_close(content, lines))
    all_issues.extend(check_visibility(content, lines))
    all_issues.extend(check_broken_markdown(content, lines))
    all_issues.extend(check_empty_components(content, lines))
    all_issues.extend(check_placeholders(content, lines))
    
    # Deduplicate
    seen = set()
    unique_issues = []
    for issue in all_issues:
        key = (issue["type"], issue["line"], issue["detail"][:120])
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

print(f"\nIssue type summary:")
for t, c in sorted(issue_type_counts.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")

output = {
    "group": "C",
    "articles_scanned": scanned,
    "articles_with_issues": issues_count,
    "issue_type_summary": issue_type_counts,
    "findings": findings
}

with open(OUTPUT_JSON, "w") as f:
    json.dump(output, f, indent=2)

print(f"\nFindings written to: {OUTPUT_JSON}")
print(f"Total findings entries: {len(findings)}")
