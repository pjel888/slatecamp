#!/usr/bin/env python3
"""
Fix option 'c' placeholder text in all lea-util-002-04 question-edits files.
The correct answer description was missing because rationale uses "correct" instead of "c" key.
"""

import json
import re
from pathlib import Path

BASE_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
qe_dir = BASE_DIR / "lea-util-002-04-system-types-and-applications--635013a5-2aa6-4d97-a79a-e4f44d3aa3ee" / "question-edits"

# Extract the key number from each question's rationale to use as the option text
# These are extracted from reading the "correct" rationale text
option_c_fixes = {
    "b08e9bbb-d487-4826-85c8-ca15809b5b48": "Adjusted load = 21.7 TR (16.7 TR × 1.30 solar factor); with 10% PD 1058 oversizing = 24 TR recommended",
    "f84628ed-5627-410a-aae1-51947dbcd81a": "18 TR - MEP engineering procedures checklist is Step 2 (load calculations); commissioning in Step 6",
    "50fd5833-bf12-4c70-b2e4-70188902e3cf": "COP = 3.8 at design; actual = 4.18 at 80% part-load; energy cost = 1,044,200 PHP/year ($18,986)",
    "4b714ff0-dac0-4f73-8bef-4d8ff6bc5c89": "R-454B alternative: 10.8% reduction (COP = 10.8/11.7 = 0.92); within 15% threshold",
    "baefce67-c8ea-40b6-bc7c-ce21d6852989": "Chiller: 200 TR centrifugal (450 kW); cooling tower = 570 GPM (3 GPM/TR); chiller COP 5.5 estimated",
    "4c64749f-c1ce-4479-b8c3-8d30e8d0527b": "Annual energy cost = 131,400 kWh × 11.50 PHP/kWh = 1,511,100 PHP ($27,475)",
    "520b4771-7f25-464f-9304-e039cd2f9cb5": "VRF System C: 24 TR (6 indoor units, outdoor on roof, 9.5 EER)",
    "274ef48a-9dc8-40c8-9f47-96918b9b84bb": "DX rooftop unit (Option A): 22.7 SHR, matches ~0.75 target; economizer adds 38% fresh air at 68% RH",
    "797db3fb-3617-4001-a5ec-5fee5c21a4a5": "31.3 TR total load; VRF system recommended",
    "8259316c-56bc-41ad-a426-657bb61ee231": "VRF System A (24 TR total, 4 outdoor units): best fit for 3-zone design despite 6% overcapacity on Zone 3",
    "5bb7abe7-fa3b-4910-98c1-df7d1b0b9648": "18 TR design load = 216,000 BTU/hr; at 3.0 COP cooling and 10 PHP/kWh = 53,160 PHP/month",
    "dd898370-88d9-40d8-a6b0-17b3bf163f3e": "36 TR total (12 TR per floor); 3 VRF outdoor units or 3 rooftop units; chiller not cost-effective for 6 stories",
    "57ad3d12-893b-4a04-8873-f02b583cf79f": "Package unit at 30 kW (10.3 TR): provides adequate cooling; check duct static pressure and SEER rating",
    "bfd3ab3c-f843-429c-ac27-64eae9e037e5": "Window-type (0.5-2 TR) and mini-split (0.75-5 TR) based on manufacturer ratings",
    "80802b77-1d96-4717-a8e3-ed05716fb21e": "New system with R-32 or R-454B: SEER 16+ estimated = 27% energy savings; payback period 3-4 years"
}

for fname, new_text in option_c_fixes.items():
    fpath = qe_dir / fname
    if not fpath.exists():
        print(f"  NOT FOUND: {fname}")
        continue
    
    with open(fpath, 'r') as f:
        data = json.load(f)
    
    # Update the options array - find option c and update text
    modified = False
    for opt in data.get("proposed", {}).get("options", []):
        if opt["id"] == "c" and (opt.get("text", "") == "Option C" or opt.get("text", "") == ""):
            opt["text"] = new_text
            modified = True
    
    if modified:
        with open(fpath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"  FIXED: {fname}")
    else:
        print(f"  SKIPPED: {fname} (option c already has text or not found)")

print("\nDone.")
