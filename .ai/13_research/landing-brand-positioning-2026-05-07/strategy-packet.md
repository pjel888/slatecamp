# SlateCamp Landing Page and Brand Positioning Strategy Packet

**Date:** 2026-05-07
**Branch:** `feat/modal-standardization-kimi26`
**Primary audit cross-link:** `.ai/02_audits/2026-05-05-landing-page-audit.md`
**Research folder:** `.ai/13_research/landing-brand-positioning-2026-05-07/`
**Status:** Strategic research packet for landing-page and brand revision
**2026-05-07 brand-cue addendum:** `.ai/13_research/filipino-consumer-brand-positioning-2026-05-07/brand-cue-and-exam-buyer-psychology-report.md`
**2026-05-07 final messaging gate:** `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`

---

## 1. Executive Recommendation

SlateCamp should now use a broader umbrella position, but the final hero should be careful about country-origin cues:

> **A source-backed architecture learning platform for school, boards, and practice.**

Use “Philippine” as a scope/trust/SEO qualifier, not necessarily as the first emotional brand cue. The sharper working formula is:

> **Premium global-feeling product, built around Philippine codes, LEA readiness, and local architecture-study realities.**

LEA readiness remains the sharpest acquisition wedge, but it should not be the whole company identity. This reduces legal/brand risk, supports university partnerships, and lets SlateCamp serve architecture students, reviewees, apprentices, educators, and practicing architects without sounding like an official board-exam authority or a review-center replacement.

The landing page should make the offer clear through four pillars:

1. **Knowledge resources** — source-backed architecture articles, code explainers, visual guides, and field-guide pages.
2. **Quizzes** — diagnostics, drills, simulations, mistake repair, and readiness tracking.
3. **3D Lab** — interactive spatial/code examples where static diagrams are not enough.
4. **Free tools** — calculators and utilities such as paint, tile/flooring, drywall, CHB, lot/buildability, occupancy, egress, and other practical architecture tools.

Within that umbrella, the LEA promise remains:

> **Know where you stand, what you missed, and what to fix before exam day.**

The target user is not primarily buying a quizzing method. The target user is buying:

- assurance,
- comfort,
- trustworthy explanations,
- a clear next step,
- a way to know if review is working,
- practical references they can reuse beyond exam season,
- and relief from discovering weak topics too late.

SlateCamp should also make its ecosystem position explicit:

> **Review centers teach. SlateCamp helps measure, organize, visualize, and reinforce.**

This avoids an unnecessary fight with JPT, CDEP, TopLab, APR, and other review centers. SlateCamp should not present itself as the replacement review center. It should be the digital companion candidates open after lectures, after mock exams, during self-study, and in the last weeks before the LEA — while still being useful before and after the board exam.

Internal metaphor: **SlateCamp is the candidate’s architecture field guide / Pokédex** — a connected resource for topics, code provisions, explanations, weak spots, notes, 3D examples, calculators, and readiness status. Public wording should prefer **Architecture Field Guide**, **Code Atlas**, **Resource Center**, or **Readiness Companion** unless trademark/legal clearance is given for “Pokédex.”

---

## 2. Evidence Base

### 2.1 Internal product and landing-page sources

Reviewed directly or through delegated agent work:

- `.ai/02_audits/2026-05-05-landing-page-audit.md`
- `.codex/skills/slatecamp-ux-researcher/SKILL.md`
- `.codex/skills/slatecamp-gtm-strategy/SKILL.md`
- `.codex/skills/slatecamp-competitive-moat/SKILL.md`
- `.codex/skills/slatecamp-revenue-architecture/SKILL.md`
- `src/components/landing/LandingPageContent.tsx`
- `src/components/marketing/HeroSection.tsx`
- `src/components/marketing/HeroHeadline.tsx`
- `src/components/marketing/BentoFeatureGrid.tsx`
- `src/components/marketing/QuestionsSection.tsx`
- `src/components/marketing/ThreeDLabSection.tsx`
- `src/components/marketing/AnalyticsSection.tsx`
- `src/components/marketing/WikiSection.tsx`
- `src/components/marketing/HowItWorksSection.tsx`
- `src/components/marketing/ComparisonSection.tsx`
- `src/components/marketing/FinalCtaSection.tsx`

### 2.2 Competitor and market sources captured locally

