# SlateCamp Read-Only Pedagogy/Depth Audit: Batches 161–163 (NSCP Structural/Utility Clusters)

**Audit Date:** 2026-05-14
**Auditor:** opencode-kimi (Sisyphus)
**Repo:** /Users/philiplewis/slatecamp
**Branch:** 3dlab-gray-viewport-bg
**Scope:** candidate.md + normalized.md + linked-questions.json + question-edits for all selected clusters in Batches 161, 162, 163
**Source Policy:** local_first_only_no_supabase_no_deploy_no_db_no_git_stage_commit_push
**Classification Legend:** PASS | THIN_NEEDS_EXPANSION | SOURCE_NEEDS_RECHECK | QUESTION_ALIGNMENT_RISK | BLOCKER | MISSING_ARTIFACTS

---

## Executive Summary

| Batch | Selected Clusters | Linked Questions | Question Edits | Articles PASS | Articles with Risk | Dominant Risk Pattern |
|-------|-------------------|------------------|----------------|---------------|-------------------|----------------------|
| 161 | 5 | 50 | 50 | 5 | 5 | QUESTION_ALIGNMENT_RISK — questions test material outside checked NSCP anchors |
| 162 | 1 | 10 | 10 | 1 | 1 | QUESTION_ALIGNMENT_RISK — questions test NatCor/operational claims excluded from article scope |
| 163 | 2 | 30 | 30 | 2 | 2 | QUESTION_ALIGNMENT_RISK — questions test exact operational claims explicitly removed in source-safe rewrite |
| **Total** | **8** | **90** | **90** | **8** | **8** | **Universal question–article misalignment; no outright blockers** |

**No-edit / no-git confirmation:** This audit is read-only. No source files, handoff files, git state, Supabase schema, deployment configs, or database content were modified. The only artifact created is this markdown report.

---

## Article-by-Article Findings

---

### Batch 161

#### 1. lea-strc-004-02 — NSCP Seismic Zone 2 / Zone 4 Z Factors

| Field | Value |
|-------|-------|
| Article ID | cc7363f6-b2bf-4ed9-a9b4-81d82eae98fe |
| Slug | lea-strc-004-02-core-concept |
| Topic | NSCP seismic Zone 2 / Zone 4 Z factors |
| Checked Anchors | page-0240.md lines 16-26: Section 208.4.4.1 and Table 208-3 |
| Linked Questions | 10 |
| Question Edits | 10 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article correctly identifies the two-zone system, the Zone 2 exception list (Palawan except Busuanga, Sulu, Tawi-Tawi), and the Zone 4 default. The V = ZICW scaling note is a useful exam shortcut.
- **Board-review clarity:** GOOD. The "Board Exam Quick Check" frames the item type immediately. The table and bullet provisions are scannable.
- **Source safety:** PASS. No overclaiming beyond the checked OCR anchor. Explicitly warns against calling zones "Zone 1 and Zone 2" — a common training shorthand that the checked NSCP text does not use.
- **Scenario/use-case quality:** The Davao real-world scenario is source-safe and directly tests the "rest of country = Zone 4" rule.

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK
- **Evidence:**
  - Question `09f7ddea-f3f3-430e-99b0-42814f68e442` asks for base-shear calculation (V = ZICW) with Zone 2 Z = 0.4. The article uses NSCP 2015 terminology (Zone 2 = 0.20, Zone 4 = 0.40). The question *inverts* the terminology, calling the lower zone "Zone 1 (Z = 0.2)" and the higher zone "Zone 2 (Z = 0.4)".
  - Question `b1599e60-b278-42b4-8f43-002a5f7df349` repeats the inverted "Zone 1 / Zone 2" labels in both stem and rationale.
  - Question `7f1e7259-26ba-4411-b27c-46d5a4b319eb` (Davao) correctly uses Z = 0.4 but calls it "Zone 4", which matches the article.
  - Question `efe5debd-0e8a-49cf-b666-715236dfccc0` asks for the ratio between "Zone 2 and Zone 1" — again inverted terminology.
