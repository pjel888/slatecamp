# Source Coverage Gap Map — Phase 0.5 Evidence

**Date:** 2026-05-05
**Scope:** Map coverage gaps by article cluster and question-bank cluster. Use categories: SOURCE_READY, PARTIAL_SOURCE_COVERAGE, CITATION_ONLY, NO_SOURCE, CONFLICTING_SOURCE, OUTDATED_SOURCE_RISK, UNKNOWN.
**Method:** Export-summary analysis, pilot-candidate shortlist inspection, live DB counts, fact-checking flag patterns.

---

## Coverage Category Legend

| Category | Meaning |
|---|---|
| `SOURCE_READY` | Approved source pack exists; claim-addressable chunks available. |
| `PARTIAL_SOURCE_COVERAGE` | Some citations exist, some verified, but not enough for full claim grounding. |
| `CITATION_ONLY` | Citation rows exist (label/URL) but no source text excerpts or verified chunks. |
| `NO_SOURCE` | Zero citation rows; zero source packs; article is unsourced. |
| `CONFLICTING_SOURCE` | Multiple sources disagree, or fact-checking flags identify contradictions. |
| `OUTDATED_SOURCE_RISK` | Source may reference repealed/updated provisions (e.g., old NBCP vs PD 1096). |
| `UNKNOWN` | Coverage status cannot be determined from available evidence. |

---

## 1. Article Cluster Coverage

### 1.1 PD 1096 (National Building Code) Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | ~2 | `wiki_article_sources` has entries with URLs, but unverified | `lea-dsgn-010-03-core-concept` (5 sources), `lea-dsgn-010-02-core-concept` (3 sources) |
| `CITATION_ONLY` | ~40–60 | Citation rows exist but no source text | Most PD 1096-tagged articles |
| `NO_SOURCE` | ~15–25 | `source_count: 0` in export summary | `pd-1096-rule-vii-area-metrics`, `fire-resistive-construction-ratings`, `pd-1096-rule-xii-egress-and-corridors`, `pd-1096-rule-vii-height-limits`, `change-of-use-and-occupancy`, `ceiling-heights-and-room-sizes`, `certificate-of-occupancy`, `rule-i-general-provisions`, `minimum-parking-requirements`, `pd-1096-rule-viii-setbacks-and-easements` |
| `CONFLICTING_SOURCE` | Unknown | Fact-checking flags note "Wrong section references" | Requires per-article audit |
| `OUTDATED_SOURCE_RISK` | High | Questions may cite old NBCP instead of PD 1096 | Flagged in fact-checking pass |
| `UNKNOWN` | ~10–20 | Insufficient evidence to classify | — |

**Cluster verdict:** `NO_SOURCE` / `CITATION_ONLY` — the highest-risk cluster has zero approved source packs.

---

### 1.2 BP 344 (Accessibility) Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | 0 | No verified sources | — |
| `CITATION_ONLY` | ~10–20 | Some citation rows | BP 344-tagged articles |
| `NO_SOURCE` | ~10–15 | `source_count: 0` | `site-planning-accessible-routes-vs-open-space`, `lodging-and-residential-accessibility`, `accessible-seating-in-assembly-areas`, `bp-344-elevator-dimensions`, `bp-344-accessible-washrooms`, `bp-344-tactile-and-visual-alarms`, `bp-344-ramp-slope-tiers`, `universal-design-in-practice-bp-344-ra-7277` |
| `CONFLICTING_SOURCE` | Unknown | Possible conflicts with RA 7277 references | `universal-design-in-practice-bp-344-ra-7277` |
| `OUTDATED_SOURCE_RISK` | Medium | BP 344 may have 2024 IRR updates not reflected | — |
| `UNKNOWN` | ~5–10 | — | — |

**Cluster verdict:** `NO_SOURCE` — zero approved source packs; high-risk accessibility cluster is unsourced.

---

### 1.3 RA 9514 (Fire Code) Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | 0 | — | — |
| `CITATION_ONLY` | ~10–20 | Some citation rows | Fire safety articles |
| `NO_SOURCE` | ~5–10 | `source_count: 0` | `fire-detection-and-alarm-systems` |
| `CONFLICTING_SOURCE` | Unknown | — | — |
| `OUTDATED_SOURCE_RISK` | High | RA 9514 has revised IRR; articles may cite old version | — |
| `UNKNOWN` | ~5–10 | — | — |

**Cluster verdict:** `NO_SOURCE` / `OUTDATED_SOURCE_RISK`.

---

