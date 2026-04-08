# 03 — Regulatory & Legal Verification Ledger

**Purpose:** Zero-hallucination compliance for parametric building code logic. Every dimension, clearance, and threshold must trace to an actual Philippine law.
**Rule:** Before coding ANY module config's `min`/`max`/`default`/`threshold`, find the value in this ledger or HALT and ask the user for the law text.

---

## Zero-Hallucination Policy

**No parametric bound may be coded without an explicit, verifiable citation to the source law.**

If you cannot find the exact value in this document or in the shared constants files, you MUST:
1. Stop implementation
2. Ask the user for the specific law section text
3. Do NOT guess, approximate, or use "common practice" values

---

## Applicable Legal Framework

| Code | Full Name | Categories |
|------|-----------|-----------|
| **PD 1096** | National Building Code of the Philippines (& IRR) | Cat 01: Room sizes, setbacks, heights, courts, ventilation, stairs, exits |
| **BP 344** | Accessibility Law (& IRR) | Cat 02: Ramps, wheelchair clearances, accessible toilets, signage |
| **RA 9514** | Fire Code of the Philippines (& IRR) | Cat 03: Travel distance, exits, sprinklers, fire ratings, smoke control |
| **NSCP** | National Structural Code of the Philippines | Cat 04: Seismic zones, load combinations, wind loads, soil profiles |
| **NPCP** | National Plumbing Code of the Philippines | Cat 05: Fixture units, pipe sizing, drainage, vents, septic |
| **PEC** | Philippine Electrical Code | Cat 06: Conductor sizing, grounding, GFCI, panel boards |
| **PMEC** | Philippine Mechanical Engineering Code | Cat 07: Air changes, duct sizing, HVAC |
| **BP 220** | Socialized Housing | Cat 13: Lot sizes, open space, road widths |
| **PD 957** | Subdivision and Condominium Act | Cat 13: Subdivision layouts, density ratios |
| **RA 386** | Civil Code (Easements) | Cat 16: Site development, easements |
| **GBC** | Philippine Green Building Code | Cat 15+: USA vegetation, WWR, SRI, ventilation |

---

## Value Classification System

Every parametric value falls into one of four categories:

| Type | Meaning | Citation Required? |
|------|---------|-------------------|
| `code-mandated` | Directly from law text (min room size, max travel distance) | **YES — exact section** |
| `code-derived` | Calculated from law (setback = f(lot width, zoning)) | **YES — formula source** |
| `pedagogical` | Chosen for teaching (default slider position, step increment) | No — but must be labeled |
| `ux-arbitrary` | No legal basis (animation speed, color, zoom) | No |

---

## LegalCitation Type (to add to `types/templates.ts`)

```ts
export type ValueClassification = 'code-mandated' | 'code-derived' | 'pedagogical' | 'ux-arbitrary'

export interface LegalCitation {
  law: string              // 'PD 1096', 'RA 9514', 'BP 344'
  section: string          // 'IRR Rule VIII §801'
  article?: string         // 'Table VIII.1'
  description: string      // 'Minimum habitable room area'
  value?: string           // '6.0 sqm'
  classification: ValueClassification
  verified?: string        // '2026-04-08'
}
```

---

## Shared Constants Plan

Create per-law constant files in `src/features/3d-lab/config/constants/`:

| File | Law | Priority |
|------|-----|----------|
| `pd-1096.ts` | National Building Code | HIGH (24 modules in Cat 01) |
| `ra-9514.ts` | Fire Code | HIGH (19 modules in Cat 03) |
| `bp-344.ts` | Accessibility Law | MEDIUM (13 modules in Cat 02) |
| `nscp.ts` | Structural Code | MEDIUM (17 modules in Cat 04) |
| `bp-220-pd-957.ts` | Housing/Subdivision | LOW (Cat 13) |
| `index.ts` | Re-exports all | — |

---

## Verified Constants (Extracted from Existing Configs)

### PD 1096 — Room Requirements (IRR Rule VIII §801)

