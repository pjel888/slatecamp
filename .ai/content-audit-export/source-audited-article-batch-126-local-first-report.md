# Source-Audited Article Batch 126 Local-First Report

Generated at: 2026-05-14T02:58:00.000+08:00
Updated at: 2026-05-14T02:58:00.000+08:00
Branch: 3dlab-gray-viewport-bg
Baseline: d65cf8ebe

## Status

Passed local validation; live git finalization is blocked in Codex by `.git/index.lock` permissions. Batch 126 reserves the next five sourceable residual history bundles after Batch 125: `lea-hist-011-01-core-concept`, `lea-hist-011-02-core-concept`, `lea-hist-012-01-core-concept`, `lea-hist-012-02-core-concept`, and `lea-hist-012-03-core-concept`.

## Scope

- Article clusters: 5
- Linked questions edited: 57/57
- Local source artifacts: 10
- Answer-key changes: 0
- Supabase push/deploy/production DB mutation/main merge: not performed

## Selected Bundles

- lea-hist-011-01-core-concept: Pre-Colonial African Architecture; questions 10; sources 2; scenario added_source_safe_real_world_scenario: compare a heritage repair brief for an earthen Sahel mosque with a dry-stone monument; the maintenance rhythm, material weathering, and conservation schedule change by climate and construction system.; diff safe=true.
- lea-hist-011-02-core-concept: Colonial Architecture in Africa; questions 11; sources 2; scenario added_source_safe_real_world_scenario: compare a hot-climate school brief in Burkina Faso with a waterfront community prototype in Lagos; both are contemporary African responses, but their site risks and material strategies differ.; diff safe=true.
- lea-hist-012-01-core-concept: Maya and Aztec Architecture; questions 12; sources 2; scenario added_source_safe_real_world_scenario: when classifying a ruin, the examiner may give the structure type before the culture; corbelled vault plus stelae suggests Maya, while a double shrine to Tlaloc and Huitzilopochtli suggests Aztec Templo Mayor.; diff safe=true.
- lea-hist-012-02-core-concept: Inca Architecture; questions 12; sources 2; scenario added_source_safe_real_world_scenario: when reading Andean site clues, separate masonry technique from imperial infrastructure; ashlar precision identifies construction logic, while Qhapaq Nan identifies administrative reach.; diff safe=true.
- lea-hist-012-03-core-concept: North American Indigenous Architecture; questions 12; sources 2; scenario added_source_safe_real_world_scenario: a preservation brief for Pueblo adobe, Mesa Verde masonry alcoves, Haudenosaunee longhouses, and Cahokia mounds requires different material, climate, and community-history assumptions.; diff safe=true.

## Source-Safe Corrections

- lea-hist-011-01-core-concept: Removed unsupported cross-in-square wording for Biete Giyorgis and replaced it with cruciform/Greek-cross plan language.
- lea-hist-011-01-core-concept: Removed roof-support-only and permanent structural overclaims about Djenne toron.
- lea-hist-011-01-core-concept: Kept Great Zimbabwe, Lalibela, and Djenne comparisons but tied them to UNESCO source anchors rather than broad internet summaries.
- lea-hist-011-02-core-concept: Removed the weak Hilton Addis Ababa/Lalibela-inspired hotel item and replaced it with the UNESCO-sourceable Asmara modernist city item.
- lea-hist-011-02-core-concept: Softened broad colonial-grid claims so they remain comparative rather than absolute.
- lea-hist-011-02-core-concept: Kept Kere and Adeyemi contemporary examples because official practice pages support them.
- lea-hist-012-01-core-concept: Corrected Pleanque to Palenque.
- lea-hist-012-01-core-concept: Softened precise Templo Mayor height/blood-channel wording to avoid over-specific claims not needed for the answer key.
- lea-hist-012-01-core-concept: Kept Chichen Itza/Kukulcan equinox language but framed it as an exam pattern supported through local INAH/UNESCO anchors.
- lea-hist-012-02-core-concept: Removed the specific 1960 Valdivia earthquake proof claim and replaced it with a general source-safe seismic-performance principle.
- lea-hist-012-02-core-concept: Changed the Qhapaq Nan item from approximately 40,000 km and relay-runner speed claims to about 30,000 km and administrative integration.
- lea-hist-012-02-core-concept: Softened Ollantaytambo wording to avoid unsupported fortress/river-control specifics.
- lea-hist-012-03-core-concept: Removed the over-specific Monks Mound radiocarbon two-phase item and replaced it with UNESCO-supported scale/construction identification.
- lea-hist-012-03-core-concept: Removed an unsupported sclea/scale typo pattern by rewriting the longhouse and mound rationales.
- lea-hist-012-03-core-concept: Softened gender/property claims for Haudenosaunee longhouses so they stay tied to extended-family compartmentation and matrilineal social organization.

## Validation Evidence

- Compose: 5/5 scoped compositions passed with blockers=0 using --overwrite by slug.
- Diff: 5/5 scoped diff reports safe_to_push=true with blockers=0.
- Validate: 5/5 bundle validation valid=true; component-usage warnings only.
- UI-block edit validation: 5/5 valid=true, blockers=0, warnings=0.
- Scoped integrity: 57 linked questions; 57 question edits; 0 answer-key changes; 10 source hashes verified; stale compose-error sidecars removed.
- Targeted tests: bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts -> 34 pass, 0 fail.
- Final git gates: scoped JSON parse passed for 54 JSON files; scoped diff/whitespace checks passed; temporary-index cached diff check passed for 90 intended paths; real commit and push still require a git-capable environment.

## Git Finalization

Live git staging failed with:

`fatal: Unable to create '/Users/philiplewis/slatecamp/.git/index.lock': Operation not permitted`

Use `.ai/03_plans/batch-126-git-handoff-stage-list.md` to stage only the intended Batch 126 paths from a git-capable environment. The source capture directories under `vitruvius-connection` are ignored by default and require force-add if the final git environment honors `.gitignore`.