- **Impact:** A student who learns the article's NSCP 2015 terminology (Zone 2 = 0.20, Zone 4 = 0.40) will be confused by questions that use "Zone 1 / Zone 2" with the same numeric values. This is not a source error but a **taxonomy/label alignment defect**.
- **Remediation:** Reconcile question labels to match the article's NSCP 2015 zone names, OR add an explicit article sidebar explaining why some training materials use older labels.

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions)

---

#### 2. lea-strc-007-03 — NSCP Section 424 Serviceability and Deflection Checks

| Field | Value |
|-------|-------|
| Article ID | f122ad42-0858-4bb6-ac19-6a788bac4c43 |
| Slug | lea-strc-007-03-core-concept |
| Topic | NSCP Section 424 serviceability and deflection checks |
| Checked Anchors | page-0482.md lines 7-89 (Section 424.1, 424.2, Table 424.2.2); page-0483.md lines 36-68 (Table 424.2.4.1.3) |
| Linked Questions | 10 |
| Question Edits | 10 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article correctly distinguishes immediate deflection (l/360), post-attachment deflection (l/480), sustained-load deflection (l/240), and time-dependent creep factors (1.0 → 2.0). The table format is learner-friendly.
- **Board-review clarity:** GOOD. The "Serviceability questions are not strength questions" framing is exactly the right exam mindset.
- **Source safety:** PASS. No overclaiming. Explicitly warns against replacing serviceability checks with "memorized span-to-depth shortcuts."
- **Scenario/use-case quality:** The brittle ceiling panel scenario is realistic and tests the post-attachment deflection limit (l/480).

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK
- **Evidence:**
  - ALL 10 linked questions test **Table 9.5.1 minimum thickness ratios** (L/20, L/24, L/28, L/21, L/8, L/10 for various support conditions and slab/beam types).
  - The article's checked anchors are **Section 424** (deflection limits) and **Table 424.2.2** / **Table 424.2.4.1.3** (time-dependent factors).
  - Table 9.5.1 is **not mentioned** in the article, nor is it in the checked source anchors.
  - Example: Question `425007a6-69a2-4550-b17a-0e6e188d3bd6` asks for minimum slab thickness for a 5 m simply supported span (L/20 = 250 mm). The article does not contain this ratio.
- **Impact:** Questions test a **different NSCP table** than the one the article is sourced from. A student reading only this article will not find the answers to the linked questions.
- **Remediation:** Either (a) expand the article to include Table 9.5.1 with checked anchors, or (b) replace the linked questions with Section 424–focused items (e.g., which deflection limit applies to a roof with nonstructural elements likely to be damaged?).

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions)

---

#### 3. lea-strc-007-05 — NSCP Embedments, Pipe Reinforcement, Cover, and Review

| Field | Value |
|-------|-------|
| Article ID | f39f802d-ddcb-4fd5-b9cd-bb1c6e0e8ef3 |
| Slug | lea-strc-007-05-core-concept |
| Topic | NSCP embedments, pipe reinforcement, cover, and review |
| Checked Anchors | page-0463.md lines 60-81 (Section 420.7); page-0508.md lines 3-27 (Section 426.8 continuation) |
| Linked Questions | 10 |
| Question Edits | 10 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article captures the structural-impairment rule, material compatibility, aluminum embedment coating, perpendicular reinforcement (0.002× concrete area), and cover thresholds (40 mm exposed, 20 mm protected). The construction coordination section adds practical value.
- **Board-review clarity:** GOOD. The table format and the "unshown pipe sleeve" scenario are exam-relevant.
- **Source safety:** PASS. The article stays within Sections 420.7 and 426.8. No overclaiming.
- **Scenario/use-case quality:** The unshown sleeve scenario tests the review trigger directly.

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK
- **Evidence:**
  - Questions test **conduit diameter limits, spacing rules, and cumulative area limits** that appear to come from **PD 1096 / general NSCP provisions** (e.g., "h/3" for beams, "w_rib/4" for ribs, "4% of column area", "3 diameters center-to-center").
  - The article's checked anchors are **Section 420.7** (embedments shall not impair strength) and **Section 426.8** (construction document coordination).
  - Specific question `0d8debcf-c39f-428d-a756-cde40a1b307a` asks about 80 mm conduits in a 300 mm beam with h/3 = 100 mm and 3× spacing = 240 mm. These specific ratios are **not in the checked anchors**.
  - Question `7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7` asks about rib width / 4 = 30 mm. Not in checked anchors.
  - Question `a7ddfea1-6c8b-4cba-967e-f0662ac042a9` asks about 50 mm cover for weather-exposed pipes. The article says 40 mm for earth/weather exposure — a **numeric mismatch** (50 mm vs 40 mm).
