#!/usr/bin/env python3
"""
Create question-edits files for all discovered issues.
"""
import json
import os

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

def get_content_hash(article_dir, question_id):
    """Get content_hash for a question."""
    qpath = os.path.join(BASE, article_dir, "linked-questions.json")
    with open(qpath) as f:
        data = json.load(f)
    for q in data["questions"]:
        if q["question_id"] == question_id:
            return q["content_hash"]
    return None

def mkdir_qedits(article_dir):
    d = os.path.join(BASE, article_dir, "question-edits")
    os.makedirs(d, exist_ok=True)
    return d

def write_edit(article_dir, qid, reason, proposed):
    """Write a question-edit JSON file."""
    d = mkdir_qedits(article_dir)
    ch = get_content_hash(article_dir, qid)
    edit = {
        "question_id": qid,
        "baseline_hash": ch,
        "reason": reason,
        "approved_by": "hermes-question-audit",
        "approved_at": "2026-05-03T12:16:00.000000+00:00",
        "proposed": proposed
    }
    path = os.path.join(d, f"{qid}.json")
    with open(path, "w") as f:
        json.dump(edit, f, indent=2)
    print(f"  Created: {path}")

# =============================================
# 1. lea-matl-006-04: WRONG ANSWER KEY (k-value units)
# =============================================
write_edit(
    "lea-matl-006-04-core-concept--763d451f-d9eb-469f-8d5e-8be6c9a7bfa7",
    "d926901d-e273-4e49-91af-5cf49525b7ba",
    "WRONG ANSWER KEY: correct_option_id was 'b' (m²·K/W = R-value units). W/(m·K) is the correct unit for thermal conductivity (k-value). Also added missing rationale entry for option 'a'.",
    {
        "correct_option_id": "a",
        "rationale": {
            "a": "W/(m·K) is the correct SI unit for thermal conductivity (k-value), representing heat flow per unit length per degree of temperature difference.",
            "b": "m²·K/W is R-value (thermal resistance), which depends on thickness — not thermal conductivity.",
            "c": "Btu·in/(hr·ft²·°F) is imperial k-value; correct units but less commonly used in metric regions.",
            "d": "Degrees per watt is not a recognized unit for thermal conductivity.",
            "correct": "k-value is thermal conductivity in W/(m·K) per ASTM C518; it describes material's ability to conduct heat, independent of thickness.",
            "takeaway": "k = thermal conductivity (material property, independent of thickness). R = thermal resistance (depends on thickness and k)."
        }
    }
)

# =============================================
# 2. lea-matl-006-05: Missing rationale for wrong option 'd'
# =============================================
write_edit(
    "lea-matl-006-05-core-concept--cd21006c-647f-4c7b-8b17-fa65c51cbeb3",
    "1e139061-1002-4cdd-a353-43a60aa7d121",
    "Missing rationale entry for wrong option 'd'. Option 'd' (rigid rebar-reinforced joint) is a wrong/distractor option that needs explanation.",
    {
        "rationale": {
            "d": "Rigid rebar-reinforced joints do not accommodate significant movement; they are designed for non-movement scenarios. A structural approach is needed but not a rigid rebar joint alone."
        }
    }
)

# =============================================
# 3. lea-matl-007-06: Missing rationale for wrong option 'c'
# =============================================
write_edit(
    "lea-matl-007-06-core-concept--cc2eb7b8-8933-47d3-a61a-f3f835daf1ab",
    "8691a1fc-83d2-4f6c-aba0-90ea7d1681e8",
    "Missing rationale entry for wrong option 'c' (Mohs 7). Option 'c' (Mohs 7) is actually correct for quartz mineral, but the correct answer for this specific question is option 'b' (5-6 to 7 depending on brand). Added explanation.",
    {
        "rationale": {
            "c": "While quartz mineral has Mohs 7, engineered quartz composite hardness varies (5-6 to 7) depending on resin-to-quartz ratio. 7 is the upper bound but not the typical stated hardness for all brands."
        }
    }
)

