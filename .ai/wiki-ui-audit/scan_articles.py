#!/usr/bin/env python3
"""
Enhanced scan of all 567 articles for best-fit matches to unused wiki components.
Better patterns, richer quotes, more discriminative scoring.
Output: unused-component-article-matches.json
"""
import json, os, re, sys
from collections import defaultdict
from pathlib import Path

ARTICLES_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
OUTPUT_FILE = Path("/Users/philiplewis/slatecamp/.ai/wiki-ui-audit/unused-component-article-matches.json")

def load_article(path):
    candidate = path / "candidate.md"
    metadata = path / "article-metadata.json"
    lq = path / "linked-questions.json"
    
    result = {"dir": str(path), "slug": path.name}
    
    if candidate.exists():
        result["content"] = candidate.read_text(encoding="utf-8", errors="ignore")
    else:
        result["content"] = ""
    
    if metadata.exists():
        try:
            result["meta"] = json.loads(metadata.read_text())
        except:
            result["meta"] = {}
    else:
        result["meta"] = {}
    
    if lq.exists():
        try:
            raw = json.loads(lq.read_text())
            if isinstance(raw, dict):
                # Handle {"questions": [...], "question_count": N} format
                result["linked_questions"] = raw.get("questions", [])
                result["question_count"] = raw.get("question_count", len(result["linked_questions"]))
            elif isinstance(raw, list):
                result["linked_questions"] = raw
                result["question_count"] = len(raw)
            else:
                result["linked_questions"] = []
                result["question_count"] = 0
        except:
            result["linked_questions"] = []
            result["question_count"] = 0
    else:
        result["linked_questions"] = []
        result["question_count"] = 0
    
    slug = path.name
    result["article_id"] = slug.split("--")[-1] if "--" in slug else slug
    result["readable_name"] = slug.split("--")[0].replace("-", " ").title()
    
    return result

def extract_context(text, match_str, context_chars=300):
    """Find match_str in text and return surrounding context."""
    idx = text.lower().find(match_str.lower())
    if idx < 0:
        return match_str[:context_chars]
    start = max(0, idx - 50)
    end = min(len(text), idx + len(match_str) + context_chars)
    return text[start:end].strip()

def scan_all_articles():
    articles = []
    for d in sorted(ARTICLES_DIR.iterdir()):
        if d.is_dir():
            articles.append(load_article(d))
    print(f"Loaded {len(articles)} articles", file=sys.stderr)
    return articles

# ============================
# IMPROVED SCORING FUNCTIONS
# ============================

