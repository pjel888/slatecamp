#!/usr/bin/env python3
"""
Direct fix for the 40 articles that got wrong Learning Goals from v1 script.
Uses LEA prefix matching (reliable) and content matching (for non-LEA articles).
"""

import json
import hashlib
import os
import re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# ─── LEA prefix objectives ──────────────────────────────────────────────

LEA_GOALS = {
    "lea-util": [
        "Identify building utility systems — plumbing, electrical, mechanical ventilation, fire protection, and vertical transportation — and their code requirements.",
        "Apply code provisions for utility system design: plumbing fixture counts, electrical load calculations, ventilation rates, and fire suppression coverage.",
        "Explain the architect's coordination role in integrating utility systems with architectural design — shaft sizing, ceiling plenum coordination, and equipment room placement."
    ],
    "lea-strc": [
        "Identify structural systems — moment frames, braced frames, shear walls, trusses, arches, and shells — and their load paths.",
        "Apply basic structural principles: load types (dead, live, wind, seismic), force distribution, and deflection criteria.",
        "Explain the role of the architect in structural design — coordinating with structural engineers, sizing preliminary members, and understanding structural behavior."
    ],
}

# Content goals for non-LEA articles
CONTENT_GOALS = {
    "bp-344": [
        "Resolve conflicts between BP 344 (Accessibility Law) and PD 1096 using the principle that the stricter standard prevails.",
        "Identify specific dimensional conflicts — door widths, ramp slopes, toilet clearances — and which code governs each.",
        "Apply the correct code hierarchy: BP 344 minimums become NBCP minimums where BP 344 is more stringent."
    ],
    "fire-resistive": [
        "Identify fire-resistive ratings required for structural elements based on building type, height, and occupancy.",
        "Apply the correct fire-resistive construction classification (Types I through V) under PD 1096.",
        "Calculate required fire-resistive protection for structural members — columns, beams, floor/roof assemblies."
    ],
    "certificate-of-occupancy": [
        "Explain the purpose, required documents, and process for obtaining a Certificate of Occupancy under PD 1096, Section 301.",
        "Distinguish between a Building Permit (authorization to construct) and a Certificate of Occupancy (authorization to use).",
        "Identify the consequences of occupying without a Certificate of Occupancy and conditions for a Temporary CO."
    ],
}

TARGETS = [
    "lea-util-004-06-cctv-systems--1edce199-0fc2-42e8-bad6-f3a74243626e",
    "lea-util-001-06-core-concept--68dc5ecb-7b3f-4394-a7b7-770336b3ce98",
    "lea-util-002-09-mechanical-room-location-and-siting--490d7fe6-8f50-404e-a323-1d9a99139869",
    "lea-strc-009-02-core-concept--047334de-c79a-4d6a-aa23-58a321b71e2e",
    "lea-util-004-05-seismic-bracing-and-earthquake-resilience--1caee82f-c2c8-409b-a3bf-41576bc702c5",
    "lea-util-003-05-core-definitions-grounding-vs-bonding--92be8354-f938-4307-a40c-4620c1381cba",
    "bp-344-vs-pd-1096-conflicts--ee1f8beb-e236-4831-a0a8-1ddce447a3b8",
    "lea-util-003-06-the-distribution-hierarchy--f481f8cd-bb99-45b9-9183-4db41848e23d",
    "lea-util-002-05-kitchen-exhaust-hood-classification--7bbf04f7-8c9c-4b8f-9f38-18d7b967a8db",
    "fire-resistive-construction-ratings--aef59aa2-220e-47fc-9492-6b2bd98f9bea",
    "lea-strc-009-03-core-concept--9375b273-4d0d-4ce2-8a7c-991b7e3d4a8c",
    "lea-util-004-04-when-fire-alarm-systems-are-mandatory-ra-9514-irr--1d37a355-c8bf-4d5e-a41b-07a9817a4427",
    "lea-util-001-09-core-concept--1a967c89-e735-4a59-88b0-d2eb0918d284",
    "lea-util-003-03-protection-levels-and-risk-assessment--8d3099bc-c90a-4f31-946f-fe7ab195fb75",
    "lea-util-002-07-escalators-specifications-and-design-parameters--a81f97c7-292d-4d1d-b047-f6987ec2d3ec",
    "lea-util-003-07-residential-load-computation-pec-method--c9e0e01a-b54b-4957-8316-010c1780aea1",
    "lea-util-003-08-summary-for-exam-preparation--29d54ad6-6af8-4c7b-b504-fa6e0a1e5220",
    "lea-util-004-07-core-concepts-and-formulas--b75b3e00-5fe7-4717-95d0-b65ea5b2bb28",
    "lea-util-002-06-regulatory-framework--514f9f04-00a2-49c3-97c6-804fc2362ec7",
    "lea-util-005-04-communication-protocols-technologies--f52e3126-774f-4eec-8456-8417769bb34a",
    "lea-util-001-07-system-components-and-functions--be3f2bf1-8d85-4c03-a047-ae1c2503d4cb",
    "lea-strc-012-01-core-concept--f0790263-a20b-4d36-bebb-05474566cbce",
    "lea-util-002-08-core-principles-standards--b2310919-6f6c-4abc-92b7-521a362c63d9",
    "lea-strc-011-02-core-concept--3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d",
    "lea-util-002-03-core-ventilation-standards--903c66da-2864-48b0-b638-2ed218a173e2",
    "lea-strc-011-01-core-concept--15364bcb-3b60-4e75-9dd5-e656a3623ccd",
    "lea-strc-011-03-core-concept--d7de9bc9-ea50-46d1-8079-2dd3cc0378e7",
    "lea-util-005-03-design-considerations-and-best-practices--881027cd-2be0-4c93-af86-4f801ec16882",
    "lea-util-005-05-summary--ca53ed30-fdc6-42de-bb68-b5335d0d77a6",
    "lea-util-003-04-wire-insulation-types-and-ratings--319c1e17-e0c6-409d-9886-c8a85ecaf747",
    "lea-strc-010-01-core-concept--ee14e9e9-4e28-4c5a-bd83-6dc33fee5c3e",
    "lea-strc-009-01-core-concept--84cf250f-9168-4bba-9b7a-55dd370f1c31",
    "lea-util-001-08-what-you-need-to-know-for-the-lea--8ba7dce8-b30a-497e-af30-7cf6b3637216",
    "lea-strc-008-02-core-concept--ace46266-45f1-4ecf-8f80-dcc9fb4b9282",
    "lea-util-003-02-emergency-power-systems--91727ebf-ee05-4aa8-a538-d8c599a1d9c9",
    "certificate-of-occupancy--68eeacdb-a61b-4f53-bbe9-e2459fa8d152",
    "lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c",
    "lea-util-002-04-system-types-and-applications--635013a5-2aa6-4d97-a79a-e4f44d3aa3ee",
    "lea-util-004-08-seismic-bracing-requirements-per-nscp-2015--585425ad-355a-4180-b64b-a872115f39f6",
    "lea-strc-010-02-core-concept--abc56d0a-101e-4bef-9eda-e5412892652e",
]


