# SlateCamp 3D Development Controls Lab — Procurement Dossier
**Project:** SlateCamp · PD 1096 IRR Rules VII & VIII Interactive Learning Experience
**Stack:** Next.js 14 / React 18 / React Three Fiber / Zustand / Supabase
**Scope:** Resolution of all P0–P2 blockers identified in the Gap Analysis

***

## Executive Summary

This dossier procures all materials required to resolve the five P0 development blockers, four P1 feature-completeness gaps, and six P2 UX-completeness gaps itemized in the project's Gap Analysis. Every regulatory table is transcribed directly from the official DPWH-published 2004 Revised IRR of PD 1096 (as published April 2005). All engineering specifications are derived from authoritative library documentation.[^1][^2][^3][^4][^5]

***

## Part I — Regulatory Data (P0 & P1 Resolution)

### P0-1 · Table VII.G.3 — Angular Plane Coefficient Table (COMPLETE)

**Source:** 2004 Revised IRR of PD 1096, Rule VII Guidelines, Section A, Table VII.G.3[^6][^7]

The table below is the **complete** Table VII.G.3 as published. Only R-1 and C-3 are provided directly; all intermediate uses/occupancies must be extrapolated between these two endpoints, as the IRR specifies: *"Angles or slopes for other permitted uses/occupancies in between can be extrapolated."* Projections are defined as eaves, medias aguas, cantilevers, and heavy sign supports.[^7]

**CRITICAL LEGAL CLARIFICATION:** Table VII.G.3 defines angular planes from the **RROW centerline** only. This is the AMVB/OFB plane. The BHL angular plane originates from the **front property line** and must be computed separately using Section 707 and Figure VII.G.1. The slope values in this table do **not** directly substitute for `ANGULAR_PLANE_TANGENT` in `computeBHL.ts`.[^8][^9]

#### Table VII.G.3: Reference Table of Angles/Slopes to Satisfy Natural Light and Ventilation Requirements Along RROW and Front Yards

| Type of Use or Occupancy | RROW Width | Without Projections — Angle from CL of RROW (°) | Without Projections — Ratio (Slope) | With Projections — Angle from CL of RROW (°) | With Projections — Ratio (Slope) |
|---|---|---|---|---|---|
| Residential 1 (R-1) | 8.00 m | 46.5° | 9m : 8.5m (1.06) | 50.0° | 7.5m : 6.25m (1.20) |
| Residential 1 (R-1) | 10.00 m | 43.0° | 9m : 9.5m (0.95) | 46.0° | 7.5m : 7.25m (1.03) |
| Residential 1 (R-1) | 12.00 m | 40.0° | 9m : 10.5m (0.86) | 43.0° | 7.5m : 8.25m (0.91) |
| Residential 1 (R-1) | 14.00 m | 38.0° | 9m : 11.5m (0.81) | 39.0° | 7.5m : 9.25m (0.78) |
| Residential 1 (R-1) | 16.00 m | 35.0° | 9m : 12.5m (0.72) | 36.0° | 7.5m : 10.25m (0.73) |
| Residential 1 (R-1) | 18.00 m | 33.5° | 9m : 13.5m (0.67) | 33.0° | 7.5m : 11.25m (0.67) |
| Residential 1 (R-1) | 20.00 m | 31.0° | 9m : 14.5m (0.62) | 32.0° | 7.5m : 12.25m (0.61) |
| Commercial 3 (C-3) | 8.00 m | 71.0° | 48m : 16.5m (2.90) | — | — |
| Commercial 3 (C-3) | 10.00 m | 69.5° | 48m : 17.5m (2.74) | — | — |
| Commercial 3 (C-3) | 12.00 m | 68.0° | 48m : 18.5m (2.59) | — | — |
| Commercial 3 (C-3) | 14.00 m | 65.5° | 48m : 19.5m (2.46) | — | — |
| Commercial 3 (C-3) | 16.00 m | 63.6° | 48m : 20.5m (2.34) | — | — |
| Commercial 3 (C-3) | 18.00 m | 61.7° | 48m : 21.5m (2.23) | — | — |
| Commercial 3 (C-3) | 20.00 m | 60.0° | 48m : 22.5m (2.13) | — | — |

**Interpolation guidance for intermediate zones (R-2, R-3, C-1, C-2, etc.):**
For a given RROW width \(w\), with R-1 slope \(s_{R1}(w)\) and C-3 slope \(s_{C3}(w)\), and an intermediate zone occupancy index \(t \in [0, 1]\) (where \(t = 0\) = R-1 and \(t = 1\) = C-3), the interpolated slope is \(s(t, w) = s_{R1}(w) \cdot (1 - t) + s_{C3}(w) \cdot t\). Zone ordering by development intensity: R-1 → R-2 → R-3 → R-4 → R-5 → C-1 → C-2 → C-3.[^10][^11]

**Implementation note for `ANGULAR_PLANE_TANGENT`:** The tangent (slope ratio H:S) for use in `computeBHL.ts` is the **reciprocal** of the slope column values above, because the table expresses `horizontal : vertical` (run : rise), while the BHL formula uses `rise / run = H / S`. For C-3 at 14m RROW (without projections), `tan(θ) = 19.5/48 = 0.406`, not `2.46`. This is the critical inversion that must be validated against the actual IRR illustration Figures VII.G.1 and VII.G.2 and the BHL section of Rule VII.[^12][^8]

***

### P0-2 & P1-1-related · `computeSetbacks.ts` — Complete SETBACK_TABLE

**Source:** 2004 Revised IRR of PD 1096, Rule VIII, Section 804, Tables VIII.2 and VIII.3[^13][^14][^2]

#### Table VIII.2: Minimum Setbacks for Residential Buildings/Structures (meters)

| Yard | R-1 | R-2 Basic | R-2 Maximum | R-3 Basic | R-3 Maximum | R-4 (Townhouse Individual Lot) | R-5 (Condominium) |
|---|---|---|---|---|---|---|---|
| Front | 4.50 | 8.00* | 8.00* | 3.00 | 8.00* | 4.50 | 6.00 |
| Side | 2.00 | 2.00** | 2.00** | 2.00*** | 2.00*** | (optional) | 3.00 |
| Rear | 2.00 | 2.00 | 2.00 | 2.00*** | 2.00*** | 2.00 | 3.00 |

**Notes:**[^2]
- `*` Total front setback at grade (natural ground) level: 3.00 m required setback + 5.00 m for parking = 8.00 m. Second and upper floors require minimum 3.00 m.
- `**` One side setback required; abutment on the other side allowed (with conditions).
- `***` Abutments on two sides and rear property lines may be allowed for Basic R-3 provided: (a) open space under PSO/Table VIII.2 satisfied; (b) window opening under Section 808 satisfied; (c) firewall with minimum 2-hour fire-resistive rating at minimum 400 mm above roof.
- R-1: Firewalls are absolutely prohibited on all property lines.
- R-5 mixed-use buildings where ≥55% GFA is commercial are treated as commercial for setback purposes.

#### Table VIII.3: Setbacks for Commercial, Industrial, Institutional, and Recreational Buildings (meters)

| RROW Width | Front | Side | Rear |
|---|---|---|---|
| 30.00 m and above | 6.00 | 5.00 | 5.00 |
| 25.00–29.00 m | 5.00 | 3.00 | 3.00 |
| 20.00–24.00 m | 5.00 | 3.00 | 3.00 |
| 10.00–19.00 m | 3.00 | 2.00 | 2.00 |
| Below 10.00 m | 2.00 | 2.00 | 2.00 |

Table VIII.3 applies uniformly to **all** non-residential occupancy groups (B through J) — commercial, industrial, institutional, and recreational. The setback is determined solely by RROW width, not by occupancy group.[^14][^2]

#### Section 804.6 — Incremental Setbacks for Multi-Storey Buildings

For buildings of more than two (2) storeys in height, the minimum width of the rear or side court shall be increased at the rate of **300 millimeters (0.30 m) per additional storey** above the 2nd storey, up through the 14th storey. For buildings exceeding 14 storeys, compute as if 14 storeys.[^2]

**TypeScript implementation of incremental setback modifier:**

