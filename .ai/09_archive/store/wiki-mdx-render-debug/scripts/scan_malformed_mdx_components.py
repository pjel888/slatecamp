#!/usr/bin/env python3
"""Scan all 567 articles for malformed MDX custom component syntax."""

import json
import os
import re
import sys
from pathlib import Path

ARTICLES_DIR = Path('/Users/philiplewis/slatecamp/.ai/content-audit-export/articles')
OUTPUT_DIR = Path('/Users/philiplewis/slatecamp/.ai/wiki-mdx-render-debug')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Known component lists (mirrors src/lib/wiki-component-registry.ts)
BLOCK_COMPONENTS = [
    'Note', 'Warn', 'Warning', 'Tip', 'Example', 'Callout', 'ExamTip',
    'AlertBox', 'CalloutBox', 'WikiCalloutBox', 'AuthorityContent', 'LawCallout',
    'Accordion', 'AccordionItem', 'Tabs', 'Tab', 'RevealBlock',
    'WikiMistakeCard', 'WikiMistakeList', 'MistakeCard', 'MistakeList', 'Mistakes',
    'ElaborativeInterrogation', 'EIPrompt', 'EIBlock', 'ComparisonTable',
    'WikiExamTable', 'SubjectSnapshot', 'FormulaBlock', 'InlineQuiz',
]
ALL_REGISTERED = BLOCK_COMPONENTS + [
    'ArticleMedia', 'WikiReference', 'Mermaid', 'WikiChangedPill',
    'WikiArticleHero', 'WikiPartHeader', 'SPP206RefServices', 'SPP207RefServices',
    'ConflictMatrix', 'EthicalFramework', 'RegulationFramework', 'WikiExactTable',
    'InfoBox', 'Alert', 'QuestionBank', 'ComparisonChart', 'TechnicalBox',
    'DataQualitySpec', 'DataTable', 'ComplianceChecklist', 'SensorTable',
    'BEMSFunctionality', 'EnergyDashboard', 'PriceBreakdown',
    'KeyValues', 'GenericBlock',
]
SELF_CLOSING = [
    'ArticleMedia', 'WikiReference', 'Mermaid', 'WikiChangedPill',
    'WikiArticleHero', 'WikiPartHeader', 'SPP206RefServices', 'SPP207RefServices',
    'ConflictMatrix', 'EthicalFramework', 'RegulationFramework', 'WikiExactTable',
    'InfoBox', 'Alert', 'QuestionBank', 'ComparisonChart', 'TechnicalBox',
    'DataQualitySpec', 'DataTable', 'ComplianceChecklist', 'SensorTable',
    'BEMSFunctionality', 'EnergyDashboard', 'PriceBreakdown',
]

BLOCK_SET = set(BLOCK_COMPONENTS)
ALL_SET = set(ALL_REGISTERED)
SELF_CLOSING_SET = set(SELF_CLOSING)

