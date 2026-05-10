# SlateCamp Learning Material Depth Protocol

> Standing protocol for turning SlateCamp articles and linked questions into fruitful, digestible, source-heavy learning materials.
> Version: 1.0 | Owner: Philip / SlateCamp Founder | Status: active protocol

---

## Purpose

The content-audit roundtrip protocol controls how edits move safely from Supabase to local files and back. This protocol controls what quality the learning material must reach before it is allowed to move forward.

A candidate is not publishable merely because it is clean, short, and free of governance notes. It must teach enough law, code, numbers, technical terms, exceptions, and application logic for a Philippine LEA learner to actually improve.

The standard is: accurate, contentful, digestible, exam-relevant, and source-grounded.

---

## Prompt preamble

Every SlateCamp article/question writing prompt must begin with:

> Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` and `.ai/00_system/slatecamp-learning-material-depth-protocol.md` before producing any content artifact.

If the prompt involves legal/code/source claims, it must also name the exact raw source files to be used from `vitruvius-connection/001_Raw-Source-Layer/` or the approved source pack.

---

## Publishability rule

A learner-facing article/question cluster can move to target mapping or Supabase dry-run only if it passes all six gates. For legal/code content, the source truth gate is a hard release blocker: section numbers, section titles, values, tables, exceptions, and linked-question rationales must be checked against raw primary sources before upload. If the raw source has not been opened and cited in the evidence log, the item is not improved.

A learner-facing article/question cluster can move to target mapping or Supabase dry-run only if it passes all six gates:

1. Source truth gate: every legal, dimensional, procedural, numeric, date, scope, exception, and definition claim is traceable to an approved primary source or explicitly marked as needing verification.
2. Depth gate: the article contains enough substance to teach the topic, not just summarize it.
3. Digestibility gate: the material is structured so a tired board candidate can study it without decoding dense legal prose.
4. Real-world application gate: standard technical, legal, dimensional, and professional-practice articles include a Philippine-context scenario that teaches application, not decoration.
5. Data-presentation gate: data-heavy articles use a table, comparison table, or tabbed table whenever verified values are numerous enough to make prose less learnable.
6. Assessment bridge gate: linked questions test what the article actually teaches, and rationales teach the misconception behind each option.

If any gate fails, the artifact is not release-ready.

---

## Minimum article substance by topic type

These are not decorative word-count targets. They are safeguards against thin content.

### Legal, code, dimensional, or professional-practice articles

Expected depth: normally 1,200 to 2,500 words, unless the topic is truly atomic.

Required content:

- Governing source and version.
- Exact Rule, Section, Table, Item, Appendix, or IRR locator.
- All important numbers, dimensions, years, time periods, penalties, percentages, formulas, and thresholds.
- Scope of application: when the rule applies and when it does not.
- At least one worked application scenario.
- At least one common exam or practice trap.
- Source-backed explanation of why the number or rule matters.
- Learner-facing citations without local filesystem paths.

A legal/code article under 900 words is automatically a depth-risk item unless the reviewer records a specific exception.

### Data-heavy articles

Required content:

- A scannable number list or comparison table.
- A table or tabbed table component whenever the topic has enough verified values to compare meaningfully.
- Units and conditions for every value.
- Distinction between minimum, maximum, typical, permitted, prohibited, and exception values.
- Formula or decision rule where relevant.
- One sample computation or plan-reading scenario.
- Common mistakes involving units, scope, or wrong table selection.

### Conceptual, history, theory, planning, or design articles

Required content:

- Clear definition and context.
- Key names, dates, periods, examples, movements, theories, or planning standards as applicable.
- Why the concept appears in the LEA.
- What students confuse it with.
- At least one Philippine or architecture-specific example when available.
- Memory anchors, not generic mnemonics.

### Overview or mastery articles

Required content:

- Study sequence.
- Topic map.
- Common traps.
- Cross-subject links.
- What to master first.
- What to postpone until prerequisites are clear.

Overview articles must guide study. They should not pretend to teach every subtopic in full.

---

## Required article structure

A publishable standard article should normally include these sections, adjusted to fit the topic:

1. Learning goal: a measurable ability, not a generic promise.
2. Why this matters on the LEA: what the board candidate must recognize or calculate.
3. Governing source: law/code/version in learner language.
4. Rule breakdown: exact provisions, definitions, thresholds, exceptions, and conditions.
5. Numbers that matter: dimensions, formulas, dates, penalties, occupancy values, percentages, or table values.
6. Data presentation: a table, comparison table, or tabbed table when the topic has enough verified values to compare.
7. How to apply it: step-by-step decision rule or plan-reading workflow.
8. Real-World Application: one realistic Philippine architecture scenario.
9. Common traps: wrong code, wrong section, wrong unit, wrong scope, outdated IRR, copied rule from another occupancy, or common distractor logic.
10. Quick checks: recall and application prompts inside the article.
11. Linked-question bridge: what the learner should now be able to answer.
12. Sources: learner-facing citation list using document, year/version, rule/section/table/item.

Not every article needs the same heading names, but every article must deliver the functions above unless explicitly waived.

---

## Source and citation rules

### Learner-facing citation format

Use this style in article prose and rationales:

```text
Source: BP 344 2024 Revised IRR, Section 6, Toilets and Baths, WC compartment requirements.
Source: PD 1096 2004 Revised IRR, Rule VII, Section 704.1(a), Group C occupancy classification.
Source: RA 9514 2019 Revised IRR, Rule [rule number], Section [section number], [specific provision].
```

Do not show local filesystem paths, SHA256 hashes, claim-ledger filenames, or internal release notes in learner-facing material.

### Internal source ledger requirements

Internal ledgers may and should include:

- raw source path;
- source SHA256;
- page number or extraction locator;
- exact quoted evidence;
- claim class;
- extraction status;
- SME status;
- release boundary.

These belong in source ledgers, review packets, metadata, or reports, not in `candidate.md` learner prose.

---

## Claim and number density expectations

For legal/code/data-heavy articles, the draft must include enough source-backed technical content to be useful. Use these audit signals:

- At least 8 source-backed claims for a normal article.
- At least 12 source-backed claims for broad law/code topics.
- Every number has units and a governing context.
- Every table value says what condition activates it.
- Every exception says what it modifies.
- Every procedural step says who acts, when it happens, and what document or rule controls it.

A low word count is not the only problem. A long article with few verified claims is also weak.

---

## Digestibility rules

Contentful does not mean bloated.

- One paragraph, one message.
- Two to four sentences per paragraph in normal prose.
- Use bullets for enumerations, conditions, or code requirements.
- Use a short decision sequence when the learner must choose between rules.
- Define technical terms before asking the learner to use them.
- Explain legal words in practical architecture language.
- Use worked examples to make dense rules usable.
- Use components only when they teach. Do not decorate.

Preferred explanation pattern:

1. State the rule.
2. Name the source.
3. Explain the condition that activates it.
4. Show how it appears in a drawing, permit, building type, room, route, or exam question.
5. Warn about the common wrong answer.

---

## Required learning devices

Every publishable standard article should include at least three of these, and legal/code articles should normally include four or more:

- Rule checklist.
- Real-World Application scenario.
- Worked example.
- Plan-reading or scenario prompt.
- Numbers that matter list.
- Common traps section.
- Why this number matters explanation.
- Apply-it sequence.
- Inline quick check.
- Distractor warning.
- Comparison between similar laws, rules, occupancies, or code families.
- Table, comparison table, or tabbed table when verified values can be compared.

The goal is not more widgets. The goal is more usable understanding.

### Real-World Application section

Use a `## Real-World Application` or `### Real-World Application` section in every standard legal, dimensional, technical, and professional-practice article unless a reviewer records a specific waiver.

