# Flagging Report: BP 344 Accessible Washrooms

**Article ID:** `6d5e0e55-215a-4806-a679-dac7aea5a99b`
**Slug:** `bp-344-accessible-washrooms`
**Review Date:** 2026-05-02
**Reviewer:** Hermes Agent (automated fact-check)

---

## 1. SOURCES MISSING (CRITICAL)

**Severity:** HIGH

sources.json has `source_count: 0` and an empty `sources: []` array. The article cites `[file:4]` (BP 344) throughout but provides no verifiable source references. Every claim must be traceable back to a specific primary source document with page/section anchors.

**Action needed:** Populate sources.json with references to the 2024 Revised IRR PDF (page numbers, section headings).

---

## 2. SECTION NUMBER MISMATCH (SIGNIFICANT)

**Severity:** MEDIUM

The article references section numbers that do not exist in the 2024 Revised IRR document:

| Claimed Reference | Actual Source Structure |
|---|---|
| Sec 6.1.a, Sec 6.1.b | "6. Toilets and Baths" — uses simple numbered list items, no sub-letter designations |
| Sec 6.3.a, 6.3.b, 6.3.c | Same issue. Grab bar specifications are listed as item "1." under the section, with sub-items using numbers, not letters |
| Sec 6.4 | No "Sec 6.4" in source. Turning space is mentioned in items "8." and elsewhere |
| Sec 6.7 | "The height of toilet seat shall be 450 mm" — no section number 6.7 used |
| Sec 6.9 | Lavatory specs are described as items under "6. Toilets and Baths" on pg 38 |
| Sec 6.12 | Urinal specs are part of the same section, not a separate 6.12 |
| Sec 6.14 | Toilet door direction is described without a "Sec 6.14" label |
| Sec 6.17 | Door pull bar at 900mm — no "Sec 6.17" exists |
| Sec 6.18 | Emergency call button specs exist but without "Sec 6.18" label |
| Sec 6.19 | Strobe alarm described without "Sec 6.19" label |
| Sec 6.22, 6.23 | Roll-in shower and bathtub specs use no sub-section numbers |

**Action needed:** Either (a) reference the correct section numbers from the 2024 Revised IRR, or (b) use descriptive path references (e.g., "Section 6, Toilets and Baths, grab bar specification item 1").

---

## 3. REAR WALL GRAB BAR DISCREPANCY

**Severity:** MEDIUM

**Article claims:** "Grab Bar — Rear Wall: Min 600mm long, located at seat height band (Sec 6.3.c)"

**Source says (pg 36-37, "6. Toilets and Baths"):**
- "One flip-up grab bar on the other side of the water closet anchored on the back wall"
- "The flip-up bar shall only allow upward and downward movement"
- "The flip-up grab bar shall extend 100 mm from the front of the water closet"
- "Both grab bars shall be installed 300 mm high from the top of the toilet seat to the top of the grab bars"

The article describes a fixed 600mm horizontal bar at "seat height band." The source describes a **flip-up grab bar** anchored on the back wall, extending 100mm from the front of the WC, also at 300mm above the seat top. The dimensions and mechanism differ.

**Action needed:** Correct the rear wall grab bar description to match the flip-up bar specification.

---

## 4. LAVATORY KNEE CLEARANCE DEPTH UNVERIFIED

**Severity:** LOW

**Article claims:** "Lavatory Knee Clearance: Min 650mm height, 500mm depth"

**Source says (pg 38):** "Lavatories shall be mounted at a height of 800 mm from the finished floor with a vertical clear leg room space not lower than 650 mm."

The source confirms the 650mm height but does **not** specify a 500mm depth for knee clearance. The source mentions a separate lowered lavatory with "a depth of 450mm" but this is for children/short-statured individuals.

**Action needed:** Verify the 500mm depth claim against another authoritative source, or remove it if unverifiable.

---

## 5. VERIFIED CLAIMS (No Action Needed)

The following claims were confirmed accurate against the 2024 Revised IRR:

- Toilet cubicle clear floor: 1800mm x 1800mm minimum ✓
- Toilet seat height: 450mm AFF ✓
- Side wall grab bar: 300mm above top of toilet seat ✓
- WC centerline from side wall: 450mm ✓
- Clear transfer space beside WC: min 750mm ✓
- Urinal lip height: 350-400mm AFF ✓
- Urinal grab bars: 600mm long, tops at 1500mm AFF, 650mm clear between outer edges ✓
- Urinal clear floor space: 900mm x 900mm ✓
- Lavatory rim height: max 800mm AFF ✓
- Lavatory centerline from wall: 450mm ✓
- Mirror bottom edge: max 1000mm AFF or tilted ✓
- Accessories: max 1000mm AFF ✓
- Emergency call button: 400-600mm AFF, waterproof, contrasting ✓
- Roll-in shower: 1800mm x 1800mm, curb max 12mm beveled ✓
- Shower spray hose: min 1500mm ✓
- Toilet door: opens outward ✓
- Door pull bar height: 900mm AFF ✓
- Strobe alarms: max 2 flashes/second (NFPA 72) ✓
- Bathtub L-type grab bar: 1200mm horizontal + 1200mm vertical, 250mm above rim ✓
- Bathtub clear transfer space: 900mm x 1500mm ✓

---

## Summary of Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | sources.json empty — no verifiable source references | HIGH | OPEN |
| 2 | Section numbers (Sec 6.1.a, 6.3.b, etc.) don't match 2024 IRR structure | MEDIUM | OPEN |
| 3 | Rear wall grab bar described as fixed 600mm bar vs flip-up bar | MEDIUM | OPEN |
| 4 | Lavatory knee clearance depth (500mm) unverified in source | LOW | OPEN |

**Total questions flagged for update:** 4
