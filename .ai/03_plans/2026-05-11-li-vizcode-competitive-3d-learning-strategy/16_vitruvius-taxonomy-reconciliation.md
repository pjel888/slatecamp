# 16 — Vitruvius Connection Taxonomy Reconciliation

## Purpose

Reconcile the vitruvius-connection canonical knowledge taxonomy with the 3D Lab's 16-category LEA-aligned taxonomy. This document defines the mapping so that:
1. LI module configs placed in a 3D Lab category can reference the correct vitruvius taxonomy path
2. Source card lookups can traverse from 3D Lab category → vitruvius taxonomy → concept → regulatory basis
3. Content authors know which canonical concepts are available for each LI scene template

## Evidence Basis

- **Vitruvius taxonomy**: 11 top-level taxonomy nodes with topics and subtopics in `vitruvius-connection/003_Canonical-Knowledge-Layer/shared/taxonomy/`
- **Vitruvius concepts**: 88 concept files in `shared/concepts/` with `taxonomy_path`, `regulatory_basis`, and `stringency_vector`
- **3D Lab taxonomy**: 16 LEA-aligned categories in `src/features/3d-lab/config/taxonomy.ts`

## Taxonomy Mapping

| 3D Lab Category (cat-XX) | Vitruvius Taxonomy | Relationship |
|--------------------------|-------------------|-------------|
| `BUILDING_CODE` (cat-01) — PD 1096 NBCP | `taxonomy-building-code` + `taxonomy-spaces-occupancy` | Building code provisions governing spaces, dimensions, occupancy |
| `ACCESSIBILITY` (cat-02) — BP 344 | `taxonomy-accessibility` | Barrier-free design, routes, accessible features |
| `FIRE_CODE` (cat-03) — RA 9514 | `taxonomy-fire-life-safety` | Fire protection, egress, life safety |
| `STRUCTURAL` (cat-04) — NSCP | *(No direct taxonomy match)* | Structural concepts are embedded in `taxonomy-building-systems` |
| `PLUMBING` (cat-05) — NPCP | `taxonomy-building-systems` → `topic-utilities` | Building services, water systems |
| `ELECTRICAL` (cat-06) — PEC | `taxonomy-building-systems` → `topic-utilities` | Building services |
| `MECHANICAL` (cat-07) — PMEC | `taxonomy-building-systems` → `topic-utilities` | HVAC, mechanical systems |
| `VERTICAL` (cat-08) — Stairs/Elevators | `taxonomy-fire-life-safety` → `topic-egress` | Stairs, exits, vertical circulation |
| `CONSTRUCTION` (cat-09) | `taxonomy-construction-execution` | Construction admin, contracts, procurement |
| `MATERIALS` (cat-10) | `taxonomy-building-systems` → `topic-concrete` | Concrete detailing, materials |
| `ARCH_HISTORY` (cat-11) | `taxonomy-architecture` → `topic-history` | History, preservation, regionalism |
| `PH_HERITAGE` (cat-12) | `taxonomy-architecture` → `topic-history` → `subtopic-preservation` | Heritage, built heritage |
| `PLANNING` (cat-13) | `taxonomy-site-infrastructure` + `taxonomy-regulatory-permits` | Land use, zoning, housing, permits |
| `PROF_PRACTICE` (cat-14) | `taxonomy-project-practice` | Ethics, registration, standards, dispute resolution |
| `ESTIMATING` (cat-15) | `taxonomy-construction-execution` → `subtopic-cost-control` | Estimating, quantity surveying |
| `SITE_DEV` (cat-16) | `taxonomy-site-infrastructure` | Site planning, parking, infrastructure |

## Concept-to-Scene-Template Mapping

This maps every enriched vitruvius concept (canonical_status = "enriched" or "validated") to the LI scene template it supports.

### P0 Scene Templates

#### Template 1: Accessible Route / Ramp Scene

