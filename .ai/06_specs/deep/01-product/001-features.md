# Platform Features

**Analysis Date:** 2026-04-06

## Overview

SlateCamp is a cognitive-first, personalized ALE (Architectural Licensure Examination) review platform for Philippine architects. The platform combines adaptive quiz flows, an expert-linked wiki, analytics, admin tooling, and interactive 3D learning modules under a shared Next.js codebase.

## Core Feature Areas

### Assessment Engine

The platform's primary learning surface. 7 distinct testing modes adapt to different study contexts:

| Mode | Purpose | Key Behavior |
|------|---------|--------------|
| **Camp** | Adaptive practice | Personalized question selection using IRT theta estimates |
| **Storm** | Rapid recall | Timed with timer bar, fast-paced |
| **Chill** | Relaxed review | Untimed, low-pressure practice |
| **Custom** | User-defined sessions | Configurable parameters (timer, difficulty, subject) |
| **Focus Review** | Targeted weak areas | Selects from 3 weakest taxonomy nodes + unexplored grey nodes |
| **Simulation** | Full exam simulation | Timed, proctored conditions, cold delivery results |
| **Endurance** | Extended practice | Multiple sessions back-to-back |

### Readiness Score

Real-time mastery metric computed using IRT 2-parameter logistic model:

```
P(correct | θ) = 1 / (1 + exp(-a * (θ - b)))
```

6 anti-inflation vectors prevent score inflation:
1. Diminishing returns on consecutive correct streaks
2. Difficulty ceiling (capped until Level 3/4 questions answered)
3. Grey node penalty (unvisited taxonomy nodes drag score down)
4. Bloom's cognitive level ceiling (recall-only practice capped)
5. Question bank depth weight (thin coverage reduces contribution)
6. Recency decay (stale mastery counts less)

**Source:** `src/lib/readiness-score.ts` (330 lines, pure function)

### Wiki Knowledge Base

Expert-linked articles covering all ALE subjects. Key behaviors:
- Every claim links to verified expert sources
- Article metadata: ALE tests, difficulty label, Bloom level, PRC area
- Taxonomy-driven organization (discipline → subject → topic tree)
- MDX rendering with callouts, tables, and embedded widgets

**Source:** `src/components/wiki/`, `src/lib/wiki-markdown.ts`

### Notes System

Contextually anchored note-taking:
- TipTap JSONB storage for rich content
- Note types: standard, quick capture, Cornell, gap analysis
- Anchored to: topic, question, session, article
- Syncs to Supabase with debouncing

**Source:** `src/components/notes/`, `src/lib/notes/`

### Analytics Dashboard

Student-facing performance tracking:
- Readiness trajectory over time
- Memory health (SRS curve)
- Pacing quadrant (coverage vs. accuracy)
- Stamina curves (session timing)
- Timeline heatmap (activity by date)

**Source:** `src/components/analytics/`, `src/app/dashboard/analytics/`

### Camp Trails

Structured study paths through the ALE curriculum:
- Trail types: time-gated, subject mastery, code deep dive, remediation, exam simulation
- Daily step breakdown: wiki read, quiz, 3D lab, review
- Enrollment tracking with pace status
- Phase transitions with subject focus shifts

**Source:** `src/components/trails/`, `src/lib/queries/trails.ts`

### 3D Lab

Spatial visualization for building code and architectural concepts:
- Module gallery with pre-built 3D scenes
- Compliance violation detection
- Hotspot annotations on geometry
- Exploded assembly views
- Floor plan walkthroughs
- Cutaway cross-sections
- 60 FPS target using React Three Fiber

**Source:** `src/features/3d-lab/`, `src/app/dashboard/3d-lab/`, `src/components/3d/`, `src/components/3d-lab/`

## Supporting Features

### Spaced Repetition System (SRS)

SM-2 algorithm with IRT-backed scheduling:
- Ease floor at 1.3
- Review queue prioritized by next_review_at
- Retention curves computed from user history

**Source:** `src/lib/srs/` (7 files)

### AI Contextual Tutor

Anthropic API integration:
- Temperature 0.0 (deterministic, no hallucination)
- Mandatory citation badges linking to exact Wiki paragraphs
- Structured rationales: Misconception vs. Principle
- Citation: misconceptions first, then principles

**Source:** `src/lib/ai/`

### Admin Knowledge Hub

Unified content management:
- Questions and wiki articles in one interface
- Taxonomy-driven browser
- SME review workflow: draft → review → approved → published
- Audit logging for all changes
- 3D asset management

**Source:** `src/app/admin/knowledge/`

### CEO Dashboard

Business intelligence:
- MRR/ARR from `mv_financial_summary`
- Revenue vs. expense charts (Recharts)
- Runway gauge with status tiers
- Cohort retention grid
- Churn risk by segment
- Time-to-value funnel
- Team management

**Source:** `src/components/ceo/`, `src/lib/queries/ceo/`

### Developer Portal

Internal engineering tools:
- Design system catalog with live component previews
- API reference documentation
- Architecture overview
- System status monitoring (database, infrastructure)
- Dev tools: console, DB inspector, logs, test data generation

**Source:** `src/app/developer/`

## Feature Flags & Tier Gating

| Tier | Access |
|------|--------|
| free | Wiki articles (free), limited quiz, basic analytics |
| camp | Full wiki, all 7 quiz modes, trails, 3D lab |
| insurance | Camp + priority support |
| institutional | Bulk access, team management |

**Source:** `src/lib/paywall/`, `src/lib/admin/feature-flags.ts`

## Prohibited Patterns

- **No generic gamification:** Zero confetti, badges, virtual currency, empty streaks
- **No generic AI:** Temperature 0.0, citation required
- **No ad-hoc mastery:** All calculations via `srs/irt.ts`

---

*Feature analysis: 2026-04-06*
