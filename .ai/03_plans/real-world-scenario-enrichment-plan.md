# Real-World Scenario Enrichment Plan

Generated: 2026-05-12T10:30:00+08:00
Workspace: /Users/philiplewis/slatecamp
Scope: planning only; no article edits, question edits, Supabase changes, commits, or deployments authorized by this plan.

## 1. Objective

Add optional **Real World Scenario** sections to eligible SlateCamp articles. Each scenario presents a realistic, exam-relevant professional situation that connects abstract article content to the daily work of a practicing architect in the Philippines. The scenario is followed by 1-3 analysis questions with answers grounded in the same article sources.

Scenarios are **optional** — articles that cannot support a grounded scenario do not receive one. No article receives a forced or fabricated scenario.

### Section Format

Each Real World Scenario section appears as a distinct callout block in the article prose, placed after the main body content and before any summary/quiz sections. Format:

```
## Real World Scenario

**The Situation**
[A paragraph setting up a realistic professional situation — site visit, client meeting,
permit application, dispute, design decision, inspection, etc. Directly tied to the
article's topic and grounded in the article's source claims.]

**Your Task**
[A concise question or decision prompt — what do you do, what do you tell the client,
which code provision applies, how do you resolve the conflict?]

**Analysis**
[Step-by-step reasoning anchored to the article's source-grounded content.
Cites the same PD 1096 section, BP 344 provision, UAP Document article,
or other source the article already references.]

**Key Takeaway for the LEA**
[One sentence connecting the scenario back to exam strategy — what the LEA tests
about this exact kind of situation.]
```

### What This Is Not

- NOT a replacement for existing quiz questions or "How It Is Tested" sections
- NOT a fictional story that invents unsupported code facts
- NOT a speculative hypothetical that goes beyond what article sources support
- NOT a required section for every article

---

## 2. Eligibility Criteria

### Eligible Article Types

An article **qualifies** for a Real World Scenario if it meets ALL of:

1. **Applied-knowledge potential**: The article's topic directly connects to a recognizable professional situation where an architect would make a judgment call, apply a rule, resolve a conflict, or exercise professional discretion.
2. **Source depth**: The article cites at least one specific legal/code/professional standard (PD 1096 section, BP 344 provision, RA citation, UAP Document article, NSCP table, DOE guideline, etc.) — not just general knowledge.
3. **Decision space**: The article's content supports more than one plausible interpretation or application path — there is room for a "choose the right response" scenario.
4. **Non-obvious application**: The scenario reveals something about how the rule works in practice that the bare text doesn't teach.

**High-yield subjects** (scenario strongly recommended where conditions met):
- **Legal/Code articles**: PD 1096 Rules V-XII enforcement scenarios, BP 344 compliance checks, RA 9266 scope-of-practice boundary cases, RA 9514 fire code application, NSCP structural decisions
- **Professional practice**: UAP Code of Ethics dilemmas, contract administration disputes (UAP Doc 301), fee computation edge cases, CPD compliance, foreign architect practice rules
- **Accessibility**: BP 344 ramp slope choices, wheelchair seating in assembly areas, accessible route conflicts with setbacks
- **Site planning**: Hydrology impact on building placement, easement conflicts, flood hazard zone decisions
- **MEPF**: Fire extinguishing system selection for occupancy type, ventilation shaft compliance check
- **Design decision**: Green building certification strategy (BERDE vs. mandatory), material selection tradeoffs for specific building conditions
- **Construction**: Excavation protection, veneer anchorage, temporary structures, trench safety

### Ineligible Article Types (skip scenarios)

An article is **excluded** from scenario enrichment if:

1. **Pure definition or formula table**: Articles that are primarily lists of values, conversion factors, formula presentations, or glossary definitions (e.g., "PD 1096 Rule VII Area Metrics" — formula tables and computation steps; "Material Properties — Steel, Concrete, and Timber" — definitional content)
2. **Narrow/catalog articles**: Articles that catalog categories without application context (e.g., "Chimneys and Fireplaces" — pure dimension tables; "Typology Checklists")
3. **Pure overview or summary**: Mastery-level overviews that summarize multiple subtopics without depth on any single applied scenario
4. **Non-LEA-enforceable topics**: Purely historical, theoretical, or stylistic content where Philippine regulatory/professional practice doesn't apply (e.g., architectural history movements, aesthetic theory)
5. **Articles without source ledger support**: Articles not yet source-audited or whose sources don't include a specific legal/code/professional standard