| Room Type | Min Area (sqm) | Min Dimension (m) | Source |
|-----------|---------------|-------------------|--------|
| Habitable | 6.0 | 2.0 | IRR Rule VIII §801, Table VIII.1 |
| Kitchen | 3.0 | 1.5 | IRR Rule VIII §801, Table VIII.1 |
| Bathroom/Toilet | 1.2 | 0.9 | IRR Rule VIII §801, Table VIII.1 |
| Laundry | 1.5 | 0.9 | IRR Rule VIII §801, Table VIII.1 |

### PD 1096 — Ceiling Heights (IRR Rule VII)

| Space | Min Height (m) | Source |
|-------|---------------|--------|
| Habitable rooms | 2.7 | IRR Rule VII §701 |
| Mezzanine | 1.8 | IRR Rule VII §702 |
| Basement | 2.4 | IRR Rule VII §703 |

### RA 9514 — Travel Distance (IRR Rule 10)

| Occupancy | No Sprinkler (m) | Sprinklered (m) | Source |
|-----------|-----------------|-----------------|--------|
| Assembly/Business | 46 | 61 | IRR Rule 10 |
| Mercantile | 30 | 46 | IRR Rule 10 |
| Industrial | 31 | 46 | IRR Rule 10 |
| Educational | 46 | 61 | IRR Rule 10 |
| Residential | 46 | 61 | IRR Rule 10 |

### RA 9514 — Dead-End Corridors

| Occupancy | Max Length (m) | Source |
|-----------|---------------|--------|
| Assembly/Business | 6 | IRR Rule 10 |
| Mercantile | 15 | IRR Rule 10 |
| Industrial | 15 | IRR Rule 10 |
| Educational | 6 | IRR Rule 10 |
| Residential | 15 | IRR Rule 10 |

### RA 9514 — Required Exits

| Occupant Count | Min Exits | Source |
|---------------|-----------|--------|
| ≤500 | 2 | IRR Rule 10 |
| 501–1000 | 3 | IRR Rule 10 |
| >1000 | 4 | IRR Rule 10 |

### RA 9514 — High-Rise Definition

| Threshold | Value | Source |
|-----------|-------|--------|
| High-rise = floor of topmost storey ≥ | 15m from ground | IRR Rule 3 |

### BP 344 — Accessibility (IRR)

| Parameter | Value | Source |
|-----------|-------|--------|
| Wheelchair width | ≥0.80m | IRR |
| Wheelchair length | ≥1.10m | IRR |
| Turning circle diameter | 1.80m | IRR |
| Min clear corridor width | 0.90m (one wheelchair) | IRR |
| Ramp max gradient | 1:12 | IRR |
| Ramp max cross slope | 1:48 (1:20 special) | IRR |
| Ramp intermediate landing (runs >10.50m) | ≥1800mm | IRR |
| Ramp end landings | ≥1800mm | IRR |
| Ramp zocalo edge | ≥100mm | IRR |
| Handrail heights | 700mm + 900mm | IRR |
| Intermediate handrail (ramp ≥3000mm wide) | At center | IRR |
| Knee clearance under counters | 0.70m | IRR |
| Reach range (vertical) | 0.70m–1.20m | IRR |
| Min door width | 800mm | IRR |
| Elevator min internal | 1.10m × 1.40m | IRR |
| Elevator max distance from entrance | 30.00m | IRR |
| Pedestrian refuge island depth (road >10m) | ≥1500mm (2000mm preferred) | IRR |

### PD 1096 — Firewalls (IRR Rule VIII)

| Parameter | Value | Source |
|-----------|-------|--------|
| Parapet above roof | ≥0.40m | IRR Rule VIII |
| From outermost edges | ≥0.60m | IRR Rule VIII |
| Under eaves | ≥0.30m | IRR Rule VIII |

### PD 1096/RA 9514/BP 344 — Staircase Cross-Reference

