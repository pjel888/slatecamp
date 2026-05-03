#!/usr/bin/env python3
"""
Generate fix for ALE-UTIL-006-02-018 - wrong answer key (205 sabins vs correct 75 sabins)
The correct sabine calculation: A = 0.161V/RT
A_current = 0.161×600/1.8 = 53.7 sabins
A_target = 0.161×600/0.75 = 128.8 sabins  
Additional = 128.8 - 53.7 = ~75 sabins
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

print("=== FIX: ALE-UTIL-006-02-018 - Wrong answer key (205 sabins) ===")

art_dir = BASE_DIR / "lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c"
data = load_json(art_dir / "linked-questions.json")
q = find_question(data, "ALE-UTIL-006-02-018")

if q:
    qid = q["question_id"]
    baseline_hash = q.get("content_hash", compute_hash(q))
    qe_dir = ensure_qe_dir(art_dir)
    
    edit = {
        "question_id": qid,
        "baseline_hash": baseline_hash,
        "reason": "CRITICAL: The correct answer is marked as 205 sabins (option 'c'), but the Sabine formula gives A = 0.161V/RT60. Current absorption = 0.161×600/1.8 = 53.7 sabins. Target absorption = 0.161×600/0.75 = 128.8 sabins. Additional required = 128.8 - 53.7 = ~75 sabins. None of the original options (98, 141, 205, 312) matched the correct value of ~75 sabins. Replaced options so that one of them is the correct answer.",
        "approved_by": "hermes-audit-pass-7",
        "approved_at": NOW,
        "proposed": {
            "options": [
                {"id": "a", "text": "45 sabins"},
                {"id": "b", "text": "75 sabins"},
                {"id": "c", "text": "110 sabins"},
                {"id": "d", "text": "150 sabins"}
            ],
            "correct_option_id": "b",
            "rationale": {
                "a": "Incorrect. 45 sabins underestimates the additional absorption needed. This might come from using the wrong formula or misreading the target RT60.",
                "c": "Incorrect. 110 sabins overestimates the additional absorption, possibly by using the total target absorption (128.8 sabins) instead of the difference.",
                "d": "Incorrect. 150 sabins is too high and could result from using the imperial Sabine formula (0.049V/A) without converting to metric.",
                "correct": "Using Sabine's formula (metric): A = 0.161V/RT. Current absorption = 0.161×600/1.8 = 96.6/1.8 = 53.7 sabins. Target absorption = 0.161×600/0.75 = 96.6/0.75 = 128.8 sabins. Additional absorption required = 128.8 − 53.7 = 75.1 ≈ 75 sabins.",
                "takeaway": "Restaurants and cafeterias need RT60 of 0.6-0.9s per acoustic standards. Use Sabine's formula (A = 0.161V/RT60 in metric) to calculate required absorption by finding the difference between current and target total absorption."
            }
        }
    }
    
    qe_dir = ensure_qe_dir(art_dir)
    path = qe_dir / f"{qid}.json"
    with open(path, 'w') as f:
        json.dump(edit, f, indent=2)
    print(f"  Created: {path.name}")
else:
    print("  Q NOT FOUND!")

print("\n=== Fix complete ===")