def scan_file(filepath: Path) -> list:
    """Scan a single normalized.md file for malformed MDX."""
    issues = []
    content = filepath.read_text(encoding='utf-8')
    lines = content.split('\n')
    
    # Self-closing tag patterns (multi-line)
    # ArticleMedia spans multiple lines, so we track open tags differently
    
    in_code_fence = False
    open_blocks: list[tuple[str, int]] = []  # (component_name, line_number)
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Track code fences
        if stripped.startswith('```'):
            in_code_fence = not in_code_fence
            continue
        if in_code_fence:
            continue
        
        # Skip lines inside markdown tables (contain |)
        if stripped.startswith('|'):
            continue
        
        # Check for same-line paired block components
        # Pattern: <Component>content</Component> on same line
        for comp in BLOCK_COMPONENTS:
            # Build pattern for <Component>...content...</Component> on same line
            # Must not be self-closing (no />)
            pat = re.compile(
                rf'<{comp}(?:\s[^>]*)?>[^<\n]+</{comp}\s*>'
            )
            if pat.search(stripped):
                issues.append({
                    'type': 'same-line-paired',
                    'component': comp,
                    'line': i,
                    'snippet': stripped[:120],
                    'description': f'{comp} has content on same line as both tags'
                })
        
        # Detect opening tags for registered components
        # <Component> or <Component attr="val">
        open_match = re.match(rf'^<({"|".join(ALL_REGISTERED)})(\s[^>]*)?>$', stripped)
        if open_match:
            comp = open_match.group(1)
            if comp in BLOCK_SET:
                # Check if next non-blank line exists and isn't blank
                next_line_idx = i  # 0-indexed in lines array
                found_blank = False
                for j in range(i, len(lines)):
                    if lines[j].strip() == '':
                        found_blank = True
                        break
                    if j > i and re.match(r'^<', lines[j].strip()):
                        # Next line is another tag, that's fine
                        break
                if not found_blank and i < len(lines) and lines[i].strip():
                    # No blank line after opening tag
                    next_content = lines[i].strip() if i < len(lines) else ''
                    issues.append({
                        'type': 'missing-blank-after-open',
                        'component': comp,
                        'line': i,
                        'snippet': f'{stripped[:60]} ... {next_content[:60]}',
                        'description': f'{comp} opening tag lacks blank line before content'
                    })
            
            open_blocks.append((comp, i))
            continue
        
        # Detect closing tags
        close_match = re.match(rf'^</({"|".join(ALL_REGISTERED)})\s*>$', stripped)
        if close_match:
            comp = close_match.group(1)
            if open_blocks:
                last_open = open_blocks[-1]
                if last_open[0] == comp:
                    open_blocks.pop()
                else:
                    # Check if this matches any open tag
                    found = False
                    for idx in range(len(open_blocks) - 1, -1, -1):
                        if open_blocks[idx][0] == comp:
                            # Close the match, but also note mismatch
                            open_blocks.pop(idx)
                            found = True
                            break
                    if not found:
                        issues.append({
                            'type': 'unmatched-close',
                            'component': comp,
                            'line': i,
                            'snippet': stripped[:80],
                            'description': f'Closing tag </{comp}> has no matching open tag'
                        })
            else:
                issues.append({
                    'type': 'extra-close',
                    'component': comp,
                    'line': i,
                    'snippet': stripped[:80],
                    'description': f'Extra closing tag </{comp}> with no open tag'
                })
            continue
        
        # Check for multi-line self-closing component start
        # <ArticleMedia, <WikiMistakeCard, etc.
        multiline_match = re.match(rf'^<({"|".join(ALL_REGISTERED)})(\s[^>]*)>?$', stripped)
        if multiline_match:
            comp = multiline_match.group(1)
            # If the rest of the tag doesn't close on this line (no > or />)
            if stripped.endswith('/>'):
                pass  # Self-closed on one line
            elif not stripped.endswith('>'):
                pass  # Continues on next line(s) — needs tracking
            elif comp in SELF_CLOSING_SET and not '/>' in stripped and stripped.endswith('>'):
                # Self-closing component without /> might be a problem
                pass  # Many self-closing components span multiple lines ending with />
    
    # Check for unclosed blocks
    for comp, line_num in open_blocks:
        issues.append({
            'type': 'unclosed-tag',
            'component': comp,
            'line': line_num,
            'snippet': f'</{comp}> never found',
            'description': f'{comp} opened at line {line_num} is never closed'
        })
    
    return issues