### Edge Cases

| Case | Decision |
|---|----|
| Article is mostly formula table BUT has a "Common Exam Traps" section with applied reasoning | Eligible — place scenario in the applied section |
| Article is eligible but the sources only support one outcome | Eligible if scenario demonstrates *how* to reach that correct outcome (process scenario, not choice scenario) |
| Article is eligible but very short (< 15 lines body prose) | Eligible only if a compact scenario (1 paragraph situation + 1 question) fits without dominating the article |

---

## 3. Source-Safety Rules

### Non-Negotiable

1. **Every factual claim in the scenario must trace to a source cited by the article.** Do not import facts from external knowledge unless the article's source ledger already contains that source.
2. **Do not invent code section numbers.** If the article cites Section 1202, do not write "Section 1202-A". Use only section numbers and provision text present in the article's source list.
3. **Do not invent compliance values.** If the article says "50 mm clearance," do not write "75 mm clearance" in the scenario. Use only values the article sources support.
4. **Do not import foreign codes.** Philippine codes (PD 1096, BP 344, RA 9266, RA 9514, NSCP) are the only valid sources. Do not cite IBC, UBC, or other foreign codes unless the article explicitly references them.
5. **Contextual details (site dimensions, building type, architect name, city) are free** only when they do not create or imply a code/legal fact that is unsupported. "A 1,200 sq. m commercial building in Manila" is fine. "A 1,200 sq. m commercial building in Manila that requires a 3-hour fire-resistive rating" is only fine if the article sources support that rating for that occupancy.

### Practical Hypotheticals

Scenarios may be **practical hypotheticals** — realistic but fictionalized situations — provided:

1. The scenario's resolution rules are entirely contained in the article's source-grounded claims.
2. The scenario is labeled as a hypothetical (the "Analysis" section makes clear which code/standard is being applied).
3. No scenario states or implies that a specific real case, real architect, or real building was the basis (to avoid misrepresentation).

### Fallback: If Sources Are Thin

If an article has too few sources to support a full scenario:
- **Do not write a scenario.** Mark the article as "InsupportedForScenario:true" in the batch manifest.
- If 1-2 sources are present but a simple process scenario (see "Edge Cases" above) is possible, write it but tag it with `scenario_source_depth: minimal`.

---

## 4. Representative Sample Inspection

Based on reading the content-audit-export articles in the improved range (batches 001-015 plus unbatched improved articles under `content-audit-export/articles/`), here is the eligibility assessment of a representative cross-section:

### SHOULD RECEIVE SCENARIO (eligible and high-value)

