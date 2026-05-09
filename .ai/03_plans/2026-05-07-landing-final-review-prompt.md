# Landing Page Final Read-Only Review Prompt

You are reviewing the current uncommitted SlateCamp landing page changes in `/Users/philiplewis/slatecamp`.

Do **not** modify files. Read only.

## Product positioning gate
- SlateCamp is a supplementary architecture study companion, not a primary review center.
- It should feel like a reliable field guide / reviewer buddy / study Pokedex concept, but avoid the literal "Pokedex" word in user-facing public copy unless clearly desired later.
- Target users care about assurance, comfort, knowledge, reliability, and knowing what to fix next.
- Avoid selling mechanisms like SRS, active recall, IRT, SM-2, EMA, or quizzing-method jargon.
- Fear marketing is allowed only as controlled clarity: weak spots are dangerous if discovered too late. No shame, no pass guarantees.
- Free resources may be dashboard-gated; copy must be honest: free after signup where needed, no credit card required.
- Legal-safe: no promise of passing, no PRC/PRBoA official-source implication, no board-result prediction.
- Public copy should use "Licensure Examination for Architects" rather than "LEA".

## Implementation intent
- Hero should make SlateCamp the best representation of the app: resources + quizzes + 3D lab + free tools.
- Hero proof is an interactive Code Envelope Explorer with setback/eave controls.
- Section order should be: Hero → SocialProof → four-pillar Bento → Questions → 3D Lab → Analytics/Readiness → Wiki → How It Works → Companion/Comparison → Final CTA → Footer.
- ScrollReveal should never leave blank content; content must remain visible before animation.

## Review dimensions
1. High-priority correctness bugs, accessibility issues, invalid anchors, hydration/runtime problems.
2. Copy/positioning misses against the gate above.
3. Legal/source-risk copy.
4. Visual/readability concerns visible from code structure.
5. Test/build risks.

Return a concise memo with:
- Verdict: pass / conditional pass / fail
- High issues
- Medium issues
- Low/optional polish
- Exact file paths and line numbers where possible
- Do not include raw logs.
