#!/usr/bin/env python3
"""Scan Group A candidate.md files for content errors."""

import json
import os
import re

EXPORT_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
ARTICLES_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-A-articles.json"
OUTPUT_JSON = "/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-A-findings.json"

# Known valid props per component (destructured in the actual React component)
KNOWN_PROPS = {
    "ArticleMedia": {
        "id", "layout", "variant", "aspectRatio", "title", "description",
        "placementIntent", "type", "status", "src", "youtubeId", "embedUrl",
        "alt", "caption", "credit", "sourceUrl", "suggestedAsset",
        "suggestedSearchQuery", "replacementNotes", "carouselCount"
    },
    "WikiMistakeCard": {
        # From normalizeMistakeProps: handles A) mistake/correction/context,
        # B) number/title/wrongValue/correctValue/explanation/sourceRef,
        # C) title/body
        "mistake", "correction", "context", "number", "title", "wrongValue",
        "correctValue", "explanation", "sourceRef", "body"
    },
    "WikiMistakeList": {
        "title", "items", "mistakes"
    },
    "Callout": {
        "variant", "title"
    },
    "WikiExamTable": {
        "headers", "rows", "caption"
    },
    "Note": set(),  # accepts children
    "Tip": set(),   # accepts children
    "Warning": set(),  # accepts children
    "LawCallout": {
        "code", "section", "title"
    },
    "WikiCalloutBox": {
        "variant", "title"
    },
    "AlertBox": {
        "type", "title"
    },
    "KeyValues": {
        "items", "values", "pairs", "title", "note"
    },
}

# Valid Callout variant values
VALID_CALLOUT_VARIANTS = {
    "note", "warning", "tip", "example", "info", "danger",
    "requirement", "most-tested", "lea-watch", "version-alert",
    "exam-tip", "authority"
}

def load_articles():
    with open(ARTICLES_JSON, "r") as f:
        return json.load(f)

def find_component_tags(lines):
    """
    Find all JSX component tags in the MDX.
    Returns list of (line_num, line_text, tag_info).
    """
    tags = []
    in_tag = False
    tag_start_line = 0
    tag_lines = []

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Check for opening tags
        if not in_tag:
            # Self-closing tag on one line
            m = re.match(r'^\s*<(\w+)\b', stripped)
            if m:
                tag_name = m.group(1)
                # Check if this line has a self-closing />
                if '/>' in stripped or re.search(r'/\s*>', stripped):
                    tags.append((i, line, {"type": "self_closing", "name": tag_name, "lines": [line]}))
                    if not stripped.endswith('>'):
                        pass  # still on same line
                    continue
                # Check if it closes on the same line with </Tag>
                close_pattern = rf'</{tag_name}\s*>'
                if re.search(close_pattern, stripped):
                    tags.append((i, line, {"type": "closed_same_line", "name": tag_name, "lines": [line]}))
                    continue
                # Multi-line opening
                if stripped.endswith('>'):
                    # Could be a complete open tag that wraps content on subsequent lines
                    pass
                in_tag = True
                tag_start_line = i
                tag_lines = [line]
                continue

        if in_tag:
            tag_lines.append(line)
            stripped_combined = ' '.join(l.strip() for l in tag_lines)
            # Try to find the tag name from the opening line
            m_open = re.match(r'^\s*<(\w+)\b', tag_lines[0].strip())
            tag_name = m_open.group(1) if m_open else "unknown"

            # Check for self-closing
            if '/>' in stripped_combined:
                tags.append((tag_start_line, tag_lines[0], {"type": "multi_line_self_closing", "name": tag_name, "lines": tag_lines}))
                in_tag = False
                tag_lines = []
                continue

            # Check for closing tag
            close_pattern = rf'</{tag_name}\s*>'
            if re.search(close_pattern, stripped_combined):
                tags.append((tag_start_line, tag_lines[0], {"type": "multi_line_closed", "name": tag_name, "lines": tag_lines}))
                in_tag = False
                tag_lines = []
                continue

    # Check if we ended while still in a tag (potential malformed)
    if in_tag:
        m_open = re.match(r'^\s*<(\w+)\b', tag_lines[0].strip())
        tag_name = m_open.group(1) if m_open else "unknown"
        tags.append((tag_start_line, tag_lines[0], {"type": "unclosed", "name": tag_name, "lines": tag_lines}))

    return tags