| Concept ID | Title | Status | Source | Section | Key Dimensions/Values |
|-----------|-------|--------|--------|---------|----------------------|
| `concept-accessible-ramps` | Accessible Ramps | enriched | `irr-revised-implementing-rules-and-regulations-of-batas-pambansa-blg-344` | `section-1` | Ramps required where level changes occur |
| *(ramp slope concept not yet in vitruvius)* | Ramp Slope | — | BP 344 | §4 | 1:12 max slope; 1:20 preferred |
| *(landing concept not yet in vitruvius)* | Landing | — | BP 344 | §4 | 1.5m min landing length |
| *(handrail concept not yet in vitruvius)* | Handrails | — | BP 344 | §5 | 0.90m-1.10m height; both sides |
| *(curb ramp concept not yet in vitruvius)* | Curb Ramps | — | BP 344 | §4 | 1:12 max slope; detectable warnings |

**Coverage**: 1 of ~8 concepts enriched. **Priority**: Enrich remaining BP 344 ramp concepts.

#### Template 2: Accessible Toilet Room Scene

| Concept ID | Title | Status | Source | Section | Key Dimensions/Values |
|-----------|-------|--------|--------|---------|----------------------|
| *(toilet room concepts not yet in vitruvius)* | — | — | BP 344 | §6 | Toilets, grab bars, clearances, doors |

**Coverage**: 0 of ~10 concepts enriched. **Priority**: Create and enrich BP 344 toilet concepts.

#### Template 3: Egress / Stair Scene

| Concept ID | Title | Status | Source | Section | Key Dimensions/Values |
|-----------|-------|--------|--------|---------|----------------------|
| `concept-stairs` | Stairs | enriched | `law-national-building-code-of-the-philippines` | `sec-1207` | Construction of stairs per occupant load |
| `concept-means-of-egress` | Means of Egress | enriched | `law-national-building-code-of-the-philippines` | `sec-1207` | Exit requirements per occupant load |
| `concept-doors-and-exits` | Doors and Exits | enriched | `law-national-building-code-of-the-philippines` | `sec-1007` | Door swing, property line projection |
| `concept-occupancy-load` | Occupancy Load | enriched | `law-national-building-code-of-the-philippines` | `sec-1207` | Occupant load determination by floor area |
| `concept-exit-width` | Exit Width | draft | *(none yet)* | — | Exit width requirements |

**Coverage**: 4 of ~15 concepts enriched, 1 draft. **Priority**: Enrich exit-width, add handrail, riser, tread, landing concepts.

### P1 Scene Templates

#### Template 5: Site-Lot / Setback / Open-Space Comparator

| Concept ID | Title | Status | Source | Section | Key Dimensions/Values |
|-----------|-------|--------|--------|---------|----------------------|
| `concept-setbacks` | Setbacks | draft | *(none yet)* | — | Setback requirements |
| `concept-open-courts` | Open Courts | enriched | `law-national-building-code-of-the-philippines` | `sec-804` | Min court dimension 2.00m; passageway min 1.20m |
| `concept-yards` | Yards | draft | *(none yet)* | — | Yard requirements |
| `concept-floor-area-ratio` | Floor Area Ratio | draft | *(none yet)* | — | FAR computation |
| `concept-lot-occupancy` | Lot Occupancy | draft | *(none yet)* | — | Lot occupancy limits |
| `concept-parking-and-loading-spaces` | Parking and Loading | draft | *(none yet)* | — | Parking requirements |
| `concept-projections-over-public-ways` | Projections | draft | *(none yet)* | — | Projection limits |
| `concept-comprehensive-land-use-plan` | CLUP | draft | *(none yet)* | — | Land use planning |

**Coverage**: 1 enriched, 7 draft of ~21 concepts. **Priority**: Enrich PD 1096 and BP 220/PD 957 setback/court/lot concepts.

#### Template 7: Fire Separation / Compartmentation Scene

| Concept ID | Title | Status | Source | Section | Key Dimensions/Values |
|-----------|-------|--------|--------|---------|----------------------|
| `concept-fire-resistive-construction` | Fire-Resistive Construction | enriched | `law-national-building-code-of-the-philippines` | `sec-1215` | Fire-resistive requirements by construction type |

**Coverage**: 1 of ~12 concepts enriched. **Priority**: Add fire wall, fire zone, compartmentation concepts.