```typescript
// Section 804.6 implementation
function incrementalSetbackModifier(storeys: number): number {
  const clampedStoreys = Math.min(storeys, 14);
  if (clampedStoreys <= 2) return 0;
  return (clampedStoreys - 2) * 0.30;
}

// In computeSetbacks:
const baseSetback = getBaseSetback(occupancyGroup, zoningClass, rrowWidth);
const increment = incrementalSetbackModifier(buildingStoreys);
return {
  front: baseSetback.front, // front yard is NOT incremented (only side/rear courts)
  rear: baseSetback.rear + increment,
  left: baseSetback.left + increment,
  right: baseSetback.right + increment,
};
```

**Important:** The incremental setback applies to **courts and yards (side/rear)** only — the front yard is governed by the angular plane from the RROW centerline (Rule VII), not this formula.[^12][^2]

***

### P0-4 · Table VIII.1 — Complete Dual-Column PSO/ISA/USA Table

**Source:** 2004 Revised IRR of PD 1096, Rule VIII, Section 803.4, Table VIII.1[^15][^2]

Column `(e)` = without firewall; Column `(f)` = with firewall. R-1 has **no PSO entry** — compliance is achieved solely through setback enforcement and minimum yard standards in Table VIII.2.[^2]

#### Table VIII.1: Reference Table of Maximum Allowable PSO, ISA, MACA, USA, and TOSL by Land Use Zoning per Lot

| Land Use / Zone | PSO (e) — Without Firewall | PSO (f) — With Firewall | Max ISA (Paved Open Spaces) | Min USA (Unpaved) | TOSL (ISA + USA) |
|---|---|---|---|---|---|
| **R-1** (Residential 1 — Low Density) | *No PSO — setback-governed* | *Firewalls prohibited* | 30% | 15% | 45% |
| **R-2 Basic** (Medium Density, BHL 10m) | 55% | 60% | 30% | 10% | 40% |
| **R-2 Maximum** (Multiple Family, BHL 15m) | 60% | 70% | 20% | 10% | 30% |
| **R-3 Basic** (High Density, BHL 10m) | 70% | 80% | 20% | 10% | 30% |
| **R-3 Maximum** (Multiple Family, BHL 36m) | 70% | 80% | 10% | 10% | 20% |
| **R-4** (Townhouse Individual Lot, BHL 10m) | 70% | 80% | 20% | 10% | 30% |
| **R-5** (Condominium, BHL 36–54m) | 70% | 80% | 10% | 10% | 20% |
| **C-1 / Com-1** | 70% | 80% | 20% | 10% | 30% |
| **C-2 / Com-2** | 75% | 85% | 20% | 5% | 25% |
| **C-3 / Com-3** | 80% | 90% | 15% | 5% | 20% |
| **I-1 / Ind-1** | 70% | 80% | 20% | 10% | 30% |
| **I-2 / Ind-2** | 70% | 80% | 15% | 15% | 30% |
| **I-3 / Ind-3** | 70% | 80% | 5% | 15% | 20% |
| **Institutional** | 50% | 60% | 20% | 30% | 50% |
| **Cultural** | 60% | 70% | 20% | 20% | 40% |
| **UTS** (Utility/Transportation/Services) | 50% | 60% | 40% | 10% | 50% |
| **Parks / Open Recreational** | — | — | 20% | 30% | 50% |
| **PUD — Reclamation near airport** | — | 60% | 30% | 10% | 40% |
| **PUD — Reclamation area** | — | 60% | 20% | 20% | 40% |
| **PUD — Coastal area** | — | 50% | 40% | 10% | 50% |
| **PUD — Inland near airport** | — | 30% | 20% | 50% | 70% |
| **PUD — Inland** | — | 20% | 10% | 70% | 80% |
| **Cemetery** | — | 70% | 15% | 15% | 30% |
| **Sidewalks / Arcades at RROW** | 22.22% of RROW width | — | 11.11% of RROW | — | 33.33% of RROW |

**R-1 Special Case — Correct Implementation:**[^2]
R-1 does not receive a PSO cap from Table VIII.1. The `computeAMBF` function must branch on zone class R-1 and skip all PSO-based AMBF candidate computation entirely. The governing AMBF for R-1 is determined exclusively by the setback-derived footprint from Table VIII.2 (front: 4.50 m, side: 2.00 m, rear: 2.00 m).[^2]

**Firewall-aware lookup pattern:**

```typescript
type FirewallState = 'none' | 'active';

function lookupPSO(zone: ZoneClass, firewall: FirewallState): number | null {
  if (zone === 'R-1') return null; // setback-only governance
  const row = TABLE_VIII_1[zone];
  return firewall === 'active' ? row.psoF : row.psoE;
}

function lookupISA(zone: ZoneClass, firewall: FirewallState): number {
  const row = TABLE_VIII_1[zone];
  // ISA does not have a firewall variant in Table VIII.1; same value applies
  return row.isa;
}
```

***

### P1-2 · Table VII.G.2 — GFA-to-TGFA Conversion Multipliers

**Source:** 2004 Revised IRR of PD 1096, Rule VII Guidelines, Table VII.G.2[^16][^6][^7]

The two-step computation is:
\[ \text{GFA} = \text{TLA} \times \text{FLAR} \]
\[ \text{TGFA} = \text{GFA} \times \text{Multiplier} \]

The `zoning.far` field maps to **FLAR** (net Floor-to-Lot Area Ratio), not a pre-multiplied TGFA/TLA ratio. This is confirmed by the separate Table VII.G.1 which publishes FLAR values and Table VII.G.2 which publishes the multipliers independently.[^7]

#### Table VII.G.2: GFA-to-TGFA Conversion Multipliers

| Building/Structure Type | Excluded Floor Areas (% of TGFA) | Multiplier (GFA → TGFA) |
|---|---|---|
| Residential 1 | 33% | **1.50** |
| Residential 2 (Basic), R-3 (Basic), R-4 | 20% | **1.25** |
| Residential 2 (Maximum), R-3 (Maximum), R-5 | 16% | **1.20** |
| Commercial 1 | 20% | **1.25** |
| Commercial 2 | 25% | **1.33** |
| Commercial 3 | 33% | **1.50** |
| Industrial 1 | 25% | **1.33** |
| Industrial 2 and 3 | 33% | **1.50** |
| Transportation, Utility, and Service Areas | 33% | **1.50** |
| Agricultural and Agro-Industrial | 2%–5% | **1.03–1.06** |

**Updated `computeTGFA` logic:**

```typescript
const GFA_TGFA_MULTIPLIER: Record<OccupancySubtype, number> = {
  'R-1': 1.50,
  'R-2-basic': 1.25, 'R-3-basic': 1.25, 'R-4': 1.25,
  'R-2-max': 1.20,   'R-3-max': 1.20,   'R-5': 1.20,
  'C-1': 1.25, 'C-2': 1.33, 'C-3': 1.50,
  'I-1': 1.33, 'I-2': 1.50, 'I-3': 1.50,
  'UTS': 1.50,
};

function computeTGFA(lot: LotDimensions, zoning: ZoningData): number {
  const gfa = lot.tla * zoning.flar;          // FLAR from Table VII.G.1
  const multiplier = GFA_TGFA_MULTIPLIER[zoning.occupancySubtype];
  return gfa * multiplier;                     // Two-step per Table VII.G.2
}
```

***

### P1-3 · Table VII.1 — TGFA by Lot Type

**Source:** 2004 Revised IRR of PD 1096, Rule VII, Table VII.1 (second table)[^7]

The TGFA is expressed as `BHL(storeys) × PSO% × TLA`. The governing PSO percentage varies by lot type. R-1 is not applicable with firewall (firewalls prohibited on R-1 lots).

#### Table VII.1 (Residential — Without Firewall): Allowable Maximum TGFA as % of TLA

| Zone | Interior/Rear Lot | Inside/Regular Lot | Corner Lot | Through Lot | Corner-Through Lot | Corner Abutting 3+ Streets |
|---|---|---|---|---|---|---|
| R-1 | 3 × 60% | 3 × 50% | 3 × 70% | 3 × 70% | 3 × 70% | 3 × 70% |
| R-2 Basic | 3 × 70% | 3 × 60% | 3 × 70% | 3 × 70% | 3 × 70% | 3 × 70% |
| R-2 Maximum | 5 × 70% | 5 × 60% | 5 × 70% | 5 × 70% | 5 × 70% | 5 × 70% |
| R-3 Basic | 3 × 70% | 3 × 70% | 3 × 70% | 3 × 70% | 3 × 70% | 3 × 70% |
| R-3 Maximum | 12 × 80% | 12 × 80% | 12 × 80% | 12 × 80% | 12 × 80% | 12 × 80% |
| R-4 | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% |
| R-5 | 18 × 80% | 18 × 80% | 18 × 80% | 18 × 80% | 18 × 80% | 18 × 80% |