### 1.4 RA 9266 (Architecture Law) Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | ~20–40 | `wiki_article_sources` has entries with URLs, but unverified | `scale-in-architecture-by-francis-dk-ching` (3 sources), `architecture-does-not-exist-in-isolation` (4 sources), `multisensory-architecture` (5 sources), `universal-design-inclusive-architecture` (4 sources), `architecture-beyond-shelter` (3 sources), `architectural-kinesthetics` (5 sources), `architectural-modernism` (7 sources), `classical-architectural-theory` (4 sources) |
| `CITATION_ONLY` | ~60–100 | Most RA 9266 articles have citations but no verified text | — |
| `NO_SOURCE` | ~20–40 | `source_count: 0` | Some professional practice articles |
| `CONFLICTING_SOURCE` | Unknown | Fact-checking flags note wrong section references in RA 9266 articles | Articles 1, 13, 19 in fact-checking tracker |
| `OUTDATED_SOURCE_RISK` | Medium | IRR may have updates | — |
| `UNKNOWN` | ~10–20 | — | — |

**Cluster verdict:** `CITATION_ONLY` / `PARTIAL_SOURCE_COVERAGE` — better than PD 1096/BP 344 but still no approved source packs.

---

### 1.5 Contracts / SPP / Professional Documents Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | ~20–40 | `wiki_article_sources` has entries with URLs, but unverified | `cpd-ethics-and-compliance` (8 sources), `ethical-obligations-in-digital-practice` (6 sources), `ethics-in-sustainable-design` (3 sources), `code-of-ethical-conduct` (4 sources), `professional-development-ethics` (6 sources) |
| `CITATION_ONLY` | ~30–50 | — | — |
| `NO_SOURCE` | ~10–20 | `source_count: 0` | `legal-liability-and-enforcement-workflow`, `civil-code-article-1723`, `pre-design-services-scope`, `guarantee-bond`, `cpd-provider-accreditation` |
| `CONFLICTING_SOURCE` | Unknown | — | — |
| `OUTDATED_SOURCE_RISK` | Medium | SPP documents may have version updates | — |
| `UNKNOWN` | ~5–10 | — | — |

**Cluster verdict:** `CITATION_ONLY` / `NO_SOURCE`.

---

### 1.6 Computation / Formula Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | ~10–20 | Some articles have source metadata | `fire-pump-sizing` (6 sources), `structural-design-capacity-check` (3 sources), `development-control-calculations` (3 sources) |
| `CITATION_ONLY` | ~10–20 | — | — |
| `NO_SOURCE` | ~10–20 | `source_count: 0` | `glass-and-glazing-area-limits`, `allowable-floor-area-increases`, `topography-and-slope-analysis`, `widths-slopes`, `fixtures-and-small-items` |
| `CONFLICTING_SOURCE` | Unknown | Formula constants may differ between sources | — |
| `OUTDATED_SOURCE_RISK` | High | NSCP 2015 vs newer editions; load factors may have changed | — |
| `UNKNOWN` | ~5–10 | — | — |

**Cluster verdict:** `NO_SOURCE` / `OUTDATED_SOURCE_RISK` — formula articles are particularly dangerous without verified source packs because numeric constants can silently drift.

---

### 1.7 General / Low-Risk Control Cluster

| Coverage Category | Count (est.) | Evidence | Example Articles |
|---|---|---|---|
| `SOURCE_READY` | 0 | No source pack exists | — |
| `PARTIAL_SOURCE_COVERAGE` | ~50–100 | Many articles have 3–16 source rows | `rainwater-harvesting-systems` (9 sources), `building-waste-disposal` (6 sources), `elevator-traffic-analysis` (14 sources), `smart-metering` (8 sources), `noise-control` (11 sources), `renewable-energy-systems` (12 sources), `en-15978-standard` (16 sources) |
| `CITATION_ONLY` | ~100–200 | — | — |
| `NO_SOURCE` | ~50–100 | `source_count: 0` | Various |
| `CONFLICTING_SOURCE` | Low | — | — |
| `OUTDATED_SOURCE_RISK` | Medium | Standards may have updates | EN 15978, etc. |
| `UNKNOWN` | ~20–40 | — | — |

**Cluster verdict:** `CITATION_ONLY` / `PARTIAL_SOURCE_COVERAGE` — low-risk articles have better citation coverage but still no approved source packs.

---

## 2. Question-Bank Cluster Coverage

### 2.1 Standard Questions (`questions` table, 7,159 rows)

| Coverage Category | Count (est.) | Evidence |
|---|---|---|
| `SOURCE_READY` | 0 | No question-level source packs |
| `PARTIAL_SOURCE_COVERAGE` | ~2,000–3,000 | `code_citation` is present but unverified |
| `CITATION_ONLY` | ~2,000–3,000 | `code_citation` present, no verified text |
| `NO_SOURCE` | ~2,000–3,000 | `code_citation` is NULL |
| `CONFLICTING_SOURCE` | Unknown | Fact-checking flags note contradictions |
| `OUTDATED_SOURCE_RISK` | High | Questions may cite old NBCP, old IRR versions |
| `UNKNOWN` | ~500–1,000 | — |

