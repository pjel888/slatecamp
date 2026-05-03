## What You Need to Know for the LEA

This topic covers the types of loads that act on structures in Philippine design. The LEA tests whether you can identify, define, and distinguish load types—and apply the correct load values from NSCP. You will NOT be tested on load combinations or analysis methods; focus on definitions and specified values.

## Core Concept

A **load** is a force or system of forces applied to a structure, categorized by its source and permanence. The Philippine National Structural Code (NSCP) classifies loads into six primary categories:

**Dead Load (DL):** Permanent, constant load from the structure's own weight and fixed fixtures. Includes concrete, steel, permanent walls, mechanical systems. Does not change over the structure's life except due to renovation. Examples: 2,400 kg/m³ for reinforced concrete = 23.6 kN/m³.

**Live Load (LL):** Temporary, movable load from occupancy, storage, or equipment. Changes with use; includes people, furniture, vehicles on floors, snow, temporary construction loads. NSCP specifies minimum values by occupancy type.

**Wind Load:** Lateral, dynamic load from wind pressure and suction on exposed surfaces. Varies with building height, terrain, and storm intensity. In Philippine design, treated separately from gravity loads.

**Seismic Load:** Inertial load from ground motion during earthquakes. Depends on seismic zone (Philippines Zone 1 or 2), building mass, and structural response. Zone 2 is the most severe, covering all PH except Palawan, Tawi-Tawi, and Sulu.

**Snow Load:** Accumulated snow weight on roofs. Rare in Philippines (negligible at low elevations); relevant only for mountain structures.

**Special Loads:** Impact, vibration, blast, hydrostatic, or soil pressure loads that require explicit design consideration.

Each load type has a specific origin, duration, and magnitude. The NSCP prescribes minimum design values for each occupancy and condition.

## Key Provisions

| Load Type | Definition | Typical Values (PH) | Duration |
|-----------|-----------|-------------------|----------|
| **Dead (DL)** | Own weight + permanent attachments | RC: 23.6 kN/m³; Steel: 78.5 kN/m³ | Permanent |
| **Live (LL)** | Occupancy, storage, equipment | Residential: 1.9 kPa; Office: 2.4 kPa; Corridors: 3.8 kPa | Temporary |
| **Wind** | Dynamic pressure from wind | Zone-dependent; 150+ km/h in typhoon zones | Variable |
| **Seismic** | Ground acceleration; Zone 1 Z=0.2, Zone 2 Z=0.4 | Philippines: mostly Zone 2 | Transient, brief |
| **Snow** | Accumulated depth on roof | ~0 in lowland PH | Winter season |
| **Special** | Impact, blast, explosion, hydrostatic | Case-by-case | Variable |

## Key Live Load Values (NSCP Reference)

These are MINIMUM design values for common Philippine occupancies:

- **Residential:** 1.9 kPa
- **Office:** 2.4 kPa
- **Corridors (above 1st floor):** 3.8 kPa
- **Assembly (fixed seats):** 2.9 kPa
- **Assembly (no fixed seats):** 4.8 kPa
- **Storage (light):** 6.0 kPa
- **Storage (heavy):** 12.0 kPa
- **Flat roof:** 1.0 kPa
- **Construction walkway:** 7.2 kPa

**Live Load Reduction Rule:** Minimum tributary area for LL reduction is ≥18.6 m² (200 ft²). Larger areas may use reduced LL factors per NSCP Table 202.

**Fixed Partition Superimposed Dead Load:** Minimum 1.0 kPa for movable partitions not shown on plans.

## Seismic Zone Reference (Philippines)

- **Zone 1Zone 2: Lower seismic risk; Z = 0.2 (Palawan except Busuanga, Tawi-Tawi, Sulu)
- **Zone 4:** Higher seismic risk; Z = 0.4 (All other provinces; most severe zone in PH))

## Philippine Practice Context

In Philippine design, load specifications must follow NSCP Table 201 (minimum DL values) and Table 202 (minimum LL values by occupancy). Load combinations use factors from older NSCP (DL factor 1.4, LL factor 1.7) or newer NSCP 2015 (DL factor 1.2, LL factor 1.6). When submitting designs to DPWH or local authorities, load specifications must cite the applicable NSCP edition and table. Wind and seismic loads are critical in the Philippines due to typhoons and frequent seismic activity; these must be calculated per the appropriate section and not omitted.

## How It's Tested

1. **Identification:** "Which load type includes the building's concrete weight?" — tests definition matching.
2. **Value Recall:** "The minimum live load for residential occupancy is ___." — tests memorization of NSCP Table 202.
3. **Classification:** "A 150 kg equipment machine on a floor is classified as ___." — tests ability to distinguish load types in context.
4. **Application:** "A multi-story office with a tributary area of 19 m² can apply a live load reduction factor. This is because the tributary area exceeds 18.6 m²." — tests understanding of LL reduction criteria.

<Tip>**Live load values by occupancy — memorize these six:**
- Residential: **1.9 kPa**
- Office: **2.4 kPa**
- Corridors: **3.8 kPa**
- Storage light: **6.0 kPa**
- Storage heavy: **12.0 kPa**
- Assembly (no seats): **4.8 kPa**

Zone 2 (seismic) covers **all PH except Palawan, Tawi-Tawi, Sulu.**</Tip>

## Common Mistakes

<WikiMistakeList mistakes={["Confusing dead load with live load: DL is permanent and structural (concrete, steel beams); LL is temporary and changeable (people, furniture). A fixed partition wall is DL; the office workers are LL.","Using wrong LL value: each occupancy has a NSCP-specified minimum. Using residential (1.9 kPa) for an office (2.4 kPa) is non-compliant.","Forgetting to check tributary area for LL reduction: reduction only applies if tributary area ≥ 18.6 m² (200 ft²). A small room with 8 m² cannot use LL reduction.","Confusing load value with load factor: a dead load factor is 1.4 (older NSCP) or 1.2 (2015). This is applied in combination, not part of the load's nominal value.","Applying seismic zone incorrectly: Zone 2 (Z=0.4) applies to almost all Philippines. Zone 1 applies only to three provinces (Palawan, Tawi-Tawi, Sulu)."]} />