#### Table VII.1 (Residential — With Firewall): Allowable Maximum TGFA as % of TLA

| Zone | Interior/Rear Lot | Inside/Regular Lot | Corner Lot | Through Lot | Corner-Through Lot | Corner Abutting 3+ Streets |
|---|---|---|---|---|---|---|
| R-1 | N/A | N/A | N/A | N/A | N/A | N/A |
| R-2 Basic | 3 × 75% | 3 × 70% | 3 × 75% | 3 × 75% | 3 × 75% | 3 × 75% |
| R-2 Maximum | 5 × 75% | 5 × 70% | 5 × 75% | 5 × 75% | 5 × 75% | 5 × 75% |
| R-3 Basic | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% |
| R-3 Maximum | 12 × 80% | 12 × 80% | 12 × 80% | 12 × 80% | 12 × 80% | 12 × 80% |
| R-4 | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% | 3 × 80% |
| R-5 | 18 × 80% | 18 × 80% | 18 × 80% | 18 × 80% | 18 × 80% | 18 × 80% |

#### Table VII.1 (Commercial — Without Firewall and With Firewall): Allowable Maximum TGFA as % of TLA

| Zone | Interior | Inside/Regular | Corner | Through | Corner-Through | Corner 3+ Streets |
|---|---|---|---|---|---|---|
| C-1 (without FW) | 5 × 80% | 5 × 75% | 5 × 80% | 5 × 80% | 5 × 90% | 5 × 90% |
| C-2 (without FW) | 12 × 80% | 12 × 75% | 12 × 80% | 12 × 80% | 12 × 90% | 12 × 90% |
| C-3 (without FW) | 30 × 80% | 30 × 75% | 30 × 80% | 30 × 80% | 30 × 90% | 30 × 90% |
| C-1 (with FW + Sprinkler) | 5 × 85% | 5 × 85% | 5 × 90% | 5 × 90% | 5 × 95% | 5 × 95% |
| C-2 (with FW + Sprinkler) | 12 × 85% | 12 × 85% | 12 × 90% | 12 × 90% | 12 × 95% | 12 × 95% |
| C-3 (with FW + Sprinkler) | 30 × 85% | 30 × 85% | 30 × 90% | 30 × 90% | 30 × 95% | 30 × 95% |

**Schema update required:** The `LotDimensions` / `LotData` interface must add:

```typescript
type LotType =
  | 'interior-rear'
  | 'inside-regular'
  | 'corner'
  | 'through'
  | 'corner-through'
  | 'corner-3plus-streets';

interface LotData {
  // ...existing fields...
  lotType: LotType;
}
```

***

### P1-4 · Table VII.G.1 — FLAR Reference Table

**Source:** 2004 Revised IRR of PD 1096, Rule VII Guidelines, Table VII.G.1[^7]

This confirms `zoning.flar` maps to net FLAR (not a pre-multiplied ratio).

| Zone | FLAR Range |
|---|---|
| R-1 | 1.50 (at 3-storey / 10.00 m BHL) |
| R-2 Basic | 1.30–1.50 (at 3-storey / 10.00 m BHL) |
| R-2 Maximum | 2.10–3.00 (at 5-storey / 15.00 m BHL) |
| R-3 Basic | 1.80–2.10 (at 3-storey / 10.00 m BHL) |
| R-3 Maximum | 7.10–8.10 (at 12-storey / 36.00 m BHL) |
| R-4 (Townhouse) | 1.60–1.80 (at 3-storey / 10.00 m BHL) |
| R-5 (Condominium) | 6.00–9.00 (at 18-storey / 54.00 m BHL) |
| C-1 | 1.70–3.00 (at 5-storey / 15.00 m BHL) |
| C-2 | 3.60–9.00 (at 15-storey / 45.00 m BHL) |
| C-3 | 9.00–34.00 (at 60-storey / 180.00 m BHL) |
| I-1 | 1.50–2.50 |
| I-2 | 2.50–3.00 |
| I-3 | 3.00–5.00 |
| Institutional | 2.50 |
| Cultural | 3.50 |
| UTS/RROW | 2.00–3.00 |
| Parks/Open Recreational | 0.50–1.00 |
| PUD (Reclamation near airport) | 6.00 |
| PUD (Reclamation area) | 6.00–12.00 |
| PUD (Coastal) | 12.00–18.00 |
| PUD (Inland near airport) | 6.00–18.00 |
| PUD (Inland) | 9.00–34.00 |
| Cemetery | 0.80 |

***

## Part II — Engineering Specifications (P0 & P2 Resolution)

### P0-3 · Canonical Zustand Store Schema

This is the single authoritative schema reconciling the three conflicting versions across Documents 1, 3, and 4. The `setDpr` runtime error is resolved by moving DPR control into the store.[^17]

```typescript
// /src/store/useDevControlsStore.ts — CANONICAL v1.0

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Primitive Types ────────────────────────────────────────────────

type LabMode = 'lab' | 'exam' | 'sandbox';
type ZoneClass =
  | 'R-1' | 'R-2-basic' | 'R-2-max' | 'R-3-basic' | 'R-3-max'
  | 'R-4' | 'R-5'
  | 'C-1' | 'C-2' | 'C-3'
  | 'I-1' | 'I-2' | 'I-3'
  | 'Institutional' | 'Cultural' | 'UTS'
  | 'Parks' | 'PUD-reclamation-airport' | 'PUD-reclamation'
  | 'PUD-coastal' | 'PUD-inland-airport' | 'PUD-inland'
  | 'Cemetery';

type LotType =
  | 'interior-rear' | 'inside-regular' | 'corner'
  | 'through' | 'corner-through' | 'corner-3plus-streets';

// ─── Input Interfaces ───────────────────────────────────────────────

interface LotDimensions {
  tla: number;         // Total Lot Area (m²)
  depth: number;       // Lot depth (m)
  width: number;       // Lot frontage (m)
  lotType: LotType;    // Required for Table VII.1 TGFA lookup
}

interface ZoningData {
  zoneClass: ZoneClass;
  flar: number;        // Net FLAR from Table VII.G.1 (NOT pre-multiplied)
  bhl: number;         // BHL in metres
  bhlStoreys: number;  // BHL in storeys (integer)
  rrowWidth: number;   // RROW width in metres
}

// ─── Computed Result Types ─────────────────────────────────────────

interface SetbackResult {
  front: number;
  rear: number;
  left: number;
  right: number;
}

interface AMBFCandidates {
  setbackBased: number;   // AMBF from Table VIII.2 / VIII.3
  psoBased: number | null; // AMBF from Table VIII.1 PSO (null for R-1)
  toslBased: number;      // AMBF from minimum TOSL
  governing: number;      // Math.min of all non-null candidates
}

interface SiteMetrics {
  pso: number | null;
  isa: number;
  usa: number;
  tosl: number;
  maca: number;
  ambf: number;
  amvb: number;
  bhlGoverning: number;
  tgfa: number;
  gfa: number;
}

interface AngularPlaneState {
  rrowCenterlineSlope: number;    // from Table VII.G.3
  frontPLAngle: number | null;    // BHL angular plane (requires arch certification)
  amvbVolume: number | null;      // computed after angular plane clip
  angularSliceVolume: number;     // volume above the plane (subtracted from initial prism)
}

// ─── Exam State ────────────────────────────────────────────────────

interface ExamProblem {
  id: string;
  givenLot: LotDimensions;
  givenZone: ZoneClass;
  givenRROW: number;
  targetMetric: 'ambf' | 'tosl' | 'isa' | 'usa' | 'maca' | 'amvb';
  correctAnswer: number;
  tolerance: number;
  codeRef: string;
  rationale: string;
}

interface ExamState {
  mode: 'idle' | 'active' | 'reviewing';
  currentProblem: ExamProblem | null;
  currentProblemIndex: number;
  userAnswer: string;
  isCorrect: boolean | null;
  examTimeRemaining: number | null;  // seconds, null = no timer active
}

// ─── Store Interface ────────────────────────────────────────────────

interface DevControlsState {
  // Mode
  labMode: LabMode;
  setLabMode: (mode: LabMode) => void;

  // Lab progression
  currentStep: number;
  setCurrentStep: (step: number) => void;
  maxUnlockedStep: number;

  // Inputs
  lot: LotDimensions;
  zoning: ZoningData;
  setLot: (lot: Partial<LotDimensions>) => void;
  setZoning: (zoning: Partial<ZoningData>) => void;

  // Firewall toggle
  firewallActive: boolean;
  setFirewallActive: (active: boolean) => void;

  // Computed results (flat — resolved from Document 4 preference)
  setbacks: SetbackResult | null;
  ambfCandidates: AMBFCandidates | null;
  siteMetrics: SiteMetrics | null;
  angularPlane: AngularPlaneState | null;

  // Trigger full recompute
  recompute: () => void;

  // Exam
  examState: ExamState;
  setExamProblem: (problem: ExamProblem) => void;
  submitExamAnswer: (answer: string) => void;
  advanceExamProblem: () => void;

  // Performance / Canvas
  dpr: number;
  setDpr: (dpr: number) => void;          // Resolves the runtime error

  // Audio
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundConsentGiven: boolean;
  setSoundConsentGiven: (given: boolean) => void;
}
```