# =============================================
# 4. lea-matl-010-07: CRITICAL - Wrong answer key (steel cost)
# Question ALE-MATL-010-07-008 (qid: 2d1f422b)
# =============================================
write_edit(
    "lea-matl-010-07-core-concept--708fd4a4-e06f-4255-a2ad-e56711b9ee43",
    "2d1f422b-b013-4ced-9bf8-52a7cdefb9c6",
    "WRONG ANSWER KEY: 2.5 MT × 40,000 pesos/MT = 100,000 pesos (option b), not 150,000 pesos (option c). The rationale itself notes this discrepancy. Fixed correct_option_id to 'b' and corrected rationale.",
    {
        "correct_option_id": "b",
        "rationale": {
            "a": "60,000 pesos results from using 1.5 MT instead of 2.5 MT.",
            "c": "150,000 pesos results from using 3.75 MT instead of 2.5 MT, or incorrectly multiplying.",
            "d": "200,000 pesos results from using 5 MT instead of 2.5 MT (double the actual quantity).",
            "correct": "Cost = 2.5 MT × 40,000 pesos/MT = 100,000 pesos (option b). Always multiply total metric tons by price per metric ton.",
            "takeaway": "Cost estimation: Total weight (MT) × Price per MT = Total material cost."
        }
    }
)

# =============================================
# 5. lea-matl-010-07: CRITICAL - Wrong answer key (beam weight)
# Question ALE-MATL-010-07-005 (qid: cbe3277b)
# =============================================
write_edit(
    "lea-matl-010-07-core-concept--708fd4a4-e06f-4255-a2ad-e56711b9ee43",
    "cbe3277b-ffde-4b56-8be1-d4056158a593",
    "WRONG ANSWER KEY: 4 beams × 8 m × 42.2 kg/m = 1,350.4 kg, closest to option 'c' (1,352 kg), not option 'd' (1,689.6 kg). The rationale itself states 'Closest is 1,352 kg (option c)'. Fixed correct_option_id to 'c' and corrected rationale.",
    {
        "correct_option_id": "c",
        "rationale": {
            "a": "846.4 kg results from 2 beams instead of 4 (half the correct quantity).",
            "b": "1,049 kg is significantly lower; calculation error or wrong section weight.",
            "d": "1,689.6 kg likely from 5 beams instead of 4, or using wrong weight per meter.",
            "correct": "Total weight = 4 beams × 8 m × 42.2 kg/m = 32 m × 42.2 kg/m = 1,350.4 kg. Closest option is 1,352 kg (option c).",
            "takeaway": "Multi-member assembly: Sum of (number × length × weight per meter) for each member type."
        }
    }
)

# =============================================
# 6. lea-matl-010-07: CRITICAL - Wrong answer key (steel weight lookup)
# Question ALE-MATL-010-07-001 (qid: b1ece91b)
# =============================================
write_edit(
    "lea-matl-010-07-core-concept--708fd4a4-e06f-4255-a2ad-e56711b9ee43",
    "b1ece91b-f8c3-4624-8c75-43391ac35306",
    "WRONG ANSWER KEY: Both 'Manufacturer weight tables' (option b) and 'Cross-sectional area × 7,850 kg/m³' (option c) are valid methods. Option 'd' explicitly says 'Both B and C (equivalent approaches)'. correct_option_id should be 'd', not 'b'. Also added missing rationale entries for options 'c' and 'd'.",
    {
        "correct_option_id": "d",
        "rationale": {
            "a": "D²÷162.5 is for rebar weight estimation, not structural steel sections.",
            "c": "Cross-sectional area × 7,850 kg/m³ is a valid method; manufacturer weight tables are derived from this calculation.",
            "d": "Both B and C are equivalent approaches. Manufacturers publish weight tables (B) calculated using cross-sectional area × density (C). Either method produces equivalent results.",
            "correct": "Both B and C are correct: manufacturers publish weight tables (B), which are calculated using cross-sectional area × steel density (C). For ALE purposes, use the published weight table as the primary reference.",
            "takeaway": "Structural steel weight = published weight tables. Memorize key section weights (HEB 200 = 50 kg/m, IPE 300 = 42.2 kg/m)."
        }
    }
)

print("\nDone creating question-edits for critical and major issues.")