Captured under:

- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_home.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_about.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_review_modes.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_code_library.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_qubi.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_register.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_faq.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/vizcode_blog.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/ddg_vizcode_search.md`
- `.ai/13_research/landing-brand-positioning-2026-05-07/sources/ddg_lea_review_centers.md`

### 2.3 Reddit/user sentiment sources

Captured under:

- `.ai/13_research/reddit-sentiment-landing-positioning-2026-05-07/reddit-sentiment-raw-extract.md`
- `.ai/13_research/reddit-sentiment-landing-positioning-2026-05-07/reddit-broader-resource-raw-extract.md`
- `.ai/13_research/reddit-sentiment-landing-positioning-2026-05-07/sentiment-and-platform-positioning-report.md`

Key sentiment findings:

- Review-center users care about organization, pacing, explanations, schedule fit, mock exams, recorded lectures, and emotional reassurance.
- Vizcode has some mindshare as a code-reference/verification tool, but users also compare it against abundant free resources.
- Architecture students, apprentices, and practitioners ask for broader reference help: books, code sources, setbacks, permit computations, professional boundaries, local standards, tools, and practical calculators.

### 2.4 Agent research inputs

Three read-only delegated workstreams completed:

1. Internal product and landing-copy audit.
2. Competitor research synthesis for Vizcode and review-center context.
3. Brand and landing-page conquest strategy memo.

OpenCode was attempted with DeepSeek routing. The local OpenCode run produced process trace output but did not produce a usable strategy memo file. CommandCode produced no usable memo. The completed delegated workstreams and local source captures were therefore used as the primary research basis.

---

## 3. Core Market Insight

The LEA candidate’s primary emotional problem is not lack of content. It is uncertainty.

They ask:

- Am I actually ready?
- Which subjects are pulling me down?
- Did today’s lecture stick?
- Did I understand the code or only memorize a number?
- If I fail, will it be because of a weakness I could have fixed earlier?
- What should I study tonight?
- Can I trust this answer?
- Am I behind everyone else?

Current landing copy is directionally strong, but too much of it still speaks like an educational SaaS product. It explains mechanisms before it resolves anxiety.

Examples of mechanism-first language to demote:

- SRS
- SM-2
- IRT
- EMA-weighted scoring
- adaptive quizzing
- active recall
- taxonomy heatmap
- mathematically optimal intervals

These concepts can stay in deeper product explanations, tooltips, documentation, or “how it works” sections. They should not carry the first-scroll conversion argument.

Translate mechanisms into user language:

- **IRT / difficulty-aware scoring:** “Your score accounts for question difficulty.”
- **SM-2 / spaced repetition:** “Weak topics come back before you forget them.”
- **taxonomy heatmap:** “A map of what is strong, weak, and next.”
- **adaptive quizzing:** “Practice adjusts to what you miss.”
- **active recall:** “Answer first, then repair the mistake.”
- **analytics:** “Know what to fix tonight.”

---

## 4. Target-Market Positioning

### 4.1 Primary user segments

#### Architecture students

They need reliable orientation, local references, study tools, and explanations that connect school topics to practice.

Their need:

- “Where do I find credible Philippine architecture resources?”
- “How do code rules connect to studio, thesis, and actual projects?”
- “What tools can help me check areas, materials, or basic standards?”

SlateCamp promise:

> **A source-backed architecture resource center for school, review, and practice.**

#### Review-center students

They already trust a primary review system: JPT, CDEP, TopLab, APR, school review groups, or another mentor-led pathway.

Their need:

- “After lecture, did I retain it?”
- “Which parts of the handout should I revisit?”
- “How do I turn this topic into board-style practice?”

SlateCamp promise:

> **Your review center teaches. SlateCamp shows what stuck.**

#### Self-reviewers

They need structure, source confidence, and a next-step path.

SlateCamp promise:

> **Your always-on LEA study buddy: practice, explanations, code references, and a clear next topic.**

#### Retakers

They need dignity, not shame. They may already carry fear and fatigue.

SlateCamp promise:

> **No shame. Just a clearer map of what pulled you down and what to fix next.**

#### Working candidates and returners

They have limited study windows and need time efficiency.

SlateCamp promise:

> **Know which 30 minutes will move your readiness tonight.**

#### Last-weeks crammers

They need risk visibility and simulation.

SlateCamp promise:

> **Find the weak topics before exam week finds them for you.**

#### Apprentices and junior professionals

They need quick, practical, educational references for local code concepts, permit computations, professional-practice topics, and site/studio questions — without SlateCamp pretending to replace a professional of record.

SlateCamp promise:

> **Keep common architecture references and calculators close, with source-backed explanations you can verify.**

#### Educators and universities

They need a platform that can support instruction without replacing faculty judgment, school syllabi, or review-center teaching.

SlateCamp promise:

> **A companion resource platform for classes, review groups, diagnostics, and interactive labs.**

### 4.2 The correct category

Public umbrella category:

> **Architecture Learning Platform**

Expanded SEO/about category:

> **Philippine Architecture Learning Resource Center**

Board-exam pathway category:

> **LEA Readiness Companion**

Supporting names:

- Architecture Resource Center
- Architecture Field Guide
- Code Atlas
- LEA Readiness Engine
- Study Compass
- Digital review buddy
- 3D Code Lab
- Practical Architecture Tools

Avoid leading with:

- quiz app,
- review center,
- LMS,
- wiki,
- flashcard app,
- analytics dashboard,
- “AI tutor” as the primary category.

---

## 5. Competitor Analysis: Vizcode

### 5.1 What Vizcode is claiming

Based on captured pages, Vizcode positions itself as a **visual learning platform for Philippine architectural codes**. Its FAQ states that it simplifies complex standards through diagrams, illustrated guides, and interactive learning tools, especially for ALE preparation.

Visible product surfaces include:

- Code Library.
- Visual diagrams.
- Isolation Mode.
- Comparative Mode.
- Game Mode.
- QUBI AI Chat / real-time voice chat surface.
- Blog/topnotcher content.
- Discord/community/event perks.
- Group and partner discount mechanics.

### 5.2 Vizcode’s strongest assets

Vizcode has serious credibility signals:

- Multiple ALE topnotcher testimonials.
- Team and advisor credibility tied to architects, engineers, and topnotchers.
- Student organization / UAPSA / UAPGA partner logos.
- Code-specific focus: PD 1096, RA 9514, BP 344, BP 220, PD 957, Philippine Green Building Code.
- Clear visual-learning value proposition.
- A free Code Library surface.
- Paid plans with simple duration-based pricing.

Pricing captured:

- 3-month plan: PHP 799.
- 6-month plan: PHP 999.
- 12-month plan: PHP 1499.

The captured FAQ states all review plans include Isolation Mode, Comparative Mode, and Game Mode.

### 5.3 Vizcode’s visible friction and gaps

Visible friction from captured FAQ/register pages:

- Account activation takes 1–3 business days after payment confirmation.
- One device at a time.
- Online-only study materials.
- No mobile app, browser-only.
- Higher-value review modes appear member-gated.
- QUBI is member-access positioned.

Strategic gaps SlateCamp can exploit:

- Vizcode appears strongest as visual code reference and code study.
- It does not visibly lead with a readiness-score thesis.
- It does not visibly own “what should I study next?” as strongly as SlateCamp can.
- It does not visibly connect question performance, source-backed mistake repair, 3D examples, notes, and readiness score into one loop.

### 5.4 How SlateCamp should compete

Do not attack Vizcode by name. Out-position it.

Competitive frame:

- Vizcode helps you **see and compare codes**.
- SlateCamp helps you **know if you are ready**.
- Vizcode is a visual code-learning platform.
- SlateCamp is a readiness companion where practice, code, explanations, 3D understanding, and next steps converge.

Strategic move:

> **Give away the reference layer; monetize the readiness loop.**

This directly supports the user’s statement: what Vizcode provides, SlateCamp should provide for free where strategically useful — but in 3D and interactive form.

---

## 6. Free Public Layer Strategy

SlateCamp should make the free layer generous enough to become the default acquisition surface for Philippine architecture learners, not only LEA candidates.

### 6.1 Free should include

- Public knowledge resources / architecture wiki.
- Public Code Atlas / Field Guide for legally usable source-backed explainers.
- Free practical calculators and tools.
- Free readiness diagnostic for board-review users.
- First Readiness Score reveal.
- Limited weak-topic map.
- Sample LEA-mapped questions.
- Sample source-backed explanations.
- Searchable major Philippine architecture codes where legally permissible and properly sourced.
- Free 3D examples for high-intent topics.
- Free comparison previews for common code confusion points.
- Sample timed drill or mini-game.
- No credit card required.

### 6.2 Four public pillars

The first two scrolls should make these pillars obvious:

1. **Knowledge resources:** articles, code explainers, visual guides, source-backed references.
2. **Quizzes:** diagnostics, drills, simulations, readiness tracking, mistake repair.
3. **3D Lab:** interactive code/spatial understanding.
4. **Free tools:** calculators and utilities for students, reviewees, apprentices, and practitioners.

### 6.3 Free Code Atlas / Field Guide focus

The free public field guide should cover high-demand code families:

- PD 1096, National Building Code of the Philippines.
- RA 9514, Fire Code of the Philippines.
- BP 344, Accessibility Law.
- BP 220, Economic and Socialized Housing.
- PD 957, Subdivision and Condominium Law.
- Philippine Green Building Code.

The point is not to duplicate a PDF library. The point is to make a connected study surface:

- provision,
- explanation,
- diagram,
- 3D example,
- related questions,
- common mistake,
- next drill.

### 6.4 3D and interactive conquest layer

Where Vizcode is diagram-first, SlateCamp should become interaction-first.

Example public hooks:

- “Don’t just read the ramp rule. Adjust the slope and see if it passes.”
- “Walk through egress distance instead of memorizing it cold.”
- “Rotate a stair, landing, parking bay, or firewall condition.”
- “Turn a code provision into a spatial check.”

Caution: only promise 3D where the page can visually prove it. If the current 3D Lab mockup still reads like a 2D plan, the landing copy must either show actual 3D proof or keep 3D as a secondary proof point.

---

## 7. Paid Strategy

Free should create the “I finally know where I stand” moment.

Paid should sell ongoing control.

### 7.1 Paid should include

- Live Readiness Score after each session.
- Full subject and topic heatmap.
- Weak-topic prioritization.
- Camp Trail guided schedule.
- Storm Mode / timed simulation.
- Full 3D Lab and advanced interactives.
- Unlimited source-backed question explanations.
- Notes and mistake-recovery workspace.
- Progress history.
- Final-weeks exam-season tools.
- Optional cohort/community features when ready.

### 7.2 Paid conversion line

> **Free shows the gap. Pro helps you close it.**

or:

> **Start free to see where you stand. Upgrade when you want SlateCamp to guide the next session every day.**

---

## 8. Landing Page Narrative Recommendation

The current landing page has the right ingredients but still feels too much like a feature catalog below the hero.

Recommended story sequence:

1. **Hero: Architecture resource center / learn, test, see, calculate.**
2. **Four-pillar clarity:** Knowledge Resources, Quizzes, 3D Lab, Free Tools.
3. **Audience bridge:** for architecture students, LEA reviewees, educators, apprentices, and practitioners.
4. **LEA pathway:** taking the boards? stop studying blind and get a free Readiness Score.
5. **Companion stance:** built to sit beside your review center or university instruction.
6. **Readiness loop:** answer → explanation → source/3D/Wiki → score update → next topic.
7. **Knowledge proof:** Code Atlas / Field Guide, source-backed articles, visual guides.
8. **3D proof:** only if visually proven.
9. **Free tools proof:** paint, tile/flooring, drywall, CHB, lot/buildability, occupancy/egress calculators.
10. **Free vs Pro:** free resources/tools to start; Pro to keep improving and track readiness deeply.
11. **Legal trust:** educational resource, not an official source or professional-of-record substitute.
12. **Final CTA:** get your free readiness score / open free tools / explore resources.

---

## 9. Hero and Copy Direction

### 9.1 Recommended hero headline options

Best umbrella direction:

> **Your architecture resource center.**

Best action-oriented direction:

> **Learn it. Test it. See it in 3D. Use it in practice.**

Best LEA pathway direction:

> **Stop studying blind.**

Best confidence direction:

> **Know where you stand before exam day.**

Existing bold direction, with caution:

> **Know you’ll win.**

If retaining `Know you’ll win.`, soften the subheadline to avoid overclaiming.

### 9.2 Recommended hero subheadline

Umbrella version:

> **Source-backed architecture resources, quizzes, 3D labs, and free tools for school, board review, and professional practice.**

LEA pathway version:

> **Taking the boards? Practice with LEA-mapped questions, learn from source-backed explanations, and see exactly what to fix before exam day.**

Companion version:

> **Built beside your school, review center, or self-study routine: learn the topic, test what stuck, and keep practical tools close.**

### 9.3 CTA language

Primary CTA:

> **Get Your Free Readiness Score**

Secondary CTAs:

- Explore Knowledge Resources.
- Open Free Tools.
- Try 10 Sample Questions.
- Start Your Free Diagnostic.
- Open the Free Code Atlas.
- See a 3D Code Example.
- Start Day 1 of Your Camp Trail.

### 9.4 Trust lines

- Educational architecture resources, not an official government source.
- Source-backed explanations with references to verify.
- Free tools for common student, review, and practice checks.
- Free to start. No credit card required.
- Built for architecture students, LEA reviewees, educators, apprentices, and practitioners.
- Use it beside any school, review center, or self-study routine.
- LEA-mapped practice and source-backed explanations.
- Know what to fix before exam day.
- Review-center friendly. Self-study friendly. Retaker friendly.
- No shame. Just a clearer next step.

---

## 10. Ethical Fear Marketing Rules

Fear marketing is appropriate only if it is honest, grounded, and immediately converted into control.

### 10.1 Allowed

- Name the fear: “I do not know if I am ready.”
- Name the risk: discovering weak topics too late.
- Normalize the experience: many candidates feel this.
- Offer a free first action: take a diagnostic.
- Frame weak scores as recoverable signals.
- Speak respectfully to retakers.
- Use verified pass-rate statistics only with visible sources.

### 10.2 Not allowed

- “Buy this or you will fail.”
- Shame-based retaker copy.
- Fake countdowns or invented urgency.
- Unsourced pass-rate claims.
- Guaranteed pass language.
- Public social comparison that humiliates users.
- Red panic UI for low readiness.
- Copy that implies review centers are obsolete.

### 10.3 Required emotional arc

Every fear-based message should follow this sequence:

1. **Name the fear:** You may not know if your review is working.
2. **Normalize it:** Many candidates feel this way.
3. **Give control:** Take a free diagnostic.
4. **Give next step:** Fix the weakest topic first.

Recommended line:

> **The danger is not having weak spots. It is discovering them too late.**

Resolution:

> **SlateCamp makes weak spots visible while there is still time to fix them.**

---

## 11. Review-Center Positioning

Do not frame review centers as “old” or obsolete.

Review centers own:

- lecture structure,
- human mentorship,
- batch accountability,
- topnotcher credibility,
- schedules,
- community trust.

SlateCamp owns:

- daily readiness measurement,
- weak-topic diagnosis,
- source-backed mistake recovery,
- interactive 3D/code understanding,
- next-session planning,
- between-class reinforcement.

Use this comparison:

> **Review centers teach. SlateCamp measures.**

More detailed version:

> **Keep your review center, handouts, mentors, and batchmates. SlateCamp helps you test what stuck, recover from mistakes, and decide what to review next.**

Use cases:

- After lecture: test retention.
- After mock exam: identify weak topics.
- Before exam week: simulate and reduce risk.
- During self-study: use the Code Atlas and 3D examples.

---

## 12. Copy Bank

### 12.1 Headlines

- Stop studying blind.
- Know where you stand before exam day.
- Your LEA review companion.
- Turn LEA anxiety into a plan.
- The scary part is not studying. It is not knowing if it is working.
- Every answer becomes a signal.
- Not a grade. A GPS.
- Every wrong answer leads back to the source.
- The LEA field guide should be free.
- Review centers teach. SlateCamp measures.
- Free to check where you stand. Pro to keep improving.
- Built for the days between review-center lectures.

### 12.2 Subheadlines

- Practice with LEA-mapped questions, learn from source-backed explanations, and see exactly what to fix before exam day.
- SlateCamp turns every practice session into a readiness signal, so you know what to review next.
- Built beside your review center: test what stuck, find weak topics, and follow a clear path to exam day.
- Your lectures teach the material. SlateCamp shows what you retained.
- The free Code Atlas helps you understand the rule. SlateCamp Pro helps you prove readiness under exam pressure.

### 12.3 CTA labels

- Get Your Free Readiness Score.
- Start Your Free Diagnostic.
- Try 10 Sample Questions.
- Open the Free Code Atlas.
- See a 3D Code Example.
- Start Day 1 of Your Camp Trail.
- Upgrade to Track Readiness.
- Run a Proof Simulation.
- Continue My Review Plan.

### 12.4 Review-center copy

- Keep your review center. Add a readiness map.
- Your review center gives the lecture. SlateCamp gives the feedback loop.
- After class, find out what stuck.
- After mock exams, find the exact topics pulling you down.
- Before exam week, stop guessing and simulate.

### 12.5 Competitor-safe conquest copy

- Code references should be searchable, visual, and free.
- Do not just read the provision — see it, test it, and track whether you remember it.
- Static code review tells you what the rule says. SlateCamp shows whether you can use it under exam pressure.
- The free field guide helps you understand the code. Pro helps you prove readiness.

---

## 13. Claims That Need Verification Before Public Use

Verify or soften these before shipping:

- Any exact question count such as “2,400+ questions.”
- “Every question” language.
- “Verified by licensed architects.”
- “Exact provision” for all explanations.
- PRC/pass-rate statistics such as “1 in 3.”
- “A score that never lies.”
- “IRT-powered” or “EMA-weighted” if not fully implemented and defensible.
- “3D” claims unless the visual proof is unmistakably 3D.
- Any implication that SlateCamp guarantees passing.

Safer default:

- “LEA-mapped practice.”
- “Source-backed explanations.”
- “Difficulty-aware scoring.”
- “A clearer signal of where you stand.”
- “Designed to help you focus your next review session.”

---

## 14. Implementation Acceptance Criteria

A landing-page revision should pass these checks:

1. A first-time visitor can explain SlateCamp within 10 seconds as a **premium architecture learning platform** with Philippine-code/LEA relevance evident in the proof and trust language.
2. The first two scrolls clearly show the four pillars: Knowledge Resources, Quizzes, 3D Lab, and Free Tools.
3. LEA readiness is framed as the strongest pathway, not the whole product identity.
4. The first two scrolls communicate anxiety relief, companion stance, Readiness Score, and a free first step for board-review users.
5. The page clearly says SlateCamp works **beside schools and review centers**, not instead of them.
6. `Get Your Free Readiness Score` remains the primary recurring LEA CTA, while `Explore Knowledge Resources` and `Open Free Tools` support broader audiences.
7. Readiness Score is the central LEA promise, not a generic site-wide promise.
8. Questions, explanations, Wiki/Code Atlas, 3D, and analytics are shown as one learning loop.
9. Free vs paid is explicit and scannable.
10. The public Code Atlas / Field Guide is positioned as a strategic free asset.
11. Free tools are visible and named: paint, tile/flooring, drywall, CHB, lot/buildability, occupancy/egress where currently available.
12. 3D is only promised where the page visually proves it.
13. Technical terms are translated into user benefits or moved below the fold.
14. Numeric, authority, source, partnership, and legal/professional-practice claims are verified or softened.
15. The review-center comparison is respectful and complementary.
16. Fear-based copy uses calm urgency, not shame.
17. Mobile order tells the umbrella offer before feature depth.
18. Hero contrast, reduced motion, CTA visibility, and small-text legibility pass QA.

---

## 15. Bottom Line

SlateCamp should not win by being louder than review centers, becoming a generic quiz bank, or tying its whole identity too tightly to one exam.

SlateCamp should win by becoming the trusted Philippine architecture resource a user opens when they ask:

> **Where do I learn this, how do I test myself, how do I see it, and what tool can help me check it?**

For board-review users, the sharper question remains:

> **Am I ready, and what should I do next?**

The strategic formula:

- Use LEA readiness as the high-intent wedge.
- Build the umbrella brand around architecture knowledge resources, quizzes, 3D Lab, and free tools.
- Give away enough reference/code/3D/tools value to win trust.
- Make the free diagnostic create the first “I know where I stand” moment.
- Convert users into Pro by helping them close the gap every day.
- Respect schools and review centers as the teaching layer.
- Own source-backed organization, interactive understanding, readiness measurement, and next-step guidance as the SlateCamp layer.
