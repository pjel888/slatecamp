# Batch 156 Local Source Capture: ASD Mechanics for lea-strc-009-03

## Source Boundary

Batch 156 captures local structural mechanics support for a generic Allowable Stress Design refresh of lea-strc-009-03-core-concept. It does not capture or reproduce NSCP timber tables, local timber species stress groups, Philippine species values, or exact adjustment-factor tables.

### Mechanics and Strength of Materials

- Raw artifact: vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Mechanics and Strength of Materials.pdf
- Raw artifact SHA-256: sha256:3e2ec9a0a52f3b2f000ab71c5bb41a39e6eaf89843a576c66c33e2b856500c7f
- Refined artifact: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Mechanics and Strength of Materials.md
- Refined artifact SHA-256: sha256:a7b53be5d55ff45c60fa56529fc629cc6c37ce018bec5c538027e331b21d6385
- Locator: Refined markdown lines 8439-8545 for allowable/safety stress method and lines 11945-11973 for section modulus, allowable bending stress check, and rectangular-section modulus

### Applied Strength of Materials

- Raw artifact: vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Applied Strength of Materials.pdf
- Raw artifact SHA-256: sha256:0bade504a124cad6a63e2b14e3767cab77c4a48efec9d12ccf3312a4c6d6a8a0
- Refined artifact: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Applied Strength of Materials.md
- Refined artifact SHA-256: sha256:0b54595c44af457a3e95194d59e2ae9da813a8585a633ce14d87ba94046c4ddf
- Locator: Refined markdown lines 25013-25023 for maximum shear at the neutral axis and lines 25698-25776 for the rectangular beam maximum shear formula, including maximum shear as 1.5 times average V/A

## Extracted Claims Used In Batch 156

1. Allowable or safety stress design compares computed service-load stress against a source-supplied allowable stress.
2. For bending checks, fb = M/S and the rectangular section modulus is S = b h^2 / 6.
3. The rectangular moment of inertia used for stiffness checks is I = b h^3 / 12.
4. For a rectangular beam, maximum shear stress occurs at the neutral axis and is 1.5 times the average V/A, so fv = 3V/(2A) where A = b h.
5. If a code table, species stress value, moisture factor, or adjustment coefficient is not locally captured, the article and questions must treat it as source-supplied by the item or outside the batch boundary.

## Explicit Exclusions

- NSCP 2015 timber adjustment-factor values.
- Philippine timber species stress groups.
- Species-specific allowable values not captured in the checked local sources.
- PD 1096 Rule 8 wood provisions for exact timber values.
- ASEP/NSCP copyrighted table text from corrupted or gray-area sources.

## Use Rule

Use only the extracted claims above for Batch 156 article and linked-question edits. When an exact table value is needed, the prompt must supply the value or the item must be deferred until a legitimate local source is captured.