def main():
    # Get all article directories
    if not ARTICLES_DIR.exists():
        print(f"ERROR: Articles directory not found: {ARTICLES_DIR}")
        sys.exit(1)
    
    article_dirs = sorted([d for d in ARTICLES_DIR.iterdir() if d.is_dir()])
    print(f"Found {len(article_dirs)} article directories")
    
    all_results = []
    articles_with_issues = 0
    total_issues = 0
    issue_type_counts: dict[str, int] = {}
    component_issue_counts: dict[str, int] = {}
    
    for article_dir in article_dirs:
        norm_path = article_dir / 'normalized.md'
        if not norm_path.exists():
            continue
        
        # Extract slug from directory name (remove UUID suffix)
        dir_name = article_dir.name
        slug = re.sub(r'--[a-f0-9-]+$', '', dir_name)
        
        issues = scan_file(norm_path)
        
        if issues:
            articles_with_issues += 1
            total_issues += len(issues)
            
            slug_issues = []
            for issue in issues:
                issue_type_counts[issue['type']] = issue_type_counts.get(issue['type'], 0) + 1
                comp = issue.get('component', 'unknown')
                component_issue_counts[comp] = component_issue_counts.get(comp, 0) + 1
                slug_issues.append(issue)
            
            all_results.append({
                'slug': slug,
                'dir': article_dir.name,
                'issue_count': len(issues),
                'issues': slug_issues,
            })
    
    # Write JSON report
    report = {
        'scan_date': str(Path(OUTPUT_DIR / 'scan_timestamp').touch() or ''),
        'total_articles': len(article_dirs),
        'articles_with_issues': articles_with_issues,
        'total_issues': total_issues,
        'issue_type_breakdown': dict(sorted(issue_type_counts.items(), key=lambda x: -x[1])),
        'component_breakdown': dict(sorted(component_issue_counts.items(), key=lambda x: -x[1])),
        'articles': sorted(all_results, key=lambda x: -x['issue_count']),
    }
    
    json_path = OUTPUT_DIR / 'malformed-mdx-component-scan.json'
    json_path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(f"Wrote: {json_path}")
    
    # Write MD report
    md_lines = [
        '# Malformed MDX Component Scan Report',
        '',
        f'**Scan date:** 2026-05-04',
        f'**Total articles scanned:** {len(article_dirs)}',
        f'**Articles with issues:** {articles_with_issues}',
        f'**Total issues found:** {total_issues}',
        '',
        '## Issue Type Breakdown',
        '',
        '| Type | Count |',
        '|------|-------|',
    ]
    for itype, count in sorted(issue_type_counts.items(), key=lambda x: -x[1]):
        md_lines.append(f'| {itype} | {count} |')
    
    md_lines.extend([
        '',
        '## Component Breakdown',
        '',
        '| Component | Issue Count |',
        '|-----------|-------------|',
    ])
    for comp, count in sorted(component_issue_counts.items(), key=lambda x: -x[1]):
        md_lines.append(f'| {comp} | {count} |')
    
    md_lines.extend(['', '## Articles with Issues', ''])
    
    for article in sorted(all_results, key=lambda x: -x['issue_count']):
        md_lines.append(f'### {article["slug"]}')
        md_lines.append(f'**Issues:** {article["issue_count"]}')
        md_lines.append('')
        for issue in article['issues']:
            md_lines.append(f'- **[`{issue["type"]}`]** Line {issue["line"]}: {issue["description"]}')
            md_lines.append(f'  `{issue["snippet"]}`')
        md_lines.append('')
    
    md_path = OUTPUT_DIR / 'malformed-mdx-component-scan.md'
    md_path.write_text('\n'.join(md_lines), encoding='utf-8')
    print(f"Wrote: {md_path}")
    
    # Print summary
    print(f'\n=== SCAN SUMMARY ===')
    print(f'Total articles: {len(article_dirs)}')
    print(f'Articles with issues: {articles_with_issues}')
    print(f'Total issues: {total_issues}')
    print(f'\nIssue type breakdown:')
    for itype, count in sorted(issue_type_counts.items(), key=lambda x: -x[1]):
        print(f'  {itype}: {count}')
    print(f'\nComponent breakdown:')
    for comp, count in sorted(component_issue_counts.items(), key=lambda x: -x[1]):
        print(f'  {comp}: {count}')

if __name__ == '__main__':
    main()
