#!/usr/bin/env python3
"""Scan Group C articles for content errors in candidate.md files - v3 with fixed regex."""

import json
import re
import os

# Paths
ARTICLES_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-C-articles.json"
EXPORT_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
OUTPUT_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-C-findings.json"

with open(ARTICLES_JSON, "r") as f:
    articles = json.load(f)

print(f"Loaded {len(articles)} articles")

# Known component prop names from ArticleMedia.tsx
ARTICLE_MEDIA_PROPS = {
    "id", "layout", "variant", "aspectRatio", "title", "description",
    "placementIntent", "type", "status", "src", "youtubeId", "embedUrl",
    "alt", "caption", "credit", "sourceUrl", "suggestedAsset", "carouselCount"
}

WIKI_MISTAKE_CARD_PROPS = {"mistake", "fix", "id", "variant", "category"}
CALLOUT_PROPS = {"variant", "title", "id", "icon"}
KEYVALUES_PROPS = {"items", "id", "variant", "title"}

# Self-closing component tags
SELF_CLOSING_TAGS = {"ArticleMedia"}
# KeyValues can be BOTH self-closing (<KeyValues items={...} />) or paired (<KeyValues>...</KeyValues>)

# Paired component tags
PAIRED_TAGS = {"Note", "Warn", "ExamTip", "Tip", "Example", "Callout", "WikiMistakeCard", "Steps", "Accordion", "Tab", "Tabs", "KeyValues"}

def extract_jsx_attributes(attrs_text):
    """
    Properly extract JSX attribute names from text inside a tag.
    """
    attrs = []
    i = 0
    while i < len(attrs_text):
        while i < len(attrs_text) and attrs_text[i] in ' \t\n\r':
            i += 1
        if i >= len(attrs_text):
            break
        
        if attrs_text[i].isalpha() or attrs_text[i] == '_':
            start = i
            while i < len(attrs_text) and (attrs_text[i].isalnum() or attrs_text[i] in '_-'):
                i += 1
            attr_name = attrs_text[start:i]
            
            while i < len(attrs_text) and attrs_text[i] in ' \t\n\r':
                i += 1
            
            if i < len(attrs_text) and attrs_text[i] == '=':
                i += 1
                while i < len(attrs_text) and attrs_text[i] in ' \t\n\r':
                    i += 1
                if i < len(attrs_text):
                    quote = attrs_text[i]
                    if quote == '"':
                        i += 1
                        while i < len(attrs_text) and attrs_text[i] != '"':
                            if attrs_text[i] == '\\': i += 1
                            i += 1
                        if i < len(attrs_text): i += 1
                    elif quote == "'":
                        i += 1
                        while i < len(attrs_text) and attrs_text[i] != "'":
                            if attrs_text[i] == '\\': i += 1
                            i += 1
                        if i < len(attrs_text): i += 1
                    elif quote == '{':
                        brace_depth = 0
                        while i < len(attrs_text):
                            if attrs_text[i] == '{':
                                brace_depth += 1
                            elif attrs_text[i] == '}':
                                brace_depth -= 1
                                if brace_depth == 0:
                                    i += 1
                                    break
                            elif attrs_text[i] in '"\'':
                                q = attrs_text[i]
                                i += 1
                                while i < len(attrs_text) and attrs_text[i] != q:
                                    if attrs_text[i] == '\\': i += 1
                                    i += 1
                                if i < len(attrs_text): i += 1
                                continue
                            i += 1
                attrs.append(attr_name)
            else:
                attrs.append(attr_name)
        elif attrs_text[i] == '/':
            break
        elif attrs_text[i] == '>':
            break
        else:
            i += 1
    return attrs


def find_all_tags(content):
    """Find all MDX component tags with proper self-closing detection.
    Returns list of {'tag': str, 'is_closing': bool, 'is_self_closing': bool, 'line': int, 'full': str}
    """
    results = []
    # Match <TagName ...> or </TagName> — capture full match and check if it ends with />
    for m in re.finditer(r'<(/?)\s*(\w+)([^>]*?)\s*(/?)>', content):
        prefix = m.group(1)
        tag_name = m.group(2)
        attrs_and_more = m.group(3)
        trailing_slash = m.group(4)
        full = m.group(0)
        
        # Check if it actually ends with /> (the trailing_slash + > pattern)
        is_self_closing = full.rstrip().endswith('/>')
        
        line_num = content[:m.start()].count('\n') + 1
        
        results.append({
            "tag": tag_name,
            "is_closing": (prefix == '/'),
            "is_self_closing": is_self_closing,
            "line": line_num,
            "full": full
        })
    
    return results


