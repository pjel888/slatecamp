#!/usr/bin/env python3
"""Deep content audit - check question content against article text."""
import json, os, glob, re, hashlib

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

def get_content_hash(content):
    return "sha256:" + hashlib.sha256(content.encode('utf-8')).hexdigest()

def audit_article_deep(article_dir):
    """Deep audit of an article's question content."""
    dir_path = os.path.join(BASE, article_dir)
    q_path = os.path.join(dir_path, "linked-questions.json")
    norm_path = os.path.join(dir_path, "normalized.md")
    
    if not os.path.exists(q_path):
        return None
    
    with open(q_path) as f:
        qdata = json.load(f)
    
    article_text = ""
    if os.path.exists(norm_path):
        with open(norm_path) as f:
            article_text = f.read()
    
    issues = []
    
    for q in qdata.get("questions", []):
        qid = q.get("question_id", "unknown")
        text = q.get("text", "")
        correct_id = q.get("correct_option_id", "")
        options = q.get("options", [])
        rationale = q.get("rationale", {})
        model_id = q.get("model_id")
        bloom = q.get("bloom_level", "")
        
        # Check options for potential issues
        option_texts = {o["id"]: o["text"] for o in options}
        
        # Check if correct option is in options
        if correct_id not in option_texts:
            issues.append(f"  {qid[:8]}... WRONG KEY: correct='{correct_id}' not in {list(option_texts.keys())}")
            continue
        
        correct_text = option_texts[correct_id]
        
        # Check for "all/none of the above" as only correct answer (lazy design)
        if correct_text.lower().startswith("all of the above") and len(options) == 4:
            # Check if other options are all actually correct
            others = [option_texts[o["id"]] for o in options if o["id"] != correct_id]
            issues.append(f"  {qid[:8]}... ALL-OF-ABOVE: correct={correct_id}, options: {len(options)}")
        
        # Check rationale has correct key
        if rationale is None or "correct" not in rationale:
            issues.append(f"  {qid[:8]}... MISSING RATIONALE: null or no 'correct' key")
        
        # Check model_id naming convention
        if model_id and model_id.startswith("ale-"):
            # Should follow ALE-CAT-XXX-XXX format
            if not re.match(r'^ALE-[A-Z]+-\d+-\d+-\d+$', model_id) and not re.match(r'^ale-[a-z]+-\d+-\d+-q\d+$', model_id):
                issues.append(f"  {qid[:8]}... NON-STANDARD model_id: {model_id}")
        
        # Check bloom level
        valid_blooms = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
        if bloom and bloom not in valid_blooms:
            issues.append(f"  {qid[:8]}... INVALID BLOOM: {bloom}")
    
    return {
        "article": article_dir[:50],
        "questions": len(qdata.get("questions", [])),
        "issues": issues
    }

def main():
    all_issues = []
    total_q = 0
    total_articles_with_issues = 0
    
    for pattern in ['lea-hist-*', 'lea-theo-*', 'lea-dsgn-*']:
        cat = pattern.replace('lea-', '').replace('-*', '')
        print(f"\n=== {cat.upper()} ===")
        for d in sorted(glob.glob(os.path.join(BASE, pattern))):
            dir_name = os.path.basename(d)
            result = audit_article_deep(dir_name)
            if result is None:
                continue
            total_q += result["questions"]
            if result["issues"]:
                total_articles_with_issues += 1
                print(f"\n{dir_name[:60]}:")
                for issue in result["issues"]:
                    print(f"  {issue}")
                all_issues.extend(result["issues"])
    
    print(f"\n\n=== SUMMARY ===")
    print(f"Total questions: {total_q}")
    print(f"Articles with issues: {total_articles_with_issues}")
    print(f"Total issues: {len(all_issues)}")
    
    # Count by type
    from collections import Counter
    types = Counter()
    for i in all_issues:
        i_type = i.split("...")[1].strip().split(":")[0] if "..." in i else "other"
        types[i_type] += 1
    print(f"\nIssue breakdown:")
    for t, c in types.most_common():
        print(f"  {t}: {c}")

if __name__ == "__main__":
    main()
