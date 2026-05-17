I'll analyze the landing page plans and current implementation to provide a comprehensive reviewBased on my analysis of the plans vs current implementation, here's my review:

---

## 1. Highest-Impact Changes

| Priority | Change | Impact |
|----------|--------|--------|
| **P0** | Rewrite hero headline: "Know you'll win" → "Your architecture study companion." | Fixes core positioning |
| **P0** | Replace all "LEA" with "Licensure Examination for Architects" in public copy | Legal/compliance requirement |
| **P0** | Build interactive 3D setbacks diagram (Rule VIII 750mm eaves/canopies) | Visual proof of premium positioning |
| **P0** | Rewrite ComparisonSection from competitive ("old way vs better way") to companion stance | Critical messaging violation |
| **P1** | Remove banned first-scroll jargon: "Active Recall", "IRT-Calibrated", "EMA-Weighted", "SM-2", "Taxonomy heatmap" | Violates messaging gate |
| **P1** | Add secondary CTA "Explore Free Tools" + local trust line | Missing conversion path |
| **P1** | Update SEO metadata in `page.tsx` | Search/discovery impact |
| **P2** | Reframe "Wiki" → "Knowledge Resources", "Question Bank" → "Quizzes" | Aligns with companion voice |

---

## 2. Implementation Sequence

**Phase 1: Copy Fixes (1-2 days)**
1. `page.tsx` — Update title, description, OG tags to use full exam name
2. `HeroHeadline.tsx` — New headline, subheadline, eyebrow copy
3. `HeroSection.tsx` — Add local trust line, secondary CTA
4. `BentoFeatureGrid.tsx` — Remove banned jargon, restructure to four pillars
5. `ComparisonSection.tsx` — Rewrite to companion stance
6. `QuestionsSection.tsx` — Remove "LEA", reframe around diagnostics/drills

**Phase 2: 3D Hero Visual (3-5 days)**
1. Create `src/components/marketing/hero/HeroCodeEnvelope.tsx` (container)
2. Create `HeroCodeEnvelopeCanvas.tsx` (R3F canvas)
3. Create `HeroCodeEnvelopeScene.tsx` (3D scene with setbacks visualization)
4. Create `HeroCodeEnvelopeFallback.tsx` (SVG fallback for mobile/no-WebGL)
5. Wire interactive controls: compliant/too-close toggle, eaves/setbacks layers, isometric/plan view
6. Integrate into `HeroSection.tsx` replacing static background image

**Phase 3: Missing Sections (2-3 days)**
1. Create `FreeToolsSection.tsx` (fourth pillar)
2. Create `LEAPathwaySection.tsx` (explicit board-prep pathway)
3. Create `CompanionProofSection.tsx` (review-center companion positioning)

---

## 3. Pitfalls

| Risk | Mitigation |
|------|------------|
| **3D diagram delays launch** — R3F implementation is complex | Ship static SVG fallback first, enhance to 3D in follow-up |
| **"LEA" in URLs/internal routes** — Plan only covers public copy | Keep internal abbreviations, audit user-facing strings only |
| **Breaking existing analytics** — Headline/CTA changes affect conversion tracking | Coordinate with growth team, set up A/B test framework |
| **Review center partnerships** — Competitive language may alienate partners | Companion stance is contractual requirement, not optional |
| **University adoption** — "Active Recall" jargon scares educators | Remove from above-fold immediately |

---

## 4. Acceptance Criteria

From the plan's Section 13, implementation passes when ALL are true:

- [ ] Hero uses "Your architecture study companion" or documented A/B variant
- [ ] First two scrolls show interactive proof + four pillars (Knowledge, Quizzes, 3D Lab, Free Tools)
- [ ] Philippine specificity appears as proof/trust, not first emotional cue
- [ ] "Licensure Examination for Architects" spelled out everywhere, no "LEA" in public copy
- [ ] NOT positioned as review-center replacement
- [ ] First-scroll avoids SRS/IRT/EMA/active-recall jargon
- [ ] Primary CTA: "Get Your Free Readiness Score"
- [ ] Secondary CTA: "Explore Free Tools" (or documented variant)
- [ ] Free-resource CTAs honest about signup gating
- [ ] Comparison section uses companion stance, not competitive

**Current score: 3/15 criteria met**

---

**Bottom line:** The implementation reflects pre-gate messaging. It needs significant copy changes and the 3D hero visual to align with the approved "premium architecture study companion" positioning.