def sha256_file(content):
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return None


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def get_lea_prefix(dirname):
    slug = dirname.split('--')[0]
    if slug.startswith("lea-util"):
        return "lea-util"
    if slug.startswith("lea-strc"):
        return "lea-strc"
    return None


def get_content_goal(dirname):
    slug = dirname.split('--')[0]
    for key in CONTENT_GOALS:
        if key in slug.lower():
            return CONTENT_GOALS[key]
    return None


def fix_article(dirname):
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_blocks_path = os.path.join(article_dir, "ui-blocks.json")
    
    content = read_file(norm_path)
    if content is None:
        return False, "No normalized.md"
    
    # Get correct objectives
    lea_id = get_lea_prefix(dirname)
    if lea_id:
        objectives = LEA_GOALS[lea_id]
    else:
        objectives = get_content_goal(dirname)
        if not objectives:
            objectives = [
                "Identify the key concepts, standards, and code provisions relevant to this topic for the ALE.",
                "Apply dimensional standards and regulatory requirements to exam calculation and scenario problems.",
                "Explain the practical application of these standards in architectural design and practice."
            ]
    
    # Remove existing ## Learning Goal section
    content = re.sub(r'\n*#{2,3} Learning Goal.*?(?=\n#{2,3}|\Z)', '', content, flags=re.DOTALL)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Find insertion point after title
    lines = content.split('\n')
    insert_pos = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('## ') and 'Learning Goal' not in stripped:
            insert_pos = i + 1
            break
    
    # Build Learning Goal section
    goal_lines = ["", "## Learning Goal", ""]
    goal_lines.append("After reading this article, you should be able to:")
    goal_lines.append("")
    for obj in objectives:
        goal_lines.append(f"- {obj}")
    goal_lines.append("")
    goal_lines.append("---")
    
    goal_text = "\n".join(goal_lines)
    
    # Insert
    new_lines = lines[:insert_pos] + [goal_text] + lines[insert_pos:]
    new_content = '\n'.join(new_lines)
    new_content = re.sub(r'\n{4,}', '\n\n\n', new_content)
    
    # Read ui-blocks.json
    ui_raw = read_file(ui_blocks_path)
    if ui_raw is None:
        article_id = dirname.split('--')[-1] if '--' in dirname else dirname
        ui_blocks = {
            "article_id": article_id,
            "slug": dirname.split('--')[0],
            "normalized_created_at": "2026-05-01T13:33:44.000Z",
            "parser_version": "ui-block-parser-v1",
            "original_content_hash": f"sha256:{sha256_file(new_content)}",
            "normalized_content_hash": f"sha256:{sha256_file(new_content)}",
            "ui_block_count": 0,
            "total_blocks": 0,
            "blocks": [],
            "unknown_blocks": [],
            "unresolved_critical_blocks": [],
            "ui_blocks_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
    else:
        ui_blocks = json.loads(ui_raw)
    
    new_hash = sha256_file(new_content)
    ui_blocks["normalized_content_hash"] = f"sha256:{new_hash}"
    blocks_json = json.dumps(ui_blocks.get("blocks", []), sort_keys=True)
    ui_blocks["ui_blocks_hash"] = f"sha256:{hashlib.sha256(blocks_json.encode()).hexdigest()}"
    
    write_file(norm_path, new_content)
    write_file(ui_blocks_path, json.dumps(ui_blocks, indent=2) + "\n")
    
    title = lines[0].strip().replace('## ', '') if lines else ""
    return True, lea_id or "content"


def main():
    fixed = 0
    errors = 0
    
    for dirname in TARGETS:
        success, src = fix_article(dirname)
        if success:
            fixed += 1
            print(f"  [{fixed}] FIXED [{src}] {dirname[:70]}")
        else:
            errors += 1
            print(f"  ERR {dirname[:70]} — {src}")
    
    print(f"\n{'='*60}")
    print(f"Fixed: {fixed}, Errors: {errors}")


if __name__ == "__main__":
    main()