#### Template 8: Massing + Grade-Plane + Projection Scene

| Concept ID | Title | Status | Source | Section | Key Dimensions/Values |
|-----------|-------|--------|--------|---------|----------------------|
| `concept-building-height` | Building Height | enriched | `law-national-building-code-of-the-philippines` | `sec-707` | Height per occupancy and construction type; measured from sidewalk; 3.00m tolerance |
| `concept-floor-area` | Floor Area | draft | *(none yet)* | — | GFA computation |
| `concept-projections-over-public-ways` | Projections | draft | *(none yet)* | — | Eaves, canopies, awnings |

**Coverage**: 1 enriched, 2 draft of ~10 concepts. **Priority**: Enrich height/massing concepts with specific BHL values.

### Non-LI Relevant Concepts (P2, Professional Practice)

These concepts exist but map to non-3D domains:

| Concept ID | Domain |
|-----------|--------|
| `concept-building-permit` | Permits (regulatory) |
| `concept-certificate-of-occupancy` | Permits |
| `concept-architectural-firm-registration` | Professional Practice |
| `concept-code-of-ethics` | Professional Practice |
| `concept-illegal-practice-of-architecture` | Professional Practice |
| Various history/theory concepts | Architecture History |

## Concept Status Summary

| Status | Count | LI-Relevant |
|--------|-------|------------|
| enriched | ~45 | ~15 |
| draft | ~35 | ~25 |
| validated | Few | ~5 |
| autonomous-ai-admission | ~8 | ~3 (history/theory) |

**Key insight**: ~25 draft concepts are directly relevant to LI scene templates but need enrichment (regulatory_basis, evidence_snippets) before they can serve as source cards.

## Dimension Gap Analysis

LI scene templates need specific numeric dimensions. Currently:

| Dimension | Source | Available in Vitruvius? |
|-----------|--------|------------------------|
| Ramp slope 1:12 | BP 344 §4 | ❌ Not extracted as concept |
| Ramp width 1.20m | BP 344 §4 | ❌ Not extracted as concept |
| Landing length 1.50m | BP 344 §4 | ❌ Not extracted as concept |
| Handrail height 0.90-1.10m | BP 344 §5 | ❌ Not extracted as concept |
| Court min dimension 2.00m | PD 1096 §804 | ✅ concept-open-courts (enriched) |
| Court passageway 1.20m | PD 1096 §804 | ✅ concept-open-courts (enriched) |
| BHL tolerance 3.00m | PD 1096 §707 | ✅ concept-building-height (enriched) |
| Stair riser/tread dimensions | PD 1096 §1207 | ❌ Not extracted as concept |
| Exit width per occupant | PD 1096 §1207 | ❌ concept-exit-width is draft |
| Occupant load unit areas | PD 1096 §1207 | ❌ concept-occupancy-load lacks specific table |

**Critical finding**: Most LI-relevant dimensions exist in raw PDFs but have NOT been extracted into structured concept form. This is the primary bottleneck for LI module content authoring.

## Recommended Enrichment Priority for LI

| Priority | Concepts to Enrich | Supports |
|----------|-------------------|----------|
| **P0** | Ramp slope, ramp width, landing, handrails, curb ramps | Template #1 (MVP) |
| **P0** | Stair riser, tread, landing, handrail dimensions | Template #3 (MVP) |
| **P0** | Exit width (enrich draft) | Template #3 (MVP) |
| **P1** | Setbacks (enrich draft), yards, lot-occupancy, FAR | Template #5 |
| **P1** | Fire wall, fire zone, compartmentation | Template #7 |
| **P1** | Toilet room clearances, grab bars, door clearances | Template #2 |

## Integration Pattern

```
LI Module Config
  └── layers[].sourceCardId: "concept-accessible-ramps"
        └── resolves to → vitruvius-connection concept
              └── regulatory_basis:
                    source_id: "irr-revised-implementing-rules-and-regulations-of-batas-pambansa-blg-344"
                    section_id: "section-1"
                    evidence_snippet: "Accessible ramps shall have..."
                      └── resolves to → 001_Raw-Source-Layer/001-Laws/BP-344/*.pdf
```