def extract_props_from_tag(tag_info):
    """Extract prop names and values from a tag's combined text."""
    combined = ' '.join(l.strip() for l in tag_info["lines"])
    props = {}
    # Match prop=value pairs
    # Handle prop="value" and prop={'value'} and prop={value}
    prop_pattern = r'(\w+)\s*=\s*(?:["\']([^"\']*?)["\']|\{[\'"]?([^\'"}]*)[\'"]?\}|\{(\d+)\})'
    for m in re.finditer(prop_pattern, combined):
        prop_name = m.group(1)
        prop_value = m.group(2) or m.group(3) or m.group(4) or ""
        props[prop_name] = prop_value
    # Also catch boolean props (no value)
    bool_prop_pattern = r'\s(\w+)\s*(?=\s|/|>|$)'
    for m in re.finditer(bool_prop_pattern, combined):
        prop_name = m.group(1)
        if prop_name not in props and prop_name.lower() not in ('class', 'classname', 'style', 'key'):
            # Don't flag as prop — these are typically HTML-like attrs
            pass

    return props


def check_malformed_mdx(lines):
    """Check for malformed MDX patterns."""
    issues = []
    text = '\n'.join(lines)

    # Check for broken self-closing syntax: <Tag / instead of <Tag />
    for i, line in enumerate(lines, 1):
        # Pattern: <TagName / without the closing >
        m = re.findall(r'<(\w+)\s[^>]*\s/\s*$', line)
        if m:
            # This matches <Tag ... / at end of line without >
            pass

        # Pattern: space before /> or missing >
        if re.search(r'<\w+\s+[^>]*\s/\s*$', line):
            # Could be continued on next line
            combined = line
            j = i
            while j < len(lines) and '>' not in combined:
                combined += ' ' + lines[j].strip()
                j += 1
            if '/>' not in combined and '>' not in combined:
                issues.append({
                    "type": "malformed_mdx",
                    "line": i,
                    "detail": f"Potentially unclosed tag at line {i}: '{line.strip()[:80]}'"
                })

        # Check for <Tag> without matching </Tag> (basic check)
        m = re.match(r'^\s*<(\w+)(?:\s[^>]*)?>\s*$', line)
        if m:
            tag_name = m.group(1)
            # Skip known void elements
            if tag_name in ('br', 'hr', 'img', 'input', 'meta', 'link'):
                continue
            # Skip self-closing tags: check if the line ends with />
            if re.search(r'/\s*>\s*$', line):
                continue
            # Skip if this line is clearly self-closing (contains /> anywhere)
            if '/>' in line:
                continue
            # Check if there's a closing tag later
            close_found = False
            open_count = 1
            for k in range(i, len(lines)):
                open_matches = len(re.findall(rf'<{tag_name}(?:\s[^>]*)?>', lines[k]))
                close_matches = len(re.findall(rf'</{tag_name}\s*>', lines[k]))
                open_count += open_matches
                open_count -= close_matches
                if open_count <= 0:
                    close_found = True
                    break
                k += 1
            if not close_found and open_count > 0:
                # Only flag if this is likely a component (uppercase first letter)
                if tag_name[0].isupper():
                    issues.append({
                        "type": "malformed_mdx",
                        "line": i,
                        "detail": f"Unclosed component tag <{tag_name}> at line {i}"
                    })

    # Check for malformed attribute quoting
    # Only flag truly broken patterns: unescaped quotes WITHIN a single attribute value
    for i, line in enumerate(lines, 1):
        # Look for suspicious quote patterns in JSX/mdx tags
        # Match: attr="value" where value contains stray unescaped quotes
        # We need to find cases like: alt="He said "hello" there"
        # Valid multi-attr: id="x" layout="y" — these are fine
        # Use a more careful approach: find attr="..." and check for quotes inside
        
        # Find all attribute=value pairs on this line
        attr_pattern = r'(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"'
        for m in re.finditer(attr_pattern, line):
            attr_name = m.group(1)
            attr_val = m.group(2)
            # Check if the attribute value contains a raw quote that would break parsing
            # This would only happen if the value itself had an unescaped "
            # But our regex already captures correctly-quoted values, so skip this check
            # The real issue is when MDX has broken quoting like:
            # alt="text with " quote inside"
            pass
        
        # Instead, detect lines where quote counts are odd (strong signal of broken MDX)
        # But only in lines that look like JSX/HTML tags
        if re.search(r'<\w+', line):
            # Count double-quotes not part of escape sequences (\")
            dq_count = len(re.findall(r'(?<!\\)"', line))
            if dq_count % 2 != 0 and re.search(r'<\w+.*=', line):
                issues.append({
                    "type": "malformed_mdx",
                    "line": i,
                    "detail": f"Odd number of double-quotes in tag line (possible unescaped quote)"
                })

    return issues


