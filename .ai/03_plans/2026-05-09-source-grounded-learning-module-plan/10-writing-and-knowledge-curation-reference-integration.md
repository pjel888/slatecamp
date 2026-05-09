# 10 — Writing and Knowledge-Curation Reference Integration

Integrated: `2026-05-09T05:43:49Z`

## Why these references matter

Philip supplied five writing and knowledge-curation references that strengthen the plan pack's weakest execution risk: producing text that is correct, useful, and recognizably human rather than generic AI output.

These references do not replace SlateCamp's source hierarchy. For legal/code truth, use `.ai/00_system/vitruvius-source-reference.md`, local `vitruvius-connection/001_Raw-Source-Layer/` PDFs, verified source packs, official sources, and SME review. The links below are process references for writing quality, voice control, pre-writing, and review discipline.

## Source notes from the supplied links

### Voxyz Quill Pack

URL: https://www.voxyz.ai/marketplace/quill

Useful patterns for SlateCamp:

- Keep a separate voice system: identity, voice/soul, agent rules, user-facing expectations, tool notes, memory, and handoff notes.
- Build from real voice samples and prior published examples, not imagined "human" style.
- Keep drafts off the record by default. Publishing needs an explicit toggle or approval.
- Use a banned-words file and self-review loop before release.
- Track post/article history so the system does not repeat the same angles.

SlateCamp adaptation:

- Create approved voice exemplars for each content family before scaled editing.
- Keep article/question rewrites draft-only until source, learning, voice, and roundtrip gates pass.
- Add a "voice calibration" section to worker briefs: sample article, words to avoid, rhythm standard, and examples of flat-to-alive rewrites.

### Research Paper Writing Skills

URL: https://github.com/Master-cai/Research-Paper-Writing-Skills

Useful patterns for SlateCamp:

- Clarify the story before sentence edits.
- One paragraph should carry one message.
- The first sentence should tell the reader what the paragraph does.
- Every major claim needs evidence or should be weakened/removed.
- Use reverse outlining after drafting.
- Review like a skeptical reviewer, not like the writer defending the draft.

SlateCamp adaptation:

- Before rewriting an article, build a mini-outline: exam task, concept, source-backed rule, trap, worked example, practice bridge.
- After rewriting, reverse-outline the article and delete sections that do not support the learning objective.
- Maintain a claim-evidence map for legal/code statements and high-risk conceptual claims.

### Anti-AI-Slop Writing

URL: https://github.com/jalaalrd/anti-ai-slop-writing

Useful patterns for SlateCamp:

- Ban generic AI words and structures: "delve," "tapestry," "landscape" as metaphor, "crucial," "pivotal," "it is important to note," "let's dive in," and generic conclusion language.
- Break default AI patterns: rule-of-three lists, identical paragraph structure, uniform sentence length, vague motivational phrasing, and overuse of em dashes.
- Prefer concrete specifics over polished generality.
- Never invent anecdotes, studies, numbers, or quotes. Mark hypotheticals clearly.

SlateCamp adaptation:

- Run every article through an anti-slop audit before publication.
- Replace generic openings with board-task framing.
- Keep specificity source-backed. If a detail is not sourced, either remove it or label it hypothetical.
- Vary prose rhythm without sacrificing legal precision.

### Stanford STORM research page

URL: https://storm-project.stanford.edu/research/storm/

Useful patterns for SlateCamp:

- Treat pre-writing as a separate stage from drafting.
- Discover multiple perspectives before writing.
- Ask perspective-specific questions to a source-grounded expert.
- Curate the gathered information into an outline before composing the article.
- Evaluate outline quality before prose quality.

SlateCamp adaptation:

For each article cluster, use perspective questions before drafting:

- Candidate perspective: What will the learner confuse on exam day?
- Board examiner perspective: What competency does the question really test?
- Practitioner perspective: What happens in drawings, permits, site conditions, contracts, or LGU review?
- Source auditor perspective: Which claims need exact locator evidence?
- Question writer perspective: Which distractors diagnose real misconceptions?

### Stanford STORM Discover / Co-STORM

URL: https://storm.genie.stanford.edu/discover

Observed access notes:

- The public page describes Co-STORM as a prototype for interactive knowledge curation.
- The page requires agreement to terms and then sign-in for deeper use.
- The terms warn that generated reports can make mistakes and that users must check important information.
- The site requests that users not include personally identifiable information in inputs.

SlateCamp adaptation:

- Do not paste private learner data, credentials, or unpublished proprietary content into external research tools.
- Treat generated reports as leads only. Legal/code content still needs primary-source verification.
- Use interactive curation as a model for local workflows: question-asking, source checks, outline evaluation, then drafting.

## Updated SlateCamp article workflow

0. Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md`; include that line at the top of the worker/content-production prompt.
1. Pull or verify the local Supabase mirror.
2. Build the source ledger from approved local/official sources, starting from `.ai/00_system/vitruvius-source-reference.md` and exact raw files under `vitruvius-connection/001_Raw-Source-Layer/`.
3. Run a STORM-style pre-writing pass: perspectives, questions, gathered evidence, outline.
4. Draft with a one-message-per-paragraph rule.
5. Reverse-outline the draft.
6. Create a claim-evidence map.
7. Run the anti-slop audit.
8. Align linked questions to objectives and source locators.
9. Compose, diff, validate, dry-run, independent review, then apply only if approved.

## Added acceptance checks

A publishable article/question cluster now needs:

- `.ai/CONTENT_EXCELLENCE_GOAL.md` acknowledgment pass;
- source ledger pass;
- outline quality pass before prose writing;
- reverse-outline pass after prose writing;
- anti-slop pass;
- voice exemplar comparison;
- claim-evidence map;
- question rationale map;
- platform roundtrip pass.

## What not to copy

Do not copy these external systems wholesale into SlateCamp content. Use their workflows, not their subject matter or marketing style. SlateCamp should still sound like a careful Philippine LEA board-review educator.