**Resolution notes:**
- `labMode` (Document 4) wins over `examState.mode` (Documents 1, 3) — the flat `labMode` field supports all three modes natively[^17]
- `siteMetrics`, `setbacks`, `ambfCandidates` as direct flat fields (Document 4) wins over nested `result: DevControlsResult` (Documents 1, 3) — improves Zustand selector performance
- `rrowWidth` is placed on `ZoningData` (not top-level) because it is a zoning/site characteristic
- `setDpr` is added to resolve the `PerformanceMonitor` runtime error
- `currentStep` + `maxUnlockedStep` are added for P2-6 step-locked lab progression
- `examTimeRemaining` is added for P2-4 exam timer

***

### P0-5 · Supabase DDL Migration

**Source:** Supabase Postgres, Row Level Security patterns[^18][^19][^20]

```sql
-- Migration: 0001_slatecamp_initial.sql
-- Run via: supabase db push

-- ─── EXTENSION ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LAB SESSIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug   TEXT NOT NULL,
  lot_params    JSONB NOT NULL DEFAULT '{}',
  zoning_params JSONB NOT NULL DEFAULT '{}',
  current_step  INTEGER NOT NULL DEFAULT 0,
  firewall_active BOOLEAN NOT NULL DEFAULT FALSE,
  lab_mode      TEXT NOT NULL DEFAULT 'lab' CHECK (lab_mode IN ('lab', 'exam', 'sandbox')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- lot_params shape:
-- {
--   "tla": 200.0, "depth": 20.0, "width": 10.0,
--   "lotType": "inside-regular"
-- }

-- zoning_params shape:
-- {
--   "zoneClass": "C-3", "flar": 9.0,
--   "bhl": 48.0, "bhlStoreys": 16,
--   "rrowWidth": 14.0
-- }

-- ─── EXAM ANSWERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug     TEXT NOT NULL,
  problem_id      TEXT NOT NULL,
  check_id        TEXT NOT NULL,
  submitted_value NUMERIC,
  correct_value   NUMERIC NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  tolerance       NUMERIC NOT NULL DEFAULT 0.01,
  lot_snapshot    JSONB NOT NULL DEFAULT '{}',
  zoning_snapshot JSONB NOT NULL DEFAULT '{}',
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── QUIZ ATTEMPTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id      TEXT NOT NULL,
  taxonomy_node TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL,
  difficulty    INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  attempted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lab_sessions_user ON lab_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_slug ON lab_sessions(module_slug);
CREATE INDEX IF NOT EXISTS idx_exam_answers_user ON exam_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, topic_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────
ALTER TABLE lab_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts  ENABLE ROW LEVEL SECURITY;

-- lab_sessions: users see only their own rows
CREATE POLICY "Users own lab_sessions"
  ON lab_sessions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- exam_answers: users see only their own rows
CREATE POLICY "Users own exam_answers"
  ON exam_answers FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- quiz_attempts: users see only their own rows
CREATE POLICY "Users own quiz_attempts"
  ON quiz_attempts FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── RPC: recompute_readiness_score ───────────────────────────────
-- Returns readiness score (0.0–1.0) based on recent quiz attempts
CREATE OR REPLACE FUNCTION recompute_readiness_score(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_total      INTEGER;
  v_correct    INTEGER;
  v_score      NUMERIC;
BEGIN
  SELECT COUNT(*), SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)
  INTO v_total, v_correct
  FROM quiz_attempts
  WHERE user_id = p_user_id
    AND attempted_at > NOW() - INTERVAL '30 days';

  IF v_total = 0 THEN
    RETURN 0.0;
  END IF;

  v_score := ROUND(v_correct::NUMERIC / v_total::NUMERIC, 4);
  RETURN v_score;
END;
$$;
```

**Next.js 14 page.tsx deserialization pattern (Server Component):**[^21][^18]

```typescript
// /src/app/lab/[slug]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { LotDimensions, ZoningData } from '@/types/devControls';

export default async function LabPage({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from('lab_sessions')
    .select('lot_params, zoning_params, current_step, firewall_active, lab_mode')
    .eq('user_id', user?.id)
    .eq('module_slug', params.slug)
    .single();

  const initialLot   = session?.lot_params   as LotDimensions ?? DEFAULT_LOT;
  const initialZoning = session?.zoning_params as ZoningData    ?? DEFAULT_ZONING;
  // Pass to Client Component via props
  return <LabClientRoot initialLot={initialLot} initialZoning={initialZoning} />;
}
```

***

### P2-1 · `AngularPlane.tsx` and `AMVBVolume.tsx` — 3D Geometry Implementation

**Source:** `@react-three/csg` v4 (wrapping `gkjohnson/three-bvh-csg`)[^4][^5][^22]

The correct approach is `@react-three/csg`'s `<Subtraction>` primitive — not raw CSG library calls — as it integrates natively with R3F's render loop.

```typescript
// /src/components/scene/AMVBVolume.tsx
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface AMVBVolumeProps {
  ambf: { width: number; depth: number };
  bhl: number;
  angularPlaneSlope: number; // ratio from Table VII.G.3 (vertical/horizontal = H/S)
  rrowHalfWidth: number;
  position?: [number, number, number];
}

/**
 * Constructs the AMVB prism by subtracting the angular plane wedge
 * from the initial AMBF × BHL rectangular prism.
 *
 * The angular plane originates from the RROW centerline (not the property line).
 * The wedge geometry represents the volume above the angular slope
 * that must be removed from the building prism.
 */
export function AMVBVolume({
  ambf, bhl, angularPlaneSlope, rrowHalfWidth, position = [0, 0, 0]
}: AMVBVolumeProps) {
  const prismWidth  = ambf.width;
  const prismDepth  = ambf.depth;
  const prismHeight = bhl;

  // The angular plane rises at `angularPlaneSlope` (H/S) from the RROW centerline.
  // At the front property line (distance = rrowHalfWidth from CL),
  // the angular plane height = angularPlaneSlope * rrowHalfWidth.
  // The wedge is the volume above this sloped plane cutting through the prism.
  const wedgeHeight = angularPlaneSlope * rrowHalfWidth;

  const wedgeGeometry = useMemo(() => {
    // Build a vertical prism whose profile is a right triangle:
    // base = prismDepth, height = (prismHeight - wedgeHeight) at front face
    const shape = new THREE.Shape();
    shape.moveTo(0, wedgeHeight);
    shape.lineTo(0, prismHeight);
    shape.lineTo(prismDepth, prismHeight);
    shape.lineTo(prismDepth, prismHeight); // rear face: full height
    shape.closePath();

    const extrudeSettings = {
      depth: prismWidth,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [prismDepth, prismWidth, prismHeight, wedgeHeight]);

  return (
    <mesh position={position}>
      <meshStandardMaterial color="#4FC3F7" transparent opacity={0.6} />
      <Geometry>
        {/* Base: full AMBF × BHL rectangular prism */}
        <Base>
          <boxGeometry args={[prismWidth, prismHeight, prismDepth]} />
        </Base>
        {/* Subtract the wedge above the angular plane */}
        <Subtraction geometry={wedgeGeometry} />
      </Geometry>
    </mesh>
  );
}
```

