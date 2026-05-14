# Allowable Stress Design (ASD) for Rectangular Timber Members

## Board Exam Quick Check

ASD asks one question first: is the computed service-load stress less than or equal to the allowable stress supplied by the source, table, or problem statement? For this Batch 156 source boundary, use supplied allowable values only. Do not invent Philippine species values, local timber stress groups, or NSCP adjustment factors.

THIN_NEEDS_EXPANSION: resolved by Batch 156 source-safe ASD mechanics refresh.

## What You Need To Know

- General ASD check: actual stress <= allowable stress.
- Bending stress: fb = M/S.
- Rectangular section modulus: S = b h^2 / 6.
- Rectangular moment of inertia: I = b h^3 / 12.
- Rectangular maximum shear stress: fv = 3V/(2A), where A = b h.
- Maximum rectangular shear is higher than average shear V/A, so using V/A alone underestimates the check.

Use consistent units. If moment is in kN-m and section modulus is in mm^3, convert moment to N-mm before dividing. Since 1 MPa equals 1 N/mm^2, the final stress is in MPa when N and mm units are used.

## Real World Scenario

A small roof beam review gives actual member width b, depth h, service moment M, service shear V, and supplied allowable stresses Fb and Fv. The source-safe workflow is to compute S and A, calculate fb = M/S and fv = 3V/(2A), then compare each demand against the supplied allowable value. If either demand exceeds the supplied allowable, resize the member, reduce the load demand, or specify a source-supported higher allowable value. Do not approve the member by adding uncited species values or adjustment factors.

## High-Yield Distinctions

| Term | Use | Common Trap |
| --- | --- | --- |
| fb | Computed bending stress from M/S | Confusing it with allowable Fb |
| Fb | Supplied allowable bending stress | Treating an uncited value as universal |
| fv | Computed maximum shear stress from 3V/(2A) | Using only average shear V/A |
| Fv | Supplied allowable shear stress | Applying an uncaptured code factor |
| S | Section modulus for stress | Substituting I by mistake |
| I | Moment of inertia for stiffness checks | Using S when checking deflection |

## Worked Mini-Checks

1. For b = 80 mm and h = 250 mm, S = b h^2 / 6 = 80 x 250^2 / 6 = 833,333 mm^3.
2. For M = 18 kN-m and S = 800,000 mm^3, fb = 18,000,000 / 800,000 = 22.5 MPa.
3. For b = 60 mm, h = 280 mm, and V = 20 kN, A = 16,800 mm^2 and fv = 3 x 20,000 / (2 x 16,800) = 1.786 MPa.

## Question Alignment

The 10 linked questions for this article are bounded to ASD inequality logic, unit conversion, section modulus, rectangular moment of inertia, rectangular maximum shear, and supplied-factor arithmetic. They intentionally avoid exact NSCP timber clauses, species values, and uncaptured adjustment-factor tables.

## Source-Primary Finding

Batch 156 checked local raw and refined structural mechanics sources before rewriting. "Mechanics and Strength of Materials" supports allowable/safety stress logic, section modulus, and bending stress checks. "Applied Strength of Materials" supports maximum shear at the neutral axis and the rectangular maximum shear formula. The corrupted local NSCP file and gray-area copies do not support source-safe citation for exact Philippine timber tables.

## Common Mistakes

- Treating lowercase demand stress fb or fv as the same thing as uppercase allowable stress Fb or Fv.
- Forgetting to convert kN-m to N-mm before computing MPa.
- Using V/A for a rectangular section maximum shear check instead of 3V/(2A).
- Importing NSCP, species, moisture, or duration factors that are not supplied by the item or captured source.
- Assuming a member passes because bending passes, even when shear fails.

## Explicit Source Limits

This refresh is source-safe for generic ASD mechanics only. If a question needs a Philippine species allowable stress, timber grade table, moisture factor, load-duration factor, or exact NSCP clause, the source must be locally captured with provenance first or the item must supply the value explicitly.