### 2.2 Design Scenario Questions (`design_scenario_questions`, 249 rows)

| Coverage Category | Count (est.) | Evidence |
|---|---|---|
| `SOURCE_READY` | 0 | No source packs |
| `PARTIAL_SOURCE_COVERAGE` | ~50–100 | `code_citation` present in some rows |
| `CITATION_ONLY` | ~50–100 | Unverified citations |
| `NO_SOURCE` | ~50–100 | NULL `code_citation` |
| `CONFLICTING_SOURCE` | Unknown | — |
| `OUTDATED_SOURCE_RISK` | Medium | Code references may be outdated |
| `UNKNOWN` | ~20–50 | — |

### 2.3 Design Questions (`design_questions`, 0 rows)

| Coverage Category | Count | Evidence |
|---|---|---|
| `NO_SOURCE` | 0 | Table is empty; no questions to cover |

---

## 3. Taxonomy Cluster Coverage

### 3.1 taxonomy_tree (559 nodes)

| Coverage Category | Count | Evidence |
|---|---|---|
| `SOURCE_READY` | 0 | No node-level source packs |
| `PARTIAL_SOURCE_COVERAGE` | 0 | `taxonomy_sources` is empty |
| `CITATION_ONLY` | 0 | — |
| `NO_SOURCE` | 559 | `taxonomy_sources` has 0 rows; `wiki_items` is navigation only |
| `CONFLICTING_SOURCE` | Unknown | — |
| `OUTDATED_SOURCE_RISK` | Unknown | — |
| `UNKNOWN` | 0 | Clear: zero source rows |

**Critical finding:** The taxonomy tree, which is the backbone of the learning graph, has **zero node-level source references** in `taxonomy_sources`.

---

## 4. Gap Heatmap by Cluster

| Cluster | Articles | Questions | Taxonomy Nodes | Primary Gap |
|---|---|---|---|---|
| PD 1096 | NO_SOURCE / CITATION_ONLY | CITATION_ONLY / NO_SOURCE | NO_SOURCE | No source pack for building code |
| BP 344 | NO_SOURCE | CITATION_ONLY / NO_SOURCE | NO_SOURCE | No source pack for accessibility code |
| RA 9514 | NO_SOURCE / OUTDATED | CITATION_ONLY / NO_SOURCE | NO_SOURCE | No source pack for fire code |
| RA 9266 | CITATION_ONLY / PARTIAL | CITATION_ONLY / NO_SOURCE | NO_SOURCE | No source pack for architecture law |
| Contracts / SPP | CITATION_ONLY / NO_SOURCE | CITATION_ONLY / NO_SOURCE | NO_SOURCE | No source pack for professional docs |
| Computation / Formula | NO_SOURCE / OUTDATED | CITATION_ONLY / NO_SOURCE | NO_SOURCE | Formula constants unverified |
| General / Low-risk | CITATION_ONLY / PARTIAL | CITATION_ONLY / NO_SOURCE | NO_SOURCE | No source packs for any cluster |

---

## 5. Priority Gap Order

1. **PD 1096 IRR** — highest article count, highest question linkage, highest learner impact.
2. **BP 344 IRR** — accessibility is high-risk for compliance; errors hurt learners directly.
3. **RA 9514 IRR** — fire safety; outdated citations are dangerous.
4. **RA 9266 IRR** — professional practice; section-reference errors are common.
5. **SPP Documents + Civil Code** — contracts, liability, compensation; high-stakes for exam.
6. **NSCP** — structural calculations; formula constants must be verified.
7. **General standards** — EN, ISO, etc.; lower priority but still needed.

---

## 6. Safe Phase 0.5 Actions

- Count and classify source coverage per article (this document).
- Map citation rows to external official URLs.
- Identify which articles have `source_count: 0`.
- Flag outdated-source risks (NBCP vs PD 1096, old IRR versions).
- Select the first source-pack feasibility target.

## 7. Blocked Actions

- Source-grounded AI rewriting (no source packs).
- Automated fact-checking against source text (no source packs).
- Claim-to-source validation (no claim-addressable chunks).
- Question-bank source-grounded editing (no question-level source packs).

---

## 8. What Claude Should Review Next

1. Is the priority gap order correct for the LEA exam emphasis?
2. Should the first source-pack target be PD 1096 IRR (broadest coverage) or BP 344 IRR (narrower, more tractable)?
3. Does the `NO_SOURCE` count for the taxonomy tree (559 nodes, 0 `taxonomy_sources` rows) represent a separate data-quality bug?
4. Should the question-bank gap analysis be expanded to include per-question `code_citation` coverage statistics?