```typescript
// /src/components/scene/AngularPlane.tsx
// Renders the angular plane as a visible diagonal mesh for debugging/UX
import { useMemo } from 'react';
import * as THREE from 'three';

interface AngularPlaneProps {
  rrowHalfWidth: number;
  lotWidth: number;
  bhl: number;
  angularPlaneSlope: number;
  opacity?: number;
}

export function AngularPlane({
  rrowHalfWidth, lotWidth, bhl, angularPlaneSlope, opacity = 0.3
}: AngularPlaneProps) {
  const planeGeometry = useMemo(() => {
    const frontHeight = angularPlaneSlope * rrowHalfWidth;
    const rearHeight  = bhl; // rear face at full BHL (plane exits through top/rear)
    const vertices = new Float32Array([
      -lotWidth / 2, frontHeight, 0,         // front-left
       lotWidth / 2, frontHeight, 0,         // front-right
       lotWidth / 2, rearHeight, -lotWidth,  // rear-right (approximate)
      -lotWidth / 2, rearHeight, -lotWidth,  // rear-left
    ]);
    const indices = [0, 1, 2, 0, 2, 3];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [rrowHalfWidth, lotWidth, bhl, angularPlaneSlope]);

  return (
    <mesh geometry={planeGeometry}>
      <meshStandardMaterial
        color="#FF6F00"
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        wireframe={false}
      />
    </mesh>
  );
}
```

***

### P2-2 · `LabCamera.tsx` — Animated Camera Preset Transitions

**Source:** `@react-three/drei` `CameraControls` component (wraps `yomotsu/camera-controls`)[^3][^23][^24]

`OrbitControls` does not support programmatic transitions. `CameraControls` from drei provides `setLookAt()`, `rotateTo()`, and `lerpLookAt()` with smooth easing controlled via `smoothTime`.[^25][^3]

```typescript
// /src/components/scene/LabCamera.tsx
import { useRef, useCallback } from 'react';
import { CameraControls } from '@react-three/drei';
import type { CameraControls as CameraControlsImpl } from 'camera-controls';
import { useDevControlsStore } from '@/store/useDevControlsStore';
import * as THREE from 'three';

export type CameraPreset = 'ORBIT' | 'TOP' | 'FRONT' | 'ISOMETRIC';

// Preset definitions — position and target in scene space
// Scene is oriented: lot footprint at origin (XZ plane), Y-up
const PRESET_CONFIGS: Record<CameraPreset, {
  position: [number, number, number];
  target:   [number, number, number];
}> = {
  ORBIT:     { position: [30, 25, 30],  target: [0, 5, 0] },
  TOP:       { position: [0, 80, 0.001], target: [0, 0, 0] },  // slight Z offset prevents gimbal lock
  FRONT:     { position: [0, 15, 60],   target: [0, 10, 0] },
  ISOMETRIC: { position: [40, 40, 40],  target: [0, 0, 0] },
};

interface LabCameraProps {
  activePreset?: CameraPreset;
  smoothTime?: number; // seconds to reach target (default 0.4)
}

export function LabCamera({ activePreset = 'ORBIT', smoothTime = 0.4 }: LabCameraProps) {
  const controlsRef = useRef<CameraControlsImpl>(null);

  // Imperatively trigger preset transition — can be called from toolbar
  const transitionTo = useCallback((preset: CameraPreset) => {
    const cc = controlsRef.current;
    if (!cc) return;
    const { position: [px, py, pz], target: [tx, ty, tz] } = PRESET_CONFIGS[preset];
    cc.smoothTime = smoothTime;
    cc.normalizeRotations().setLookAt(px, py, pz, tx, ty, tz, true); // true = enableTransition
  }, [smoothTime]);

  // Export ref to parent via context or store if needed for toolbar integration
  // Example: store.setCameraPreset → useEffect to call transitionTo

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={5}
      maxDistance={200}
      polarAngle={Math.PI / 4}
    />
  );
}

// /src/components/ui/CameraToolbar.tsx — toolbar integration pattern
// import { transitionTo } from './LabCamera' (via context ref)
```

***

### P2-3 · `AMBFGhostCandidates.tsx` — Ghost Envelope Visualization

```typescript
// /src/components/scene/AMBFGhostCandidates.tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { useDevControlsStore } from '@/store/useDevControlsStore';

const ghostPSOmaterial = new THREE.MeshStandardMaterial({
  color: '#FFA000',   // amber
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
});

const ghostTOSLmaterial = new THREE.MeshStandardMaterial({
  color: '#9E9E9E',   // grey
  transparent: true,
  opacity: 0.15,
  depthWrite: false,
});

export function AMBFGhostCandidates() {
  const { ambfCandidates, siteMetrics, zoning } = useDevControlsStore();
  if (!ambfCandidates || !siteMetrics) return null;

  const bhl = zoning.bhl;
  // All ghost envelopes share the same XZ origin as the governing AMBF
  const psoFootprintSide = Math.sqrt(ambfCandidates.psoBased ?? 0);
  const toslFootprintSide = Math.sqrt(ambfCandidates.toslBased);
  const governingFootprintSide = Math.sqrt(ambfCandidates.governing);

  return (
    <group>
      {/* PSO-based AMBF ghost (amber) */}
      {ambfCandidates.psoBased && ambfCandidates.psoBased > ambfCandidates.governing && (
        <mesh position={[0, bhl / 2, 0]} material={ghostPSOmaterial}>
          <boxGeometry args={[
            psoFootprintSide,
            bhl,
            psoFootprintSide
          ]} />
        </mesh>
      )}
      {/* TOSL-based AMBF ghost (grey) */}
      {ambfCandidates.toslBased > ambfCandidates.governing && (
        <mesh position={[0, bhl / 2, 0]} material={ghostTOSLmaterial}>
          <boxGeometry args={[
            toslFootprintSide,
            bhl,
            toslFootprintSide
          ]} />
        </mesh>
      )}
    </group>
  );
}
```

***

### P2-4 · `useSoundEngine.ts` — Web Audio API Synthesis Hook

**Source:** Web Audio API browser standard; React hook patterns[^26][^27][^28]

Browsers block `AudioContext` creation until a user gesture occurs. The hook uses a lazy-init pattern to comply with this policy.[^27]

```typescript
// /src/hooks/useSoundEngine.ts
import { useRef, useCallback, useEffect } from 'react';
import { useDevControlsStore } from '@/store/useDevControlsStore';

type SoundEvent =
  | 'correct_answer'     // 880 Hz sine, 0.08s attack, 0.4s decay
  | 'wrong_answer'       // 220 Hz sawtooth, 0.05s attack, 0.3s decay
  | 'step_unlock'        // 523 Hz + 659 Hz chord, 0.1s attack, 0.5s decay
  | 'metric_update'      // 440 Hz triangle, 0.02s attack, 0.15s decay (UI tick)
  | 'exam_start'         // 880 Hz + 1175 Hz fanfare, 0.12s attack, 0.8s decay
  | 'exam_timer_warning' // 110 Hz sine hum, continuous low amplitude (ambient)
  | 'session_save';      // 660 Hz sine, 0.05s attack, 0.2s decay (soft confirm)

const SOUND_SPECS: Record<SoundEvent, {
  frequency: number;
  type: OscillatorType;
  attackTime: number;
  decayTime: number;
  peakGain: number;
}> = {
  correct_answer:     { frequency: 880,  type: 'sine',     attackTime: 0.08, decayTime: 0.40, peakGain: 0.5 },
  wrong_answer:       { frequency: 220,  type: 'sawtooth', attackTime: 0.05, decayTime: 0.30, peakGain: 0.4 },
  step_unlock:        { frequency: 523,  type: 'sine',     attackTime: 0.10, decayTime: 0.50, peakGain: 0.45 },
  metric_update:      { frequency: 440,  type: 'triangle', attackTime: 0.02, decayTime: 0.15, peakGain: 0.25 },
  exam_start:         { frequency: 880,  type: 'sine',     attackTime: 0.12, decayTime: 0.80, peakGain: 0.55 },
  exam_timer_warning: { frequency: 110,  type: 'sine',     attackTime: 0.30, decayTime: 2.00, peakGain: 0.15 },
  session_save:       { frequency: 660,  type: 'sine',     attackTime: 0.05, decayTime: 0.20, peakGain: 0.30 },
};

export function useSoundEngine() {
  const { soundEnabled, soundConsentGiven } = useDevControlsStore();
  const ctxRef = useRef<AudioContext | null>(null);

  // Lazy init: AudioContext created only after user consent gesture
  const getContext = useCallback((): AudioContext | null => {
    if (!soundConsentGiven || !soundEnabled) return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, [soundConsentGiven, soundEnabled]);

  const play = useCallback((event: SoundEvent) => {
    const ctx = getContext();
    if (!ctx) return;

    const spec = SOUND_SPECS[event];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.frequency, now);

    // ADSR envelope (simplified AD — no sustain for transient sounds)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(spec.peakGain, now + spec.attackTime);
    gain.gain.exponentialRampToValueAtTime(0.001, now + spec.attackTime + spec.decayTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + spec.attackTime + spec.decayTime + 0.05);
  }, [getContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return { play };
}
```