| Article | Topic | Why Eligible | Scenario Angle |
|---|----|---|---|
| `lea-prac-ctr-005` | Architect's Authority During Construction | UAP Doc 301, decision space, impartiality requirement | Dispute between owner and contractor over defective work — what can the architect decide? |
| `fire-zones-and-existing-buildings` | PD 1096 Rule V Fire Zones | Code application with thresholds, exceptions | Existing building damaged by fire in restrictive zone — repair or relocate? |
| `excavation-foundation-and-veneer` | PD 1096 Rule XII Excavation | Specific duties, notice periods, trench safety | Adjoining building owner refuses access before excavation — who is liable? |
| `accessible-seating-in-assembly-areas` | BP 344 Assembly Seating | Dimensional rule with application context | Auditorium design with 3% wheelchair space — check location, route, footprint |
| `green-building-design` | BERDE / DOE Guidelines | Certification process, strategy decisions | Developer claims "BERDE-certified" at design stage — is the claim valid? |
| `bp-344-ramp-slope-tiers` | BP 344 Ramp Requirements | Dimensional with design decision | Site constraints force a ramp slope at the boundary — what is allowed? |
| `lea-prac-eth-001` | RA 9266 Scope of Practice | Boundary enforcement scenario | Engineer preparing architectural plans — scope violation or not? |
| `lea-prac-ctr-002` | Basic vs. Additional Services | Fee scope decision | Owner asks architect to include interior design in basic service fee |
| `lea-prac-law-010` | Civil Code Art. 1723 - 15-Year Liability | Legal liability scenario | Building defect appears at year 12 — who is liable? |
| `bp-344-elevator-dimensions` | BP 344 Elevator Requirements | Dimensional compliance check | Existing elevator shaft constraints vs. BP 344 minimum dimensions |
| `lea-util-004-04` | Fire Alarm System Mandatory Triggers | RA 9514 application | Mixed-use building — is a fire alarm system mandatory? |
| `site-exterior-circulation` | PD 1096 Site Circulation | Code application with site constraints | Site with limited frontage — accessible route conflicts with parking |
| `lea-prac-svc-005` | Schematic Design Deliverables | Professional practice boundary | Client demands full working drawings during schematic phase |
| `lea-prac-frm-001` | Sole Proprietorship | Practice structure decision | Architect wants to practice alone — what form is allowed? |
| `lea-prac-cmp-006` | MDPE Formula | Fee computation with judgment | Multiple-of-direct-personnel-expense — which costs count? |

### MAY RECEIVE SCENARIO (eligible but needs per-article assessment)

| Article | Topic | Assessment Needed |
|---|----|---|
| `pd-1096-rule-vii-area-metrics` | Area computation formulas | Formula-heavy but has applied "Exam Workflow" section — could support a computation scenario |
| `transpor-nodes-escalators-walkways` | Escalator/walkway specs | Dimensional specs but application exists in building design |
| `stairs-handrails-guardrails` | Stair requirements | Code dimensions + judgment calls on design |
| `conflict-matrix-stairs-guards-elevators` | Code conflict matrix | Rich comparison content ideal for a "choose the right controlling rule" scenario |
| `penthouses-and-roof-structures` | Roof structure exemptions | Threshold judgment — does this structure qualify as penthouse? |

### DO NOT RECEIVE SCENARIO (ineligible)

| Article | Topic | Why Ineligible |
|---|----|---|
| `chimneys-and-fireplaces` | Dimension tables | Pure dimensional catalog — no decision space |
| `lea-strc-003-02` | Material Properties (steel/concrete/timber) | Definitional catalog — ductility, brittleness, etc. |
| `lea-strc-005-02` | Structural Load Combinations | Formula application — scenario would be a computation problem, not a scenario |
| `overview-*` (all overview pages) | Subject overviews | Pure summaries of multiple subtopics |
| `mastery-*` (all mastery pages) | Cross-subject syntheses | Too broad for focused scenario |
| `pre-colonial-vernacular` | History article | No regulatory/professional practice application |
| `brutalism` | Architectural history | No scenario possible |
| `le-corbusier-five-points` | Architectural theory | No scenario possible |
| `american-colonial-era` | History | No regulatory application |

---

## 5. Implementation Workflow (Roundtrip-Compatible)

### File Ownership in the Roundtrip Protocol

The existing roundtrip protocol strictly separates roles:

| File | Role | Who Edits |
|---|---|---|
| `original.md` | Exact Supabase snapshot | Never edited |
| `normalized.md` | Review/edit surface for prose | Workers edit scenario prose here |
| `ui-blocks.json` | Preserves custom UI component blocks | Workers update if scenario uses a new component |
| `candidate.md` | Recomposed article for diff and push | Generated by compose — never hand-edited |

### Scenario Integration Strategy

**Strategy: Placeholder-based scenario block in normalized.md, treated as new UI block in ui-blocks.json**

1. The scenario is written as a fenced UI block in `normalized.md` with the component name `RealWorldScenario`.
2. The raw HTML/MDX content of the scenario (including the callout structure) is stored in `ui-blocks.json` with a new block ID (e.g., `ui_0XYZ`).
3. The compose step replaces the `[SLATECAMP_UI_BLOCK:...]` placeholder with the full scenario render block.
4. `candidate.md` gains the full rendered scenario.
5. The diff compares `candidate.md` vs `original.md` — scenario addition appears as added content.

