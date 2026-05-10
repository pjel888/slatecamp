# Microclimate Analysis


## Board Exam Quick Check

Before memorizing details from this topic, state the task in one sentence: what concept is being identified, compared, sequenced, or applied? Then anchor your answer to the article's stated scope and avoid importing details from a different topic.

**Common mistake:** treating a familiar keyword in **Microclimate Analysis** as enough to answer. For exam practice, first identify the exact concept being asked, then choose the option that matches that concept.


## The Real-World Scenario (The Hook)

## Learning Goal

After reading this article, you should be able to:

Analyze site microclimate factors — solar orientation, wind patterns, temperature, humidity, precipitation — for building placement and fenestration design; calculate shadow patterns using solar altitude and azimuth; apply the wind rose to building orientation decisions; and identify the effect of nearby water bodies, vegetation, and topography on site conditions.
---

You are designing a 5-storey BPO office building on a mid-block lot in Bonifacio Global City, Taguig. The client demands maximum natural ventilation to reduce HVAC costs, but the west-facing lot boundary receives brutal afternoon sun from 1:00–5:00 PM year-round. You must orient the building's long axis, position operable windows to capture the Amihan during the dry season, shield the southwest facade from Habagat-driven rain, and deploy solar shading strategies calibrated to the Philippine sun path — all within the constraints of PD 1096 light-and-ventilation requirements and the lot's setback limitations.

---

## Core Concepts

- **Amihan (Northeast Monsoon):** Prevails from approximately **October to March** (dry season). Brings cool, dry winds from the **northeast** direction. This is the desirable wind for natural ventilation in Philippine buildings — orient primary living spaces and operable windows to capture Amihan breezes. The Amihan season coincides with the cooler months, making cross-ventilation highly effective.

- **Habagat (Southwest Monsoon):** Prevails from approximately **June to September** (wet season). Brings warm, **moisture-laden winds from the southwest**, carrying heavy rains and typhoon-associated weather. Buildings must protect southwest-facing facades from driving rain through extended overhangs, rain screens, and water management detailing. The Habagat season is when waterproofing and drainage performance are most critical.

- **Philippine Sun Path:** The Philippines lies between approximately **5°N and 20°N latitude**. The sun is south of the zenith for most of the year (roughly September to March), meaning the **south-facing facade receives the most consistent solar radiation**. However, the **west-facing facade** receives the most intense heat gain due to low-angle afternoon sun. The east facade receives morning sun (tolerable). The north facade receives minimal direct sun and is the coolest orientation year-round.

- **Passive Design Integration:** Microclimate analysis in the LEA is not abstract theory — it directly informs building orientation, fenestration placement, shading device design, and ventilation strategy. The goal is to minimize mechanical cooling loads by maximizing natural ventilation (Amihan capture) and minimizing solar heat gain (west/southwest shading).

---

## The Hard Data (Cheat Sheet)

| Parameter | Detail | Design Implication |
|---|---|---|
| **Amihan Direction** | Northeast (NE) — Oct to Mar | Orient living/working spaces with operable windows facing NE to capture cool, dry breezes for cross-ventilation |
| **Habagat Direction** | Southwest (SW) — Jun to Sep | Protect SW facades with extended overhangs (≥600 mm), rain screens, and minimal operable openings; manage driving rain |
| **Transition Periods** | April–May (hot, dry, variable winds); October (monsoon transition) | Hottest months; passive cooling is least effective; these months drive the HVAC peak load design |
| **Philippine Latitude Range** | 5°N to 20°N | Sun is nearly overhead at summer solstice; south-leaning most of the year |
| **Worst Solar Exposure** | West facade (low-angle afternoon sun, 1:00–5:00 PM) | Minimize west-facing glazing; use vertical louvers or fins for west facade shading |
| **Best Orientation (Long Axis)** | East-West long axis (narrow east and west faces) | Minimizes solar heat gain on east/west while maximizing north/south facade area for controlled light |
| **Solar Shading — North/South Facades** | Horizontal overhangs, brise-soleil, light shelves | High sun angle on south; horizontal elements are effective |
| **Solar Shading — East/West Facades** | Vertical fins, louvers, deep recesses, or operable screens | Low sun angle on east/west; horizontal overhangs alone are insufficient |
| **PD 1096 Window-to-Floor Area** | Minimum 10% of floor area for natural light; minimum 5% for ventilation (openable portion) | PD 1096, Rule VIII |
| **PD 1096 Minimum Ceiling Height** | 2.70 m for habitable rooms | PD 1096, Rule VIII — affects stack ventilation potential |
| **Cross-Ventilation Requirement** | Openings on at least two opposite or adjacent walls for effective air movement | PD 1096 light & ventilation standards; tropical design principle |
| **Stack Ventilation** | Clerestory windows, ventilation shafts, operable skylights — warm air rises and exits high, drawing cool air through low openings | Effective when ceiling heights exceed 3.0 m; leverages Philippine heat differentials |
| **BERDE Green Rating** | Philippine green building rating system; credits awarded for passive cooling, daylighting, and natural ventilation strategies | BERDE (Building for Ecologically Responsive Design Excellence) |