- **Impact:** Questions test **detailed dimensional rules** that are either not in the article or contradict it. The 50 mm cover question is particularly problematic because it directly conflicts with the article's 40 mm value.
- **Remediation:** Audit whether the h/3, w_rib/4, 4%, and 3-diameter rules exist in the checked NSCP OCR pages. If they do, add them to the article. If not, replace the questions with ones that test the article's actual content (structural impairment, review triggers, aluminum coating, 0.002 reinforcement).

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions)

---

#### 4. lea-strc-012-01 — NSCP Wind Speed, Exposure, Enclosure, Low-Rise, and Flexible Definitions

| Field | Value |
|-------|-------|
| Article ID | f0790263-a20b-4d36-bebb-05474566cbce |
| Slug | lea-strc-012-01-core-concept |
| Topic | NSCP wind speed, exposure, enclosure, low-rise, and flexible definitions |
| Checked Anchors | page-0060.md, page-0080.md, page-0081.md, page-0092.md, page-0095.md, page-0121.md (Section 207 definitions) |
| Linked Questions | 10 |
| Question Edits | 10 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article defines basic wind speed V (3-sec gust at 10 m in Exposure C), the Occupancy II probability note (7% in 50 years, AEP 0.00143, MRI 700 years), and all classification categories (open, enclosed, partially enclosed, low-rise, flexible, rigid, Exposures B/C/D). The table is dense but scannable.
- **Board-review clarity:** GOOD. The classification-first approach matches how wind-load questions appear on the exam.
- **Source safety:** PASS. Definitions are anchored to checked NSCP pages. The article correctly warns against using "old annual-exceedance shortcuts."
- **Scenario/use-case quality:** The 12 m warehouse / Exposure C scenario is realistic and tests the low-rise + exposure combination.

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK
- **Evidence:**
  - Questions frequently cite **"NBCP 2015" and "IBC 2021"** (e.g., `995484a4-d309-4bcf-85d9-73e0ecd04f1e` cites "NBCP 2015 207.2.2; IBC 2021 26.7.2"). The article is sourced from **NSCP 2015 Section 207**.
  - Question `662044b0-dc1e-437b-90c3-a62e6366324a` defines low-rise as "≤60 ft (18.3 m)". The article says **h ≤ 18 m**. The 0.3 m difference (18.3 vs 18) is minor but could confuse metric-only learners.
  - Question `1dba5961-c1da-413b-82fe-fab5c4fc41fe` asks about "annual probability of exceedance 0.02 → 50-year MRI". The article states **AEP = 0.00143, MRI = 700 years** for Occupancy Category II. The question's 0.02 / 50-year values **do not match** the article's checked source.
  - Question `c13d8387-d38a-47f1-99c3-42ca182f2081` cites "ASCE 7-22 26.2" for flexibility criteria. The article does not mention ASCE 7-22.
- **Impact:** Questions mix **different code editions and standards** (NBCP, IBC, ASCE 7-22) with the article's NSCP 2015 anchors. The probability question uses values (0.02 / 50-year) that contradict the article's checked values (0.00143 / 700-year).
- **Remediation:** Replace probability question with one that tests the article's AEP = 0.00143 / MRI = 700 years. Replace NBCP/IBC/ASCE citations with NSCP 2015 references. Clarify the 18 m vs 18.3 m issue.

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions)

---