### Step-by-Step Implementation Sequence

**For each article in a batch:**

```
1. READ:  article-metadata.json, normalized.md, sources.json, ui-blocks.json
2. DECIDE: Does this article meet eligibility criteria? (Section 2)
   - If NO → record "scenario:skip" in batch manifest with reason → done.
   - If YES → proceed.
3. DRAFT:  Write scenario content:
   - Review sources.json for source-grounded claims
   - Draft "The Situation", "Your Task", "Analysis", "Key Takeaway"
   - Verify every claim against article sources (source-safety gate)
4. UPDATE normalized.md:
   - Insert at end of main body (before "How It Is Tested" / "Common Mistakes" / summary section)
   - Add placeholder: [SLATECAMP_UI_BLOCK:ui_<NEW_ID> component="RealWorldScenario" status="preserved"]
   - Add summary of scenario props/content
   - Update normalized_content_hash
5. UPDATE ui-blocks.json:
   - Add new block entry with:
     - id: "ui_<NEW_ID>"
     - component: "RealWorldScenario"
     - raw: the full scenario markdown/HTML
     - status: "preserved"
     - scenario_source_depth: "full" | "minimal"
     - scenario_source_refs: [list of source locators used]
6. COMPOSE: bun run content-audit:compose -- --article-id <id> --overwrite
7. DIFF:   bun run content-audit:diff -- --article-id <id>
8. VALIDATE:
   - Verify no broken placeholders
   - Verify all scenario claims trace to article sources
   - Verify compose-error.json is absent
   - Run linter on any new component markup
9. DRY-RUN PUSH: bun run content-audit:push:dry-run -- --article-id <id>
10. RECORD: batch manifest with article ID, scenario status, source refs
```

### RealWorldScenario Component

The scenario block introduces one new component type to the roundtrip: `RealWorldScenario`. Its schema in `ui-blocks.json`:

```json
{
  "id": "ui_<NEW_ID>",
  "component": "RealWorldScenario",
  "raw": "## Real World Scenario\n\n**The Situation**\n...\n\n**Your Task**\n...\n\n**Analysis**\n...\n\n**Key Takeaway for the LEA**\n...",
  "status": "preserved",
  "props": {
    "scenario_source_depth": "full",
    "scenario_source_refs": ["PD 1096 Rule V Section 506", "RA 9514 Section 12.2"],
    "scenario_questions": 2,
    "article_id": "<article_uuid>"
  },
  "scenario_content_hash": "sha256:<hash>"
}
```

The scenario is stored as a preserved UI block because:
- It contains formatted content (bold headings, lists, etc.) that should survive normalization/recomposition
- It follows the existing pattern for structured, non-prose blocks in the roundtrip pipeline
- It can be independently versioned and diffed

---

## 6. Safe Swarm/Agent Division

### Principle: One File, One Writer

No two agents may edit the same file concurrently. For scenario enrichment, the critical shared resource is each article's `normalized.md` and `ui-blocks.json`.

### Agent Structure

```
Coordinator (Hermes / OpenCode orchestrator)
│
├── Eligibility Scanner Agent (1 agent, read-only)
│   Reads: article-metadata.json, sources.json, normalized.md for each article
│   Outputs: eligibility manifest ("eligible", "ineligible", "edge_case")
│   File: .ai/17_article_improvement/jobs/scenario-eligibility-<batch>.json
│
├── Scenario Writer Agents (1 per article, parallel-safe)
│   Each writer owns ONE article folder exclusively
│   Reads: article-metadata.json, sources.json, normalized.md, ui-blocks.json
│   Writes: normalized.md (add scenario placeholder), ui-blocks.json (add scenario block)
│   No two writers ever share an article_id
│
├── Compose Agent (1 agent, sequential per article)
│   Reads: normalized.md, ui-blocks.json
│   Runs: compose command per article
│   Outputs: candidate.md, compose-report.json
│
├── Diff & Validate Agent (1 agent, sequential per article)
│   Reads: candidate.md, original.md
│   Runs: diff, validate commands
│   Outputs: diff-report.md, diff-report.json
│
└── Integration Agent (1 agent, batch-level)
    Aggregates: all per-article reports
    Outputs: batch manifest with scenario status per article
    Runs: final validation checks
```