---

## Crucial Formulas & Computations

### 1. Solar Altitude Angle (for Shading Device Design)

**Formula:**
```
sin(α) = sin(φ) × sin(δ) + cos(φ) × cos(δ) × cos(H)
```

Where:
- **α** = Solar altitude angle (degrees above horizon)
- **φ** = Latitude of the site (e.g., Manila ≈ 14.6°N)
- **δ** = Solar declination (varies from +23.45° at summer solstice to −23.45° at winter solstice)
- **H** = Hour angle (15° per hour from solar noon; 0° at noon, 15° at 1 PM, etc.)

**Simplified: Solar Noon Altitude**
At solar noon (H = 0°), the formula simplifies to:
```
α_noon = 90° − |φ − δ|
```

**Example — Manila (14.6°N) at the December Solstice (δ = −23.45°):**
```
α_noon = 90° − |14.6° − (−23.45°)| = 90° − 38.05° = 51.95°
```
The sun is about **52° above the horizon** at solar noon in December — south-leaning. This is when horizontal overhangs on the south facade are most critical.

**Example — Manila at the June Solstice (δ = +23.45°):**
```
α_noon = 90° − |14.6° − 23.45°| = 90° − 8.85° = 81.15°
```
The sun is nearly directly overhead (**81°**) in June — overhangs are less effective because the sun is too high. Roof insulation and ventilation become more important.

### 2. Overhang Depth Calculation (Horizontal Shading)

**Formula:**
```
D = H / tan(α)
```

Where:
- **D** = Required overhang depth (m)
- **H** = Height of window to be shaded (m) — measured from the sill to the overhang line
- **α** = Solar altitude angle at the critical time (e.g., December noon for south facade)

**Example:**
For a south-facing window in Manila, 1.5 m tall, at December noon (α = 52°):
```
D = 1.5 / tan(52°) = 1.5 / 1.28 = 1.17 m
```
An overhang of approximately **1.20 m** will fully shade the south-facing window at the December solstice solar noon — the time of maximum south-facade exposure.

### 3. Natural Ventilation Rate (Cross-Ventilation Estimate)

**Simplified Formula (for preliminary design):**
```
Q = Cv × A × V
```

Where:
- **Q** = Airflow rate (m³/s)
- **Cv** = Effectiveness coefficient (0.5–0.6 for perpendicular wind; 0.25–0.35 for diagonal)
- **A** = Area of inlet opening (m²) — use the smaller of inlet or outlet openings
- **V** = Wind velocity (m/s) — reference Amihan speeds (typically 2–5 m/s in urban Metro Manila)

**Example:**
Inlet window = 2.0 m², Amihan wind at 3.0 m/s, perpendicular to facade (Cv = 0.55):
```
Q = 0.55 × 2.0 × 3.0 = 3.30 m³/s
```
This airflow rate can then be compared to the minimum ventilation requirements for the occupancy type.

---