#### 5. lea-strc-009-01 — NSCP Section 605 Timber Decay and Termite Protection

| Field | Value |
|-------|-------|
| Article ID | 84cf250f-9168-4bba-9b7a-55dd370f1c31 |
| Slug | lea-strc-009-01-core-concept |
| Topic | NSCP Section 605 timber decay and termite protection conditions |
| Checked Anchors | page-0870.md lines 13-113 (Section 605.1–605.7); page-0871.md lines 3-16, 35-42 (wood-earth separation, treated-wood moisture content) |
| Linked Questions | 10 |
| Question Edits | 10 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article captures all major Section 605 thresholds: 300 mm stump removal, 450 mm joist clearance, 300 mm girder clearance, 450×600 mm access, 200 mm pedestal, 15 mm air space, 0.07 m² ventilation per 10 m², 150 mm wood-earth separation, 19% moisture content. The condition-based table is excellent for exam study.
- **Board-review clarity:** GOOD. The "code-condition questions" framing is accurate. Thresholds are explicit.
- **Source safety:** PASS. The article explicitly warns: "The checked rule is not a species list." It avoids naming specific Philippine species as naturally resistant.
- **Scenario/use-case quality:** The raised timber floor / 400 mm joist clearance scenario directly tests the 450 mm threshold.

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK
- **Evidence:**
  - ALL 10 questions test **NatCor durability classifications, FPRDI species resistance, sapwood limits, and heartwood biology** — NONE of which are in the article.
  - The article is about **Section 605 conditions** (clearances, ventilation, moisture, treated wood). The questions are about **species-specific natural resistance** (Narra, Kamagong, Dao, Tangile, Yakal, Molave).
  - Example: Question `96d4546c-eab8-4ac1-ac61-7ccfc81a797f` asks which species provide "BOTH decay and termite resistance without chemical treatment." The article explicitly says: "Avoid species-resistance shortcuts when the source only proves code conditions."
  - Question `c5a6da5f-9d82-4137-a1ed-73a67cbc48b4` tests Yakal vs Narra substitution for ground-contact use. The article does not mention Yakal or Narra.
  - Question `60a71679-a95f-4b65-8ddd-36e05a2c0ed1` asks about chemically treating Dao timber. The article does not discuss chemical treatment specifications.
- **Impact:** The questions test a **completely different topic** (species durability) than the article (code clearance conditions). This is the most severe misalignment in Batch 161.
- **Remediation:** Either (a) rewrite questions to test Section 605 thresholds (300 mm, 450 mm, 200 mm, 15 mm, 0.07 m², 19%), OR (b) expand the article to include checked species-durability sources (FPRDI, NatCor) if those are intended to be tested.

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions)

---

### Batch 162

#### 6. lea-strc-009-02 — NSCP Table 615.2-1 Timber Stress Groups and Section 622 Machine-Graded Lumber

