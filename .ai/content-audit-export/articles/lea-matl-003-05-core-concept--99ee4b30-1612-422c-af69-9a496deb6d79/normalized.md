## What You Need to Know for the LEA
## Learning Goal

Classify glass types (annealed, tempered, laminated, insulated, heat-strengthened, wired) by manufacturing process, strength characteristics, break pattern, and safety/security applications in building enclosures.
## Core Concept

Welding joins two or more metal pieces by melting them together (fusion welding) without the addition of extraneous material, or with filler metal that fuses with the base material. The weld pool solidifies to form a permanent bond exceeding the strength of the base metal if properly executed.


[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-glass-type-cross-sections", layout="single", type="image", status="placeholder", alt="Cross-section illustrations of annealed, tempered, laminated, insulated (IGU), heat-strengthened, and wired glass showing layer construction", caption="Future diagram: glass types cross-section — layer construction and manufacturing characteristics", suggestedAsset="Cross-section diagram set showing each glass type's internal structure", placementIntent="Visualizes glass manufacturing differences and lamination/ tempering structure"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

### Welding Processes

_Shielded Metal Arc Welding (SMAW)_ is the oldest and most versatile process. An operator holds a consumable electrode (coated with flux) that melts, depositing filler metal into the weld pool. The flux coating generates a shielding gas and slag that protects the molten weld from atmospheric contamination. Advantages: portable, minimal equipment, tolerates windy outdoor conditions (key for Philippine field work), versatile across all positions. Disadvantages: slower deposition rate, slag removal required, operator skill-dependent. TESDA NC II certification emphasizes SMAW as the foundational welding qualification.

_Gas Metal Arc Welding (GMAW)_, also called MIG (Metal Inert Gas), uses a continuously fed solid wire electrode. An external shielding gas (typically argon-CO₂ mixture) protects the weld. Advantages: high deposition rate, clean welds, reduced slag, improved penetration in thicker sections, suitable for production welding. Disadvantages: requires constant shielding gas supply, sensitive to wind, limited portability. Philippine fabrication shops favor GMAW for high-volume structural work.

_Gas Tungsten Arc Welding (GTAW)_, also called TIG (Tungsten Inert Gas), uses a non-consumable tungsten electrode. Filler metal (if required) is added separately. An inert gas (typically argon) shields the weld zone. Advantages: precise control, superior weld quality, excellent aesthetic appearance, suitable for thin materials and critical connections. Disadvantages: slow deposition rate, requires high operator skill, impractical for heavy structural work. GTAW dominates aluminum welding and specialty stainless steel applications.

_Flux Cored Arc Welding (FCAW)_ uses a hollow wire electrode filled with flux. Shielding comes from the flux core (self-shielded FCAW) or from both flux and external gas (dual-shield FCAW). Advantages: high deposition rate, produces a self-shielding slag layer comparable to SMAW, suitable for outdoor work. Disadvantages: post-weld cleaning required, can produce porosity if poorly executed. Less common in Philippine structural work compared to SMAW/GMAW.

### Weld Joint Types

_Butt Joint_ joins two pieces aligned end-to-end, forming a continuous surface. Filler metal bridges the gap.

_Lap Joint_ overlaps two pieces, with the weld applied to the outer edges.

_T-Joint_ joins one piece perpendicular to another, forming a T-shape.

_Corner Joint_ joins two pieces at approximately 90°, forming a corner.

_Edge Joint_ joins two pieces along their edges.

### Weld Groove Profiles (Bevels)

_Groove Welds_ fill V-shaped or other shaped grooves between base metal edges to achieve full-thickness fusion.

- _V-Groove_ — Symmetrical V-shape, economical, standard for manual welding (SMAW/GTAW). Requires multiple passes for thick material.
- _Bevel-Groove_ — Asymmetrical V-shape; one edge is beveled, the other remains square. Used when one edge cannot be prepared, or to reduce weld metal volume.
- _U-Groove_ — Rounded groove profile, reduces residual stress compared to V-groove, economical for thick material (reduces weld passes and heat input).
- _J-Groove_ — One rounded edge and one square edge; reduces weld volume compared to V-groove.

### Fillet Welds

Fillet welds apply to lap joints, T-joints, and corner joints. The weld deposited in the 90° angle between two plates forms a triangular cross-section. Size is designated by leg length (e.g., 6 mm fillet = 6 mm legs on each side). Fillet welds are simpler and faster than groove welds; they dominate connection detailing in Philippine structural steel work.

### AWS A2.4 Weld Symbols

AWS A2.4 (2020) establishes standardized symbols for communicating welding requirements on drawings. The _weld symbol_ communicates:

- Weld type (fillet, groove, plug, slot)
- Weld location (arrow side or other side)
- Dimensions (size, length)
- Finish requirements (as-welded, ground, etc.)
- Process and consumables (if specified)
- Quality assurance (inspection requirements)

The _reference line_ and _arrow line_ form the symbol's foundation. Welds on the _arrow side_ (the side the arrow points toward) sit below the reference line; welds on the _other side_ sit above the reference line. Both-sides welds are on both sides simultaneously.

_Groove weld symbols_ show the bevel angle and root opening. For example, a V-groove with 45° bevel angle and 3 mm root opening is drawn as a V between the reference line and the base metal outline.

_Fillet weld symbols_ appear as right triangles on the reference line. A 6 mm fillet weld reads as "6" on the left side of the symbol.

_Weld all around_ is indicated by a circle where the arrow and reference line meet.

_Field weld_ (performed on-site rather than in the shop) is flagged with a filled circle (or flag) on the reference line.

### Weld Inspection Methods

_Visual Inspection (VT)_ — The simplest and most economical method. The inspector examines welds for surface defects (porosity, undercut, spatter, cracks), dimensional accuracy, and profile. VT is performed before more expensive methods.

_Ultrasonic Testing (UT)_ — High-frequency sound waves detect internal defects (internal porosity, lack of fusion, cracks). UT is non-destructive and quick but requires skilled operators and equipment.

_Radiographic Testing (RT)_ — X-rays or gamma rays reveal internal defects. RT requires safety protocols, longer exposure time, and interpretation expertise. Historically common for bridge and pressure vessel work; increasingly replaced by UT in structural work due to safety and cost.

_Magnetic Particle Testing (MT)_ — Magnetic fields reveal surface and near-surface defects in ferrous materials only. Fast, economical, and suitable for field use.

_Penetrant Testing (PT)_ — Liquid dyes penetrate surface cracks and are revealed under UV light. Works on all materials (ferrous and non-ferrous); useful for detecting tight surface cracks.

### Prequalified Joints (AWS D1.1)

AWS D1.1 (Structural Welding Code—Steel) establishes requirements for prequalified welded connections. A prequalified joint has demonstrated, through extensive testing, that it will meet code requirements if fabricated and installed within specified parameters (position, process, materials, dimensions, preheat, etc.).

Prequalified joints simplify design and fabrication by eliminating the need for individual qualification testing. Examples include:

- _Complete Joint Penetration (CJP) groove welds_ in butt joints
- _Partial Joint Penetration (PJP) groove welds_ in certain applications
- _Fillet welds_ in lap, T, and corner joints

When a proposed joint falls outside prequalified parameters, the fabricator must qualify the joint through testing—a costly and time-consuming process. Philippine structural engineers commonly reference AWS D1.1 prequalified joints to accelerate fabrication schedules.

## Key Provisions

| Welding Process | Shielding | Deposition Rate | Operator Skill | Portability | Primary Use |
|---|---|---|---|---|---|
| SMAW (Stick) | Flux coating | Low–Medium | High | Excellent | Field work, all positions, versatile |
| GMAW (MIG) | External gas | High | Medium | Good | Production work, flat/horizontal, clean |
| GTAW (TIG) | External gas | Low | Very High | Fair | Aluminum, stainless, thin/critical |
| FCAW (Flux Cored) | Flux + gas | High | Medium | Good | Production, outdoor, thick sections |

| Groove Type | Profile | Typical Material Thickness | Weld Passes | Residual Stress | Cost Efficiency |
|---|---|---|---|---|---|
| V-Groove | Symmetrical V | Thin–Moderate | 1–3 | Moderate | Standard |
| Bevel-Groove | Asymmetrical V | Thin–Moderate | 1–3 | Moderate | When prep limits apply |
| U-Groove | Rounded | Thick | Fewer passes | Reduced | Thick material |
| J-Groove | Rounded + square | Moderate–Thick | Fewer passes | Reduced | Thick material |

| Inspection Method | Detection Range | Non-Destructive | Speed | Cost | Equipment |
|---|---|---|---|---|---|
| Visual (VT) | Surface only | Yes | Fast | Low | Magnifying glass, light |
| Ultrasonic (UT) | Internal defects | Yes | Fast | Medium | UT equipment, skilled operator |
| Radiographic (RT) | Internal defects | Yes | Slow | High | X-ray or gamma source, film |
| Magnetic Particle (MT) | Surface + near-surface | Yes | Fast | Low | Magnetic field equipment |
| Penetrant (PT) | Surface cracks | Yes | Medium | Low | Penetrant dyes, UV light |


[SLATECAMP_UI_BLOCK:ui_0002 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-glass-manufacturing-process", layout="single", type="image", status="placeholder", alt="Process flow diagram showing float glass manufacturing from raw materials through melting, forming, annealing, cutting, and processing into tempered, laminated, and insulated glass", caption="Future diagram: glass manufacturing process — float glass production and secondary processing", suggestedAsset="Process flow diagram of glass manufacturing and fabrication", placementIntent="Visualizes how different glass types are manufactured from base float glass"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
## Philippine Construction Context

Philippine structural steel fabricators—including those in Vleanzuela's industrial zones and throughout Metro Manila—predominantly employ SMAW for field connections and GMAW for shop welding. TESDA NC II Shielded Metal Arc Welding certification is the foundational qualification for Filipino welders seeking employment locally and abroad. The dual-skill pathway (SMAW → GMAW → GTAW) enables fabricators to handle diverse structural applications.

AWS D1.1 provides the technical basis for NSCP 2015 Chapter 5 (Structural Steel), which requires structural welds to meet AWS D1.1 standards or recognized equivalent. Philippine design codes do not deviate materially from AWS requirements; designers confidently reference AWS D1.1 prequalified joint tables in final specifications.

Weld inspection is typically specified as 100% visual (VT) with spot ultrasonic (UT) for critical connections (high-rise moment-resisting frames, bridges). The fabricator performs VT during production; the owner's representative conducts UT on a sampling basis. Radiographic inspection (RT) is rare in contemporary Philippine structural work due to cost and safety concerns with radiation exposure on active construction sites.

## How It's Tested

The LEA evaluates welding knowledge through:

1. _Weld symbol interpretation_ — Given a drawing callout (e.g., "1/4 fillet weld both sides"), identify the joint type, process implications, and acceptance criteria.
2. _Process selection_ — Match welding process to project constraints (position, speed, operator availability, weather, portability).
3. _Joint design_ — Select appropriate groove or fillet configuration based on thickness, position, and prequalification status.
4. _Defect recognition_ — Identify common welding defects (porosity, cracks, undercut, lack of fusion) and specify inspection methods.
5. _Philippine standards alignment_ — Apply NSCP 2015, AWS D1.1, and TESDA certification requirements.

[SLATECAMP_UI_BLOCK:ui_0003 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: SMAW dominates Philippine field work and TESDA certification pathways. When a question specifies welding a structural connection on-site, assume SMAW unless otherwise stated. For shop fabrication or high-volume work, consider GMAW. Prequalified joints from AWS D1.1 eliminate expensive qualification testing—always check if a proposed joint is prequalified before committing to a custom design.
[/SLATECAMP_UI_BLOCK]

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: title="Confusing Weld Symbol Sides", body="A designer draws a fillet weld symbol on the reference line without clarifying whether it applies to the arrow side or other side. The fabricator welds the wrong side, requiring costly rework. Always clarify weld symbol sides, especially in lap joints and corner joints where both sides may require different weld sizes."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0005 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: title="Specifying Non-Prequalified Joints Without Testing", body="An engineer proposes a CJP groove weld configuration that falls outside AWS D1.1 prequalified parameters (e.g., unusual bevel angle or root opening). Without explicit qualification testing, the weld may not meet strength requirements. Always reference prequalified joints unless custom qualification is budgeted and scheduled."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: items="{[\"Assuming all four processes (SMAW, GMAW, GTAW, FCAW) are interchangeable—each has distinct advantages and limitations. SMAW is field-portable; GMAW is fast; GTAW yields best quality; FCAW handles thick material outdoors.\", \"Omitting preheat temperature for thick-section structural steel in cool weather—carbon steel thicker than 25 mm typically requires preheating (per AWS D1.1) to prevent cold cracking. Philippine rainy seasons may necessitate preheat even for moderate thicknesses.\", \"Relying on visual inspection alone for critical connections—specify UT or MT spot checks for high-rise moment-resisting frames, bridges, and suspension systems. Visual inspection misses internal defects like lack of fusion and internal porosity.\", \"Failing to account for Philippine welding certifications—TESDA NC II is the foundational qualification. Fabricators must employ certified welders per NSCP 2015; specifying processes outside TESDA-certified scopes risks non-compliance.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also within Metals, Glass, and Glazing: **lea-matl-003-04-core-concept**, **lea-matl-003-07-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.

