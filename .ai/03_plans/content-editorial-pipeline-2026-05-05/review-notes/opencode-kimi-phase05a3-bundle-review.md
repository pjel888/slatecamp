**Review Memo — Phase 0.5A.3 / 0.5B Generated Artifacts**

**Verdict: REQUEST_CHANGES**

The artifacts maintain a correct `DISCOVERY_ONLY` boundary everywhere, contain strong blocker language, and do not promote any bundle beyond discovery. No unsafe overclaims were found. However, schema/status inconsistencies and unanchored statistics must be fixed before these artifacts become the baseline for Phase 0.5B.

---

### Critical Issues

1. **HIGH bundle count mismatch.**  
   `source-bundle-reconciliation-report.md` reports **45** HIGH bundles, but `source-bundle-high-risk-queue.md` and `source-verification-packet-draft-queue.md` only list **28**. Clarify whether the remaining 17 HIGH bundles belong to non-`law_code_policy` families (and are therefore intentionally excluded from the SME_ADMIN queue) or correct the report count.

2. **Risk-tier inconsistency between bundle map and URL candidates.**  
   Refined duplicates (e.g., `…-refined` variants) are graded `LOW` in `source-official-url-candidates.generated.csv` while their base bundles are `MEDIUM` or `HIGH` in `source-bundle-map.generated.csv`. Align risk tiers or document the rationale for the downgrade.

---

### Important Issues

3. **Unanchored statistic in reconciliation report.**  
   The report claims “946 bundles have unresolved or low-confidence identity signals,” but this number does not derive from any table provided (854 `unknown` + 629 `derived_only` = 1,483; 1,528 − 45 `with_PDF` − 319 `LOW` = 1,164). Provide the derivation or remove the claim.

4. **Low-quality bundle titles in unpaired-files list.**  
   Bundles with garbled or placeholder titles (e.g., `"Compound. ~ ,,...""""' …"`, `"ABC"`, `"BOW"`) are assigned `MEDIUM` risk and `BUNDLED_DERIVED_ONLY`. While not promoted beyond discovery, this noise will complicate Phase 0.5B triage. Consider adding a `title_quality` flag or a minimum-token filter.

5. **Conflation of identity confidence signals.**  
   `identity_match_confidence` = `high` is assigned to HIGH-risk bundles with `primary_document_code = unknown` and `official_anchor_hosts = unresolved`. Add a note that this column measures filename/path heuristic confidence, not source-verification confidence.

---

### Minor Issues

6. **Unpaired-files MD is a sample, not exhaustive.**  
   The file lists ~300 rows but states 1,483 bundles. The inline “… 1,183 more rows omitted” note is present, but the README should flag this MD explicitly as a representative sample.

7. **Tautological blocker phrasing in roadmap.**  
   `pre-implementation-autopilot-roadmap.md` says Phase 0.5B is “BLOCKED until web/live verification pass is explicitly run and reviewed.” Rephrase to “BLOCKED until human operator authorizes and reviews the live verification run.”

8. **Duplicate physical files not surfaced.**  
   The bundle map assigns 2,551 physical files, but some files share identical SHA-256 hashes (e.g., raw/refined variants placed in `test/` subdirectories). This is accurate but could be noted to avoid double-counting in throughput estimates.

---

### Recommended Corrections

- **Reconcile counts:** Add a family breakdown to the reconciliation report’s risk table (e.g., `law_code_policy: 28`, `building_technology_reference: X`, etc.) so the 45 vs 28 split is explicit.
- **Align risk tiers:** Copy the base-bundle `risk_tier` into the official URL candidates for refined variants, or add a `base_bundle_risk` column to preserve traceability.
- **Anchor or remove the “946 bundles” statistic.**
- **Add a `title_quality_score` or `needs_human_triage` column** to the unpaired-files summary for bundles with garbled or ultra-short titles.
- **Clarify `identity_match_confidence`** in the bundle-map CSV header or README: “Heuristic confidence based on filename/path similarity; not source-verification confidence.”
- **Update README description** for `source-bundle-unpaired-files.md` to say “representative sample of derived-only/unpaired bundles” rather than implying a full list.