| Field | Value |
|-------|-------|
| Article ID | 047334de-c79a-4d6a-aa23-58a321b71e2e |
| Slug | lea-strc-009-02-core-concept |
| Topic | NSCP Table 615.2-1 timber stress groups and Section 622 machine-graded lumber |
| Checked Anchors | page-0889.md lines 5-65 (Table 615.2-1); page-0943.md lines 51-96 (Section 622) |
| Linked Questions | 10 |
| Question Edits | 10 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article provides the full Table 615.2-1 group list with safe species examples from the OCR, plus Section 622 machine-graded lumber rules (moisture <16% = dry, >28% = 40% strength reduction, interpolation in between, required markings). The explicit boundary statement is strong pedagogy.
- **Board-review clarity:** GOOD. The "table-lookup questions" framing and three test patterns (species ID, substitution check, unknown species) are exam-relevant.
- **Source safety:** PASS. The article explicitly excludes unsupported claims: "Do not use this article to infer product-density rules for fiberboard or hardboard, nominal-to-actual lumber sizes, or unverified grade-defect schedules."
- **Scenario/use-case quality:** The species-group table is the core learning asset. No separate scenario section, but the "How It Is Tested" section serves the same function.

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK
- **Evidence:**
  - Questions test **NatCor stress groups** with different groupings than the article's Table 615.2-1. Example: Question `c503eb0a-79f5-4041-baa6-6ee79e9d1b7c` says "Yakal is Group I (highest)" — but in the article's Table 615.2-1, **Yakal is in Group I (High Strength Group)**. This matches.
  - However, question `9640e7ab-7532-4a85-b54e-683ffb2b9466` says "Narra: Group II, Lauan: Group III, Apitong: Group II". In the article's table: **Narra is in Group II (Moderately High Strength)**. **Lauan is in Group III (Medium Strength)**. **Apitong is in Group III (Medium Strength)** — NOT Group II. The question has Apitong in Group II, which **contradicts the article**.
  - Questions `0c2afd87-7afa-49e6-8974-3a2d224f1af2` and `34def5c9-1623-4322-bd32-47636959a406` test **fiberboard and hardboard** — exactly the topics the article says are **excluded** from Batch 162 scope.
  - Question `37b399b3-f04c-4d24-a3bd-7fe1fd2bc186` tests **nominal vs actual dimensions** (50×200 mm nominal → 38×189 mm actual) — also explicitly excluded from the article scope.
- **Impact:** Multiple questions test material **explicitly excluded** from the article. One question (`9640e7ab...`) contains a **species-group mismatch** (Apitong Group II vs Group III).
- **Remediation:** Remove fiberboard, hardboard, and nominal-dimension questions. Correct the Apitong group assignment. Add questions that test Table 615.2-1 group lookups and Section 622 moisture/markings rules.

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions)

---

### Batch 163

#### 7. lea-util-004-05 — NSCP Section 208.9 Nonstructural Equipment Restraint and Flood Utility Boundaries

| Field | Value |
|-------|-------|
| Article ID | 1caee82f-c2c8-409b-a3bf-41576bc702c5 |
| Slug | lea-util-004-05-seismic-bracing-and-earthquake-resilience |
| Topic | NSCP Section 208.9 nonstructural equipment restraint, utility continuity, and flood utility boundaries |
| Checked Anchors | page-0237.md, page-0240.md, page-0259.md, page-0283.md, page-0284.md, page-0285.md, page-0286.md, page-0287.md, page-0290.md (Section 208.9, Table 208-1, Table 208-13, Section 211.1) |
| Linked Questions | 15 |
| Question Edits | 15 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe: scenarios retained only where they can be framed as NSCP nonstructural equipment restraint, relative-motion, or flood utility boundary checks |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article is a **source-safe rewrite** that narrows scope to checked NSCP anchors. It clearly defines the safe scope (permanent nonstructural components, Table 208-13 categories, flexible accommodation, vibration isolators, flood utility language) and explicitly lists unsupported claims that were removed.
- **Board-review clarity:** GOOD. The "Source-Safe Scope" section is an excellent pedagogical device — it teaches students to distinguish source-supported from unsupported claims.
- **Source safety:** PASS. The article is explicitly defensive: "The safe scope does not include unsupported exact thresholds for generator transfer time, public-address intelligibility, emergency-power runtime, HVAC operating duration, smoke-control pressure, gas-shutoff valve mechanisms, or proprietary inspection protocols."
- **Scenario/use-case quality:** The retained scenarios are framed as code-supported design postures (anchor life-safety equipment, use flexible detailing, treat emergency power as equipment category, use flood hazard language).

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK (severe)
- **Evidence:**
  - Questions test **exactly the unsupported claims that the article removed**:
    - `961a0025-7d66-4687-a931-e9a1ac59e619` — check valves and automatic shutoff for flood contamination (unsupported per article).
    - `b495ee57-be6f-4e97-a4bf-39ee822e7aa0` — ASTM F1554 Grade 36 fasteners for typhoon regions (unsupported; article removed "exact wind-fastener ASTM claims").
    - `2b17803b-3aa6-4188-bbe2-8d88091f712e` — integrated design for seismic 0.4g, typhoon 1.48 kPa, flood +0.6 m freeboard, 72-hour emergency power, 90-minute backup PA (unsupported exact thresholds).
    - `27e3b467-5bed-4061-95f6-c8d7a8a85863` — 0.15-second max transfer time for auto-transfer switches (unsupported exact threshold).
    - `9c6a6587-1493-430c-9ae9-cad501989ed5` — RA 10121 resilience principles for HVAC (unsupported; article removed "HVAC operating duration" claims).
    - `0863616e-8994-4ed6-91c7-e3b5684ed4a5` — 72-hour autonomy RA 10121 requirement (unsupported exact threshold).
    - `31f01fa7-d997-4a9f-aff6-5762d82be418` — 1.5–2.0× wind moment multiplier for rooftop equipment (unsupported; article removed "exact wind-fastener ASTM claims and wind moment multipliers").
    - `ad388f32-8ec2-45d8-8a4f-1726da564759` — IEC 60268-16 speech intelligibility ≥0.70 (unsupported exact threshold).
    - `b683dad1-83ca-4973-a6d2-dd80480182af` — PD 1096 smoke control pressure relief dampers (unsupported operational claim).
    - `c7b1786e-3a56-45f4-b7c9-a2eae78515a4` — seismic acceleration 0.5g / 0.35g exceeding design spectra (unsupported exact threshold).