| Parameter | PD 1096 | RA 9514 | BP 344 |
|-----------|---------|---------|--------|
| Max riser | 0.20m | — | 0.20m |
| Spiral max riser | N/A for main egress | 0.24m | N/A |
| Min door width | 900mm | 710mm (egress) | 800mm |
| Min door height | 2.00m | 2.00m | 2.00m |
| Max door width | 1200mm | 1220mm | 1220mm |

**Resolution rule:** Most restrictive wins UNLESS law explicitly exempts (e.g., RA 9514 spiral riser 0.24m exemption).

### PD 957 / BP 220 — Subdivision

| Parameter | PD 957 | BP 220 | Source |
|-----------|--------|--------|--------|
| Min lot (single detached) | 120 sqm (Open Market) | 72 sqm (Econ/Soc) | PD 957 / BP 220 |
| Min lot (rowhouse) | 60 sqm (Open Market) | 35 sqm (Econ/Soc) | PD 957 / BP 220 |
| Max saleable ratio (≥1 hectare) | 70% | 70% | PD 957 |
| Max block length | 400m | 400m | BP 220 |
| Auto-alley threshold | 250m | 250m | BP 220 |
| Max rowhouse cluster | 20 units | 20 units | BP 220 |
| Max cluster length | 100m | 100m | BP 220 |
| Major road min width | 10m | 10m | PD 957 / BP 220 |
| Motor court min ROW | 6m | 6m | PD 957 / BP 220 |
| Motor court max length | 60m | 60m | PD 957 / BP 220 |
| Min park area | 100 sqm | 100 sqm | PD 957 / BP 220 |

### PD 957 / BP 220 — Parks Allocation by Density

| % of Gross Area | PD 957 Density (lots/ha) | BP 220 Density (lots/ha) |
|----------------|------------------------|------------------------|
| 3.50% | ≤20 | ≤150 |
| 4.00% | 21–25 | 151–160 |
| 5.00% | 26–35 | 161–175 |
| 6.00% | 36–50 | 176–200 |
| 7.00% | 51–65 | 201–225 |
| 9.00% | >65 | >225 |

### GBC — Green Building Code

| Parameter | Value | Source |
|-----------|-------|--------|
| Min vegetated % of Unpaved Surface Area | 50% | GBC Section 14.2 |

---

## Computational Layers

| Layer | Description | Template Fit |
|-------|-------------|-------------|
| **L1: Procedural Geometry** | Runtime geometry from parametric inputs | `parametric`, `animated` |
| **L2: Parametric Bounding Boxes** | Invisible collision volumes for legal clearances | `floorplan`, `exploded` |
| **L3: Real-Time Data Binding** | UI controls drive 3D state + dashboards | All templates |

---

## Module Catalogue (Series 100-500)

Full mapping in master document Section 8.2. Quick reference:

| Series | Law | Modules | Templates Used |
|--------|-----|---------|---------------|
| 100 | PD 1096 | 9 | parametric, exploded, cutaway, floorplan, animated |
| 200 | BP 344 | 9 | parametric, floorplan |
| 300 | RA 9514 | 7 | parametric, floorplan, cutaway, exploded, **simulation** (NEW) |
| 400 | BP 220/PD 957 | 6 | parametric, floorplan, **site-planner** (NEW) |
| 500 | GBC | 4 | parametric, floorplan, cutaway, **simulation** (NEW) |

---

## Verification Workflow (Per Module)

```
STEP 1: List every min, max, default, step, threshold in the config
STEP 2: For each value, find it in this ledger or the shared constants file
STEP 3: If NOT found → HALT. Ask user for law text. Do NOT guess.
STEP 4: Classify: code-mandated | code-derived | pedagogical | ux-arbitrary
STEP 5: If another module references same law section → values MUST match
STEP 6: Add citation to ParameterDef and ViolationRule
```

---

## Audit Script

`scripts/audit-legal-citations.ts` — run as `bun run audit:citations`
- Scans all configs in `config/modules/`
- Reports: % parameters cited, % violations cited, uncited constants list
- Target: 100% `code-mandated` values cited
