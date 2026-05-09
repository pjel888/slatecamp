# 01 — Local Content Inventory

Generated: `2026-05-09T05:14:46.925474+00:00`

## Corpus counts

- Local article folders: **567**.
- Article metadata files: **567**.
- `original.md`: **567**.
- `normalized.md`: **567**.
- `candidate.md`: **0** currently present.
- `linked-questions.json`: **567**.
- `sources.json`: **567**.
- `taxonomy.json`: **567**.

Important interpretation:

- Missing `candidate.md` is expected before composition. Candidates must be generated, not hand-written.
- `normalized.md` contains placeholders by design. The current scan found **563** normalized files with UI placeholders and **0** candidate files with raw placeholders.
- `sources.json` rows are article metadata links, not proof that claims are source-grounded.

## Subject distribution

- `ALE-DSGN`: 117 articles; 2123 linked questions
- `ALE-PRAC`: 114 articles; 1120 linked questions
- `ALE-HIST`: 74 articles; 1019 linked questions
- `ALE-THEO`: 63 articles; 718 linked questions
- `ALE-MATL`: 50 articles; 480 linked questions
- `ALE-PLAN`: 49 articles; 525 linked questions
- `ALE-STRC`: 48 articles; 460 linked questions
- `ALE-UTIL`: 40 articles; 601 linked questions
- `Subject`: 11 articles; 110 linked questions
- `Playwright Quiz`: 1 articles; 3 linked questions

## Linked question inventory

- Total linked questions: **7159**.
- Unique question IDs: **7159**.
- Question types: `{'mcq': 7159}`.
- Option-count distribution: `{'4': 7158, '5': 1}`.
- Empty rationale count: **1**.

Top article/question clusters:

- `building-permit-process--687e0da7-4e39-454f-b3f8-a95308678556`: 57 linked questions
- `pd-1096-rule-vii-area-metrics--85bcd328-436d-49ba-9d37-7b202d0d38d4`: 50 linked questions
- `fire-resistive-construction-ratings--aef59aa2-220e-47fc-9492-6b2bd98f9bea`: 46 linked questions
- `fire-extinguishing-systems--f61a5716-97a1-41d5-8863-a2fc5fd4115f`: 41 linked questions
- `pd-1096-rule-xii-egress-and-corridors--93009368-9041-46e0-b93b-8786100311be`: 41 linked questions
- `location-on-property-and-exterior-walls--16ba355e-811c-4191-98c2-c7fac22ca59b`: 40 linked questions
- `change-of-use-and-occupancy--9e053410-cea0-400b-b185-576cbb4a8bd0`: 39 linked questions
- `excavation-foundation-and-veneer--bd009a97-21fe-400e-8717-615d5a877cfd`: 39 linked questions
- `glass-and-glazing-area-limits--3a28da11-0053-4b2f-85a8-f675a3d10a43`: 39 linked questions
- `pd-1096-rule-vii-height-limits--a865c6b2-8c25-404e-bb0c-08d374d374a5`: 39 linked questions
- `ceiling-heights-and-room-sizes--915c1016-2ed6-4b47-b2ca-f12965c6bc9f`: 37 linked questions
- `signs-design-and-construction--16a0bc40-d538-4e4a-8408-cd41dd7aa7aa`: 37 linked questions
- `minimum-requirements-group-a-dwellings--42eb0c36-da27-4b7e-a1e3-4ed915bfca8d`: 36 linked questions
- `sheet-metal-and-spray-booths--d6015c96-3954-4780-ad92-64507a2959d1`: 34 linked questions
- `spanish-colonial-laws-of-the-indies--31fff533-f6b9-44dc-8d46-996e5413a587`: 34 linked questions
- `chimneys-and-fireplaces--f8d416c0-abfb-45be-a7ef-a9f98df06507`: 33 linked questions
- `fire-zones-and-existing-buildings--9437579a-377e-41ec-8527-4c0399348746`: 33 linked questions
- `vent-shafts-and-ventilation--4aa53e66-6e93-44c1-804b-59f5e19bfda6`: 33 linked questions
- `certificate-of-occupancy--68eeacdb-a61b-4f53-bbe9-e2459fa8d152`: 32 linked questions
- `pedestrian-protection-during-construction--e6c2a686-5b8c-477d-b5e4-d02bef987743`: 32 linked questions

## Source metadata inventory

- `sources.json` files seen: **567**.
- Total source rows: **1110**.
- Articles with empty source rows: **247**.
- Maximum source rows in one article: **16**.

Planning implication:

- Empty `sources.json` articles should not be treated as impossible, but they require source-family mapping before rewrite.
- Non-empty `sources.json` articles still need claim-to-source locators.

## UI block inventory

- Articles with UI blocks: **563**.
- Total preserved blocks: **4251**.
- Low-confidence/unknown-block article count: **11**.
- Parser confidence counts: `{'high': 4240, 'low': 11}`.
- Parse status counts: `{'parsed': 4240, 'unknown_block': 11}`.

Component counts:

- `ExamTip`: 774
- `ArticleMedia`: 766
- `Tip`: 439
- `WikiMistakeCard`: 365
- `WikiMistakeList`: 291
- `Note`: 286
- `Warn`: 278
- `Callout`: 270
- `LawCallout`: 244
- `WikiExamTable`: 196
- `KeyValues`: 78
- `ComparisonTable`: 72
- `Example`: 68
- `ProcessFlow`: 40
- `Accordion`: 30
- `WikiCalloutBox`: 9
- `SubjectSnapshot`: 8
- `LeartBox`: 7
- `SPP206RefServices`: 5
- `details`: 5
- `WikiPartHeader`: 3
- `WikiReference`: 2
- `SPP207RefServices`: 2
- `Tabs`: 1
- `FormulaBlock`: 1
- `Warning`: 1
- `ConflictMatrix`: 1
- `RegulationFramework`: 1
- `AlertBox`: 1
- `RevealBlock`: 1
- `CalloutBox`: 1
- `WikiChangedPill`: 1
- `ElaborativeInterrogation`: 1
- `Mermaid`: 1
- `AuthorityContent`: 1

Warnings:

- No closing tag found for ArticleMedia; preserved opening line as unknown custom block.: 10
- No closing tag found for Mermaid; preserved opening line as unknown custom block.: 1

## Inventory-driven prioritization

1. Prioritize article clusters with many linked questions because one source-correct module improves many practice items.
2. Prioritize legal/code topics with high risk of outdated dimensions or source conflicts.
3. Treat empty-source articles as source-mapping tasks before rewrite tasks.
4. Treat low-confidence UI blocks as roundtrip safety tasks before prose edits.
5. Treat one-off 5-option or missing-rationale questions as assessment-quality cleanup candidates.

Detailed machine-readable inventory: `artifacts/local-content-inventory.generated.json`.