- **Impact:** The questions are **leftover from the pre-rewrite article** and test content that the source-safe rewrite **explicitly removed**. A student who reads the article and then takes the quiz will find that the article says "we do NOT cover this" while the questions ask exactly those things.
- **Remediation:** **Rewrite all 15 questions** to test only the checked NSCP anchors: Table 208-1 importance factors (Ip = 1.5 for life-safety anchorage), Table 208-13 equipment categories, Section 208.9.2 force design, Section 208.9.3 load transfer, vibration isolator rules, and Section 211.1 flood utility language.

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions — severe)

---

#### 8. lea-util-004-08 — NSCP Section 208.9 Workflow for Seismic Bracing, Equipment Anchorage, and Vibration-Isolated MEPF

| Field | Value |
|-------|-------|
| Article ID | 585425ad-355a-4180-b64b-a872115f39f6 |
| Slug | lea-util-004-08-seismic-bracing-requirements-per-nscp-2015 |
| Topic | NSCP Section 208.9 workflow for seismic bracing, equipment anchorage, relative motion, and vibration-isolated MEPF |
| Checked Anchors | Same set as lea-util-004-05 (page-0237.md through page-0290.md) |
| Linked Questions | 15 |
| Question Edits | 15 |
| Source Audit Status | PASS |
| Scenario Status | included_source_safe: scenarios retained only as NSCP seismic zone, component force, anchorage, relative-motion, and vibration-isolator checks |

**Pedagogy Assessment**
- **Explanation depth:** ADEQUATE. The article provides a 6-step workflow for nonstructural equipment design, explains Ip = 1.5 for life-safety anchorage, lists Table 208-13 equipment categories, covers flexible crossings, vibration isolators, and equipment specifications. The explicit "Unsupported Claims Removed" list is strong pedagogy.
- **Board-review clarity:** GOOD. The "seismic zone is an input, not the whole answer" framing is an excellent exam strategy.
- **Source safety:** PASS. The article explicitly replaces "unsupported former labels such as NSCP Section 1307.5" with checked Section 208.9 anchors.
- **Scenario/use-case quality:** The scenario checklist (Is the item in a checked equipment category? Does life-safety importance apply? etc.) is a useful exam framework.

