#!/usr/bin/env python3
"""
Generate additional question-edits/ fix files for content-level issues.
Fixes:
1. ALE-STRC-001-02-003: "Zone 4" in options doesn't exist - article says Zone 1/2 only
2. ALE-STRC-001-02-008: LL reduction threshold mismatch between question (37 m²) and article (18.6 m²)
3. ALE-STRC-001-01-009: Already fixed (corrupted rationale)
4. ALE-UTIL-001-06-004: Short option text (just values like "18 L" - acceptable for numerical)
Plus scan more articles for content issues
"""

import json
import hashlib
import os
import re
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
    return path

# ============================================================
# FIX 1: ALE-STRC-001-02-003 - "Zone 4" doesn't match article
# Article says only Zone 1 (Z=0.2) and Zone 2 (Z=0.4)
# ============================================================
print("=== FIX: ALE-STRC-001-02-003 - Zone 4 mismatch ===")
art_dir = BASE_DIR / "lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff"
data = load_json(art_dir / "linked-questions.json")
q = find_question(data, "ALE-STRC-001-02-003")
if q:
    qid = q["question_id"]
    baseline_hash = q.get("content_hash", compute_hash(q))
    qe_dir = ensure_qe_dir(art_dir)
    
    edit = {
        "question_id": qid,
        "baseline_hash": baseline_hash,
        "reason": "Options reference 'Zone 4' and 'Zone 2 with Z=0.2' but the article only describes Zone 1 (Z=0.2) and Zone 2 (Z=0.4) per NSCP. Also, rationale mentions 'Zone 4 covers Eastern Visayas, most of Luzon' which contradicts the article. Fixed options to match article's two-zone system (NSCP). Correct answer for Metro Manila is Zone 2 with Z=0.4.",
        "approved_by": "hermes-audit-pass-7",
        "approved_at": NOW,
        "proposed": {
            "options": [
                {"id": "a", "text": "Zone 1, with Z = 0.2"},
                {"id": "b", "text": "Zone 2, with Z = 0.2"},
                {"id": "c", "text": "Zone 2, with Z = 0.4"},
                {"id": "d", "text": "Zone 1, with Z = 0.4"}
            ],
            "correct_option_id": "c",
            "rationale": {
                "a": "Incorrect. Zone 1 (Z=0.2) applies only to Palawan (except Busuanga), Tawi-Tawi, and Sulu — not Metro Manila.",
                "b": "Incorrect. Zone 2 has Z=0.4, not Z=0.2. Zone 1 has Z=0.2.",
                "d": "Incorrect. Zone 1 (Z=0.4) is not a valid combination. Zone 1 has Z=0.2; Zone 2 has Z=0.4.",
                "correct": "Per NSCP, the Philippines has two seismic zones: Zone 1 (Z=0.2, lower risk, covering Palawan/Tawi-Tawi/Sulu) and Zone 2 (Z=0.4, higher risk, covering all other provinces including Metro Manila). Metro Manila is in Zone 2 with Z = 0.4.",
                "takeaway": "The Philippines uses a two-zone seismic system. Zone 2 (Z=0.4) applies to all provinces except Palawan, Tawi-Tawi, and Sulu."
            }
        }
    }
    write_edit(qe_dir, edit)
else:
    print("  Q NOT FOUND!")