def check_visibility_issues(tag_info, tag_name, line_num):
    """Check for invalid/unknown props on known components."""
    issues = []
    if tag_name not in KNOWN_PROPS:
        return issues

    valid_props = KNOWN_PROPS[tag_name]
    if not valid_props:  # Component accepts children only, no known prop checking needed
        return issues

    props = extract_props_from_tag(tag_info)
    for prop_name, prop_value in props.items():
        if prop_name not in valid_props:
            issues.append({
                "type": "visibility",
                "line": line_num,
                "detail": f"<{tag_name}> uses unknown prop '{prop_name}'; valid props: {sorted(valid_props)}"
            })

    # Special check: Callout variant values
    if tag_name == "Callout" and "variant" in props:
        variant = props["variant"]
        if variant not in VALID_CALLOUT_VARIANTS:
            issues.append({
                "type": "visibility",
                "line": line_num,
                "detail": f"<Callout> has unknown variant '{variant}'; valid: {sorted(VALID_CALLOUT_VARIANTS)}"
            })

    return issues


def check_broken_markdown(lines):
    """Check for orphaned markdown formatting markers."""
    issues = []
    in_code_block = False

    for i, line in enumerate(lines, 1):
        # Skip code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        # Skip lines that are inside JSX tags
        if re.match(r'^\s*<', line.strip()):
            continue

        # Count ** and __ markers
        bold_asterisks = line.count('**')
        bold_underscores = line.count('__')

        if bold_asterisks % 2 != 0:
            issues.append({
                "type": "broken_markdown",
                "line": i,
                "detail": f"Orphaned '**' bold marker (odd count: {bold_asterisks})"
            })

        if bold_underscores % 2 != 0:
            issues.append({
                "type": "broken_markdown",
                "line": i,
                "detail": f"Orphaned '__' bold marker (odd count: {bold_underscores})"
            })

        # Check for orphaned italic markers (* and _)
        # Simple: count * characters not part of **
        # This is tricky so we'll be conservative
        single_asterisks = len(re.findall(r'(?<!\*)\*(?!\*)', line))
        if single_asterisks % 2 != 0 and '**' not in line:
            issues.append({
                "type": "broken_markdown",
                "line": i,
                "detail": f"Orphaned '*' italic marker (odd single asterisks: {single_asterisks})"
            })

    return issues