Minimum requirements:

- At least 150 words. This counts toward the 900-word legal/code article floor.
- Philippine setting: name a plausible city/province, climate/site condition, LGU review context, building type, or professional setting.
- Clear stakeholders: architect, client, LGU/OBO, fire authority, accessibility user, contractor, developer, school, hospital, transport operator, or community as relevant.
- Technical action: show what the architect checks, calculates, revises, coordinates, rejects, or documents.
- Source discipline: any legal, dimensional, procedural, or numeric claim inside the scenario must be sourced or flagged for verification.
- Narrative format: write it as a compact practice story, not as generic bullets.
- Hypothetical honesty: unless the event is from a verified source, frame it as `Suppose`, `Imagine`, or `In a typical project review` rather than as a real historical event.

Anti-duplication guardrails:

- Give each scenario a fingerprint before writing: location + building type + stakeholder + governing issue + plan condition + outcome.
- Do not reuse the same fingerprint within a batch.
- Rotate building types across a batch: school, clinic, mixed-use, barangay hall, transport terminal, small office, residential, market, worship building, heritage site, industrial shell, and public park.
- Rotate stakeholders across a batch: OBO plan examiner, BFP reviewer, accessibility user, client/developer, contractor, facilities manager, foreign consultant, community user, and board examinee.
- Rotate practice action across a batch: compute, classify, compare, redesign, annotate, reject, coordinate, document, inspect, and explain to a client.
- Avoid the default examples unless the topic demands them: generic mall, generic hospital, generic Quezon City project, and generic permit delay.
- If two scenarios begin to feel interchangeable, rewrite the later one with a different setting, conflict, stakeholder pressure, and decision outcome.

### Tables and tabbed data presentation

Use tables when they make the learner faster and more accurate. Do not add a table just to decorate the article.

Add a table when at least one condition is true:

- The article has three or more verified numbers, dimensions, years, percentages, penalties, formula inputs, scope categories, or threshold values.
- Learners must compare minimum versus maximum, front versus back, before versus after, allowed versus prohibited, baseline versus exception, or one regulation against another.
- The topic includes recurring board traps caused by reading the wrong row, wrong column, wrong unit, wrong condition, or wrong code family.
- A prose paragraph is doing the work of a matrix.