# ============================================================
# FIX 2: ALE-STRC-001-02-008 - LL reduction threshold issue
# ============================================================
print("\n=== FIX: ALE-STRC-001-02-008 - LL reduction mismatch ===")
q2 = find_question(data, "ALE-STRC-001-02-008")
if q2:
    qid2 = q2["question_id"]
    baseline_hash2 = q2.get("content_hash", compute_hash(q2))
    qe_dir2 = ensure_qe_dir(art_dir)
    
    edit2 = {
        "question_id": qid2,
        "baseline_hash": baseline_hash2,
        "reason": "The question uses 18 m² tributary area but claims reduction is permissible because it 'exceeds 37 m².' The article states minimum threshold is 18.6 m² (200 ft²), so 18 m² < 18.6 m² means reduction should NOT be permissible per the article. The KLL factor (4 for interior columns) would make KLL*AT = 72 m² ≥ 37.2 m², but this context is missing from question. Fixed question text to use compliant area and correct threshold reference.",
        "approved_by": "hermes-audit-pass-7",
        "approved_at": NOW,
        "proposed": {
            "text": "A floor system with a tributary area of 20 m² is being designed for office use. The designer notes that a live load reduction factor may be applied. This is permissible because:",
            "options": [
                {"id": "a", "text": "Office LL is less than residential LL, which allows certain design flexibilities under specific conditions"},
                {"id": "b", "text": "The tributary area exceeds the NSCP minimum of 18.6 m² (200 ft²) for live load reduction"},
                {"id": "c", "text": "Wind and seismic loads are not critical, provided the building is not located in a high-risk zone"},
                {"id": "d", "text": "The structure is designed for gravity loads only, which simplifies load calculations"}
            ],
            "correct_option_id": "b",
            "rationale": {
                "a": "Incorrect. The relative values of office vs residential LL are irrelevant to the reduction rule.",
                "c": "Incorrect. Wind and seismic load criticality does not affect live load reduction eligibility.",
                "d": "Incorrect. Gravity-only design does not automatically permit live load reduction.",
                "correct": "NSCP permits live load reduction when the tributary area exceeds 18.6 m² (200 ft²). At 20 m², the floor system qualifies for reduction. Larger tributary areas may use reduced LL factors per NSCP Table 202.",
                "takeaway": "Live load reduction threshold is ≥18.6 m² (200 ft²) tributary area per NSCP."
            }
        }
    }
    write_edit(qe_dir2, edit2)
else:
    print("  Q2 NOT FOUND!")

# ============================================================
# FIX 3: ALE-STRC-001-01-009 - was already fixed, but let's also 
# fix the generic rationales for the whole article set as a batch
# Actually, let's flag the pervasive generic rationale issue
# ============================================================

# ============================================================
# Scan more articles for content issues - let me check lea-strc-003-* (seismic terms)
# and lea-strc-004-* (structural systems)
# ============================================================
print("\n=== Scanning additional key articles ===")

# Check lea-strc-004-01 (Base Shear / Seismic Design)
art_004_01 = BASE_DIR / "lea-strc-004-01-core-concept--2ef8093e-b636-42f7-8f25-55adcfc22821"
if art_004_01.exists():
    data_004_01 = load_json(art_004_01 / "linked-questions.json")
    for q in data_004_01.get("questions", []):
        mid = q.get("model_id", "")
        text = q.get("text", "")
        correct = q.get("correct_option_id")
        
        # Check for numerical claims in questions about base shear
        if "base shear" in text.lower() or "seismic" in text.lower():
            print(f"  {mid}: {text[:80]}...")
            # Verify key numerical values if present
            
# Check lea-strc-005-01 (Required Strength / Load Combinations)
art_005_01 = BASE_DIR / "lea-strc-005-01-core-concept--dac86d82-085d-4627-bf1d-2e3ab4be9da3"
if art_005_01.exists():
    data_005_01 = load_json(art_005_01 / "linked-questions.json")
    article_005_01 = (art_005_01 / "normalized.md").read_text()
    for q in data_005_01.get("questions", []):
        mid = q.get("model_id", "")
        text = q.get("text", "")
        correct = q.get("correct_option_id")
        rationale = q.get("rationale", {})
        correct_text = rationale.get("correct", "")
        
        # Check for load combination calculations
        if "kN" in text or "factor" in text or "1.2" in text or "1.4" in text:
            print(f"  {mid}: {text[:100]}...")
            cf = correct_text[:150]
            print(f"    Rationale: {cf}...")

print("\n=== Scanning complete ===")
