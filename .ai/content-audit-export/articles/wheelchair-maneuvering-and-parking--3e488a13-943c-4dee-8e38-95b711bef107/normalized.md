# Wheelchair Maneuvering and Parking

_(Aligned with BP 344 2024 IRR + PD 1096, using your files and the official 2024 IRR online)[file:1][file:2][web:11][web:8]_

---

## Learning Goal

After reading this article, you should be able to:

Recall the core wheelchair mnemonic (4.0-1.8-2.3-1.5-1.8-1.2 m) and apply each value to accessible parking stall dimensions, access aisles, vertical clearance, corridors, turning spaces, and ramp widths under BP 344; design compliant accessible parking layouts with correct stall dimensions, signage, and access aisle locations.

## 1. Core Footprint Numbers (Easy Mnemonic)

**Mnemonic: 4 – 1.8 – 2.3 – 1.5 – 1.8 – 1.2**

- **4.0 m** → Accessible parking stall width.
- **1.8 m** → Access aisle width (beside stall).
- **2.3 m** → Vertical clearance over accessible parking.
- **1.5 m** → Accessible corridor clear width (inside buildings).
- **1.8 m** → Turnabout / two‑wheelchair & rest space side.
- **1.2 m** → Accessible ramp clear width.

---

## 2. Accessible Parking (BP 344 2024 IRR – Appendix C)