[SLATECAMP_UI_BLOCK:ui_0001 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Real-World Application: Orient the long axis of a BGC office building along the east-west line. This captures Amihan (NE) breezes through the long north facade for natural ventilation while minimizing west-facing exposure to the brutal afternoon sun. Operable windows on NE, minimal openings on SW.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: ⚠️ Common Mistake: Students often remember Amihan and Habagat directions but forget the transition periods. April-May (hot, dry, variable winds) is when passive cooling is LEAST effective — this drives HVAC peak load design. The exam tests seasonal applicability, not just direction.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0003 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: LEA Pattern: Questions ask you to identify the correct passive design strategy for a given site condition. South-facing facade receives most consistent solar radiation (sun is south of zenith Sep-Mar). West-facing receives INTENSE low-angle afternoon heat. North facade = coolest year-round. East = tolerable morning sun.
[/SLATECAMP_UI_BLOCK]

## LEA Exam Traps and Common Mistakes

- **Trap 1: Confusing Amihan with Habagat.** This is the single most common monsoon-related error on the LEA. **Amihan = NE monsoon = cool/dry = Oct–Mar** (the one you WANT for ventilation). **Habagat = SW monsoon = warm/wet = Jun–Sep** (the one you PROTECT against). Mnemonic: **A**mihan = **A**ir you want (pleasant); **H**abagat = **H**eavy rain (protect).

- **Trap 2: Assuming the south facade is the worst for heat gain.** In the Philippines, the **west facade** receives the most intense heat gain because of low-angle afternoon sun. The south facade gets consistent but more manageable exposure (higher sun angle = easier to shade with horizontal devices). The LEA tests whether you know that west = worst and that vertical shading devices (fins/louvers) are needed for east and west, while horizontal devices (overhangs/brise-soleil) work for north and south.

- **Trap 3: Using generic international rules instead of Philippine-specific sun path.** At 14–15°N latitude (Manila), the sun passes nearly directly overhead at the June solstice and leans significantly south at the December solstice. Students who memorize temperate-zone rules (e.g., "south-facing is always worst") will misapply them. In the Philippines, the sun can be on the **north** side of the building briefly near the June solstice — a critical nuance for shading design.

---

## Active Recall Questions

### Question 1
During which months does the **Amihan** (Northeast Monsoon) prevail in the Philippines, and from which cardinal direction does it blow?

A. June to September; from the Southwest
B. October to March; from the Northeast
C. April to May; from the Southeast
D. December to February; from the Northwest

> **Answer: B. October to March; from the Northeast**
> The Amihan is the NE monsoon prevailing from approximately October to March. It brings cool, dry air from the northeast — the desirable breeze for natural ventilation in Philippine buildings. Option A describes the Habagat (SW monsoon). Options C and D are fabricated distractors. A common exam trap is reversing the months and directions of Amihan and Habagat.

### Question 2
An architect in Manila is designing horizontal overhangs for a **south-facing** window that is 1.8 m tall. At the December solstice, the solar noon altitude angle is approximately 52°. What is the minimum overhang depth to fully shade the window at noon?

A. 0.94 m
B. 1.41 m
C. 1.80 m
D. 2.30 m

> **Answer: B. 1.41 m**
> Using D = H / tan(α) = 1.8 / tan(52°) = 1.8 / 1.28 = 1.406 ≈ **1.41 m**. Option A results from using tan(52°) incorrectly (dividing by 1.9 instead of 1.28). Option C simply uses the window height without calculation. Option D overestimates. The December solstice is the critical design condition for south-facade shading in the Philippines because the sun is at its lowest noon angle, leaning furthest south.

### Question 3
Which building facade in the Philippines receives the **most intense heat gain** and requires **vertical** shading devices (fins or louvers) rather than horizontal overhangs?

A. North facade
B. South facade
C. East facade
D. West facade

> **Answer: D. West facade**
> The west facade receives low-angle afternoon sun (1:00–5:00 PM), which creates the most intense heat gain of any orientation. Because the sun angle is low (near the horizon), horizontal overhangs are ineffective — vertical fins, louvers, or deep wall recesses are required. The south facade (B) has a higher sun angle and can be effectively shaded with horizontal devices. The north facade (A) receives minimal direct sun year-round. The east facade (C) also receives low-angle sun but in the cooler morning hours, making it less critical than the west.

---

## Cross‑References

**Topography And Slope Analysis**, **Hydrology In Site Planning**, **Flora And Fauna In Site Development**, **Geological Hazards**


<!-- no-media-needed: existing content format is sufficient without visual media -->