Table guardrails:

- Every value must have units and a condition.
- Every legal/code value must have a source locator in the article source ledger.
- Prefer one narrow table over one overloaded table.
- Do not mix verified and unverified values in the same row without marking the unverified cell.
- Do not use a table when the article has only one or two values, or when the comparison is too obvious to teach.
- For two or more related comparisons, use the `WikiTableTabs` MDX component so learners can switch between regulations, conditions, or design cases.
- For one compact source-backed table, use the existing wiki table pattern or `WikiExamTable` when source columns are needed.

Roundtrip-safe `WikiTableTabs` pattern:

Use a JSON-string prop for `tables`. Do **not** use a JavaScript array expression like `tables={[...]}` in article MDX; the live `next-mdx-remote/rsc` path does not reliably pass complex expression props from Supabase content. The component decodes this string through `parseMdxProp()`.

```mdx
<WikiTableTabs
  caption="Numbers that matter"
  tables='[{"id":"bp344-ramp","title":"BP 344 ramp checks","content":"| Check | Value | Condition | Common trap |\n|---|---|---|---|\n| Ramp slope | 1:12 | Normal accessible ramp | Treating steeper slopes as the default |\n| Landing | Source-backed value | Use the exact source condition | Forgetting landings between runs |"},{"id":"pd1096-area","title":"PD 1096 area checks","content":"| Metric | Meaning | Use |\n|---|---|---|\n| TLA | Total lot area | Starting value for site controls |\n| AMBF | Allowable maximum building footprint | Compare against proposed footprint |"}]'
/>
```

After adding or editing `WikiTableTabs`, rendered browser QA must verify: caption present, tabs present, `role="table"` present, expected table text present, and native `<table>` count is 0.

---

## Linked-question protocol

Questions are not separate from the article. They are proof that the article teaches the tested competency.

For every linked question that is edited or created:

1. Use learner-friendly wording: question prompt, question text, or problem statement. Do not use the learner-facing term `stem`.
2. Verify the correct answer against the same source locator used by the article.
3. Make every distractor plausibly wrong because it reflects a real misconception.
4. Keep answer choices parallel in length and grammar.
5. Explain the correct answer and the wrong options.
6. Include a takeaway that the learner can remember under time pressure.
7. Include the source locator at subsection, item, table, or rule level when the question depends on a legal/code detail.
8. Use `question-edits/<question_id>.json` for proposed changes. Do not edit `linked-questions.json` as the publish path.

A question with a thin rationale is not release-ready even if the answer key is correct.

---

## Anti-thin-content blockers

Block target mapping and Supabase learner-facing apply if any of these appear:

- Legal/code article under 900 words with no recorded atomic-topic exception.
- No exact legal source locator for numeric or dimensional claims.
- Bare section citation when a subsection/item/table is required.
- Article says a topic is important but does not teach the rule.
- Candidate contains internal governance text, local paths, source-pack filenames, hashes, claim-ledger notes, or release-status notes.
- Candidate has fewer than three meaningful technical sections after the intro.
- No worked example or Real-World Application section for a technical/legal article.
- Real-World Application section under 150 words without a recorded waiver.
- Scenario reads like a generic filler example rather than a Philippine architecture decision.
- Scenario duplicates the same location, building type, stakeholder, governing issue, and outcome pattern as another article in the same batch.
- Data-heavy article has three or more comparable verified values but no table, comparison table, or recorded table waiver.
- Table contains values without units, governing condition, or source-ledger support.
- Linked questions do not cite the exact source locator for legal/code answers.
- Rationale only says the answer is correct without teaching why distractors fail.
- Learner-facing text uses internal exam-writer jargon such as `stem`.

---

## Roundtrip integration

This protocol sits inside the existing Supabase local mirror workflow:

1. Pull article/question bundles from Supabase into `.ai/content-audit-export/articles/`.
2. Edit article prose only in `normalized.md`.
3. Store question changes in `question-edits/<question_id>.json`.
4. Keep internal source details in sidecar files, reports, ledgers, and metadata.
5. Generate `candidate.md` through compose.
6. Run diff, validation, and dry-run push.
7. Run the learning-depth review before target mapping.
8. Apply only after clean technical validation and human release approval.

The depth protocol does not replace roundtrip safety. It adds a quality gate before publication.

---

## Review checklist

Before a candidate can be called release-ready, record yes/no evidence for:

- Exact source version identified.
- Exact section/table/item locators included.
- All numbers verified.
- Sufficient technical depth for the topic.
- Worked example included.
- Common traps included.
- Quick checks or practice bridge included.
- Linked questions aligned to the article.
- Rationales teach both correct and wrong options.
- No learner-visible local paths or governance text.
- No learner-facing `stem` terminology.
- Candidate generated, not hand-written.
- Dry-run and validation results recorded.

If the dry run feels short, shallow, or not useful enough for a learner, it fails the depth gate even when the mechanics pass.