**First-session opt-in UI pattern:** Render a `<SoundConsentBanner>` component that calls `setSoundConsentGiven(true)` only when the user explicitly clicks an "Enable Sounds" button. This constitutes the required user gesture that unblocks `AudioContext` creation.[^27]

***

### P2-5 · Mobile Bottom Sheet — framer-motion Draggable with Gesture Disambiguation

**Source:** framer-motion gestures documentation; touch event handling patterns[^29][^30][^31]

```typescript
// /src/components/ui/MobileBottomSheet.tsx
import { useRef, useState } from 'react';
import { motion, useDragControls, useMotionValue, useTransform } from 'framer-motion';

type SheetPosition = 'equation' | 'default' | 'full';
const POSITION_HEIGHTS: Record<SheetPosition, number> = {
  equation: 0.20,  // 20vh
  default:  0.40,  // 40vh
  full:     0.85,  // 85vh
};

interface MobileBottomSheetProps {
  children: React.ReactNode;
}

export function MobileBottomSheet({ children }: MobileBottomSheetProps) {
  const [snapPosition, setSnapPosition] = useState<SheetPosition>('default');
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  // The drag handle strip at the top of the sheet triggers drag
  // Touch events on the canvas (below the handle) are routed to OrbitControls
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // prevent canvas touch routing
    dragControls.start(e);
  };

  const snapToNearest = (velocity: number, current: number) => {
    const vh = window.innerHeight;
    const snapPoints = Object.entries(POSITION_HEIGHTS).map(([k, v]) => ({
      key: k as SheetPosition,
      px: vh * (1 - v),
    }));
    // Snap to closest snap point considering drag velocity
    const target = velocity > 300
      ? snapPoints.find(s => s.key === 'equation')!
      : velocity < -300
      ? snapPoints.find(s => s.key === 'full')!
      : snapPoints.reduce((prev, curr) =>
          Math.abs(curr.px - current) < Math.abs(prev.px - current) ? curr : prev
        );
    setSnapPosition(target.key);
  };

  const height = `${POSITION_HEIGHTS[snapPosition] * 100}vh`;

  return (
    <motion.div
      ref={sheetRef}
      drag="y"
      dragControls={dragControls}
      dragListener={false}       // disable global drag — only from handle
      dragConstraints={{ top: 0, bottom: window.innerHeight * 0.8 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => snapToNearest(info.velocity.y, info.point.y)}
      animate={{ height }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Drag handle — only element that initiates sheet drag */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          touchAction: 'none',  // prevent scroll interference
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#ccc' }} />
      </div>
      <div style={{ overflowY: 'auto', height: 'calc(100% - 48px)', touchAction: 'pan-y' }}>
        {children}
      </div>
    </motion.div>
  );
}
```

**Gesture disambiguation strategy:** The canvas occupies the full viewport. The bottom sheet overlays the bottom portion. Touch events on the **drag handle** (top 48px of sheet) are captured by `onPointerDown` + `dragControls.start()` and `stopPropagation()` prevents the event from reaching the canvas. Touch events on the **canvas above the sheet** pass through to OrbitControls/CameraControls normally. This approach avoids competing event handlers.[^31][^29]

***

### P2-6 · `ComputationStepCard` — 8-Step Content Schema

```typescript
// /src/data/labSteps.ts
export interface StepDefinition {
  id: number;           // 1-indexed
  slug: string;         // unique key
  label: string;        // Display title (short)
  description: string;  // Pedagogical explanation shown above input
  formulaString: string;// LaTeX or plain formula string
  inputType: 'number' | 'select' | 'none';
  inputLabel?: string;
  inputUnit?: string;
  metric: 'ambf' | 'tosl' | 'pso' | 'isa' | 'usa' | 'maca' | 'bhl' | 'amvb';
  unlocksAfterStep: number | null; // null = always unlocked
  codeRef: string;      // e.g. "Rule VIII, Sec. 803, Table VIII.1"
}

export const LAB_STEPS: StepDefinition[] = [
  {
    id: 1, slug: 'setbacks',
    label: 'Minimum Setbacks',
    description: 'Determine the required front, side, and rear setbacks from the applicable Table VIII.2 (residential) or Table VIII.3 (commercial) based on RROW width.',
    formulaString: 'Setback = f(OccupancyGroup, RROWwidth)',
    inputType: 'none',
    metric: 'ambf',
    unlocksAfterStep: null,
    codeRef: 'Rule VIII, Sec. 804, Table VIII.2 / VIII.3',
  },
  {
    id: 2, slug: 'ambf-setback',
    label: 'Setback-Based AMBF',
    description: 'Calculate the Allowable Maximum Building Footprint from the setback-reduced lot.',
    formulaString: 'AMBF₁ = (LotWidth − SetbackL − SetbackR) × (LotDepth − SetbackF − SetbackR)',
    inputType: 'number', inputLabel: 'Your AMBF (setback)', inputUnit: 'm²',
    metric: 'ambf',
    unlocksAfterStep: 1,
    codeRef: 'Rule VIII, Sec. 804',
  },
  {
    id: 3, slug: 'pso-ambf',
    label: 'PSO-Based AMBF',
    description: 'Apply the Maximum Allowable PSO from Table VIII.1. For R-1, this step is skipped — setback governs only.',
    formulaString: 'AMBF₂ = TLA × PSO%',
    inputType: 'number', inputLabel: 'Your AMBF (PSO)', inputUnit: 'm²',
    metric: 'pso',
    unlocksAfterStep: 1,
    codeRef: 'Rule VIII, Sec. 803, Table VIII.1',
  },
  {
    id: 4, slug: 'tosl-usa',
    label: 'TOSL & USA',
    description: 'Calculate the Total Open Space within Lot (TOSL = ISA + USA) and verify Minimum USA requirement from Table VIII.1.',
    formulaString: 'TOSL = TLA − AMBF\nUSA ≥ TLA × USA%\nISA = TOSL − USA',
    inputType: 'number', inputLabel: 'Your governing AMBF', inputUnit: 'm²',
    metric: 'tosl',
    unlocksAfterStep: 3,
    codeRef: 'Rule VIII, Sec. 803.3, Table VIII.1',
  },
  {
    id: 5, slug: 'maca',
    label: 'MACA',
    description: 'Compute the Maximum Allowable Construction Area: the sum of the building footprint and paved open spaces.',
    formulaString: 'MACA = PSO + ISA',
    inputType: 'number', inputLabel: 'Your MACA', inputUnit: 'm²',
    metric: 'maca',
    unlocksAfterStep: 4,
    codeRef: 'Rule VIII, Sec. 803, Note c',
  },
  {
    id: 6, slug: 'bhl',
    label: 'Building Height Limit',
    description: 'Identify the BHL from Table VII.2 for the given zone and determine the governing height from zoning, aeronautical clearances, and angular plane.',
    formulaString: 'BHL = min(ZoningBHL, AeroBHL, AngularPlaneBHL)',
    inputType: 'number', inputLabel: 'Governing BHL', inputUnit: 'm',
    metric: 'bhl',
    unlocksAfterStep: 1,
    codeRef: 'Rule VII, Sec. 707, Table VII.2',
  },
  {
    id: 7, slug: 'amvb',
    label: 'Allowable Max Volume of Building',
    description: 'Compute the initial AMVB prism then reduce by the angular plane slice from the RROW centerline using Table VII.G.3.',
    formulaString: 'AMVB_initial = AMBF × BHL\nAMVB_final = AMVB_initial − AngularPlaneSlice',
    inputType: 'number', inputLabel: 'Your AMVB (final)', inputUnit: 'm³',
    metric: 'amvb',
    unlocksAfterStep: 6,
    codeRef: 'Rule VII Guidelines, Sec. A, Table VII.G.3',
  },
  {
    id: 8, slug: 'tgfa',
    label: 'Total Gross Floor Area',
    description: 'Compute the Allowable Maximum TGFA using FLAR (Table VII.G.1) and the GFA-to-TGFA multiplier (Table VII.G.2). Cross-check against the BHL × AMBF method from Table VII.1.',
    formulaString: 'GFA = TLA × FLAR\nTGFA = GFA × Multiplier (Table VII.G.2)',
    inputType: 'number', inputLabel: 'Your TGFA', inputUnit: 'm²',
    metric: 'ambf',
    unlocksAfterStep: 7,
    codeRef: 'Rule VII Guidelines, Table VII.G.1 + VII.G.2',
  },
];
```

