const fs = require('fs');
const path = require('path');

const EXPORT_DIR = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles';
const ARTICLES_JSON = '/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-B-articles.json';
const OUTPUT_JSON = '/Users/philiplewis/slatecamp/.ai/content-inspection-swarm/group-B-findings.json';

// ── Known valid props from actual component source code ────────────────
const KNOWN_PROPS = {
  ArticleMedia: new Set([
    'id', 'layout', 'variant', 'aspectRatio', 'title', 'description',
    'placementIntent', 'type', 'status', 'src', 'youtubeId', 'embedUrl',
    'alt', 'caption', 'credit', 'sourceUrl', 'suggestedAsset',
    'suggestedSearchQuery', 'replacementNotes', 'carouselCount'
  ]),
  // WikiMistakeCardRawProps — union of all three conventions per src/types/wiki.ts
  WikiMistakeCard: new Set([
    'mistake', 'correction', 'context',           // Convention A
    'number', 'title', 'wrongValue', 'correctValue', 'explanation', 'sourceRef', // Convention B
    'body',                                        // Convention C
  ]),
  Callout: new Set(['variant', 'title']),
  WikiExamTable: new Set(['headers', 'rows', 'id']),
  WikiMistakeList: new Set(['mistakes', 'items', 'id']),
  ExamTip: new Set(['id']),
  Note: new Set(['id']),
  DefinitionCard: new Set(['term', 'definition', 'id', 'variant']),
  ExampleCard: new Set(['title', 'example', 'id', 'variant']),
  TipCard: new Set(['title', 'tip', 'id', 'variant']),
  WarningCard: new Set(['title', 'warning', 'id', 'variant']),
  InfoCard: new Set(['title', 'info', 'id', 'variant']),
  KeyTakeaway: new Set(['title', 'takeaway', 'id']),
  Accordion: new Set(['title', 'id', 'defaultOpen']),
  Tabs: new Set(['tabs', 'defaultTab', 'id']),
  Tab: new Set(['label', 'id']),
  Quiz: new Set(['question', 'answers', 'correctAnswer', 'explanation', 'id']),
  VideoEmbed: new Set(['src', 'youtubeId', 'title', 'id', 'autoplay', 'controls']),
  ImageZoom: new Set(['src', 'alt', 'caption', 'id']),
  Citation: new Set(['text', 'source', 'url', 'id']),
  Blockquote: new Set(['author', 'source', 'id']),
  TableOfContents: new Set(['items', 'id']),
  RelatedArticles: new Set(['articles', 'id']),
};

// ── Helpers ────────────────────────────────────────────────────────────

function isDiagnosticLine(line) {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith('- Props:') ||
    trimmed.startsWith('- Text:') ||
    trimmed.startsWith('Extracted summary:') ||
    trimmed.startsWith('[Remove this row') ||
    /^\[.*\]:\s*#\s*\(/.test(trimmed)  // markdown link ref definitions
  );
}

/**
 * Parse JSX-style attribute names from an attributes string.
 * Uses a simple state machine to avoid matching inside quoted strings or braces.
 * Returns an array of { name, lineOffset } objects.
 */