def check_empty_components(tag_info, tag_name, line_num):
    """Check for component tags with no children or props."""
    issues = []
    # Only flag if the tag is truly empty: no props and no content
    combined = ' '.join(l.strip() for l in tag_info["lines"])
    # Count props: look for prop= patterns (values starting with ", ', {, [, or /) 
    prop_count = len(re.findall(r'\w+\s*=\s*["\'{\[/]', combined))
    has_children = False
    
    if tag_info["type"] in ("multi_line_closed",):
        # Check if there's content between open and close
        full_text = ' '.join(l.strip() for l in tag_info["lines"])
        # Get content between the opening > and closing </ 
        content_match = re.search(r'>\s*(.+?)\s*</', full_text, re.DOTALL)
        if content_match and content_match.group(1).strip():
            has_children = True

    if prop_count == 0 and not has_children:
        if tag_info["type"] in ("self_closing", "multi_line_self_closing"):
            issues.append({
                "type": "empty_component",
                "line": line_num,
                "detail": f"<{tag_name} /> has no props and may render nothing"
            })

    return issues


def check_placeholders(lines):
    """Check for [SLATECAMP_UI_BLOCK:...] placeholders."""
    issues = []
    for i, line in enumerate(lines, 1):
        if '[SLATECAMP_UI_BLOCK:' in line:
            issues.append({
                "type": "placeholder",
                "line": i,
                "detail": f"Orphaned UI block placeholder: '{line.strip()[:120]}'"
            })
    return issues


def scan_article(article_dir, slug):
    """Scan a single article for all error types."""
    candidate_path = os.path.join(EXPORT_DIR, article_dir, "candidate.md")
    if not os.path.exists(candidate_path):
        return [{"type": "missing_file", "line": 0, "detail": f"candidate.md not found at {candidate_path}"}]

    with open(candidate_path, "r") as f:
        content = f.read()
        lines = content.split('\n')

    issues = []

    # 1. Malformed MDX
    issues.extend(check_malformed_mdx(lines))

    # 2. Placeholders
    issues.extend(check_placeholders(lines))

    # 3. Broken markdown
    issues.extend(check_broken_markdown(lines))

    # 4. Component-specific checks
    tags = find_component_tags(lines)
    known_components = set(KNOWN_PROPS.keys())

    for tag_line, tag_text, tag_info in tags:
        tag_name = tag_info["name"]

        # Visibility issues
        if tag_name in known_components:
            issues.extend(check_visibility_issues(tag_info, tag_name, tag_line))

        # Empty/dead components
        if tag_name[0].isupper():  # Component-like
            issues.extend(check_empty_components(tag_info, tag_name, tag_line))

    # Deduplicate issues
    seen = set()
    deduped = []
    for issue in issues:
        key = (issue["type"], issue["line"], issue["detail"])
        if key not in seen:
            seen.add(key)
            deduped.append(issue)

    return deduped


def main():
    articles = load_articles()
    print(f"Scanning {len(articles)} articles in Group A...")

    findings = []
    articles_with_issues = 0

    for idx, article in enumerate(articles):
        if (idx + 1) % 20 == 0:
            print(f"  Progress: {idx + 1}/{len(articles)}")

        issues = scan_article(article["dir"], article["slug"])
        if issues:
            articles_with_issues += 1
            findings.append({
                "article_dir": article["dir"],
                "slug": article["slug"],
                "issues": issues
            })

    print(f"\nDone! Scanned {len(articles)} articles, {articles_with_issues} with issues.")

    # Count issue types
    issue_counts = {}
    for f in findings:
        for issue in f["issues"]:
            issue_counts[issue["type"]] = issue_counts.get(issue["type"], 0) + 1

    print("\nIssue type counts:")
    for t, c in sorted(issue_counts.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")

    result = {
        "group": "A",
        "articles_scanned": len(articles),
        "articles_with_issues": articles_with_issues,
        "findings": findings
    }

    with open(OUTPUT_JSON, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\nFindings written to: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