def score_mermaid(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # 1. Numbered step-by-step processes (2+ sequential numbered items)
    numbered_blocks = re.findall(r'(?:(?:^|\n)\s*(?:\d+[\.\)])\s+.+){3,}', content, re.MULTILINE)
    if numbered_blocks:
        block_lines = numbered_blocks[0].strip().split('\n')
        step_count = len(block_lines)
        score += min(step_count * 2, 15)
        reasons.append(f"numbered process: {step_count} sequential steps")
        quotes.append('\n'.join(block_lines[:4]))
    
    # 2. Decision tree / if-then logic
    if_then_count = len(re.findall(r'\bif\s.{10,150}?\bthen\b', lower))
    if if_then_count >= 2:
        score += min(if_then_count * 3, 15)
        reasons.append(f"decision tree: {if_then_count} if-then branches")
        # Find a good if-then block
        dt = re.search(r'if\s.{10,200}?\bthen\b.{10,200}', lower)
        if dt:
            quotes.append(extract_context(content, dt.group(0)))
    
    # 3. Flow/keywords signaling diagrams
    flow_signal = len(re.findall(r'\b(?:flow\s*chart|flow\s*diagram|decision\s*tree|process\s*flow|workflow|decision\s*framework)\b', lower))
    if flow_signal:
        score += flow_signal * 5
        reasons.append(f"explicit flow/diagram mention: {flow_signal}")
    
    # 4. Lifecycle/phase descriptions
    lifecycle = len(re.findall(r'\b(?:life\s*cycle|phase[s]?\s*[IVX\d]|stage[s]?\s*[IVX\d]|sequence\s*of)\b', lower))
    if lifecycle:
        score += lifecycle * 2
        reasons.append(f"lifecycle/phases: {lifecycle}")
    
    # 5. Classification hierarchies
    hierarchy = len(re.findall(r'\b(?:classified\s*(?:as|into|by)|categor(?:y|ies|ized)|types?\s*(?:of|include|:)|groups?\s*(?:[IVX\d]+|A|B|C)\b)', lower))
    if hierarchy >= 3:
        score += min(hierarchy, 10)
        reasons.append(f"classification hierarchy: {hierarchy} terms")
    
    if not quotes:
        proc = re.search(r'(?:process|procedure|method|sequence|steps?).{0,500}', lower)
        if proc:
            quotes.append(extract_context(content, proc.group(0)))
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_formula_block(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # 1. Actual formula patterns: variable = expression  
    formulas = re.findall(r'(?:[A-Za-z_]\w*\s*=\s*[\d.]+\s*[×*/+\-]\s*[\d.]+|[A-Za-z_]\w*\s*=\s*[\d.]+\s*(?:sq\.?\s*(?:m|ft)|square\s*(?:meter|foot|metre))|\b(?:area|width|height|length|depth|volume|span|load|stress|pressure)\s*=\s*.{5,80})', content)
    if formulas:
        score += len(formulas) * 4
        reasons.append(f"formula expressions: {len(formulas)}")
        quotes.extend(f.strip()[:200] for f in formulas[:3])
    
    # 2. Percentage/ratio calculations
    pct_calcs = len(re.findall(r'\b(?:percent(?:age)?\s*(?:of|is|=)|%\s*(?:of|is|=)|ratio\s*(?:of|is|=))\s*.{5,60}', lower))
    if pct_calcs:
        score += pct_calcs * 2
        reasons.append(f"percentage/ratio calculations: {pct_calcs}")
    
    # 3. Allowable area / structural calculations  
    struct_calcs = len(re.findall(r'\b(?:allowable\s*(?:area|load|stress|span)|tributary\s*area|dead\s*load|live\s*load|wind\s*load|seismic\s*(?:load|force|weight)|bearing\s*capacity|load\s*bearing|moment\s*of\s*inertia|section\s*modulus)\b', lower))
    if struct_calcs:
        score += struct_calcs * 3
        reasons.append(f"structural calc terms: {struct_calcs}")
    
    # 4. Multipliers and factors
    multipliers = len(re.findall(r'\b(?:multipl(?:y|ied|ier)\s*(?:by|of)|factor\s*(?:of|is|=)|times\s*\d|×\s*\d|coefficient\s*(?:of|is))\b', lower))
    if multipliers:
        score += multipliers * 2
        reasons.append(f"multiplier/factor terms: {multipliers}")
    
    # 5. Square footage / area computations
    area_comp = len(re.findall(r'\b(?:square\s*(?:meter|foot|metre)|sq\.?\s*(?:m|ft)\.?|floor\s*area\s*(?:ratio|is|=)|GFA|TFA|BHL|building\s*footprint)\b', lower))
    if area_comp:
        score += area_comp
        reasons.append(f"area computation terms: {area_comp}")
    
    if not quotes:
        calc = re.search(r'(?:calculation|computation|formula|determined?\s*(?:as|by)).{0,400}', lower)
        if calc:
            quotes.append(extract_context(content, calc.group(0)))
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_tabs(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # 1. Headers comparing two+ parallel things
    h2s = re.findall(r'^##\s+(.+)$', content, re.MULTILINE)
    parallel_h2s = []
    for h in h2s:
        hl = h.lower().strip()
        if re.search(r'\b(?:type|category|group|class|scenario|option|method|case|era|period|style|code)\s*[:\-]?\s*(?:[AI12]|[AI]:|1[.:]|2[.:]|[AB][.:]|one|two|first|second)', hl):
            parallel_h2s.append(h.strip())
        elif re.search(r'\b(?:residential|commercial|industrial|assembly|institutional|storage|hazardous|mercantile)\b', hl):
            parallel_h2s.append(h.strip())
        elif re.search(r'\b(?:type\s*(?:I|II|III|IV|V)|group\s*(?:[A-I]))\b', hl):
            parallel_h2s.append(h.strip())
    if len(parallel_h2s) >= 2:
        score += len(parallel_h2s) * 4
        reasons.append(f"parallel section headers: {len(parallel_h2s)}")
        quotes.append(f"Parallel sections: {' | '.join(parallel_h2s[:6])}")
    
    # 2. Multiple codes/standards compared
    codes = set(re.findall(r'\b(?:PD\s*1096|BP\s*344|NSCP|PEC|NBCP|IRR|RA\s*\d+|UAP\s*Doc\s*\d+|SPP)\b', content))
    if len(codes) >= 2:
        score += len(codes) * 3
        reasons.append(f"multiple codes: {', '.join(sorted(codes)[:5])}")
        quotes.append(f"References: {', '.join(sorted(codes)[:5])}")
    
    # 3. Vs/comparison language
    vs_patterns = len(re.findall(r'\b(?:versus|vs\.?|compared?\s*(?:to|with)|in\s*contrast|unlike|whereas|on\s*the\s*other\s*hand|differ(?:s|ent|ence\s*(?:between|in)))\b', lower))
    if vs_patterns:
        score += min(vs_patterns, 10)
        reasons.append(f"comparison signals: {vs_patterns}")
    
    # 4. Two eras/styles  
    eras = len(re.findall(r'\b(?:pre-colonial|colonial|american\s*(?:era|period)|post-war|modern(?:ist|ism)?|contemporary|brutalist|renaissance|baroque|neo-?classic)\b', lower))
    if eras >= 2:
        score += eras * 3
        reasons.append(f"multiple era/style mentions: {eras}")
    
    # 5. "Types of" patterns with enumerated lists
    type_lists = len(re.findall(r'(?:types?\s*(?:of|include)[:\s].{5,300}?(?:\n\s*(?:[-•*]|\d+[\.\)])\s*.+){2,})', lower, re.DOTALL))
    if type_lists:
        score += type_lists * 3
        reasons.append(f"enumerated type lists: {type_lists}")
    
    if not quotes:
        comp = re.search(r'(?:compar|versus|vs\.|unlike|whereas|in contrast|differ).{0,400}', lower)
        if comp:
            quotes.append(extract_context(content, comp.group(0)))
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_reveal_block(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # 1. "Test yourself" or self-check patterns
    test_patterns = re.findall(r'(?:test\s*your\s*(?:self|knowledge|understanding)|check\s*your\s*(?:knowledge|understanding|answer|work)|can\s*you\s*(?:identify|name|list|recall|remember|spot|find|determine)|try\s*(?:it|this|to|answering))\s*.{0,200}', lower)
    if test_patterns:
        score += len(test_patterns) * 5
        reasons.append(f"test-yourself: {len(test_patterns)}")
        quotes.append(extract_context(content, test_patterns[0]))
    
    # 2. Common mistakes / don't confuse - great for reveal
    mistake_patterns = re.findall(r'(?:common\s*(?:mistake|error|pitfall|trap|misconception)|don\'?t\s*confuse|watch\s*out\s*for|be\s*careful|beware|tricky|easily\s*(?:confused|mistaken))\s*.{0,200}', lower)
    if mistake_patterns:
        score += len(mistake_patterns) * 4
        reasons.append(f"common mistakes: {len(mistake_patterns)}")
        quotes.append(extract_context(content, mistake_patterns[0]))
    
    # 3. Answer/solution reveal
    answer_hidden = re.findall(r'(?:answer|solution|correct\s*(?:answer|response|choice)|the\s*(?:secret|trick|key)\s*(?:is|:)|here\'?s?\s*(?:why|what|how))\s*.{0,200}', lower)
    if answer_hidden:
        score += len(answer_hidden) * 3
        reasons.append(f"answer reveals: {len(answer_hidden)}")
    
    # 4. Spoiler/surprise content
    spoilers = len(re.findall(r'\b(?:surprising|surprisingly|counter-?intuitive|lesser.?known|little.?known|often\s*overlooked|hidden|secret\s*(?:to|of))\b', lower))
    if spoilers:
        score += spoilers * 2
        reasons.append(f"spoiler content: {spoilers}")
    
    # 5. Example + answer pairs  
    example_answer = re.findall(r'(?:example|for\s*(?:example|instance)).{0,800}?(?:answer|solution|result)', lower, re.DOTALL)
    if example_answer:
        score += len(example_answer) * 3
        reasons.append(f"example-answer pairs: {len(example_answer)}")
        # Get the example context
        ea = example_answer[0]
        quotes.append(extract_context(content, ea[:100], 400))
    
    if not quotes:
        qa = re.search(r'\b(?:which\s+of\s+the\s+following|what\s+is\s+the|how\s+(?:many|much)).{0,600}\b(?:answer|correct|right)\b', lower)
        if qa:
            quotes.append(extract_context(content, qa.group(0)))
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_wrong_answer_banner(art):
    lq = art.get("linked_questions", [])
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # Primary: linked questions count
    if isinstance(lq, list) and len(lq) > 0:
        score = len(lq) * 2
        reasons.append(f"linked to {len(lq)} quiz questions")
        # Show question IDs
        q_ids = [q.get("id", q.get("question_id", str(q))) for q in lq[:5]]
        quotes.append(f"Quiz linkage ({len(lq)} questions): {', '.join(str(x)[:60] for x in q_ids)}")
    elif isinstance(lq, dict) and len(lq) > 0:
        score = len(lq) * 2
        reasons.append(f"linked to {len(lq)} quiz questions")
    
    # Bonus: content that naturally aligns with wrong-answer patterns
    wa_content = len(re.findall(r'\b(?:wrong\s*answer|incorrect|common\s*mis(?:take|conception)|you\s*may\s*have\s*(?:thought|assumed|guessed)|not\s*(?:to\s*be\s*confused|the\s*same\s*as))\b', lower))
    if wa_content:
        score += wa_content * 2
        reasons.append(f"wrong-answer content patterns: {wa_content}")
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_inline_quiz(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # 1. Explicit Q: / A: pairs
    qa_explicit = re.findall(r'(?:^|\n)\s*(?:Q:?\s*|Question:?\s*)\s*(.+?)(?:\n\s*(?:A:?\s*|Answer:?\s*)\s*(.+))?', content, re.MULTILINE | re.IGNORECASE)
    if qa_explicit:
        score += len(qa_explicit) * 5
        reasons.append(f"explicit Q&A pairs: {len(qa_explicit)}")
        for q, a in qa_explicit[:2]:
            text = f"Q: {q.strip()}"
            if a:
                text += f" → A: {a.strip()}"
            quotes.append(text[:250])
    
    # 2. Rhetorical questions with immediate answers
    rhetorical = re.findall(r'([A-Z][^.!?]*\?)\s*\n?\s*(The(?:se)?|This|It|That|Those)\s+(?:is|are|means|was|refers)\s', content)
    if rhetorical:
        score += len(rhetorical)
        reasons.append(f"rhetorical Q&A: {len(rhetorical)}")
        if rhetorical and not quotes:
            quotes.append(rhetorical[0][0][:200])
    
    # 3. Knowledge check patterns
    knowledge_checks = re.findall(r'\b(?:remember|note|key\s*(?:point|takeaway|fact|concept|insight)|important|critical|essential)\s*:\s*.{20,200}', lower)
    if knowledge_checks:
        score += len(knowledge_checks)
        reasons.append(f"key-point callouts: {len(knowledge_checks)}")
        if not quotes:
            quotes.append(extract_context(content, knowledge_checks[0]))
    
    # 4. Definition-style Q&A
    definitions = re.findall(r'\*\*(.+?)\*\*\s*(?:is|are|refers?\s*to|means?|defined?\s*as)\s+(.+?)(?:\.|$)', content)
    if definitions:
        score += min(len(definitions), 5)
        reasons.append(f"definition pairs: {len(definitions)}")
        if definitions and len(quotes) < 2:
            quotes.append(f"'{definitions[0][0].strip()}' → '{definitions[0][1].strip()[:100]}'")
    
    if not quotes:
        fact = re.search(r'(?:what\s+is\s+the|which\s+of\s+the|how\s+(?:many|much|does)).{0,400}', lower)
        if fact:
            quotes.append(extract_context(content, fact.group(0)))
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_wiki_article_hero(art):
    content = art["content"]
    score = 0
    reasons = []
    quotes = []
    
    stripped = content.strip()
    
    # Check for H1 at top
    has_h1 = bool(re.match(r'^#\s+', stripped))
    has_frontmatter = stripped.startswith('---')
    
    if has_frontmatter:
        fm_end = stripped.find('---', 3)
        after_fm = stripped[fm_end+3:].strip() if fm_end > 0 else ""
        has_h1 = bool(re.match(r'^#\s+', after_fm))
    
    if not has_h1:
        score = 5
        reasons.append("no H1 header at top of article")
        first_line = stripped.split('\n')[0] if stripped else ""
        quotes.append(f"Article starts with: '{first_line[:150]}'")
    else:
        # Has H1 but could still benefit from hero with metadata
        meta = art.get("meta", {})
        if "subject" in meta or "difficulty" in meta or "readTime" in meta:
            score = 1
            reasons.append("has H1 but metadata available for hero enrichment")
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_wiki_part_header(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # Count sections
    h2_count = len(re.findall(r'^##\s+', content, re.MULTILINE))
    h3_count = len(re.findall(r'^###\s+', content, re.MULTILINE))
    words = len(content.split())
    
    # Base score from length
    if words > 3000:
        score += 5
        reasons.append(f"very long: {words} words")
    elif words > 1500:
        score += 3
        reasons.append(f"long: {words} words")
    elif words > 800:
        score += 1
    
    # Score from section count
    if h2_count >= 6:
        score += 6
        reasons.append(f"many sections: {h2_count} H2")
    elif h2_count >= 4:
        score += 4
        reasons.append(f"multiple sections: {h2_count} H2")
    elif h2_count >= 2:
        score += 2
    
    if h3_count >= 10:
        score += 3
        reasons.append(f"many subsections: {h3_count} H3")
    elif h3_count >= 5:
        score += 1
    
    # Natural part divisions
    part_markers = len(re.findall(r'\b(?:Part|Module|Unit|Section)\s+[IVX\d]+\b', content))
    if part_markers:
        score += part_markers * 3
        reasons.append(f"explicit part markers: {part_markers}")
    
    # Thematic grouping potential
    section_titles = re.findall(r'^##\s+(.+)$', content, re.MULTILINE)
    if len(section_titles) >= 3:
        quotes.append(f"{h2_count} sections: {' → '.join(section_titles[:8])}")
    
    # Content density (words per section)
    if h2_count > 0:
        wps = words / h2_count
        if wps > 500:
            score += 2
            reasons.append(f"dense sections: ~{int(wps)} words/section")
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


def score_wiki_reference(art):
    content = art["content"]
    lower = content.lower()
    score = 0
    reasons = []
    quotes = []
    
    # 1. Code section references with specific numbers
    section_refs = re.findall(r'(?:Section|Sec\.|Rule|Chapter|Article|Table|Figure|Annex|Appendix)\s+[\dIVX]+[A-Za-z]?(?:[\.-]\d+)?(?:\([a-z]\))?', content)
    if section_refs:
        unique_sections = list(dict.fromkeys(section_refs))
        score += len(unique_sections) * 3
        reasons.append(f"section refs: {len(unique_sections)} unique")
        quotes.append(f"References: {', '.join(unique_sections[:8])}")
    
    # 2. Legal document references
    legal_refs = set(re.findall(r'\b(?:BP\s*344|PD\s*1096|Republic\s*Act\s*(?:No\.?\s*)?\d+|RA\s*\d+|Presidential\s*Decree|Batas\s*Pambansa|IRR|NSCP\s*\d{4}|NBCP|PEC|UAP\s*Doc\.?\s*\d+|SPP\s*\d+)\b', content))
    if legal_refs:
        score += len(legal_refs) * 5
        reasons.append(f"legal refs: {len(legal_refs)}")
        quotes.append(f"Legal: {', '.join(sorted(legal_refs)[:5])}")
    
    # 3. Citation patterns (Author, Year)
    citations = re.findall(r'\(([A-Z][a-z]+(?:\s+(?:et\s*al\.?|&\s*[A-Z][a-z]+))?,\s*\d{4}[a-z]?)\)', content)
    if citations:
        score += len(citations)
        reasons.append(f"citations: {len(citations)}")
    
    # 4. Per-code / according-to patterns
    per_code = len(re.findall(r'\b(?:per\s+(?:the\s+)?(?:IRR|Code|Table|Standard|PD|RA|BP|Rule)|according\s+to\s+(?:the\s+)?(?:IRR|Code|Table|Standard|PD|RA|BP|Rule)|as\s+(?:stated|specified|required|mandated|provided)\s+(?:in|by|under))\b', lower))
    if per_code:
        score += per_code * 2
        reasons.append(f"code citation patterns: {per_code}")
    
    # 5. Specific measurements/values from code
    code_values = len(re.findall(r'\b\d+(?:\.\d+)?\s*(?:mm|cm|m|meter|ft|feet|inch|kg|kN|MPa|psi|°C|°F|degrees|percent|%)\b.{0,50}?\b(?:per|according|required|mandated|specified|minimum|maximum)\b', lower))
    if code_values:
        score += code_values
    
    return {"score": score, "reasons": reasons, "quotes": quotes[:3]}


# ============================
# PLACEMENT SUGGESTIONS
# ============================

def suggest_placement(comp_name, art, result):
    content = art["content"]
    
    if comp_name == "Mermaid":
        if "decision" in str(result.get("reasons", "")).lower():
            return "Insert a Mermaid flowchart showing the decision tree logic near the top of the article"
        if "numbered" in str(result.get("reasons", "")).lower():
            return "Replace the numbered step list with a Mermaid flowchart; keep steps as supporting text"
        if "lifecycle" in str(result.get("reasons", "")).lower():
            return "Add a Mermaid sequence or state diagram showing the lifecycle phases"
        return "Insert Mermaid diagram after the intro paragraph to visualize the process"
    
    elif comp_name == "FormulaBlock":
        return "Wrap any inline formulas in FormulaBlock with step-by-step variable breakdown"
    
    elif comp_name == "Tabs":
        codes = str(result.get("reasons", ""))
        if "codes" in codes.lower() or "pd 1096" in codes.lower() or "bp 344" in codes.lower():
            return "Use Tabs for side-by-side code comparison (one tab per code/standard)"
        if "era" in codes.lower() or "style" in codes.lower():
            return "Use Tabs for side-by-side era/style comparison"
        if "type" in codes.lower() or "group" in codes.lower():
            return "Use Tabs for each building type/group classification"
        return "Use Tabs for parallel topic comparison"
    
    elif comp_name == "RevealBlock":
        if "mistake" in str(result.get("reasons", "")).lower():
            return "Wrap common-mistake content in RevealBlock so users see the warning, then drag to reveal the correction"
        if "test" in str(result.get("reasons", "")).lower():
            return "Place RevealBlock around the answer so users attempt the test before seeing the solution"
        if "example" in str(result.get("reasons", "")).lower():
            return "Wrap the example answer in a RevealBlock"
        return "Wrap spoiler/surprise content in RevealBlock"
    
    elif comp_name == "WrongAnswerBanner":
        lq = art.get("linked_questions", [])
        count = len(lq) if isinstance(lq, list) else 0
        return f"Add WrongAnswerBanner at article top (linked from {count} quiz questions)"
    
    elif comp_name == "InlineQuiz":
        return "Convert Q&A pairs into interactive InlineQuiz components throughout the article"
    
    elif comp_name == "WikiArticleHero":
        return "Add WikiArticleHero at the very top with subject, difficulty, and estimated read time"
    
    elif comp_name == "WikiPartHeader":
        h2 = len(re.findall(r'^##\s+', content, re.MULTILINE))
        return f"Add WikiPartHeader before each major thematic section group ({h2} H2 sections total)"
    
    elif comp_name == "WikiReference":
        return "Add WikiReference popover for each code section, IRR reference, or legal citation"
    
    return "Based on content analysis"


# ============================
# MAIN
# ============================

def main():
    articles = scan_all_articles()
    
    components = {
        "Mermaid": score_mermaid,
        "FormulaBlock": score_formula_block,
        "Tabs": score_tabs,
        "RevealBlock": score_reveal_block,
        "WrongAnswerBanner": score_wrong_answer_banner,
        "InlineQuiz": score_inline_quiz,
        "WikiArticleHero": score_wiki_article_hero,
        "WikiPartHeader": score_wiki_part_header,
        "WikiReference": score_wiki_reference,
    }
    
    results = {}
    
    for comp_name, scorer in components.items():
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"Scoring for {comp_name}...", file=sys.stderr)
        
        scored = []
        for art in articles:
            result = scorer(art)
            if result["score"] > 0:
                scored.append((art, result))
        
        scored.sort(key=lambda x: x[1]["score"], reverse=True)
        top5 = scored[:5]
        
        print(f"  Found {len(scored)} candidates with score > 0", file=sys.stderr)
        print(f"  Top 5:", file=sys.stderr)
        
        candidates = []
        for art, result in top5:
            slug = art["slug"]
            article_id = art["article_id"]
            readable = art["readable_name"]
            print(f"    [{result['score']:>4}] {slug}", file=sys.stderr)
            if result["reasons"]:
                print(f"          {' | '.join(result['reasons'])}", file=sys.stderr)
            
            candidates.append({
                "slug": slug,
                "article_id": article_id,
                "readable_name": readable,
                "score": result["score"],
                "reasons": result["reasons"],
                "quote": result["quotes"][0] if result["quotes"] else "N/A",
                "placement": suggest_placement(comp_name, art, result)
            })
        
        results[comp_name] = {
            "total_candidates_found": len(scored),
            "top_candidates": candidates
        }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(results, indent=2))
    print(f"\nOutput written to {OUTPUT_FILE}", file=sys.stderr)

if __name__ == "__main__":
    main()