function parseAttributeNames(attrStr) {
  const names = [];
  let i = 0;
  const len = attrStr.length;
  
  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(attrStr[i])) i++;
    if (i >= len) break;
    
    // If we hit a quote or brace, skip the entire quoted/braced section
    if (attrStr[i] === '"' || attrStr[i] === "'") {
      const quote = attrStr[i];
      i++;
      while (i < len && attrStr[i] !== quote) {
        if (attrStr[i] === '\\') i++; // skip escaped char
        i++;
      }
      if (i < len) i++; // skip closing quote
      continue;
    }
    
    if (attrStr[i] === '{') {
      let depth = 1;
      i++;
      while (i < len && depth > 0) {
        if (attrStr[i] === '{') depth++;
        else if (attrStr[i] === '}') depth--;
        else if (attrStr[i] === '"' || attrStr[i] === "'") {
          const q = attrStr[i];
          i++;
          while (i < len && attrStr[i] !== q) {
            if (attrStr[i] === '\\') i++;
            i++;
          }
        }
        i++;
      }
      continue;
    }
    
    if (attrStr[i] === '>' || attrStr[i] === '/') {
      break;
    }
    
    // Try to match an attribute name: word followed by =
    const start = i;
    while (i < len && /[a-zA-Z0-9_]/.test(attrStr[i])) i++;
    const name = attrStr.substring(start, i);
    
    // Skip whitespace before =
    while (i < len && /\s/.test(attrStr[i])) i++;
    
    if (i < len && attrStr[i] === '=') {
      if (name.length > 0 && name[0].toLowerCase() === name[0]) {
        names.push({ name, offset: start });
      }
      i++; // skip =
      // Skip value (quote string or brace expression)
      while (i < len && /\s/.test(attrStr[i])) i++;
      if (i < len) {
        if (attrStr[i] === '"' || attrStr[i] === "'") {
          const quote = attrStr[i];
          i++;
          while (i < len && attrStr[i] !== quote) {
            if (attrStr[i] === '\\') i++;
            i++;
          }
          if (i < len) i++;
        } else if (attrStr[i] === '{') {
          let depth = 1;
          i++;
          while (i < len && depth > 0) {
            if (attrStr[i] === '{') depth++;
            else if (attrStr[i] === '}') depth--;
            else if (attrStr[i] === '"' || attrStr[i] === "'") {
              const q = attrStr[i];
              i++;
              while (i < len && attrStr[i] !== q) {
                if (attrStr[i] === '\\') i++;
                i++;
              }
            }
            i++;
          }
        }
      }
    } else {
      // Boolean attribute (no =value), skip
      i = start + name.length;
    }
  }
  
  return names;
}

function getAllArticleDirs() {
  return JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf-8'));
}

function readCandidateFile(dir) {
  const filePath = path.join(EXPORT_DIR, dir, 'candidate.md');
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// ── Checkers ───────────────────────────────────────────────────────────

function findMalformedMdx(lines) {
  const issues = [];
  
  // First, filter to actual content lines (not diagnostic)
  const contentLines = [];
  const lineMap = []; // contentLines[i] -> original line number
  for (let i = 0; i < lines.length; i++) {
    if (!isDiagnosticLine(lines[i])) {
      contentLines.push(lines[i]);
      lineMap.push(i + 1);
    }
  }
  
  // Check for broken self-closing: <Tag / without >
  for (let ci = 0; ci < contentLines.length; ci++) {
    const line = contentLines[ci];
    const origLine = lineMap[ci];
    
    // <Something ... / at end of line without closing >
    if (/<[A-Z][a-zA-Z]*\s/.test(line)) {
      const stripped = line.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '').replace(/\{[^}]*\}/g, '');
      // Check for / without closing >
      if (/\/\s*$/.test(stripped) && !/>\s*$/.test(stripped)) {
        issues.push({
          type: 'malformed_mdx',
          line: origLine,
          detail: `Tag may have broken self-closing syntax — ends with / but missing >`
        });
      }
    }
  }
  
  // Check for unclosed MDX tags
  const tagStack = [];
  const allTagRe = /<\/?([A-Z][a-zA-Z]*)(\s[^>]*?)?(\/)?>/g;
  for (let ci = 0; ci < contentLines.length; ci++) {
    const line = contentLines[ci];
    const origLine = lineMap[ci];
    
    allTagRe.lastIndex = 0;
    let match;
    while ((match = allTagRe.exec(line)) !== null) {
      const tagName = match[1];
      const isClose = match[0].startsWith('</');
      const isSelfClosing = match[0].endsWith('/>');
      
      if (isSelfClosing) continue;
      
      if (isClose) {
        if (tagStack.length === 0) {
          issues.push({
            type: 'malformed_mdx',
            line: origLine,
            detail: `Unexpected closing tag </${tagName}> with no matching open tag`
          });
        } else {
          // Find matching open tag (handle nesting)
          let found = -1;
          for (let s = tagStack.length - 1; s >= 0; s--) {
            if (tagStack[s].tag === tagName) {
              found = s;
              break;
            }
          }
          if (found === -1) {
            issues.push({
              type: 'malformed_mdx',
              line: origLine,
              detail: `Unexpected closing tag </${tagName}> — no matching open tag found in document`
            });
          } else {
            // Report any unclosed inner tags
            for (let s = tagStack.length - 1; s > found; s--) {
              issues.push({
                type: 'malformed_mdx',
                line: tagStack[s].line,
                detail: `Unclosed MDX tag <${tagStack[s].tag}> — implicitly closed by </${tagName}>`
              });
            }
            tagStack.length = found;
          }
        }
      } else {
        tagStack.push({ tag: tagName, line: origLine });
      }
    }
  }
  
  // Report remaining unclosed tags
  for (const unclosed of tagStack) {
    issues.push({
      type: 'malformed_mdx',
      line: unclosed.line,
      detail: `Unclosed MDX tag <${unclosed.tag}> opened here but never closed`
    });
  }
  
  return issues;
}