### Parallelism Rules

1. **Eligibility scan** can be parallelized across articles (one agent processes N articles, each independently).
2. **Scenario writing** can be parallelized with **one writer per article** — no two agents share an article_id.
3. **Compose** and **Diff** must be sequential per article (compose writes candidate.md, then diff compares it).
4. **Compose across articles** can be parallel if compose commands are independent (they read/write disjoint article folders).
5. **The integration agent** must run last, after all per-article work is complete.

### Delegate Agent Brief Template

```
TASK: Write Real World Scenario for article <article_id>
EXPECTED OUTCOME: Updated normalized.md and ui-blocks.json with scenario block
REQUIRED TOOLS: Read (normalized.md, sources.json, ui-blocks.json, article-metadata.json), Edit (normalized.md, ui-blocks.json)
MUST DO:
- Verify eligibility against this plan's criteria
- Ground every claim in article sources from sources.json
- Insert scenario before "How It Is Tested" / "Common Mistakes" section
- Add placeholder and ui-blocks.json entry with proper props
- Update normalized_content_hash
MUST NOT DO:
- Do not edit original.md, candidate.md, or linked-questions.json
- Do not invent code sections, values, or non-Philippine sources
- Do not write scenario for ineligible articles
CONTEXT: See .ai/03_plans/real-world-scenario-enrichment-plan.md for eligibility criteria and source-safety rules
```

---

## 7. Validation Gates

### Pre-Compose Gate (per article)

| Check | Method | Pass/Fail |
|---|---|---|
| Article is on the eligibility manifest | Compare article_id against batch eligibility JSON | Pending |
| Scenario claims traceable to article sources | Manual review of each claim against sources.json entries | Pending |
| No unsupported code sections or values | Regex scan for section numbers not in sources.json | Pending |
| Scenario placeholder format correct | Match `/SLATECAMP_UI_BLOCK:ui_\d+/` pattern | Pending |
| Placeholder references existing ui-blocks.json entry | Cross-reference normalized.md placeholders with ui-blocks.json keys | Pending |

### Post-Compose Gate (per article)

| Check | Method | Pass/Fail |
|---|---|---|
| compose-error.json absent | File existence check | Pending |
| candidate.md generated successfully | File exists and non-empty | Pending |
| No raw placeholders in candidate.md | Search for `SLATECAMP_UI_BLOCK` in candidate.md (MUST be 0 matches) | Pending |
| diff-report.json present | File existence check | Pending |
| No source-claim regression (scenario did not remove or alter existing source-grounded claims) | Verify original.md claims still present in candidate.md | Pending |

### Batch-Level Gate

| Check | Method | Pass/Fail |
|---|---|---|
| All articles accounted for (eligible, ineligible, edge) | Count(eligible) + count(ineligible) + count(edge) = total articles in batch | Pending |
| No agent file conflicts | Verify no two agents edited same article_id | Pending |
| Batch manifest complete | JSON valid, all fields present per article | Pending |

---

## 8. Handoff Instructions for Future Batches

### What Each Batch Worker Needs

1. This plan file (`.ai/03_plans/real-world-scenario-enrichment-plan.md`)
2. The batch manifest with article_ids
3. The scenario eligibility manifest (generated by scanner) — or run scanner as first step
4. Source files for each article: `sources.json`, `normalized.md`, `ui-blocks.json`, `article-metadata.json`

### Prioritization for Serial Production

- **First pass**: High-yield legal/code/professional-practice articles from the eligible list (Section 4)
- **Second pass**: Accessibility and site planning articles
- **Third pass**: MEPF, design decision, and construction articles
- **Batch scope**: No more articles than the base article improvement batch. Scenario work should trail article improvement by at least one batch to ensure source-audited content.

