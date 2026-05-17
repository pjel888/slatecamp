# SME Council Synthesis — Remaining Exemplar Risks

Date: 2026-05-09
Council: Claude, OpenCode, CommandCode
Scope: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/`

## Bottom-line verdict

All 9 exemplar packs are accepted for calibration after the applied fixes below. All 9 remain `HOLD_FOR_DIRECT_PUBLICATION`.

This LLM council review is being used as SME-style calibration review, not as licensed-human release approval. Any learner-facing Supabase publication still requires normal roundtrip conversion, source/provenance gates, and human SME clearance.

## Council consensus

- `04-npcp-fixture-unit-and-venting`: `npcp-c1` and `npcp-c2` can be promoted from `NOT_FOUND_BY_TEXT` / `NEEDS_REVIEW` to `FOUND_VERBATIM` / `SUPPORTED` after rendered-page visual checks.
- `05-vitruvius-principles-and-departments`: `vitruvius-c1` can be promoted to `FOUND_VERBATIM` / `SUPPORTED`; citation must declare the Morris Hicky Morgan translation/edition.
- `02-ra9266-foreign-architect-temporary-permit`: content is acceptable for calibration; `authority_host_unverified` remains a provenance/direct-publication blocker.
- `06-pd1096-tgfa-ambf-location-controls`: source-pack ID must be corrected to `source-pack-pd-1096-irr`; AMBF wording must distinguish footprint/PSO control from TGFA and not flatten it into “firewall control.”
- `09-uap-spp201-pre-design-and-service-boundaries`: `uap-c4` must be scoped to UAP Document 401-402 Article 7.08 and not reused as a universal UAP fee-allocation rule.
- Direct publication remains held for every pack.

## Accepted fixes applied

- `npcp-c1`: claim text now follows the source wording: “equivalent to a rate of flow at 28.3 liters per minute (1 cu. ft./minute).” Locator now cites Section 207.8, PDF p.24.
- `npcp-c2`: claim now includes exceptions in Sections 812, 813, and 814, plus the second prohibition on single drainage and venting systems with unvented branch lines. Locator remains Section 311.4, PDF p.44.
- `vitruvius-c1`: status promoted to `SUPPORTED` / `FOUND_VERBATIM`; locator now cites `Vitruvius, The Ten Books on Architecture`, trans. Morris Hicky Morgan, Book I, Chapter II, PDF pp.33-36.
- PD 1096: `source_pack_id` corrected from `source-pack-pd-1096-rirr` to `source-pack-pd-1096-irr`. `pd1096-c2` locator refined to Rule VII, Section 704.1(c), PDF p.81. `pd1096-c3` now cites Section 705.1-2 and Table VII.1, PDF pp.83-84. `pd1096-c4` reworded as footprint/PSO control distinct from TGFA.
- UAP: `uap-c4` reworded to the exact Article 7.08 suspended/abandoned-work context.
- Source ledgers and reviewer memos were updated with LLM council calibration status and direct-publication boundaries.

## Council disagreement / reconciliation notes

- Claude raised a BP 344 1:12 accessible-ramp concern. Raw 2024 BP 344 PDF search found `1:12` only in a swimming-pool transfer-wall clear transfer space, not in the accessible-ramp table. The BP 344 exemplar retained the raw p.2 values: 1:20 general gradient, 1:15 special row, 10.50 m, 700 mm, and 10 m landing interval.
- Claude questioned the PD 1096 eaves locator. Raw DPWH PDF p.81 visibly places the eaves text under Rule VII, Section 704.1(c), so the Rule VII locator was retained and made more precise.
- CommandCode accepted all packs without fixes. The synthesis adopts the stricter Claude/OpenCode wording and metadata fixes where supported by raw-source evidence.

## Remaining blockers

- Direct publication remains blocked for every pack.
- Remaining blockers are release/provenance blockers, not calibration blockers:
  - licensed-human SME release approval still required;
  - source-pack provenance/hash reconciliation still required where flagged;
  - roundtrip article/question conversion still required before Supabase push;
  - no exemplar pack should be pasted directly into Supabase.
