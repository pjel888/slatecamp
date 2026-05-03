## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define live load in the seismic context as part of the effective seismic weight (W)
- Distinguish between full live load and reduced live load for seismic mass calculation
- Explain why only a portion of live load is included in seismic weight
- State the NSCP percentage of live load used in seismic weight for typical occupancies

Live loads (floor occupancy loads) are the responsibility of the occupant, not the designer. The NSCP specifies minimum live load values for design; the occupant must not exceed them. Partition loads (dead load from non-structural walls) must be added if partitions are present or anticipated. Storage loads can be severe and override standard floor loads if the space will contain stored materials.

## Core Concept

_Live load_ (LL) is the load exerted by occupancy, equipment, and temporary activities on a floor. It is distinct from dead load (permanent structural weight). The NSCP provides a table of minimum live load values for different occupancy types, measured in kPa (kiloPascals):

| Occupancy Type | Minimum LL (kPa) |
|---|---|
| Residential (apartments, houses) | 1.9 |
| Office | 2.4 |
| Corridors (above 1st floor) | 3.8 |
| Assembly (fixed seating) | 2.9 |
| Assembly (no fixed seating) | 4.8 |
| Construction walkway | 7.0 |
| Storage (light) | 6.0 |
| Storage (heavy) | 12.0 |

These are _minimum_ values. If the occupant uses the space differently (e.g., a residential unit converted to office, an office space used for storage), the higher live load applies.

_Tributary area_ is the floor area that drains into a structural member. The NSCP permits _live load reduction_ (a discount factor) when the tributary area exceeds a threshold (typically 14 m² for standard buildings). The reduction is calculated as:LL(reduced) = L0 × (0.25 + 15 / √(K_LL × A_I)) per NSCP 205.5, where A_I is influence area and K_LL is live load element factor.m². The reduction recognizes that the probability of all floor occupants loading simultaneously is low in large open areas; a percentage of seats will be empty, some desks unmanned. Small areas (< 14 m²) get no reduction because every seat/desk occupant contributes to the total.

_Fixed partition load_ is the dead load of non-structural walls (drywall, insulation, cladding, etc.). If partitions are present or anticipated (e.g., an office floor that might be subdivided later), the code requires a minimum partition load of 1.0 kPa be added to the design. This accounts for the weight of walls that will eventually be installed.

_Live load responsibility_ is a legal and moral one. The NSCP specifies design minimums; the building owner/occupant is responsible for ensuring actual use does not exceed the assumed design live load. If a residential unit is converted to office, the floor was not designed for the higher 2.4 kPa office load and may fail. Violations of this responsibility lead to structural distress, collapse, and legal liability.

## Key Provisions

| Parameter | Value / Rule | LEA Context |
|-----------|--------------|-------------|
| Residential LL | 1.9 kPa | Apartments, single-family homes |
| Office LL | 2.4 kPa | Typical commercial office space |
| Corridors (above 1st floor) | 3.8 kPa | Circulation; higher than floor LL |
| Assembly fixed | 2.9 kPa | Theaters, auditoriums with fixed seating |
| Assembly no fixed seating | 4.8 kPa | Concert halls, dance floors, gathering spaces |
| Construction walkway | 7.2 kPa | Temporary loads during construction |
| Storage light | 6.0 kPa | Books, light materials |
| Storage heavy | 12.0 kPa | Steel, machinery, dense materials; severe |
| Fixed partition | 1.0 kPa minimum | Dead load; add if partitions present/anticipated |
| LL reduction threshold | 14 m² tributary area | Areas > 14 m² may apply reduction formula |
| Economic housing (BP 220) max floor area | 60 m² per unit | Applies to BP 220 projects; NSCP LL still 1.9 kPa regardless of size |

The distinction between occupancy categories is critical. A 2.4 kPa office floor cannot safely accommodate 4.8 kPa assembly loads or 12.0 kPa storage loads. Occupancy changes require structural re-evaluation.

## Philippine Practice Context

In Metro Manila, mixed-use developments often blend residential, office, retail, and parking on a single structure. Design floors must accommodate the highest live load of any intended occupancy on that floor. A typical scenario: ground floor (4.8 kPa assembly for lobbies/shops), floors 2–5 (office 2.4 kPa), floors 6–20 (residential 1.9 kPa with 1.0 kPa partition allowance). Partition load is essential because office-to-residential conversion mid-project is common; designers anticipate this and add 1.0 kPa at design time.

Low-cost housing (60 m² maximum per unit, per Housing and Land Use Regulatory Board guidelines) is designed at residential 1.9 kPa. However, occupants sometimes add improper loads (heavy storage, equipment installations) that exceed this assumption, leading to visible sagging and code violations. The designer specifies the LL assumption; the occupant/owner is bound by it.

Storage facilities (warehouses) in industrial zones require 12.0 kPa if heavy materials might be stacked. A common error: designing a "flexible" warehouse at only 6.0 kPa (light storage) to save cost, then loading it with machinery (12.0 kPa equivalent) once in operation. This violates the occupant's responsibility and risks collapse.

## How It's Tested

**Pattern 1: Live load table lookup.** "What is the minimum design live load for an office building in the Philippines?" → 2.4 kPa (from the table).

**Pattern 2: Occupancy mismatch.** "A residential floor is designed for 1.9 kPa LL. The owner later converts it to office storage. Is this compliant?" → No. Office storage exceeds residential load. Structural re-design or use restriction required.

**Pattern 3: Partition load reasoning.** "Why must a 1.0 kPa partition load be included in an office floor design if no partitions are built initially?" → Because partitions will likely be installed later when offices are subdivided. The 1.0 kPa reserves capacity for this predictable change.

**Pattern 4: Tributary area and reduction.** "A column supports a 20 m² tributary area on a residential floor. Can live load reduction be applied?" → Yes, because 20 m² > 14 m² threshold. Calculate the reduction factor.

<Tip>Live load defaults to the table value. Partitions always add 1.0 kPa (if anticipated). Storage can be 2–6× the occupancy LL if heavy materials are present. The occupant's use is the occupant's responsibility—the designer provides the capacity, not the police.</Tip>

## Related Articles

See also: **Load Types** (lea-strc-001-02) for the complete live load discussion, **Base Shear** (lea-strc-004-03) for how seismic weight enters the formula, and **Required Strength** (lea-strc-005-01) for how live load factors into combinations.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