function findVisibilityIssues(lines) {
  const issues = [];
  
  // Find all component usages and check their props
  const componentRe = /<([A-Z][a-zA-Z]*)(\s[^>]*?)(\/)?>/g;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDiagnosticLine(line)) continue;
    
    componentRe.lastIndex = 0;
    let match;
    while ((match = componentRe.exec(line)) !== null) {
      const componentName = match[1];
      const attrsStr = match[2];
      
      const validProps = KNOWN_PROPS[componentName];
      if (!validProps) continue;
      
      const attrNames = parseAttributeNames(attrsStr);
      for (const attr of attrNames) {
        if (!validProps.has(attr.name)) {
          // Skip obvious false positives: attributes that look like they're from inside strings
          // (single letter, or parts of technical terms)
          issues.push({
            type: 'visibility',
            line: i + 1,
            detail: `<${componentName}> uses unrecognized prop '${attr.name}'. Known props: [${[...validProps].sort().join(', ')}]`
          });
        }
      }
    }
  }
  
  return issues;
}

function findBrokenMarkdown(lines) {
  const issues = [];
  
  // Track whether we're in a code block
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDiagnosticLine(line)) continue;
    
    // Track code blocks
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    
    // Orphaned ** markers
    const stars = (line.match(/\*\*/g) || []).length;
    if (stars % 2 !== 0) {
      issues.push({
        type: 'broken_markdown',
        line: i + 1,
        detail: `Orphaned bold marker (**): odd count (${stars}). May render literal "**" in output`
      });
    }
    
    // Orphaned __ markers (but not inside words like __dirname)
    const underscores = (line.match(/(?<!\w)__(?!\w)/g) || []).length;
    if (underscores % 2 !== 0) {
      issues.push({
        type: 'broken_markdown',
        line: i + 1,
        detail: `Orphaned bold marker (__): odd count (${underscores}). May render literal "__" in output`
      });
    }
    
    // Orphaned backticks (single, not triple)
    const singleBackticks = (line.match(/(?<!`)`(?!`)/g) || []).length;
    if (singleBackticks % 2 !== 0) {
      issues.push({
        type: 'broken_markdown',
        line: i + 1,
        detail: `Orphaned backtick: odd count (${singleBackticks}). May render literal "\`" in output`
      });
    }
  }
  
  return issues;
}

function findEmptyComponents(lines) {
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDiagnosticLine(line)) continue;
    
    // Self-closing tags with no props at all
    const emptySelfRe = /<([A-Z][a-zA-Z]*)\s*\/>/g;
    let match;
    while ((match = emptySelfRe.exec(line)) !== null) {
      issues.push({
        type: 'empty_component',
        line: i + 1,
        detail: `<${match[1]} /> is self-closing with no props — will render as empty space`
      });
    }
    
    // Empty tag pairs on the same line
    const emptyPairRe = /<([A-Z][a-zA-Z]*)(\s[^>]*?)?>\s*<\/([A-Z][a-zA-Z]*)>/g;
    while ((match = emptyPairRe.exec(line)) !== null) {
      if (match[1] === match[3]) {
        issues.push({
          type: 'empty_component',
          line: i + 1,
          detail: `<${match[1]}>...</${match[3]}> has no children — will render as empty space`
        });
      }
    }
  }
  
  return issues;
}

function findPlaceholders(lines) {
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDiagnosticLine(line)) continue;
    
    // Remaining SLATECAMP_UI_BLOCK placeholders
    if (/\[SLATECAMP_(?:UI_BLOCK|PLACEHOLDER|COMPONENT|MEDIA|IMAGE|VIDEO|AUDIO):[^\]]*\]/i.test(line)) {
      issues.push({
        type: 'placeholder',
        line: i + 1,
        detail: `Remaining SLATECAMP placeholder: ${line.trim().substring(0, 120)}`
      });
    }
    
    // Other common placeholder markers in article text
    if (/\[(?:TODO|FIXME|TBD)\]/i.test(line)) {
      issues.push({
        type: 'placeholder',
        line: i + 1,
        detail: `Placeholder marker found: ${line.trim().substring(0, 120)}`
      });
    }
  }
  
  return issues;
}

// ── Main ───────────────────────────────────────────────────────────────

function main() {
  const articles = getAllArticleDirs();
  console.log(`Total articles to scan: ${articles.length}`);
  
  const findings = [];
  let scanned = 0;
  let withIssues = 0;
  
  for (const article of articles) {
    const content = readCandidateFile(article.dir);
    if (content === null) {
      console.log(`  SKIP: ${article.dir} — candidate.md not found`);
      continue;
    }
    
    scanned++;
    const lines = content.split('\n');
    const allIssues = [];
    
    allIssues.push(...findMalformedMdx(lines));
    allIssues.push(...findVisibilityIssues(lines));
    allIssues.push(...findBrokenMarkdown(lines));
    allIssues.push(...findEmptyComponents(lines));
    allIssues.push(...findPlaceholders(lines));
    
    if (allIssues.length > 0) {
      withIssues++;
      findings.push({
        article_dir: article.dir,
        slug: article.slug,
        issues: allIssues
      });
      // Only log articles with >0 issues for concise output
    }
  }
  
  // Compute issue type counts
  const typeCounts = {};
  for (const f of findings) {
    for (const issue of f.issues) {
      typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
    }
  }
  
  const output = {
    group: 'B',
    articles_scanned: scanned,
    articles_with_issues: withIssues,
    findings: findings,
    issue_type_summary: typeCounts
  };
  
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
  console.log(`\n=== RESULTS ===`);
  console.log(`Articles scanned: ${scanned}`);
  console.log(`Articles with issues: ${withIssues}`);
  console.log(`Total issues: ${Object.values(typeCounts).reduce((a, b) => a + b, 0)}`);
  console.log(`\nIssue type breakdown:`);
  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    console.log(`  ${type}: ${count}`);
  }
  
  // Print articles with issues summary
  if (withIssues > 0) {
    console.log(`\nArticles with issues:`);
    for (const f of findings) {
      const typeStr = [...new Set(f.issues.map(i => i.type))].join(', ');
      console.log(`  ${f.slug} (${f.issues.length}) [${typeStr}]`);
    }
  }
  
  console.log(`\nFindings written to: ${OUTPUT_JSON}`);
}

main();