**Question Alignment Assessment**
- **Risk level:** QUESTION_ALIGNMENT_RISK (severe)
- **Evidence:**
  - Questions test **exactly the unsupported claims the article removed**:
    - `02b11a14-0f2e-41ee-82cf-2d83c09af0e2` — inertial gas shutoff valve mechanics, heavy ball sensor, PHP 8,000–15,000 cost, activation threshold >0.5g, response time <1 second. The article says: "The checked source does not support exact gas shutoff valve internals, exact response time, price ranges."
    - `b3958f33-180d-4bf5-b1fb-dc1c6c02857e` — emergency generator filter clogging post-earthquake, PD 1096 Section 5.5, 24-hour filter replacement. The article says: "does not support generator filter maintenance deadlines, silt-source diagnosis, and post-incident maintenance sequence."
    - `5c74d1f9-f1fb-48ab-95f2-6be2ee361d52` — generator auto-start timeline: 5 sec detection, 30 sec warm-up, ±5% sync, ≤50 ms transfer, IEC 62310-3, ISO 3006. The article says: "does not support exact generator transfer times, runtime hours, maintenance sequence."
    - `aa3e5e12-6f4d-460e-b251-da273a19e59c` — flexible metallic hose ASME B16.39, canvas connector UL Class 1, NEC Article 300, NFPA 90A. The article says: "does not support exact ASME flexible hose movement ratings, exact AISC or anchor-bolt grade rules."
    - `a72c9aa8-a967-4b0f-8180-a9b3558261c6` — gas shutoff valve failure diagnostics (frozen sensor ball, mineral scale, 8–10 year wear). The article says: "does not support inertial gas shutoff ball-sensor mechanics, response time, activation threshold."
    - `c1ed334c-bcb3-4322-b56a-a6add8b96b84` — flexible coupling movement distribution, ASME B31.1, NSCP 208.6. The article says: "does not support exact ASME flexible hose movement ratings."
    - `1c85cd70-7225-435d-ba16-00c211e62b29` — cable restraint safety factor 1.43, NSCP 1307.5. The article says: "does not support exact AISC or anchor-bolt grade rules not present in the checked NSCP anchors."
    - `21b3a069-8ad6-402b-9423-608071bdf1e6` — water heater strapping band corrosion, PD 1096 Section 5.4. The article says: "does not support post-earthquake inspection protocols."
    - `488b3c49-4af9-4d33-a76e-af7501a57702` — friction-only prohibition, NSCP Section 1307. The article says: "replaces unsupported former labels such as NSCP Section 1307.5."
  - Question `e5179a2a-67ba-4c10-8218-82d980349bfb` asks about NSCP 2015 **Table 208-1** Ip = 1.5 for life-safety systems. This **IS** in the checked anchors and the article. This is a **correctly aligned question**.
  - Question `05cd5a06-3183-4848-9b1f-f8cb6a36f581` asks about Zone 4 Z = 0.40. This **IS** in the article. Correctly aligned.
- **Impact:** Like lea-util-004-05, most questions are **leftover from the pre-rewrite article** and test content that the source-safe rewrite removed. Only 2 of 15 questions are fully aligned.
- **Remediation:** **Rewrite 13 of 15 questions** to test only the checked NSCP anchors. Keep the 2 aligned questions (Table 208-1 Ip, Zone 4 Z factor).

**Classification:** PASS (article) + QUESTION_ALIGNMENT_RISK (questions — severe)

---

## Cross-Cutting Observations

### 1. Universal Question–Article Misalignment
Every article in Batches 161–163 has **QUESTION_ALIGNMENT_RISK**. The articles are source-safe and well-written, but the linked questions were **not rewritten to match the narrowed article scope**. In Batch 163 (utility clusters), the disconnect is extreme: questions test exact operational claims that the articles explicitly list as "unsupported claims removed."

### 2. OCR/Code Overclaiming Avoidance
**All 8 articles successfully avoid OCR overclaiming.** The Batch 163 articles are exemplary: they include explicit "Unsupported Claims Removed" lists and "Source-Safe Scope" sections. This is a best-practice pattern that should be replicated in future batches.

### 3. Scenario Quality
- **Batches 161–162 (structural):** Scenarios are source-safe, code-grounded, and exam-relevant. The timber durability scenario (raised floor / 400 mm joist clearance) and the embedment scenario (unshown pipe sleeve) are particularly strong.
- **Batch 163 (utility):** Scenarios are **intentionally abstracted** to code-supported design postures rather than operational specifics. This is correct for source safety but may feel thin to learners who expect concrete numbers. The trade-off is justified.