def check_malformed_mdx(content, lines):
    """Check for malformed MDX tags."""
    issues = []
    tags = find_all_tags(content)
    
    # Filter for known component tags only
    known_tags = [t for t in tags if t["tag"] in SELF_CLOSING_TAGS or t["tag"] in PAIRED_TAGS]
    
    # Check self-closing tags that should have />
    for t in known_tags:
        if t["tag"] in SELF_CLOSING_TAGS and not t["is_closing"] and not t["is_self_closing"]:
            # This is a self-closing component used without />
            # But check: is it actually a paired usage? (has closing tag later)
            has_closing = any(ct["tag"] == t["tag"] and ct["is_closing"] for ct in known_tags)
            if not has_closing:
                issues.append({
                    "type": "malformed_mdx",
                    "line": t["line"],
                    "detail": f"Self-closing component <{t['tag']}> missing closing slash — should be <{t['tag']} ... />"
                })
    
    # Check for unbalanced paired tags
    for component in PAIRED_TAGS:
        comp_tags = [t for t in known_tags if t["tag"] == component]
        if not comp_tags:
            continue
        
        # Separate by type
        opens = [t for t in comp_tags if not t["is_closing"] and not t["is_self_closing"]]
        closes = [t for t in comp_tags if t["is_closing"]]
        
        if len(opens) != len(closes):
            if len(opens) > len(closes):
                # Find unmatched opens using stack
                stack = []
                unmatched = []
                for t in comp_tags:
                    if t["is_closing"]:
                        if stack:
                            stack.pop()
                        else:
                            unmatched.append(t)  # extra close
                    elif not t["is_self_closing"]:
                        stack.append(t)
                for t in stack:
                    issues.append({
                        "type": "malformed_mdx",
                        "line": t["line"],
                        "detail": f"Unclosed <{component}> tag ({len(opens)} opens vs {len(closes)} closes) — missing </{component}>"
                    })
            else:
                # More closes than opens
                stack = []
                for t in comp_tags:
                    if t["is_closing"]:
                        if stack:
                            stack.pop()
                        else:
                            issues.append({
                                "type": "malformed_mdx",
                                "line": t["line"],
                                "detail": f"Orphaned closing </{component}> without matching opening tag"
                            })
                    elif not t["is_self_closing"]:
                        stack.append(t)
    
    # Check for broken self-closing syntax: <Tag ... /  (without >)
    for m in re.finditer(r'<(\w+)\s[^>]*/\s*$', content, re.MULTILINE):
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
    
    prop_checks = [
        (r'<ArticleMedia\b([^>]*?)(?:/>|>)', ARTICLE_MEDIA_PROPS, "ArticleMedia"),
        (r'<WikiMistakeCard\b([^>]*?)(?:/>|>)', WIKI_MISTAKE_CARD_PROPS, "WikiMistakeCard"),
        (r'<Callout\b([^>]*?)(?:/>|>)', CALLOUT_PROPS, "Callout"),
        (r'<KeyValues\b([^>]*?)(?:/>|>)', KEYVALUES_PROPS, "KeyValues"),
    ]
    
    for pattern, known_props, component_name in prop_checks:
        for m in re.finditer(pattern, content, re.IGNORECASE):
            attrs_text = m.group(1)
            line_num = content[:m.start()].count('\n') + 1
            attr_names = extract_jsx_attributes(attrs_text)
            for attr in attr_names:
                if attr not in known_props:
                    issues.append({
                        "type": "visibility",
                        "line": line_num,
                        "detail": f"<{component_name}> uses prop '{attr}' — verify against component definition (known: {sorted(known_props)})"
                    })
    
    return issues


def check_broken_markdown(content, lines):
    """Check for orphaned markdown formatting markers."""
    issues = []
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith('```'):
            continue
        if re.match(r'^\s*<[A-Z]\w*', stripped) or re.match(r'^\s*</[A-Z]\w*', stripped):
            continue
        
        # Check for orphaned ** markers
        bold_count = stripped.count('**')
        if bold_count % 2 != 0 and bold_count >= 1:
            issues.append({
                "type": "broken_markdown",
                "line": i,
                "detail": f"Unbalanced '**' markers ({bold_count} occurrences) — possible broken bold formatting"
            })
        
        # Check for orphaned __ markers
        if 'http' not in stripped and '://' not in stripped:
            underscore_count = len(re.findall(r'(?<!\w)__(?!\w)', stripped))
            if underscore_count >= 1 and underscore_count % 2 != 0:
                issues.append({
                    "type": "broken_markdown",
                    "line": i,
                    "detail": f"Unbalanced '__' markers ({underscore_count}) — possible broken bold/underline formatting"
                })
        
        # Check for orphaned backtick
        backtick_count = stripped.count('`')
        if backtick_count == 1 and not stripped.startswith('```'):
            issues.append({
                "type": "broken_markdown",
                "line": i,
                "detail": "Single backtick '`' — possible broken inline code formatting"
            })
        
        # Broken link syntax
        if '[' in stripped and '](' in stripped:
            bracket_pos = stripped.find('[')
            closing_bracket = stripped.find('](', bracket_pos)
            if closing_bracket != -1:
                paren_start = closing_bracket + 2
                closing_paren = stripped.find(')', paren_start)
                if closing_paren == -1 and paren_start < len(stripped):
                    issues.append({
                        "type": "broken_markdown",
                        "line": i,
                        "detail": "Broken link syntax — missing closing ')'"
                    })
        
        # Broken image syntax
        if '![' in stripped:
            img_start = stripped.find('![')
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
    """Check for component tags that would render empty."""
    issues = []
    
    # Self-closing paired tags with no content
    for tag in ["Note", "Warn", "ExamTip", "Tip", "Example", "Callout", "WikiMistakeCard"]:
        for m in re.finditer(rf'<{tag}\s*/>', content, re.IGNORECASE):
            line_num = content[:m.start()].count('\n') + 1
            issues.append({
                "type": "empty_component",
                "line": line_num,
                "detail": f"Self-closing <{tag} /> with no content — should use <{tag}>...</{tag}>"
            })
    
    # Paired tags with nothing between them
    for tag in PAIRED_TAGS:
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
            "article_dir": dir_name, "slug": slug,
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
            "article_dir": dir_name, "slug": slug,
            "issues": [{"type": "read_error", "line": 0, "detail": f"Failed to read {cand_path}: {e}"}]
        })
        issues_count += 1
        scanned += 1
        continue
    
    lines = content.split('\n')
    
    all_issues = []
    all_issues.extend(check_malformed_mdx(content, lines))
    all_issues.extend(check_visibility(content, lines))
    all_issues.extend(check_broken_markdown(content, lines))
    all_issues.extend(check_empty_components(content, lines))
    all_issues.extend(check_placeholders(content, lines))
    
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
