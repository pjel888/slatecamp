# Geological Hazards
## Learning Goal
After reading this article, you should be able to:

Identify the three geological hazard types relevant to site planning (landslide, liquefaction, fault rupture) and their identifying site characteristics; apply NSCP seismic zone factors to structural design decisions; determine when a geotechnical investigation is mandatory; and identify no-build zones within active fault trace buffers.
---

## The Real-World Scenario (The Hook)

You are the project architect for a proposed 8-storey residential condominium in Marikina City. The geotechnical engineer's preliminary report reveals that the site is within 200 meters of the West Valley Fault — part of the 1,200-km Philippine Fault Zone — and sits on alluvial deposits with high liquefaction susceptibility. Before you can finalize your structural concept and foundation design, you must reconcile the PHIVOLCS hazard maps, the NSCP seismic provisions, and the PD 1096 RIRR requirement for a geotechnical investigation report. One wrong assumption here could mean catastrophic structural failure during the next major earthquake.

---

## Core Concepts

[SLATECAMP_UI_BLOCK:ui_0050 component="Example" status="preserved"]

- **The Philippine Fault Zone (PFZ) and PHIVOLCS Hazard Mapping:** The Philippines sits on the Pacific Ring of Fire with over 30 active fault systems. DOST-PHIVOLCS (Philippine Institute of Volcanology and Seismology) produces detailed fault-line maps, liquefaction susceptibility maps, and volcanic hazard maps. These are the primary references for geological site assessment — not PD 1096. PHIVOLCS recommends a **minimum 5-meter buffer zone** from both sides of the fault trace or from the edge of the deformation zone. No permanent structures should be built within this buffer.

- **Liquefaction:** The phenomenon where saturated, loose, granular soils (typically sand and silt) temporarily lose their shear strength during strong ground shaking, behaving like a liquid. Areas most susceptible include reclaimed land, alluvial plains, areas near rivers and coastlines, and sites with high water tables. In the Philippines, liquefaction risk is documented in PHIVOLCS ground-shaking and liquefaction hazard maps.

- **Soil Bearing Capacity and the NSCP:** The maximum pressure that soil can support without failure. The **National Structural Code of the Philippines (NSCP)**, not PD 1096, provides the technical standards for determining soil bearing capacity. NSCP Section 304 (Table 304.1) provides presumptive allowable bearing capacities, while detailed geotechnical investigation provides site-specific values.

- **Geotechnical Investigation under PD 1096 RIRR:** The Revised IRR of PD 1096 requires that a written geotechnical report — including soil boring results, load test data, and design bearing capacity — be submitted with the building permit application. This report must be prepared by a licensed civil or geotechnical engineer.

---

## The Hard Data (Cheat Sheet)

[SLATECAMP_UI_BLOCK:ui_0051 component="ExamTip" status="preserved"]

| Parameter | Value / Requirement | Source |
|---|---|---|
| **PHIVOLCS Fault Buffer Zone** | Minimum 5 meters from both sides of the fault trace or edge of the deformation zone | PHIVOLCS Recommendation |
| **Philippine Seismic Zone** | Most of the Philippines is classified as **Seismic Zone 4** (highest seismicity) | NSCP 2015, Chapter 2 |
| **Soil Exploration Requirement** | Mandatory soil boring and load tests for sites with potential geological/geotechnical hazards | PD 1096 RIRR 2004, Rule III |
| **Geotechnical Report** | Written report from licensed civil/geotechnical engineer with design bearing capacity and test results; submitted with building permit application | PD 1096 RIRR 2004 |
| **NSCP Presumptive Bearing Capacity (Table 304.1)** | Crystalline bedrock: 600 kPa; Sedimentary rock: 300 kPa; Gravel/sand-gravel (well-cemented): 300 kPa; Sand/silty sand/clayey sand (medium-dense): 100 kPa; Clay (stiff): 100 kPa; Clay (medium-stiff): 50 kPa | NSCP 2015, Table 304.1 |
| **Minimum Footing for Table 304.1 Values** | 300 mm width, 300 mm depth into natural grade | NSCP 2015, Sec. 304.2 |
| **Bearing Capacity Increase** | 20% increase for each additional 300 mm of width and/or depth, up to 3× the designated value | NSCP 2015, Sec. 304.2 |
| **Liquefaction Susceptibility Indicators** | Loose sandy/silty soil, high water table (&lt;10 m), proximity to rivers/coast, reclaimed land, alluvial deposits | PHIVOLCS hazard maps; NSCP seismic provisions |
| **Foundation Requirement in Liquefaction Zones** | Deep foundations (piles) bearing on competent strata below the liquefiable layer; soil improvement techniques (e.g., compaction grouting, stone columns) | NSCP 2015; Geotechnical engineering practice |
| **Metro Manila Shallow Bearing Capacity Range** | 0–200 kPa at 1–2 m depth; 200–300 kPa at greater depths (varies significantly by location) | Published geotechnical research (GeoMate Journal) |

---

[SLATECAMP_UI_BLOCK:ui_0052 component="Warn" status="preserved"]

## Crucial Formulas & Computations

### 1. Terzaghi's Ultimate Bearing Capacity (Square Footing)

This is the foundational formula in geotechnical engineering for determining ultimate soil bearing capacity.

**Formula:**
```
q_ult = 1.2·c·Nc + γ·Df·Nq + 0.4·γ·B·Nγ
```