[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-wheelchair-maneuvering-and-par-0", name="accessible-parking-layout", type="diagram", caption="Top-down parking layout showing accessible stall 4.0 m × 5.0 m with 1.8 m access aisle. Show two configurations: single stall + aisle = 5.8 m total width, and two stalls sharing an aisle = 9.8 m total width. Include vertical clearance callout (2.3 m), the shortest route to accessible entrance arrow, and PWD signage symbol."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="ArticleMedia" status="unknown"]
Extracted summary:
- Props: id="media-accessible-corridor-ramp-profile", name="accessible-corridor-ramp-profile", type="diagram", caption=true, Plan=true, and=true, section=true, of=true, accessible=true, corridor=true, m=true, clear=true
- Text: 10.5 m, and 100 mm edge curb." />
[/SLATECAMP_UI_BLOCK]

Accessible slots must be nearest the accessible entrance and on the shortest route.[web:8][web:11]

| Item                   | 2024 Spec           | Memory Hook                                    |
| :--------------------- | :------------------ | :--------------------------------------------- |
| **Stall width**        | **4000 mm (4.0 m)** | Vehicle space only (no aisle yet).[web:8]      |
| **Stall length**       | **5000 mm (5.0 m)** | Fits SUV/van.[web:8]                           |
| **Access aisle width** | **1800 mm (1.8 m)** | For ramp deployment and side transfer.[web:11] |
| **Vertical clearance** | **2300 mm (2.3 m)** | For raised‑roof accessible vans.[web:11]       |

- One accessible stall + aisle → **4.0 + 1.8 = 5.8 m** total width.
- Two stalls sharing aisle → **4.0 + 1.8 + 4.0 = 9.8 m** total width.

---

## 3. Corridors & Internal Maneuvering (BP 344 2024 IRR – Appendix C)

| Element                             | 2024 Spec                                     | Section idea                                             |
| :---------------------------------- | :-------------------------------------------- | :------------------------------------------------------- |
| **Accessible corridor clear width** | **1500 mm**                                   | Two‑way wheelchair + pedestrian traffic.[web:11][web:9]  |
| **Turnabout space**                 | **1800 mm × 1800 mm**, every **12000 mm** max | For 180° wheelchair turn; near dead‑ends.[web:11][web:9] |
| **Passing space (two wheelchairs)** | **1800 mm × 2000 mm**                         | Local widening where two chairs must pass.[web:9]        |

Think:

```text
Corridor base width     → 1500 mm
Turnabout “square”      → 1800 × 1800 mm
Passing “rectangle”     → 1800 × 2000 mm
Max spacing for turn    → 12,000 mm
```

---

## 4. Ramps & Exterior Walkways (Your PDFs + 2024 IRR)

**Accessible Ramps** (Appendix A)[file:2][web:11]

- Width: **1200 mm** clear (min).[file:2]
- Slopes (Table A.1.1):
  - **1:20** preferred; landings every **15.0 m**.
  - **1:15** max (new work): **10.50 m** run, **700 mm** rise, landings every **10.0 m**.[file:2]
- Landings:
  - **1800 mm** min length for intermediate landings.
  - **1800 mm** level areas at upper & lower ends.[file:2]
- Edge protection:
  - Raised curb **100 mm** min.[file:2]

**Sidewalks / Walkways / Pathways** (Appendix B)[file:2][web:17]

- Width: **1500 mm** min.
- Where two wheelchairs must pass: **1800 mm**.[file:2]
- Rest / turn spaces on long routes: **1800 mm** clear dimension, spaced every **12000 mm** max, and within **3500 mm** of dead‑ends.[file:2]

---

## 5. Quick Comparison Table (Parking vs Corridors vs Ramps)

| Element                          | Width (mm) | Length / Size (mm) | Notes                                                 |
| :------------------------------- | :--------- | :----------------- | :---------------------------------------------------- |
| **Accessible stall**             | **4000**   | **5000**           | Vehicle only, near accessible entrance.[web:8]        |
| **Access aisle**                 | **1800**   | ~stall length      | Adjacent to stall, for ramp & transfer.[web:11]       |
| **Vertical clearance (parking)** | –          | **2300**           | Clear headroom above accessible bays.[web:11]         |
| **Accessible corridor**          | **1500**   | –                  | Interior accessible route.[web:11][web:9]             |
| **Turnabout space**              | **1800**   | **1800**           | Every 12 m; within 3.5 m of dead‑ends.[web:11][web:9] |
| **Passing space**                | **1800**   | **2000**           | Local widening for two wheelchairs.[web:9]            |
| **Accessible ramp**              | **1200**   | –                  | Clear width; see slopes below.[file:2][web:11]        |
| **Ramp landing (top/bottom)**    | –          | **1800**           | Level maneuvering space.[file:2]                      |
| **Ramp intermediate landing**    | –          | **1800**           | If length > 10.50 m.[file:2]                          |

---

## 6. Minimal Exam Mnemonic Stack

```text
PARKING
- Stall width          = 4.0 m
- Stall length         = 5.0 m
- Access aisle width   = 1.8 m
- Vertical clearance   = 2.3 m

INSIDE BUILDING
- Corridor width       = 1.5 m
- Turnabout            = 1.8 × 1.8 m
- Passing space        = 1.8 × 2.0 m

RAMPS & EXTERIOR
- Ramp width           = 1.2 m
- Ramp landings        = 1.8 m (top, bottom, intermediate)
- Ramp slopes          = 1:20 (pref), 1:15 (max new; 10.5 m / 700 mm)
- Sidewalk width       = 1.5 m (1.8 m to pass)
- Rest spaces          = 1.8 m every 12 m
```

Use this one page as your **go‑to widths & slopes sheet** for LEA questions on wheelchair maneuvering, parking, corridors, ramps, and passing spaces.[file:1][file:2][web:8][web:11]

---

[SLATECAMP_UI_BLOCK:ui_0003 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344", section="Section 6 - Maneuvering Space"
- Text: Per BP 344 2024 IRR Appendix C, accessible parking stalls must be: 4000 mm width × 5000 mm length, with an 1800 mm wide access aisle. Vertical clearance must be ≥2300 mm. The accessible stall must be the nearest to the accessible entrance on the shortest possible route. ISA signage at 600×600 mm on poles is required.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Do not confuse accessible parking stall width (4000 mm) with the combined stall+aisle width. The stall is vehicle-only at 4000 mm; the adjacent 1800 mm access aisle is separate. The total width for a single accessible space with aisle = 5800 mm. Two adjacent accessible stalls can share one 1800 mm aisle between them.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0005 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Memorize the mnemonic: '4 – 1.8 – 2.3 – 1.5 – 1.8 – 1.2'. Test yourself by converting each number to its corresponding element: 4.0 m (stall width), 1.8 m (aisle width), 2.3 m (vertical clearance), 1.5 m (corridor width), 1.8 m (turning space), 1.2 m (ramp width).
[/SLATECAMP_UI_BLOCK]

---

## Cross‑References

**Wheelchair Maneuvering And Parking Slots**, **Accessible Seating In Assembly Areas**, **Standard Human Body Dimensions**, **Bp 344 Accessible Washrooms**


<!-- no-media-needed: existing content format is sufficient without visual media -->
