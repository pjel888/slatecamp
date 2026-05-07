**Phase 0.5A.1 Verdict:**
CONDITIONAL GO — structurally sound but not final. The state machine, quarantine rules, grounding gate, and original-PDF retention are correctly conservative. Two gaps weaken it: (1) State Machine Rule 4 allows a script to promote files to `VERIFIED_SOURCE_CANDIDATE` after an automated “successful official-web spot-check,” which creates an over-trust vector for non-critical files; (2) The `current` label restriction lives only in the naming convention, while the manifest schema has zero validation rules enforcing `date_assigned_current` or notes. Do not treat the gate as complete until Corrections 1 and 2 below are applied.

**Live Read-Only Check Verdict:**
ACCURATE and SOUND. The live evidence fully justifies all three classifications:
- `wiki_article_sources` as `DISCOVERY_SEED_ONLY` (1,110 rows, 0 verified, 0 populated URLs).
- `taxonomy_sources` contradiction (0 rows live vs any claim of completeness).
- Admin AI audit live integration blocked (no public `ai_audit_*` tables; restriction migration local-only).
No corrections needed for this file.

**Blockers Before Source-Pack Creation:**
- `vitruvius-connection/` is empty; no local source files exist.
- No file has reached `VERIFIED_SOURCE_CANDIDATE`.
- No manifest entries, hashes, extraction metadata, or verification records exist.
- Script-promotion loophole must be closed (Required Correction 1).
- Manifest must enforce `current` restrictions (Required Correction 2).
- At least one official PDF must be obtained, retained, hashed, and spot-checked.

**Blockers Before Phase 1B:**
All source-pack creation blockers, plus:
- No approved source pack exists (need 10+ chunks, version label, hash).
- Source-pack storage location not accepted.
- `taxonomy_sources` contradiction unresolved (need explanation for 0 rows).
- Admin AI audit tables are not live.
- Component prop/nesting validation approach unselected.
- Question-edit artifact schema incomplete.
- Reviewer roles, capacity, and authority undefined.
- Replay-grade traceability fields not enforced.
- Rollback drill not rehearsed.
- Provider/data-governance boundary not accepted.
- Pilot benchmark rubric and cost ceiling undefined.

**Overclaims to Remove:**
1. `readiness-report.md` Section 4.5 calls the admin surface “READY as admin MVP.” The DB tables are not live-applied. Downgrade to “PARTIAL — UI/code exists, DB tables not live-applied.”
2. `source-drop-intake-protocol.md` State Machine Rule 4 implies an automated official-web spot-check can suffice for `VERIFIED_SOURCE_CANDIDATE`. This overstates machine trust; remove or qualify the “or” language.
3. `source-file-manifest-schema.md` implies `current` is safely restricted by the naming convention alone, but the schema validation rules contain no enforcement of `date_assigned_current` or notes.

**Required Corrections:**
1. **Close script-promotion loophole** in `source-drop-intake-protocol.md` State Machine Rule 4: Require explicit human sign-off for all promotions to `VERIFIED_SOURCE_CANDIDATE`. A script may prepare the promotion packet, but a human (admin for Medium/Low, SME for High/Critical) must approve. Automated spot-checks may support but not replace human approval for High/Critical.
2. **Add `current` enforcement to manifest validation** in `source-file-manifest-schema.md`: Add rule: “If `source_id` contains the segment `current`, `date_assigned_current` MUST be populated and `notes` MUST contain evidence justifying the label. `allowed_use` MUST NOT be `CANONICAL_AFTER_REVIEW` while `current` remains in the ID.”
3. **Align admin readiness wording** in `readiness-report.md` and `source-pack-readiness-report.md`: Change “READY as admin MVP” to “PARTIAL — UI/code exists, DB migrations not live-applied.”
4. **Reconcile source count ambiguity** in `local-source-file-inventory.md`: Add explicit note that 567 = article-bundle count while 1,110 = total exported source rows, preventing readers from confusing the two.
5. **Clarify HIGH-risk `presumed_match`** in `source-file-manifest-schema.md` Section 4.2: Add note that for HIGH-risk legal/code content, `presumed_match` is acceptable only if a documented search confirms no official URL is available; otherwise `verified_match` is required.

**Optional Hardening Recommendations:**
1. Add `quarantine_reason` field to the manifest schema so blockages are explicit rather than inferred from missing data.
2. Add `human_verifier_id` field for accountability on all verified files.
3. Add `spot_check_pages` field documenting how many pages were spot-checked.
4. Add `recheck_date` field for `current` and `presumed_match` sources to force periodic re-verification.
5. Define an “exhaustive search” protocol in `official-web-verification-policy.md` before `no_official_url_found` can be claimed.
6. Require dual-hash verification (two independent tools) for CRITICAL original PDFs.
7. Add `conflict_flag` field to link manifest rows to conflict-resolution log entries.