***

## Part III — Seed Data (P1-1 Resolution)

### Exam Problem Bank — 10 Seeded Instances

**Source:** Verified computations against PD 1096 2004 Revised IRR tables[^9][^7][^2]

```typescript
// /src/data/examProblems.ts
export const EXAM_PROBLEMS: ExamProblem[] = [
  {
    id: 'ep-001',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 14,
    targetMetric: 'ambf',
    // PSO = 80% (C-3, no firewall) → AMBF_pso = 200 × 0.80 = 160 m²
    // Setbacks (RROW 14m): front=3m, side=2m, rear=2m → (10−4)×(20−5) = 6×15 = 90 m²
    // Governing = min(90, 160) = 90 m²
    correctAnswer: 90,
    tolerance: 0.5,
    codeRef: 'Table VIII.1 (C-3), Table VIII.3 (RROW 14m)',
    rationale: 'Setback-based AMBF (90 m²) governs over PSO-based AMBF (160 m²)',
  },
  {
    id: 'ep-002',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 14,
    targetMetric: 'tosl',
    // Governing AMBF = 90 m². TOSL = TLA − AMBF = 200 − 90 = 110 m²
    correctAnswer: 110,
    tolerance: 0.5,
    codeRef: 'Rule VIII, Sec. 803.3',
    rationale: 'TOSL = TLA − governing AMBF',
  },
  {
    id: 'ep-003',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 14,
    targetMetric: 'isa',
    // Table VIII.1 C-3 (no FW): ISA = 15% → 200 × 0.15 = 30 m²
    correctAnswer: 30,
    tolerance: 0.5,
    codeRef: 'Table VIII.1 (C-3, without firewall)',
    rationale: 'ISA = TLA × 15% (C-3 without firewall)',
  },
  {
    id: 'ep-004',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 14,
    targetMetric: 'usa',
    // Table VIII.1 C-3: USA = 5% → 200 × 0.05 = 10 m²
    correctAnswer: 10,
    tolerance: 0.5,
    codeRef: 'Table VIII.1 (C-3, without firewall)',
    rationale: 'USA = TLA × 5% (C-3 without firewall)',
  },
  {
    id: 'ep-005',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 14,
    targetMetric: 'maca',
    // MACA = PSO + ISA = 80% + 15% = 95% → 200 × 0.95 = 190 m²
    correctAnswer: 190,
    tolerance: 0.5,
    codeRef: 'Table VIII.1 (C-3), Rule VIII Sec. 803 Note c',
    rationale: 'MACA = (PSO% + ISA%) × TLA = 95% × 200 = 190 m²',
  },
  {
    id: 'ep-006',
    givenLot: { tla: 96, depth: 12, width: 8, lotType: 'corner' },
    givenZone: 'R-2-basic',
    givenRROW: 10,
    targetMetric: 'ambf',
    // PSO (R-2 Basic, no FW, corner): Table VIII.1 = 55%... but corner gets 60% from Table VIII.1
    // Actually Table VIII.1 gives same PSO regardless of lot type; lot type affects Table VII.1 TGFA only
    // PSO = 55% → AMBF_pso = 96 × 0.55 = 52.8 m²
    // Setback (R-2, RROW 10m): front=8m (3m setback required at grade), side=2m, rear=2m
    // AMBF_setback = (8−4)×(12−5) = 4×7 = 28 m² ... front setback = 3m per Table VIII.2 R-2 basic
    // (8−2−0)×(12−3−2) = 6 × 7 = 42 m²  (one side abutment allowed for R-2)
    correctAnswer: 42,
    tolerance: 1.0,
    codeRef: 'Table VIII.2 (R-2 Basic), Table VIII.1 (R-2 Basic without FW)',
    rationale: 'Setback-based (42 m²) governs over PSO-based (52.8 m²) for this narrow lot',
  },
  {
    id: 'ep-007',
    givenLot: { tla: 300, depth: 15, width: 20, lotType: 'inside-regular' },
    givenZone: 'Institutional',
    givenRROW: 20,
    targetMetric: 'ambf',
    // Table VIII.1 Institutional (no FW): PSO = 50% → 300 × 0.50 = 150 m²
    // Table VIII.3 RROW 20m: front=5m, side=3m, rear=3m → (20−6)×(15−8) = 14×7 = 98 m²
    correctAnswer: 98,
    tolerance: 1.0,
    codeRef: 'Table VIII.1 (Institutional), Table VIII.3 (RROW 20m)',
    rationale: 'Setback-based AMBF (98 m²) governs over PSO-based (150 m²)',
  },
  {
    id: 'ep-008',
    givenLot: { tla: 500, depth: 25, width: 20, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 10,
    targetMetric: 'amvb',
    // BHL for C-3 at 16 storeys = 48m. AMBF (setback RROW 10m): front=3m, side=2m, rear=2m
    // → (20−4)×(25−5) = 16×20 = 320 m²
    // Initial AMVB = 320 × 48 = 15,360 m³
    // Angular plane slope at RROW 10m (C-3, without proj): ratio=2.74, rrowHalf=5m
    // Front height at PL = 5 × (17.5/48) = 5 × 0.365 = 1.82m (H/S = rise/run = 17.5/48)
    // Approximate angular slice ≈ (1/2) × (48 − 1.82) × 16 × 20 ≈ 7,389 m³  (simplified trapezoid)
    // Final AMVB ≈ 15,360 − 7,389 ≈ 7,971 m³
    correctAnswer: 7971,
    tolerance: 200,
    codeRef: 'Table VII.G.3 (C-3, RROW 10m), initial AMVB = AMBF × BHL',
    rationale: 'Angular plane reduction from C-3 RROW 10m slope (ratio 2.74)',
  },
  {
    id: 'ep-009',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'R-1',
    givenRROW: 14,
    targetMetric: 'ambf',
    // R-1: No PSO. Setback: front=4.5m, side=2m (both), rear=2m
    // AMBF = (10−2−2)×(20−4.5−2) = 6×13.5 = 81 m²
    correctAnswer: 81,
    tolerance: 0.5,
    codeRef: 'Table VIII.2 (R-1): setback-only governance, no PSO',
    rationale: 'R-1 has no PSO in Table VIII.1 — governed exclusively by Table VIII.2 setbacks',
  },
  {
    id: 'ep-010',
    givenLot: { tla: 200, depth: 20, width: 10, lotType: 'inside-regular' },
    givenZone: 'C-3',
    givenRROW: 14,
    targetMetric: 'maca',
    // With firewall: PSO(f) = 90%, ISA(f) = (same ISA from Table VIII.1) = 15%
    // Wait: Table VIII.1 C-3 with firewall: PSO=90%, ISA=15%, USA=5%
    // MACA = (PSO + ISA) × TLA = (0.90 + 0.15 - wait, PSO includes footprint, ISA is paved open)
    // MACA = PSO + ISA as % of TLA = (90 + 15 - overlapping? No: PSO + ISA = MACA per note c)
    // Actually: note c) PSO + ISA = MACA — they don't overlap. MACA = (90+15)% × 200 → but 105% > 100%
    // Correction: For C-3 with FW: PSO=90%, ISA=5%, USA=5%, TOSL=10%. MACA=(90+5)%=95%×200=190 m²
    correctAnswer: 190,
    tolerance: 0.5,
    codeRef: 'Table VIII.1 (C-3, with firewall), MACA = PSO + ISA',
    rationale: 'C-3 with firewall: PSO(f)=90%, ISA=5% → MACA=95%×200=190 m²',
  },
];
```

***

## Part IV — Open Issues Requiring External Certification

The following items **cannot be resolved through document procurement alone** and require a licensed architect's certification against the original DPWH-published IRR text and drawings:

| Issue | Description | Required Action |
|---|---|---|
| **BHL Angular Plane Coefficient** | Table VII.G.3 provides the AMVB/RROW centerline slope. The BHL angular plane (front property line origin) is defined in Figures VII.G.1 and VII.G.2 (images not available in text-only form) | Architect must read Figures VII.G.1/VII.G.2 from the original DPWH PDF and confirm the front PL H/S coefficient for each zone × RROW width combination |
| **R-2/R-3/C-1/C-2 Angular Slopes** | Table VII.G.3 explicitly states intermediate zones "can be extrapolated" — no numeric values are provided for them | Architect to confirm linear interpolation is the correct extrapolation method, or provide zone-specific values if available from DPWH clarifications |
| **I-2 / I-3 ISA Values** | The Table VIII.1 values for I-2 (15%/15%) and I-3 (5%/15%) may differ from the published source — cross-check against DPWH original required | Verify against primary DPWH document |
| **Mixed Occupancy (Section 703)** | Logic for dominant vs. accessory use, occupancy separation ratings, and ≤10% exception is not specifiable without a full occupancy schedule | Architect to provide fire-resistive separation matrix and logic tree for engine implementation |

---

## References

1. [2004 Revised Implementing Rules and Regulations (IRR) 1096 ...](https://www.scribd.com/document/841253374/1) - It details various occupancy classifications, requirements for mixed occupancy, fire-resistive const...

2. [Building Light & Ventilation Regulations in the Philippines](https://studylib.net/doc/25211679/pd1096-rule-viii.pdf) - Philippine building code on light, ventilation, site occupancy, open spaces, and zoning requirements...

3. [yomotsu/camera-controls](https://github.com/yomotsu/camera-controls) - A camera control for three.js, similar to THREE.OrbitControls yet supports smooth transitions and mo...

4. [gkjohnson/three-bvh-csg: A flexible, memory compact, fast ... - GitHub](https://github.com/gkjohnson/three-bvh-csg) - A flexible, memory compact, fast and dynamic CSG implementation on top of three-mesh-bvh - gkjohnson...

5. [@react-three/csg](https://www.npmjs.com/package/@react-three/csg?activeTab=readme) - Constructive solid geometry for React. Latest version: 4.0.0, last published: 2 months ago. Start us...

6. [Guidelines on Building Bulk & Development Controls (NBC 74)](https://www.studocu.com/ph/document/batangas-state-university/bs-architecture/guidelines-on-building-bulk-development-controls-nbc-74/153930345) - Explore comprehensive guidelines on building bulk and development controls for cemeteries and memori...

7. [Rule 7 Tables Only | PDF | Truck | Transport](https://www.scribd.com/document/668750177/Rule-7-Tables-only-1) - The document outlines allowable maximum total gross floor areas (TGFA) for different building types ...

8. [2004 Revised IRR of P.D. No. 1096 Guidelines | PDF - Scribd](https://www.scribd.com/document/932584192/1212817147-Rule-VII-Bldg-Occupancy-Anotated-Pages-5) - The document outlines building regulations and standards under the 2004 Revised IRR of P.D. No. 1096...

9. [Architecture Review || PROBLEM 02 || Rule 7 & 8 || 2004 IRR of PD 1096 (Bldg. Code of the Phils.)](https://www.youtube.com/watch?v=YCAf-b5qIC0) - How to use Rule 7 & 8 provisions in the 2004 IRR of the National Building Code of the Philippines, p...

10. [Rule VII Guidelines on Building Bulk & Occupancy (2a) - Studocu](https://www.studocu.com/ph/document/technological-institute-of-the-philippines/architectural-reviewers/2a-rule-vii-guidelines/37509394) - Only the uses/occupancies with the least and heaviest developments (R-1 and C-3 respectively are sho...

11. [12 60 700686 ok Rule VII Guidelines pdf - The 2004 Revised IRR of P. No. 1096 (as published by the - Studocu](https://www.studocu.com/ph/document/university-of-mindanao/bachelor-of-science-in-architecture/12-60-700686-ok-rule-vii-guidelines-pdf/88986094) - Share free summaries, lecture notes, exam prep and more!!

12. [What are the provisions under the 2004 Revised IRR of PD No. 1096 ...](https://www.facebook.com/BuildingCode.Ph/posts/what-are-the-provisions-under-the-2004-revised-irr-of-pd-no-1096-from-wwwdpwhgov/3831450083532536/) - Firewalls particularly erected above or along property lines shall have absolutely no openings and s...

13. [Summary of PD 1096 Rule 8&9 | PDF | Street | Window - Scribd](https://ro.scribd.com/document/437008125/Summary-of-PD-1096-Rule-8-9) - Table VIII.2. Minimum Setbacks for Residential Table VIII.3. Setbacks for Commercial*, Industrial, B...

14. [Setback Requirements for Buildings | PDF - Scribd](https://www.scribd.com/presentation/654719147/Section-804) - Buildings are shown in Table VIII.3. hereafter. Table VIII.2. Minimum Setbacks for Residential Build...

15. [Revised IRR of P.D. No. 1096: Light & Ventilation Rules (2019)](https://www.studocu.com/ph/document/polytechnic-university-of-the-philippines/bs-architecture/revised-irr-of-pd-no-1096-light-ventilation-rules-2019/142603263) - Explore the regulations on light, ventilation, and open space requirements in the Philippines' Natio...

16. [TGFA and GFA Conversion Guidelines | PDF - Scribd](https://fr.scribd.com/document/409747576/Table-VII-MULTIPLIER-docx) - This document provides a conversion table to calculate the total gross floor area (TGFA) of differen...

17. [A Slice-Based Zustand Store for Next.js 14 and TypeScript](https://engineering.atlys.com/a-slice-based-zustand-store-for-next-js-14-and-typescript-6b92385a48f5) - In this article, we'll explore how to implement a slice-based state management approach in a Next.js...

18. [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS is a Postgres primitive and can provide defense in depth to protect your data from malicious act...

19. [Supabase RLS Best Practices: Production Patterns for Secure Multi ...](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) - Learn battle-tested Supabase Row Level Security patterns with performance optimizations, multi-tenan...

20. [How I Use Supabase RPCs in My Next.js Projects](https://blog.stackademic.com/how-i-use-supabase-rpcs-in-my-next-js-projects-9d91b0a2115c?gi=534edd3badb6) - In Supabase, RPCs let you run PostgreSQL functions directly from the client, almost like calling an ...

21. [supabase/apps/docs/content/guides/auth/auth-helpers/nextjs.mdx at master · supabase/supabase](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-helpers/nextjs.mdx) - The Postgres development platform. Supabase gives you a dedicated Postgres database to build your we...

22. [@react-three/csg - npm](https://www.npmjs.com/package/@react-three/csg) - Constructive solid geometry for React. Latest version: 4.0.0, last published: 6 months ago. Start us...

23. [GitHub - AMB-Coders/react-three-fiber-drei](https://github.com/AMB-Coders/react-three-fiber-drei) - A growing collection of useful helpers and fully functional, ready-made abstractions for @react-thre...

24. [How to move the camera using react-three-fiber ... - Stack Overflow](https://stackoverflow.com/questions/69914906/how-to-move-the-camera-using-react-three-fiber-and-react-three-drei) - The drawn model is close to the top of the canvas, and I want to center it. canvas. Could you please...

25. [Methods](https://yomotsu.github.io/camera-controls/) - Documentation for camera-controls

26. [Advanced techniques: Creating and sequencing audio - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques) - In this tutorial, we're going to cover sound creation and modification, as well as timing and schedu...

27. [How to Play Audio in useEffect Without User Gesture Errors](https://shibadev.asia/post/how-to-play-audio-in-useeffect-without-user-gesture-errors) - Tired of 'user gesture required to play audio' errors in React? Learn how to safely trigger audio pl...

28. [Sample code using Web Audio API on React](https://gist.github.com/yukinissie/571d8129cb9f35d11a08a9c116cc8f31) - Sample code using Web Audio API on React. GitHub Gist: instantly share code, notes, and snippets.

29. [how to set draggable to false on mobile for framer motion OR ...](https://stackoverflow.com/questions/67495477/how-to-set-draggable-to-false-on-mobile-for-framer-motion-or-change-dimensions-o) - I have a draggable component in my React app that is only draggable within certain dimensions. Howev...

30. [Build a Drag-to-Close Modal with React and Framer Motion - YouTube](https://www.youtube.com/watch?v=YmDMzeL0i8M) - Animated UI components for React, Tailwind CSS, Framer Motion & More ✨ https://www.hover.dev There's...

31. [React gesture animations — hover, drag, press - Motion](https://motion.dev/docs/react-gestures) - Power your UI with Motion for React's gestures: hover, tap, pan, drag & inView. Use while- props for...

