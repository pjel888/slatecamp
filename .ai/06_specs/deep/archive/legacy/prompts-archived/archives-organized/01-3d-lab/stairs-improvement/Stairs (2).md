Yes — if your app is meant to **show all the conflicting Philippine stair standards**, you should treat them as **parallel rule sets**, not as one merged standard. BP 220 explicitly authorizes different standards for economic and socialized housing from PD 1096 and even from the Fire Code, so conflicts are legally expected rather than accidental. [youtube](https://www.youtube.com/watch?v=T5-5nrfnsq8)

## Best framing

Your app should organize standards by **regime / applicability**, because the “correct” stair dimension depends first on what law governs the project type. A regular private dwelling may default to PD 1096, a socialized housing unit may use BP 220, and an accessible public-facing route may also need BP 344 overlay requirements. [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677)

## Core regimes

Use these as separate filters or tabs in the app: [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/)

- **PD 1096 / NBCP baseline** for general buildings and typical private residential work; the DPWH copy states stairs shall be at least 750 mm clear width, with 200 mm rise and 200 mm minimum run. [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)
- **BP 220** for economic and socialized housing; it allows a 600 mm minimum clear width, 250 mm maximum riser, and 200 mm minimum tread for interior stairs. [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/)
- **BP 344** as an accessibility overlay; its stair-related rules emphasize handrails, continuity, heights, and extensions rather than replacing the riser/tread values outright. [pdfcoffee](https://pdfcoffee.com/bp-344-slides-pedrosantosjr-pdf-free.html)
- **Fire/egress rules** as another overlay for exit stairs and occupant-load-driven design, especially in multi-family or public buildings. [youtube](https://www.youtube.com/watch?v=T5-5nrfnsq8)

## Key conflicts

These are the clearest stair-dimension conflicts your app should expose: [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)

| Standard | Applicability | Min clear width | Max riser | Min tread/run | Notes |
|---|---|---:|---:|---:|---|
| PD 1096 / NBCP | General baseline buildings | 750 mm  [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf) | 200 mm  [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf) | 200 mm  [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf) | Baseline minimums from DPWH copy |
| BP 220 | Economic/socialized housing interior stairs | 600 mm  [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/) | 250 mm  [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/) | 200 mm  [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/) | Narrower and steeper than NBCP |
| BP 344 | Accessible stairs / accessible route overlay | Often treated as 1200 mm route width in practice, but verify exact stair-route implementation from your chosen IRR source  [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677) | Usually relies on underlying stair code  [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677) | Usually relies on underlying stair code  [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677) | Adds handrail and usability rules |
| BP 220 winders | BP 220 interior stairs | — | — | 150 mm absolute minimum at any point for winders/circular stairs  [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/) | Run measured near narrow side rule also applies |

The biggest direct conflict is that **BP 220 permits a stair that would fail the NBCP baseline**, especially on width and riser height. That is not necessarily noncompliance, because BP 220 was created specifically to allow different standards for qualifying housing projects. [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)

## Accessibility overlay

For BP 344, your app should treat it as an **additional compliance layer** rather than a replacement code for all stair geometry. The clearest, well-supported stair items are handrails on both sides, handrail heights at 900 mm and 700 mm above stair treads, and 300 mm extensions beyond the top and bottom of the stairs. [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677)

## Decision logic

A useful app flow would ask these in order: [youtube](https://www.youtube.com/watch?v=T5-5nrfnsq8)

1. **What project type is it?** If economic or socialized housing, BP 220 becomes a primary regime. [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/)
2. **Is the stair part of an accessible route?** If yes, apply BP 344 overlay rules on top of the base regime. [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677)
3. **Is it an exit stair serving larger occupant loads or a multi-family/public building?** If yes, add egress and fire-related checks. [youtube](https://www.youtube.com/watch?v=T5-5nrfnsq8)
4. **Which requirement is stricter where multiple laws apply?** The app should flag stricter values rather than silently averaging them. [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/)

## Recommended data model

For each stair rule in your app, store these fields: [studocu](https://www.studocu.com/ph/document/lyceum-of-the-philippines-university/bs-civil-engineering/bp-344/8864677)

- **Law / source**: PD 1096, BP 220, BP 344, Fire Code.
- **Rule category**: width, riser, tread, landing, headroom, handrail, guard.
- **Value**: e.g. 750 mm, 200 mm.
- **Direction**: minimum or maximum.
- **Applicability**: single-family, socialized housing, public building, accessible route, exit stair.
- **Conflict note**: e.g. “BP 220 is more permissive than NBCP on riser and width.” [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)
- **Priority note**: e.g. “Use only when project qualifies under BP 220.” [facebook](https://www.facebook.com/architectclaud/videos/standard-of-stairs-ilang-beses-na-itong-tinatanong-ilan-ba-talaga-ang-tamang-suk/4356645431282443/)

## Practical interpretation

For your app, avoid presenting one “Philippine standard stair.” The better output is something like: **“Under NBCP: 750/200/200; under BP 220: 600/250/200; under BP 344: keep base dimensions but add accessible handrails and route conditions.”** [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)

If you want, I can turn this into a **clean comparison matrix for your app** with fields like `law`, `applies_to`, `dimension_type`, `min_or_max`, `metric_value_mm`, `conflicts_with`, and `ui_explanation`.