Where:
- **q_ult** = Ultimate bearing capacity (kPa)
- **c** = Cohesion of soil (kPa)
- **γ** = Unit weight of soil (kN/m³)
- **Df** = Depth of footing below ground surface (m)
- **B** = Width of footing (m)
- **Nc, Nq, Nγ** = Terzaghi's bearing capacity factors (depend on soil friction angle φ)

**Allowable Bearing Capacity:**
```
q_allowable = q_ult / FS
```
Where **FS** = Factor of Safety (typically 3.0 for static conditions)

### 2. NSCP Presumptive Bearing Capacity Adjustment (Sec. 304.2)

**Rule:** The Table 304.1 value applies to footings of 300 mm width at 300 mm depth. For larger footings:

```
q_adjusted = q_table × [1 + 0.20 × n]    (max = 3 × q_table)
```
Where **n** = number of additional 300 mm increments in width and/or depth

**Example:**
For medium-dense sand (q_table = 100 kPa), a footing 900 mm wide at 900 mm depth:
- Additional width increments beyond 300 mm: (900 − 300) / 300 = 2
- Additional depth increments beyond 300 mm: (900 − 300) / 300 = 2
- Total additional increments n = 2 + 2 = 4
- q_adjusted = 100 × [1 + 0.20 × 4] = 100 × 1.80 = **180 kPa**
- Check: 3 × 100 = 300 kPa (max); 180 < 300, so 180 kPa governs.

### 3. Liquefaction Potential Screening (Simplified)

While the full liquefaction analysis (Seed & Idriss method) is beyond typical LEA scope, know the screening criteria:

**A site is susceptible to liquefaction if:**
- Soil is loose, saturated sand or silt (SPT N-value < 15)
- Water table is within 10 meters of the surface
- Site is in Seismic Zone 4 (most of the Philippines)
- Ground shaking PGA (Peak Ground Acceleration) ≥ 0.1g

---

## LEA Exam Traps and Common Mistakes

- **Trap 1: Citing PD 1096 for soil bearing capacity values.** PD 1096 and its RIRR require that a geotechnical report be submitted — but they do **not** provide the actual bearing capacity values or calculation methods. The technical standards are in the **NSCP** (National Structural Code of the Philippines). The NBC (PD 1096) is the administrative trigger; the NSCP is the technical standard.

- **Trap 2: Confusing the PHIVOLCS 5-meter fault buffer with "no-build" setbacks from PD 1096.** The 5-meter buffer from fault traces is a PHIVOLCS geohazard recommendation specific to active faults. PD 1096 setbacks (front, side, rear yards) are zoning/fire safety requirements. They are entirely different parameters governed by different agencies.

- **Trap 3: Assuming liquefaction only occurs near the coast.** Liquefaction occurs in any area with loose, saturated granular soil — including inland alluvial plains, riverbanks, reclaimed land, and areas with high water tables. Marikina Valley, Pampanga, and Central Cebu all have documented liquefaction-prone zones far from the coast.

---

## Active Recall Questions

### Question 1
According to PHIVOLCS guidelines, what is the minimum recommended buffer zone from the trace of an active fault line where no permanent structures should be built?

A. 3 meters  
B. 5 meters  
C. 10 meters  
D. 20 meters  

> **Answer: B. 5 meters**  
> PHIVOLCS recommends a minimum 5-meter buffer zone reckoned from both sides of the fault trace or from the edge of the deformation zone. This is a geohazard-based setback, distinct from the PD 1096 building setbacks. Option A (3 m) confuses this with the PD 1067 urban river easement. Option C (10 m) and D (20 m) are overestimates or confusions with other buffer requirements.

### Question 2
Under the NSCP Table 304.1, what is the presumptive allowable foundation pressure for **medium-dense sand** at the minimum footing dimension of 300 mm × 300 mm?

A. 50 kPa  
B. 100 kPa  
C. 200 kPa  
D. 300 kPa  

> **Answer: B. 100 kPa**  
> NSCP 2015, Table 304.1, designates 100 kPa as the presumptive allowable bearing capacity for sand, silty sand, and clayey sand (medium-dense), at the baseline footing dimension of 300 mm width and 300 mm depth into natural grade. Option A (50 kPa) is for medium-stiff clay. Option D (300 kPa) is for sedimentary rock or well-cemented gravel. This value may be increased by 20% for each additional 300 mm of width/depth, up to 3× the designated value.

### Question 3
Which of the following correctly describes the relationship between PD 1096 and the NSCP regarding soil bearing capacity for building permit applications?

A. PD 1096 provides the bearing capacity values; the NSCP provides the administrative procedures.  
B. PD 1096 RIRR requires submission of a geotechnical report; the NSCP provides the technical standards for determining bearing capacity.  
C. The NSCP replaces PD 1096 for all foundation-related requirements.  
D. PD 1096 and the NSCP are interchangeable for soil bearing capacity determination.  

[SLATECAMP_UI_BLOCK:ui_0001 component="LawCallout" status="preserved"]

---



<ArticleMedia type="image" caption="Geological Hazard Mapping — Fault Buffer, Liquefaction, and Landslide Zones" description="Composite site hazard map showing: active fault trace with 5m minimum no-build buffer (PHIVOLCS), liquefaction susceptibility zones (high/medium/low based on soil type and water table), landslide hazard overlay (slope >30° triggers), seismic zone factors per NSCP, and recommended geotechnical investigation borehole locations." />
## Cross‑References

**Microclimate Analysis**, **Topography And Slope Analysis**, **Hydrology In Site Planning**, **Excavation Foundation And Veneer**