### 4. Board-Review Clarity
All articles follow the same template (Board Exam Quick Check → Learning Goal → Core Concept → Key Provisions → Real World Scenario → How It's Tested → Common Mistakes). This consistency is good for learner navigation. The "Common Mistakes" sections are consistently strong.

### 5. Batch 163 Rewrite Quality
The Batch 163 rewrites (lea-util-004-05 and lea-util-004-08) are **significantly improved** over their pre-rewrite versions in terms of source safety. The explicit scope narrowing, the 6-step workflow, and the "Unsupported Claims Removed" lists are all high-quality pedagogy. However, the **questions must be rewritten** to match.

---

## Remediation Recommendations (Prioritized)

### High Priority
1. **Batch 163: Rewrite all utility-cluster questions (30 total).** Questions must test only the checked NSCP anchors (Table 208-1, Table 208-13, Section 208.9, Section 211.1). Remove all questions that test operational claims (generator transfer times, PA intelligibility, smoke-control pressure, gas-shutoff mechanics, ASME ratings, post-earthquake inspection protocols).
2. **Batch 161 lea-strc-009-01: Rewrite all 10 questions.** Questions must test Section 605 thresholds (300 mm, 450 mm, 200 mm, 15 mm, 0.07 m², 19%) instead of species-specific durability classifications.
3. **Batch 161 lea-strc-007-03: Rewrite all 10 questions.** Questions must test Section 424 deflection limits (l/360, l/480, l/240, time-dependent factors) instead of Table 9.5.1 minimum thickness ratios.

### Medium Priority
4. **Batch 161 lea-strc-004-02: Reconcile zone terminology.** Ensure questions use NSCP 2015 labels (Zone 2 / Zone 4) instead of inverted "Zone 1 / Zone 2" labels.
5. **Batch 161 lea-strc-007-05: Audit question anchors.** Verify whether h/3, w_rib/4, 4%, and 3-diameter rules exist in the checked NSCP pages. If yes, add them to the article; if no, replace the questions.
6. **Batch 161 lea-strc-012-01: Reconcile code citations.** Replace NBCP/IBC/ASCE 7-22 citations with NSCP 2015 references. Fix the probability question (0.02/50-year vs 0.00143/700-year).
7. **Batch 162 lea-strc-009-02: Fix Apitong group mismatch.** Correct question `9640e7ab...` (Apitong Group II → Group III). Remove fiberboard/hardboard/nominal-dimension questions.

### Low Priority
8. **Consider adding a "Question Alignment Check" step to the batch acceptance workflow.** Before a batch is accepted, verify that every linked question tests content explicitly present in the article's checked anchors.
9. **Consider cross-referencing the "Unsupported Claims Removed" list against the question bank** as an automated validation step.

---

## No-Edit / No-Git Confirmation

- **No source files were edited.** All inspection was read-only.
- **No candidate.md or normalized.md was modified.**
- **No question-edit JSON files were modified.**
- **No git operations were performed.** No staging, committing, or pushing occurred.
- **No Supabase or database operations were performed.**
- **No deployment or build operations were performed.**
- **The only artifact created is this audit report.**

---

## Audit Artifact Checklist

| Requirement | Status |
|-------------|--------|
| Inspect candidate.md for all 8 articles | ✅ Done |
| Inspect normalized.md for all 8 articles | ✅ Done |
| Inspect linked-questions.json for all 8 articles | ✅ Done |
| Inspect sample question-edits for all 8 articles | ✅ Done |
| Evaluate pedagogy depth | ✅ Done |
| Evaluate source safety / OCR overclaiming | ✅ Done |
| Evaluate scenario / use-case quality | ✅ Done |
| Evaluate board-review clarity | ✅ Done |
| Evaluate question alignment with upgraded articles | ✅ Done |
| Classify each article | ✅ Done |
| Provide remediation suggestions | ✅ Done |
| Explicit no-edit / no-git confirmation | ✅ Done |
| Write report to specified path | ✅ Done |

---

*End of audit report.*
