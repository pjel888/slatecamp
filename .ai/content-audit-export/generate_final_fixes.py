#!/usr/bin/env python3
"""
Final round of question-edits generation for remaining issues.
Fixes:
1. ALE-STRC-005-01-009 - corrupted rationale with hallucinated "118 kN"
2. Quick scan of remaining Utilities articles for critical issues
"""

import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
NOW = datetime.now(timezone.utc).isoformat()

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def compute_hash(obj):
    return f"sha256:{hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()}"

def find_question(data, model_id):
    for q in data.get("questions", []):
        if q.get("model_id") == model_id:
            return q
    return None

def ensure_qe_dir(article_dir):
    qe_dir = article_dir / "question-edits"
    qe_dir.mkdir(parents=True, exist_ok=True)
    return qe_dir

def write_edit(qe_dir, edit_obj):
    qid = edit_obj["question_id"]
    path = qe_dir / f"{qid}.json"
    with open(path, 'w') as f:
        json.dump(edit_obj, f, indent=2)
    print(f"  Created: {path.name}")

# ============================================================
# FIX: ALE-STRC-005-01-009 - corrupted rationale with "118 kN"
# ============================================================
print("=== FIX: ALE-STRC-005-01-009 - corrupted rationale ===")
art_dir = BASE_DIR / "lea-strc-005-01-core-concept--dac86d82-085d-4627-bf1d-2e3ab4be9da3"
data = load_json(art_dir / "linked-questions.json")
q = find_question(data, "ALE-STRC-005-01-009")
if q:
    qid = q["question_id"]
    baseline_hash = q.get("content_hash", compute_hash(q))
    qe_dir = ensure_qe_dir(art_dir)
    
    edit = {
        "question_id": qid,
        "baseline_hash": baseline_hash,
        "reason": "Rationale contains hallucinated/incorrect calculation artifact ('0.75(135) = 101.25 ≈ 118 kN'). The correct calculation is 101.25 kN. The rationale also has repetitive content (calculation repeated twice) and a 'Wait, let me recalculate' internal note. Fixed to be clean and correct.",
        "approved_by": "hermes-audit-pass-7",
        "approved_at": NOW,
        "proposed": {
            "rationale": {
                "a": "Correct. The actual combined load = 101.25 kN.",
                "b": "Incorrect. The calculation gives 101.25 kN, not 85 kN.",
                "c": "Incorrect. The minimum formula U = 1.4(D+T) = 84 kN is lower than the combined formula.",
                "d": "Incorrect. The combined formula gives 101.25 kN, not 84 kN.",
                "correct": "Combined: U = 0.75(1.4×50 + 1.4×10 + 1.7×30) = 0.75(70 + 14 + 51) = 0.75(135) = 101.25 kN. Minimum: U = 1.4(50 + 10) = 84 kN. Since 101.25 kN > 84 kN, the combined formula controls.",
                "takeaway": "Temperature load combinations in older NSCP always require checking both the combined formula (with 0.75 reduction) and the minimum formula (D+T only)."
            }
        }
    }
    write_edit(qe_dir, edit)
else:
    print("  Q NOT FOUND!")

# ============================================================
# Scan Utilities articles for lighting/HVAC numerical accuracy
# ============================================================
print("\n=== Scanning Utilities articles for numerical accuracy ===")

util_articles = sorted(BASE_DIR.glob("lea-util-*"))
for art_dir in util_articles:
    data = load_json(art_dir / "linked-questions.json")
    article_text = (art_dir / "normalized.md").read_text()
    dirname = art_dir.name
    
    for q in data.get("questions", []):
        mid = q.get("model_id", "")
        text = q.get("text", "")
        correct = q.get("correct_option_id")
        rationale = q.get("rationale", {})
        correct_rationale = rationale.get("correct", "")
        
        # Check for numerical claims that might be wrong
        # Look for equations with results
        if "=" in correct_rationale and any(c.isdigit() for c in correct_rationale):
            # Check for obvious arithmetic errors like "0.75(135) = 118"
            import re
            # Find patterns like "= X.XX ≈ Y.YY" where the approximation is wrong
            eq_matches = re.findall(r'=\s*(\d+\.?\d*)\s*≈\s*(\d+\.?\d*)', correct_rationale)
            for exact, approx in eq_matches:
                if abs(float(exact) - float(approx)) > 2.0:
                    print(f"  POSSIBLE ERROR in {mid}: {exact} ≈ {approx} (diff={abs(float(exact)-float(approx)):.1f})")
                    print(f"    Text: {text[:80]}...")

print("\n=== Scanning complete ===")