### Integration with Existing Production Pipeline

```
Article Improvement Batch N
  → Article improved, source-audited, pushed to Supabase
  → Scenario Enrichment Batch N (trails by 1 batch)
    → Eligibility scan
    → Scenario write (eligible articles only)
    → Compose + Diff + Validate
    → Dry-run push
    → Apply push
```

Scenario enrichment should NOT block base article improvement. It is an **optional add-on layer** that runs after the article improvement pipeline has completed for a batch.

### Known Constraints

1. **Component rendering**: The `RealWorldScenario` UI block needs a renderer in the wiki article view (`.tsx` component) to display correctly. This is a frontend implementation task outside this plan's scope. The roundtrip storage works; rendering must be built separately.
2. **Existing "How It Is Tested" overlap**: Some articles (e.g., `lea-prac-ctr-005`) already have a "How It Is Tested" section that describes scenario patterns. The Real World Scenario section should complement, not duplicate, this content. If the "How It Is Tested" section already describes a concrete scenario, do not add a redundant scenario.
3. **Per-article judgment**: The eligibility of some articles (especially combined formula + applied sections) requires human or high-quality AI judgment. The eligibility scanner should flag these as "edge_case" for manual review rather than making a binary decision.
4. **Source ledger completeness**: Scenario writing for an article should only proceed if `sources.json` has at least one entry with `source_type: "legal"` or `source_type: "code"` or `source_type: "professional_standard"`. Articles with only textbook or secondary sources do not qualify.

### Batch 001-002 Recommendation

First scenario batch: **10 articles maximum** from the "SHOULD RECEIVE SCENARIO" list in Section 4. Select from:
- Professional practice (contract, ethics, scope) — 3 articles
- Code application (fire zones, excavation, accessibility) — 4 articles
- Site/design decision (green building, circulation) — 3 articles

This pilot validates the workflow, the source-safety rules, and the compose/diff pipeline before scaling.

---

## Appendix A: Quick Reference — Eligibility Decision Flow

```
Is the article source-audited with at least one legal/code/professional standard source?
├── NO → Not eligible → Mark "scenario:ineligible:no_source"
└── YES
    └── Is the article primarily definitional, formulaic, or a catalog?
        ├── YES → Is there a "Common Exam Traps" or applied section?
        │   ├── YES → Edge case — consider for minimal scenario
        │   └── NO → Not eligible → Mark "scenario:ineligible:catalog"
        └── NO
            └── Does the topic connect to a recognizable professional decision?
                ├── NO → Not eligible → Mark "scenario:ineligible:no_decision_space"
                └── YES
                    └── Can a scenario be written without inventing unsupported facts?
                        ├── NO → Not eligible → Mark "scenario:ineligible:thin_sources"
                        └── YES → ELIGIBLE → Mark "scenario:eligible"
```

## Appendix B: Scenario Block in normalized.md — Example

```md
## Real World Scenario

**The Situation**
You are the architect for a 3-storey commercial building in a fire zone where the owner wants to add a 4th storey mezzanine. The existing building was constructed in 2005 and does not meet current fire-resistive construction requirements for new buildings in that zone. The owner argues that since the building has stood for 20 years, the addition should be permitted under the same standards.

**Your Task**
Under PD 1096 Rule V, what conditions, if any, would allow this addition?

**Analysis**
Section 506 of PD 1096 Rule V controls existing buildings in fire zones. The building cannot be enlarged unless it meets one of the exceptions: (a) the addition is separated by a fire wall meeting Section 506 requirements, or (b) the owner demolishes the nonconforming portion, or (c) the work is a repair after a fortuitous event not exceeding 20% of replacement cost. A mere desire to add space does not qualify. The mezzanine addition would require fire-wall separation or full compliance with current fire-zone requirements for the new portion.

**Key Takeaway for the LEA**
Do not assume an existing nonconforming building can be expanded just because it existed before the current rules. Section 506 limits alterations and additions to specific paths.
```
