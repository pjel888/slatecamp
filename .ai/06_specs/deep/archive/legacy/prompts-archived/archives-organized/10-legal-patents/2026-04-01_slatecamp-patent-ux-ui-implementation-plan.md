# SlateCamp Patent UX/UI Implementation Plan
## Behavioral Signal Capture & Cognitive State Inference System

**Document Type:** UX/UI Implementation Plan & Design Guide
**Patent Reference:** IPOPHL Filing — Behavioral Signal Capture and Cognitive State Inference System for Secure Digital Assessments
**Date:** April 2026
**Stack:** Next.js 14 · React 18 · React Three Fiber · Zustand · Supabase · Framer Motion

---

## Executive Summary

This document translates every patentable element of SlateCamp's Behavioral Signal Capture patent into concrete UX/UI implementation specifications — from the submission gesture a student touches, to the cognitive state indicators an administrator reads. Every design decision serves two masters: the student's exam preparation experience and the patent's technical claims. Where those masters conflict, the student wins — a gesture that feels natural but captures rich telemetry is worth more than a gesture that captures perfect data but feels hostile.

The implementation is organized into seven patentable UX surfaces, each mapped to specific patent claims, with mobile-first design specs, component architecture, interaction patterns, educational psychology grounding, and research validation plans.

---

## Table of Contents

1. [Design Principles for Patentable UX](#1-design-principles-for-patentable-ux)
2. [Surface 1: The Confirmation Gesture — Instrumented Interaction Layer](#2-surface-1-the-confirmation-gesture)
3. [Surface 2: CAGE Visual Integrity Feedback](#3-surface-2-cage-visual-integrity-feedback)
4. [Surface 3: Cognitive State Inference Dashboard (Admin)](#4-surface-3-cognitive-state-inference-dashboard)
5. [Surface 4: Adaptive Feedback Loop — Student-Facing](#5-surface-4-adaptive-feedback-loop)
6. [Surface 5: Behavioral Session Summary — Post-Assessment](#6-surface-5-behavioral-session-summary)
7. [Surface 6: Disengagement Intervention System](#7-surface-6-disengagement-intervention-system)
8. [Surface 7: Population Behavioral Analytics — B2B/Institutional](#8-surface-7-population-behavioral-analytics)
9. [Component Architecture & State Management](#9-component-architecture--state-management)
10. [Mobile-First Interaction Specifications](#10-mobile-first-interaction-specifications)
11. [Accessibility & Inclusive Design](#11-accessibility--inclusive-design)
12. [Educational Psychology Alignment](#12-educational-psychology-alignment)
13. [UX Research Validation Plan](#13-ux-research-validation-plan)
14. [Commercialization UX — Revenue Surface Design](#14-commercialization-ux)
15. [Phased Implementation Roadmap](#15-phased-implementation-roadmap)
16. [Appendix: Patent Claim ↔ UX Surface Mapping](#16-appendix-patent-claim--ux-surface-mapping)

---

## 1. Design Principles for Patentable UX

These principles govern every design decision in this document. They reconcile patent requirements with SlateCamp's coach-like brand and the Filipino architecture student's reality.

### Principle 1: Invisible Instrumentation

The student must never feel surveilled. The confirmation gesture must feel like a natural, satisfying conclusion to their quiz session — not a biometric scan. The instrumented interaction layer is invisible. The student sees a "submit" action. The system sees a multi-dimensional behavioral signal source.

**Patent alignment:** Claim 1(a) requires a "submission control configured to require a continuous confirmation interaction." The UX must make that requirement feel like a feature, not friction.

**Design test:** If a student's first reaction to the submission gesture is "why do I have to do this?" — the design has failed. If their reaction is "that felt satisfying" — the design has succeeded.

### Principle 2: Privacy as Brand Promise

SlateCamp's patent explicitly avoids cameras, microphones, and browser lockdown. This is not just a technical constraint — it is a brand differentiator. The UX must communicate this: "We see how you think, not who you are." Every touchpoint where behavioral analysis is surfaced must reinforce that this system is privacy-first.

**Patent alignment:** White Space 4 — "educational integrity via internal interaction analysis" as a privacy-preserving alternative to external surveillance.

### Principle 3: Behavioral Insights Serve Learning, Not Punishment

Cognitive state indicators (confidence, hesitancy, engagement) exist to help students study better — not to catch cheaters. The primary UX surface for behavioral data is the student's own post-session feedback, not an administrator's surveillance dashboard. The admin dashboard is secondary.

**Patent alignment:** Claims 22–25 cover adaptive feedback and population-level modeling for educational analytics.

### Principle 4: The Coach Reveals the Signal

SlateCamp's voice is a coach. When behavioral data surfaces to the student, it sounds like a coach observing practice: "You hesitated on 4 of your structural questions — that might be worth revisiting" — not "Anomalous behavior detected on items 7, 12, 15, 19."

### Principle 5: Mobile-Touch is the Primary Modality

The median SlateCamp user is on a 6" mid-range Android with touch input. Every gesture, every interaction region, every feedback element is designed for thumb-driven mobile touch first. Desktop is the adaptation, not the source.

**Patent alignment:** Claim 27 — "the client application operates on a mobile device with a touchscreen display, and the interaction signal data is captured from native touch events."

---

## 2. Surface 1: The Confirmation Gesture

**Patent Claims:** 1(a–d), 2(b)(i–ii), 14, 15, 16
**Priority:** P0 — This is the primary behavioral signal source. Everything downstream depends on it.

### 2.1 What the Student Sees

A full-width lateral swipe track at the bottom of the quiz completion screen. The student places their thumb on a start indicator and slides it across to a completion zone to confirm submission.

This replaces the standard "Submit" button.

### 2.2 Interaction Design Specification

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Quiz Complete — 20 of 20 answered              │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  ◉━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▸ ✓   │    │
│  │  ↑                                  ↑   │    │
│  │  Start zone          Completion zone    │    │
│  │  "Slide to submit"                      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  This confirms your final answers.              │
│  You can review before sliding.                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Track dimensions (mobile):**
- Width: 100% of content area minus 32px (16px margin each side)
- Height: 64px (touch target compliant, generous thumb zone)
- Border radius: 32px (pill shape)
- Background: `#F0F2F5` (light grey, dark mode: `#2A2D35`)

**Thumb indicator:**
- Diameter: 56px (inside the 64px track)
- Fill: Slate Blue `#1E3A5F`
- Icon: Right arrow chevron, white, 20px
- Shadow: `0 2px 8px rgba(30, 58, 95, 0.3)`

**Completion zone:**
- Right 20% of track
- On approach: subtle green glow appears (`#2ECC71` at 10% opacity)
- On arrival: checkmark icon fades in, haptic feedback fires

**Label text:**
- Pre-interaction: "Slide to submit" — 14px, `#9B9B9B`, centered below track
- During interaction: "Keep sliding..." — 14px, Slate Blue
- On completion: "Submitted ✓" — 14px, Trail Green

### 2.3 Behavioral Signal Capture (Invisible to Student)

During the gesture, the instrumented interaction layer captures — at high frequency via `pointermove` / `touchmove` event listeners:

| Signal | Source | Capture Rate | Patent Claim |
|---|---|---|---|
| X/Y coordinates | `event.clientX`, `event.clientY` | Every pointer event (~60Hz+) | Claim 1(b) |
| Timestamp | `performance.now()` | Sub-millisecond per event | Claim 1(b) |
| Event type | `pointerdown`, `pointermove`, `pointerup` | Every event | Claim 1(b) |
| Touch contact area | `event.width`, `event.height` (Touch API) | Every touch event | Claim 6 |
| Estimated pressure | Derived from contact area | Every touch event | Claim 6 |
| Device orientation | `DeviceOrientationEvent` (accelerometer/gyro) | Concurrent stream | Claim 7 |

**Critical UX constraint:** None of this capture changes what the student sees or feels. The gesture is a natural lateral swipe. The capture layer is entirely behind the interaction surface.

### 2.4 Gesture Variants (Claim 16)

The system supports configurable confirmation interaction modalities. For initial launch, implement the lateral swipe only. Future variants provide A/B testing surface and patent breadth:

| Variant | Gesture | Signal Richness | UX Feel |
|---|---|---|---|
| **Lateral Swipe** (default) | Thumb slides left → right | High: velocity, path deviation, hesitation | Familiar (iOS slide-to-unlock pattern) |
| **Vertical Pull** | Thumb pulls bottom → top | Medium: vertical trajectory | "Pulling the lever" feel |
| **Touch-and-Hold** | Thumb holds on zone for 2s | Medium: pressure variation, tremor | Deliberate, zero-accident |
| **Draw-a-Shape** | Trace a checkmark path | Highest: full 2D trajectory | Most engaging, highest friction |

**Recommendation:** Ship lateral swipe first. It has the best signal-to-friction ratio. Add touch-and-hold as a Settings option for accessibility (motor impairment accommodations). Reserve draw-a-shape for high-stakes assessments (Proof Simulation).

### 2.5 Failure & Edge Case States

| State | UX Response | Patent Alignment |
|---|---|---|
| Swipe too fast (<200ms) | Track snaps back, "Take your time" label appears | Claim 15 — temporal threshold |
| Swipe doesn't reach completion zone | Track snaps back, "Slide all the way to submit" | Claim 15 — endpoint status |
| Swipe path wildly erratic | Accepted but flagged server-side (student never sees the flag) | Claim 4 — velocity profile anomaly |
| Touch lost mid-swipe (finger lifts) | Track snaps back, "Try again" | Standard UX recovery |
| Network offline at submission | Queue payload locally, submit when reconnected. "Saved — will submit when you're back online." | Resilience for PH connectivity |
| Student has unanswered items | Pre-gesture: "You have 3 unanswered items. Submit anyway?" confirmation | Claim 1(c)(iii) — completion status |

### 2.6 Animation & Motion Specification

```
Thumb indicator follow:
  - Transition: none (direct 1:1 tracking, no lag)
  - Overshoot: spring physics on snap-back (spring: stiffness 300, damping 25)

Track fill:
  - As thumb moves right, a colored fill follows behind it
  - Color: Slate Blue at 15% opacity
  - Transition: none (real-time fill)

Completion animation:
  - Duration: 400ms
  - Sequence: thumb scales to 0 → checkmark scales from 0 to 1 → track fill goes Trail Green
  - Haptic: `navigator.vibrate(50)` on completion
  - Easing: ease-out cubic

Snap-back animation:
  - Duration: 300ms
  - Easing: spring (stiffness 400, damping 30)
  - Thumb returns to start position
```

Use Framer Motion for all gesture animations. The spring physics on snap-back must feel physical — a rubber-band return, not a teleport.

---

## 3. Surface 2: CAGE Visual Integrity Feedback

**Patent Claims:** 3(a–h), 20, 21
**Priority:** P0 — CAGE is the strongest novel element with zero prior art.

### 3.1 What the Student Sees

Almost nothing. CAGE operates entirely behind the submission gesture. The student's only visible CAGE touchpoint is a small integrity confirmation after submission:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         ✓ Submitted                             │
│                                                 │
│    🔒 Answers locked at submission              │
│    Your responses are tamper-sealed.            │
│                                                 │
│    [View Results]                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design rationale:** The lock icon + "tamper-sealed" language does three things: (1) reassures the student their answers are safe, (2) establishes the privacy-preserving integrity narrative, (3) creates a visible UX artifact that maps to the CAGE patent claim.

### 3.2 CAGE UX Flow (What Happens Under the Hood)

```
Student taps start zone
    ↓
[CAGE: Hash current answer state → SHA-256]
[CAGE: Capture behavioral attestation from first N events]
[CAGE: Bind response hash + behavioral attestation + server nonce + sequence number]
[CAGE: Sign binding token with session-derived key]
    ↓
Student slides thumb across track
    ↓
[Behavioral telemetry captured throughout gesture]
    ↓
Student reaches completion zone
    ↓
[Package: signed CAGE token + answer data + telemetry + device fingerprint + session token]
    ↓
Transmit to server
    ↓
Server verifies:
  ✓ Response hash matches received answers
  ✓ Nonce is valid and unconsumed
  ✓ Signature is valid
  ✓ Behavioral attestation consistent with telemetry
    ↓
If all pass → "✓ Submitted" + lock icon
If any fail → silent flag to admin (student sees normal submission confirmation)
```

### 3.3 CAGE Failure UX

**Critical design decision:** When CAGE verification fails, the student should NOT see an error. The submission is flagged server-side for admin review. Showing an error would: (a) confuse legitimate students who had a network glitch, (b) alert bad actors to the verification mechanism, (c) create anxiety that contradicts the coach brand.

The admin sees a CAGE integrity flag in the session record:

```
Session #4821 — Maria S.
  Status: Flagged — CAGE hash mismatch
  Risk: Response data may have been modified after gesture initiation
  Action: [Review Session] [Dismiss Flag]
```

### 3.4 Hash Chain Visualization (Admin — Claim 20)

For sessions with multiple submission events (e.g., per-section quiz with multiple submit gestures), CAGE forms a hash chain. The admin dashboard visualizes this as a chain integrity indicator:

```
Section 1    Section 2    Section 3    Final
  [🔒]───────[🔒]───────[🔒]───────[🔒]
  Valid      Valid       Valid       Valid

  Chain Status: ✓ Intact — all hashes verified
```

If any link breaks:

```
Section 1    Section 2    Section 3    Final
  [🔒]───────[⚠️]───────[❌]───────[❌]
  Valid      Mismatch    Invalid     Invalid

  Chain Status: ⚠ Broken at Section 2 — downstream hashes unreliable
```

---

## 4. Surface 3: Cognitive State Inference Dashboard (Admin)

**Patent Claims:** 1(g), 11, 12, 13, 24, 25
**Priority:** P1 — Required for B2B institutional licensing and GPPB pathway.

### 4.1 Dashboard Purpose

The admin/institutional dashboard surfaces aggregate behavioral insights from the cognitive state inference engine. This is the primary B2B-facing UX surface and the commercialization gateway for white-label licensing, the Performance Intelligence Product, and the GPPB government procurement pathway.

**Two audiences, two views:**
1. **SlateCamp Admin** — sees all sessions, all cohorts, integrity flags
2. **Institutional Partner** (review center, university) — sees their students only, through white-label branding

### 4.2 Per-Session Behavioral Summary (Claim 24)

When an admin clicks into a specific assessment session:

```
┌─────────────────────────────────────────────────────────────┐
│ Session Behavioral Summary                                  │
│ Student: Maria S. · Assessment: Building Laws Mock 3        │
│ Date: April 1, 2026 · Duration: 34 min                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Overall Confidence Profile                                  │
│ ┌─────────────────────────────────────────────────────┐     │
│ │  High ████████████████░░░░░░░░░░░░  12 items (60%)  │     │
│ │  Moderate ████████░░░░░░░░░░░░░░░░  5 items (25%)   │     │
│ │  Low ████░░░░░░░░░░░░░░░░░░░░░░░░  2 items (10%)   │     │
│ │  Guessing ██░░░░░░░░░░░░░░░░░░░░░  1 item (5%)     │     │
│ │                                                     │     │
│ │  Distribution: ▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒░░▪                │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Behavioral Consistency    ████████████████████ 94%          │
│ Engagement Level          ████████████████░░░░ 82%          │
│ Integrity Flags           0                                 │
│                                                             │
│ Per-Item Confidence Breakdown                               │
│ ┌────┬──────────┬──────────┬─────────┬──────────┐           │
│ │ Q# │ Topic    │ Answer   │ Confid. │ Correct? │           │
│ ├────┼──────────┼──────────┼─────────┼──────────┤           │
│ │ 1  │ Fire Cod │ B        │ High    │ ✓        │           │
│ │ 2  │ Setbacks │ C        │ High    │ ✓        │           │
│ │ 3  │ TGFA     │ A        │ Low     │ ✗        │           │
│ │ 4  │ Parking  │ D        │ Guess   │ ✗        │           │
│ │ ...│          │          │         │          │           │
│ └────┴──────────┴──────────┴─────────┴──────────┘           │
│                                                             │
│ CAGE Status: ✓ Verified · Session Token: ✓ Valid            │
│ Device: Samsung A54 · Fingerprint: consistent               │
│                                                             │
│ [Export Report]  [Flag for Review]  [View Raw Telemetry]    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Confidence Level Classification (Claim 11)

The inference model classifies each submission gesture into four discrete levels:

| Level | Behavioral Signature | Visual Indicator | Color |
|---|---|---|---|
| **High Confidence** | Smooth, fast, direct trajectory. Low path deviation. Consistent velocity. | Filled circle | Trail Green `#2ECC71` |
| **Moderate Confidence** | Moderate speed. Some micro-pauses. Slight path deviation. | Half-filled circle | Camp Amber `#F5A623` |
| **Low Confidence** | Slow. Multiple hesitations. Direction reversals. High path deviation. | Quarter-filled circle | Alert Red `#E74C3C` |
| **Guessing** | Extremely fast (under threshold). No hesitation. Near-zero engagement indicators. | Empty circle | Grey Fog `#9B9B9B` |

**Design note:** These confidence levels are inferred from the confirmation gesture behavioral features (velocity, path deviation, temporal duration, pressure variance) combined with assessment-context features (time-on-task, answer changes per item, item difficulty). They are NOT self-reported by the student.

### 4.4 Cohort-Level Analytics (Claim 25 — Population Models)

```
┌─────────────────────────────────────────────────────────────┐
│ Cohort Behavioral Analytics                                 │
│ Cohort: UST ALE Reviewees Batch 2026 · N = 147             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Confidence Distribution by Topic                            │
│                                                             │
│ Building Laws    ▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒░░░  High: 65% Low: 15% │
│ Structural       ▓▓▓▓▓▓▒▒▒▒▒▒░░░░░░░  High: 35% Low: 40% │
│ Utilities        ▓▓▓▓▓▓▓▓▒▒▒▒▒░░░░░░  High: 45% Low: 30% │
│ History          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░  High: 75% Low: 10% │
│ Design (Area C)  ▓▓▓▓▒▒▒▒▒▒▒░░░░░░░░  High: 25% Low: 45% │
│                                                             │
│ Key Insight: Structural Design shows lowest confidence      │
│ despite 52% correctness — students may have fragile         │
│ knowledge that collapses under pressure.                    │
│                                                             │
│ Engagement Trend (Last 8 Weeks)                             │
│ ┌──────────────────────────────────────┐                    │
│ │ 90%─────────●───●───●                │                    │
│ │ 80%──●──●──/         \──●            │                    │
│ │ 70%─/                    \──●──●     │                    │
│ │     W1  W2  W3  W4  W5  W6  W7  W8  │                    │
│ └──────────────────────────────────────┘                    │
│ ⚠ Engagement declining in weeks 6-8 — typical pre-exam     │
│   fatigue pattern. Consider intervention.                   │
│                                                             │
│ [Export Full Report]  [Compare to National Average]         │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Admin Dashboard Design System

The admin dashboard follows SlateCamp's design system with these additions:

- **Data visualization palette:** Use the four semantic colors (Green/Amber/Red/Grey) for confidence levels. Use Slate Blue for neutral data (engagement, consistency). Never introduce new colors.
- **Table design:** Zebra-lemonsqueezyd rows, 48px row height, sortable columns, sticky headers. No horizontal scroll on desktop.
- **Export format:** PDF report with SlateCamp branding (for B2B clients) or CSV raw data (for researchers).
- **White-label adaptation:** Logo, primary color, and header text are configurable per institutional partner. Data visualization colors remain fixed (they're part of the patented classification system).

---

## 5. Surface 4: Adaptive Feedback Loop — Student-Facing

**Patent Claims:** 22, 23
**Priority:** P1 — This is where the patent serves the student directly.

### 5.1 Post-Session Confidence Insight Card

After every quiz session, the student's results screen includes a behavioral insight card. This is the most sensitive UX surface in the entire system — it must feel like a coach's observation, not a surveillance report.

```
┌─────────────────────────────────────────────────┐
│ Results: Building Laws Mock 3                   │
│ Score: 16/20 (80%)                              │
│                                                 │
│ ┌─────────────────────────────────────────┐     │
│ │ 🧠 Your Coach's Observation             │     │
│ │                                         │     │
│ │ You were confident on 12 items and      │     │
│ │ got 11 of them right — strong signal.   │     │
│ │                                         │     │
│ │ On 3 structural items, you hesitated    │     │
│ │ before submitting. Two of those were    │     │
│ │ wrong. That hesitation was your         │     │
│ │ instinct telling you something.         │     │
│ │                                         │     │
│ │ Recommendation: Revisit TGFA            │     │
│ │ computation and parking requirements.   │     │
│ │                                         │     │
│ │ [Study TGFA →]  [Study Parking →]       │     │
│ └─────────────────────────────────────────┘     │
│                                                 │
│ [View Full Results]  [Return to Trail]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5.2 Insight Card Content Rules

| Rule | Rationale |
|---|---|
| Never use the word "confidence" as a metric label | Students will think it's self-reported or performative. Use coach-voice language instead. |
| Always pair behavioral observation with actionable next step | The observation alone is interesting but useless. The recommendation turns it into learning. |
| Maximum 4 sentences of behavioral insight | Cognitive load. The student just finished a quiz. They're tired. |
| Only surface insights when the signal is strong | If behavioral features are ambiguous, don't show the card. Silence is better than noise. |
| Never surface integrity flags to the student | Integrity is an admin concern. The student only sees learning insights. |
| Celebrate high-confidence correct answers | "You were confident and right" reinforces mastery signal — Skinner's positive reinforcement. |
| Frame hesitation as useful information, not weakness | "Your hesitation was telling you something" reframes self-doubt as a skill. |

### 5.3 Adaptive Item Selection (Claim 22)

The cognitive state inference feeds into SlateCamp's adaptive testing engine:

- **Low confidence + correct:** Flag as "fragile knowledge" — the student guessed right but doesn't know it reliably. Re-test in next session with a variant question.
- **Low confidence + incorrect:** Expected — add to Blindspot Protocol priority queue. Weight higher in next Camp Trail day.
- **High confidence + incorrect:** Most dangerous state — overconfidence. Surface immediately in post-session feedback with clear corrective rationale.
- **High confidence + correct:** Mastery signal — reduce repetition weight. Move to maintenance spacing.

```
Confidence × Correctness Matrix

                  Correct             Incorrect
            ┌───────────────────┬───────────────────┐
  High      │ ✅ Mastery         │ ⚠️ Overconfidence  │
  Confidence│ → Reduce weight   │ → Immediate fix   │
            ├───────────────────┼───────────────────┤
  Low       │ 🔍 Fragile        │ 📌 Blindspot      │
  Confidence│ → Re-test variant │ → Priority queue  │
            └───────────────────┴───────────────────┘
```

This 2×2 matrix is the core adaptive logic that drives SlateCamp's Readiness Score toward accuracy. It is the practical learning application of the patent's cognitive state inference.

---

## 6. Surface 5: Behavioral Session Summary — Post-Assessment

**Patent Claims:** 24
**Priority:** P2 — Valuable for Proof Simulation and high-stakes assessments.

### 6.1 Proof Simulation Behavioral Report

For SlateCamp's Proof Simulation (the full ALE mock exam under real conditions), the behavioral session summary is expanded into a comprehensive report. This is a Pro feature and a key conversion driver.

```
┌─────────────────────────────────────────────────────────────┐
│ Proof Simulation Report                                     │
│ ALE Full Mock — April 1, 2026                               │
│ Score: 72% · Readiness Zone: Green                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Performance Profile                                         │
│                                                             │
│ ┌─────────────────────────────────────────────┐             │
│ │         Confident                           │             │
│ │            ▲                                │             │
│ │    ●●●●●   │   ●●●●●●●●●                   │             │
│ │    ●●●     │   ●●●●●●                      │             │
│ │ ───────────┼────────────────►               │             │
│ │ Incorrect  │             Correct            │             │
│ │    ●●      │   ●                            │             │
│ │    ●       │                                │             │
│ │            ▼                                │             │
│ │         Hesitant                            │             │
│ └─────────────────────────────────────────────┘             │
│                                                             │
│ Top-right cluster (confident + correct): 62% of items       │
│ → These are your strengths.                                 │
│                                                             │
│ Top-left cluster (confident + incorrect): 8% of items       │
│ → ⚠ Danger zone. You believe you know these but don't.     │
│ → Topics: Fire Code egress widths, Parking lot dimensions   │
│                                                             │
│ Bottom-left cluster (hesitant + incorrect): 18% of items    │
│ → Expected gaps. Your Camp Trail will target these.         │
│                                                             │
│ Bottom-right cluster (hesitant + correct): 12% of items     │
│ → You know more than you think. Build confidence here.      │
│                                                             │
│ Engagement Over Time                                        │
│ ┌─────────────────────────────────────────────┐             │
│ │ 100%│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒░░░░░░░░░      │             │
│ │     │ Strong      Dipping    Fatigued       │             │
│ │     └────────────────────────────────────    │             │
│ │      Q1-30        Q31-60      Q61-90        │             │
│ └─────────────────────────────────────────────┘             │
│ Your engagement dropped after question 55. On exam day,     │
│ plan a 30-second pause around that point.                   │
│                                                             │
│ [Download Full Report]  [Share with Review Center]          │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Confidence × Correctness Scatter Plot Design

The 2×2 scatter plot is the signature visualization of the behavioral session summary. Design specs:

- **Axes:** X = correctness (binary: left/right), Y = confidence (continuous: bottom/top)
- **Dots:** Each dot = one assessment item. Size: 8px. Color: topic-coded (Building Laws = blue, Structural = orange, etc.)
- **Quadrant labels:** Top-right: "Mastery" (green tint). Top-left: "Overconfidence" (red tint). Bottom-right: "Hidden Strength" (amber tint). Bottom-left: "Growth Area" (grey tint).
- **Interactive:** Tap a dot → bottom sheet reveals the specific question, topic, and rationale.
- **Mobile adaptation:** Full-width, 1:1 aspect ratio. Pinch to zoom on dense clusters.

---

## 7. Surface 6: Disengagement Intervention System

**Patent Claims:** 23
**Priority:** P2 — Improves session completion rates and generates patent-protected adaptive behavior.

### 7.1 What the Student Sees

When the behavioral inference model detects sustained low cognitive engagement (e.g., rapid-fire guessing, minimal time-on-task, erratic gesture patterns for 5+ consecutive items), the system surfaces a gentle intervention:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ☕ Quick break?                                 │
│                                                 │
│  You've been powering through.                  │
│  A 2-minute pause helps your brain              │
│  actually store what you just studied.          │
│                                                 │
│  [Take a Break — 2 min]    [Keep Going]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7.2 Intervention Design Rules

| Rule | Rationale |
|---|---|
| Never mention "disengagement" or "low engagement" | Surveillance language. Use encouraging framing. |
| Maximum 1 intervention per session | More than 1 becomes nagging. The coach suggests once, then trusts. |
| Offer genuine value: the 2-minute break | Spaced practice research (effect size d=0.71) supports microbreaks for encoding. |
| "Keep Going" must be prominent | Never force a break. Autonomy is sacred. |
| Only trigger after 5+ consecutive low-engagement items | False positive interventions are worse than no intervention. High threshold. |
| Track intervention acceptance rate | If >70% dismiss, the threshold is too sensitive. Tune it. |

### 7.3 Break Screen (If Accepted)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            ☕                                    │
│                                                 │
│    Take a breath. You're 65% through.           │
│                                                 │
│    Fun fact: The NBCP requires a minimum        │
│    of 6 sq.m. per office worker. Give           │
│    yourself the same courtesy.                  │
│                                                 │
│    ██████████████████████░░░░░░░░  1:24          │
│                                                 │
│    [I'm Ready — Resume]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

The break screen includes a topic-relevant fun fact (micro-learning moment), a countdown timer, and a resume button. The fun fact reinforces the brand — even rest has value.

---

## 8. Surface 7: Population Behavioral Analytics — B2B/Institutional

**Patent Claims:** 25, 24
**Priority:** P2 — Revenue surface for B2B licensing and GPPB government procurement.

### 8.1 Commercial Context

This surface serves three revenue streams from the IP Commercialization roadmap:

1. **White-Label Engine Licensing** — Review centers see their students' behavioral analytics under their own brand
2. **ALE Performance Intelligence Product** — Anonymized, aggregate behavioral data sold to universities, PRC, CHED
3. **GPPB Government Procurement** — PRC and CHED procure the analytics platform under the STI pathway

### 8.2 Institutional Dashboard: "Cohort Behavioral Intelligence"

```
┌─────────────────────────────────────────────────────────────┐
│ [Partner Logo]  Cohort Intelligence Dashboard               │
│ Review Center: Excel Architecture Review · Cohort: ALE-2026│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cohort Confidence Heatmap                                   │
│                                                             │
│ Each cell = one topic. Color = average confidence level.     │
│                                                             │
│ Building Laws  ■■■■■■■■ History      ■■■■■■■■              │
│ Structural     ■■░░░░░░ Planning     ■■■■■░░░              │
│ Utilities      ■■■░░░░░ Prof Practice ■■■■■■░░             │
│ Design (C)     ■░░░░░░░ Estimating   ■■■■░░░░              │
│                                                             │
│ ■ = High confidence   ░ = Low confidence                    │
│                                                             │
│ Population Behavioral Norms                                 │
│ ┌─────────────────────────────────────────────┐             │
│ │ Average submission gesture duration: 1.4s   │             │
│ │ Average path deviation: 12% of track width  │             │
│ │ Guessing rate (items < 5s + low confidence): │             │
│ │   This cohort: 18%  |  National avg: 22%    │             │
│ └─────────────────────────────────────────────┘             │
│                                                             │
│ At-Risk Students (Engagement < 60% last 2 weeks)            │
│ ┌────────┬────────────┬──────────┬──────────┐               │
│ │ Student│ Engagement │ Confid.  │ Sessions │               │
│ ├────────┼────────────┼──────────┼──────────┤               │
│ │ J.D.   │ 45%        │ Low      │ 2 / wk   │               │
│ │ A.M.   │ 52%        │ Moderate │ 1 / wk   │               │
│ └────────┴────────────┴──────────┴──────────┘               │
│                                                             │
│ [Export Full Report]  [Schedule Faculty Review]              │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Data Privacy Framework for Population Models

Population-level behavioral models must be built from anonymized data. The UX must communicate this clearly to both students and institutional partners:

**Student-facing (in Settings > Privacy):**
```
Your behavioral data helps us understand how ALE candidates
study — as a group, never as individuals. We use anonymized
patterns to improve recommendations for everyone.

No cameras. No microphones. No screen recording. Just how
you interact with your quiz — and only when you submit.

[Learn More]  [Opt Out of Anonymized Analytics]
```

**Institutional partner-facing (in license agreement and dashboard):**
```
This dashboard shows aggregate behavioral patterns for your
cohort. Individual student behavioral data is never shared
without explicit student consent. All population models are
built from anonymized, de-identified interaction telemetry.
```

---

## 9. Component Architecture & State Management

### 9.1 React Component Tree

```
<QuizSession>                              ← Page-level container
  <QuizItemRenderer />                     ← Renders current question
  <AnswerSelector />                       ← Handles answer selection
  <QuizProgressBar />                      ← Item progress indicator
  │
  <SubmissionGate>                         ← Checks completion status
    <ConfirmationGestureTrack             ← ⭐ PATENTABLE COMPONENT
      onGestureStart={handleCAGEInit}
      onGestureMove={handleTelemetryCapture}
      onGestureComplete={handleSubmission}
      onGestureCancel={handleSnapback}
      gestureVariant="lateral_swipe"
      minimumDuration={200}
      trackWidth="100%"
      trackHeight={64}
    />
  </SubmissionGate>
  │
  <PostSubmissionFeedback>
    <CAGEIntegrityBadge />                 ← Lock icon + "tamper-sealed"
    <CoachObservationCard />               ← Behavioral insight card
    <ResultsSummary />                     ← Score + per-item breakdown
  </PostSubmissionFeedback>
  │
  <DisengagementInterventionModal />       ← Triggered by inference engine
</QuizSession>
```

### 9.2 Zustand Store Architecture

```typescript
// stores/gestureSignalStore.ts
interface GestureSignalState {
  // Telemetry buffer
  events: GestureEvent[];
  isCapturing: boolean;
  gestureStartTime: number | null;
  
  // CAGE state
  cageToken: string | null;
  responseHash: string | null;
  serverNonce: string | null;
  sequenceNumber: number;
  
  // Submission state machine (client-side mirror)
  submissionState: 'idle' | 'gesture_active' | 'confirming' | 'submitted' | 'failed';
  
  // Actions
  startCapture: () => void;
  recordEvent: (event: GestureEvent) => void;
  computeCAGEBinding: (answerState: AnswerMap) => void;
  submitPayload: () => Promise<SubmissionResult>;
  reset: () => void;
}

// stores/cognitiveStateStore.ts
interface CognitiveStateStore {
  // Per-item inference results (returned from server after submission)
  itemConfidenceLevels: Map<string, ConfidenceLevel>;
  sessionEngagementScore: number | null;
  sessionConsistencyScore: number | null;
  
  // Disengagement detection
  consecutiveLowEngagementCount: number;
  shouldShowIntervention: boolean;
  
  // Adaptive feedback
  coachObservation: CoachObservation | null;
  adaptiveRecommendations: TopicRecommendation[];
}

type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'guessing';

interface GestureEvent {
  timestamp: number;          // performance.now() — sub-millisecond
  type: 'start' | 'move' | 'end' | 'cancel';
  x: number;
  y: number;
  contactWidth?: number;      // Touch API
  contactHeight?: number;
  pressure?: number;          // Derived from contact area
  accelerometer?: { x: number; y: number; z: number };
  gyroscope?: { alpha: number; beta: number; gamma: number };
}
```

### 9.3 Event Capture Implementation Notes

- Use `PointerEvent` API for unified mouse/touch handling. Fall back to `TouchEvent` on older Android WebViews.
- Capture rate: Attach listener with `{ passive: true }` to avoid blocking the main thread. Do NOT use `requestAnimationFrame` throttling — capture every event for maximum signal fidelity. Batch-send to server after gesture completion.
- Buffer size: A typical 1–2 second gesture generates 60–120 events at ~1KB each. Total payload: 60–120KB. Well within mobile upload limits.
- `performance.now()` provides sub-millisecond timestamps (DOMHighResTimeStamp). Do NOT use `Date.now()` — insufficient precision for behavioral feature extraction.
- Device orientation events require user permission on iOS 13+. Request permission once during onboarding: "SlateCamp uses motion sensors to personalize your experience." If denied, degrade gracefully — gesture telemetry alone is sufficient for core inference.

---

## 10. Mobile-First Interaction Specifications

### 10.1 Thumb Zone Mapping for Confirmation Gesture

```
┌────────────────────────────┐
│                            │  ← Top zone: Review answers button
│                            │     (intentional reach = intentional action)
│                            │
│        Quiz content        │  ← Middle zone: Question + answers
│                            │
│                            │
│                            │
├────────────────────────────┤
│  ◉━━━━━━━━━━━━━━━━━━▸ ✓   │  ← Bottom zone: Confirmation gesture
│  "Slide to submit"        │     (natural thumb reach, zero stretch)
├────────────────────────────┤
│  🏠    📊    🏕    👤     │  ← Nav bar
└────────────────────────────┘
```

The confirmation gesture track sits in the natural thumb zone (bottom 40% of screen). The student never needs to reach to the top of the screen to submit. This is critical for one-handed mobile use on 6"+ devices.

### 10.2 Touch Target Compliance

| Element | Minimum Size | Actual Size | Compliant |
|---|---|---|---|
| Gesture track | 44×44px | 100%w × 64px | ✓ |
| Thumb indicator | 44×44px | 56×56px | ✓ |
| "Keep Going" button (intervention) | 44×44px | 100%w × 48px | ✓ |
| Coach observation card CTA | 44×44px | 50%w × 44px | ✓ |

### 10.3 Offline Resilience

Philippine mobile connectivity is unreliable. The confirmation gesture and CAGE binding must handle offline scenarios:

1. **Gesture captured offline:** Store the full payload (CAGE token + telemetry + answers) in IndexedDB.
2. **Display:** "✓ Saved — will submit when you're back online."
3. **On reconnection:** Auto-submit queued payloads. Server validates with relaxed temporal policy (accepts submissions within a configurable grace window).
4. **Nonce expiry:** If the server nonce expires during offline period, the server issues a replacement nonce on reconnection and revalidates.

---

## 11. Accessibility & Inclusive Design

### 11.1 Motor Impairment Accommodations

The lateral swipe gesture may be difficult for users with motor impairments. Provide an alternative in Settings:

```
Settings > Accessibility > Submission Method

○ Slide to submit (default)
○ Press and hold to submit (3 seconds)
○ Double-tap to submit (with confirmation dialog)
```

All three methods capture behavioral telemetry — the touch-and-hold captures pressure variation and tremor; double-tap captures timing between taps. The patent covers alternative modalities (Claim 16).

### 11.2 Screen Reader Support

- Gesture track: `aria-label="Slide to submit your answers. Use the alternative submission method in accessibility settings if needed."`
- Completion: `aria-live="assertive"` announcement: "Answers submitted successfully. Your responses are tamper-sealed."
- Coach observation card: Full text readable by screen reader. No visual-only indicators.
- Confidence scatter plot (Proof Simulation report): Provide a text-based alternative table of confidence levels per item.

### 11.3 Color-Independent Indicators

All confidence level indicators use color + shape (per SlateCamp design system rules):

| Level | Color | Shape | Label |
|---|---|---|---|
| High | Green | Filled circle ● | "Confident" |
| Moderate | Amber | Half circle ◐ | "Moderate" |
| Low | Red | Quarter circle ◔ | "Hesitant" |
| Guessing | Grey | Empty circle ○ | "Guessing" |

---

## 12. Educational Psychology Alignment

### 12.1 Bloom's Taxonomy Mapping

The behavioral signal capture system operates at Bloom's Level 4 (Analyze) and Level 5 (Evaluate):

- **Level 4 — Analyze:** The system analyzes the behavioral signature of each submission to distinguish confident knowledge from fragile knowledge. This is metacognitive analysis — the system performs the metacognitive assessment that students often cannot do for themselves.
- **Level 5 — Evaluate:** The adaptive feedback loop (Confidence × Correctness matrix) helps students evaluate the quality of their own understanding, not just whether they got the answer right.

### 12.2 Mayer's Multimedia Principles Applied

| Principle | Application |
|---|---|
| Coherence | The confirmation gesture captures data without adding visual clutter. No extra UI elements. |
| Signaling | The coach observation card highlights the most important behavioral insight, not all of them. |
| Segmenting | Students control when to view behavioral insights — they're in a card, not auto-displayed. |
| Personalization | Coach voice ("Your hesitation was telling you something") over clinical voice ("Hesitancy index: 0.73"). |
| Spatial contiguity | Confidence indicators appear next to each item in the results table, not in a separate section. |

### 12.3 Situated Learning Integration

The confirmation gesture is itself a situated learning element. By requiring a deliberate gesture to submit, the system trains students in the metacognitive habit of pausing before committing to an answer. This habit transfers to the actual ALE, where students mark answers on a physical answer sheet — a deliberate, irreversible action.

The behavioral insight card ("You hesitated on 4 structural items") teaches students to recognize their own uncertainty signals. This is metacognitive calibration — one of the highest-value learning interventions (Hattie effect size d=0.69).

---

## 13. UX Research Validation Plan

### 13.1 Phase 1: Gesture Usability Testing (Pre-Launch)

**Method:** Moderated usability test with 8–12 ALE candidates
**Recruitment:** Mix of Persona 1 (Anxious First-Taker) and Persona 2 (Retaker)
**Device:** Their own phones (mid-range Android, 6"+ display)
**Tasks:**
1. Complete a 10-item quiz and submit via the confirmation gesture
2. Think-aloud protocol during the gesture
3. Post-task questionnaire: "How did the submission feel?" (5-point scale: frustrating → satisfying)

**Success criteria:**
- ≥90% first-attempt completion rate (gesture reached completion zone)
- ≥80% rate the gesture as "neutral" or "satisfying" (3+ on 5-point scale)
- Zero participants ask "why do I have to do this?" without prompting
- Average gesture duration: 800ms–2000ms (signal-rich window)

**Key questions to answer:**
- Is the lateral swipe intuitive on first encounter?
- Does the gesture feel like a natural "submit" action or an obstacle?
- Do students with smaller hands (female Filipino average: ~17cm hand length) have any difficulty?
- Does the snap-back animation feel clear when the gesture is incomplete?

### 13.2 Phase 2: Behavioral Insight Card Testing (Post-Launch Week 2)

**Method:** A/B test — sessions with vs. without coach observation card
**Sample:** 200+ Pro users across 2 weeks
**Primary metric:** Return rate within 48 hours (does the insight card drive re-engagement?)
**Secondary metrics:**
- Engagement with recommended topics (do they tap "Study TGFA →"?)
- Self-reported helpfulness (in-app micro-survey: "Was this insight helpful?")
- Readiness Score trajectory (does the behavioral insight accelerate improvement?)

### 13.3 Phase 3: Disengagement Intervention A/B Test (Post-Launch Month 2)

**Method:** A/B test — intervention on vs. off
**Sample:** 500+ sessions of 30+ items
**Primary metric:** Session completion rate (items answered / items in session)
**Secondary metrics:**
- Accuracy in final third of session (does the break improve performance?)
- Intervention acceptance rate (what % take the break?)
- Sentiment (does the intervention feel helpful or patronizing?)

### 13.4 Phase 4: Institutional Dashboard Validation (Pre-B2B Launch)

**Method:** Contextual inquiry with 3–5 review center owners/faculty
**Tasks:** Navigate the cohort dashboard, interpret the confidence heatmap, identify at-risk students
**Success criteria:**
- Faculty can identify the weakest topic in their cohort within 30 seconds
- Faculty can find at-risk students within 1 minute
- ≥80% say the dashboard provides insights they cannot get from traditional quiz scores alone
- ≥60% express willingness to pay for continued access

---

## 14. Commercialization UX — Revenue Surface Design

### 14.1 Behavioral Insights as Pro Feature Gate

The coach observation card and the Proof Simulation behavioral report are Pro-only features. Free users see their score and per-item correctness. Pro users see the behavioral layer on top.

**Paywall trigger point:** After a free user completes their 3rd quiz session, show a teaser:

```
┌─────────────────────────────────────────────────┐
│  Your Score: 14/20                              │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 🔒 Pro Insight                          │    │
│  │                                         │    │
│  │ We noticed something about how you      │    │
│  │ answered 3 of these questions that      │    │
│  │ could help you study smarter.           │    │
│  │                                         │    │
│  │ [Unlock with Pro — ₱299/mo]             │    │
│  │ [Not yet]                               │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design rules for behavioral paywall:**
- Never fake the insight. If the behavioral signal wasn't actually strong enough to generate an insight, don't show the teaser.
- The teaser implies real value ("we noticed something") without revealing the content. This is honest scarcity.
- "Not yet" must be visible and functional. No dark patterns.

### 14.2 White-Label Theming for B2B

The institutional dashboard supports white-label branding via a theming configuration:

```typescript
interface WhiteLabelConfig {
  partnerLogo: string;        // URL to logo asset
  partnerName: string;        // "Excel Architecture Review"
  primaryColor: string;       // Replaces Slate Blue in header/nav
  accentColor: string;        // Replaces Camp Amber in secondary elements
  // Semantic colors (Green/Red/Grey) are NOT configurable — they're patent-protected
  showSlateCampBranding: boolean;  // "Powered by SlateCamp" footer
}
```

**Non-configurable elements (IP-protected):**
- Confidence level colors and shapes (part of the patented classification system)
- Confidence × Correctness scatter plot design
- CAGE integrity chain visualization
- Behavioral feature extraction labels and categories

### 14.3 GPPB-Ready Report Format

For government procurement under GPPB Resolution No. 04-2026, the system must export standardized reports:

- **PDF format:** SlateCamp-branded or partner-branded header, cohort summary, confidence heatmap, at-risk student list, integrity summary
- **Data standard:** CSV with column headers matching PRC reporting requirements
- **Audit trail:** Every report generation is logged with timestamp, requesting user, and data scope
- **IP ownership clause alert:** When generating reports for government partners, display a footer: "Analytics powered by SlateCamp · Patent Pending IPOPHL"

---

## 15. Phased Implementation Roadmap

### Phase 1: Core Gesture + CAGE (Weeks 1–4)

| Week | Deliverable | Patent Claims Activated |
|---|---|---|
| 1 | `ConfirmationGestureTrack` component with lateral swipe, snap-back animation, Framer Motion | 1(a), 14, 15 |
| 1 | `gestureSignalStore` Zustand store with event buffer | 1(b), 2(b)(i–ii) |
| 2 | High-frequency event capture pipeline (PointerEvent + DeviceOrientation) | 1(b), 6, 7 |
| 2 | CAGE binding: SHA-256 hash of answer state at gesture start | 3(a–e) |
| 3 | Submission payload packaging (CAGE token + telemetry + device fingerprint + session token) | 1(c–d), 3(f) |
| 3 | Server-side CAGE verification endpoint (hash recomputation, nonce validation, signature check) | 3(g–h) |
| 4 | Submission state machine (idle → gesture_active → confirming → submitted/failed) | 1(h–j), 17 |
| 4 | `CAGEIntegrityBadge` component ("🔒 Answers locked at submission") | UX Surface 2 |

**Phase 1 output:** Students can submit quizzes via the confirmation gesture. CAGE binding is live. Server validates every submission. No behavioral inference yet — telemetry is captured and stored for Phase 2 training data.

### Phase 2: Behavioral Feature Extraction + Basic Inference (Weeks 5–8)

| Week | Deliverable | Patent Claims Activated |
|---|---|---|
| 5 | Server-side feature extraction pipeline: path metrics, temporal metrics, velocity profiles | 1(f), 4, 5 |
| 5 | Pressure profile and contact area feature extraction | 6 |
| 6 | Jerk metric computation (rate of change of acceleration) | 8 |
| 6 | Sliding window micropattern detection (micro-pauses, velocity bursts, directional oscillations) | 9 |
| 7 | Rule-based confidence classifier (threshold-based, not ML — MVP approach) | 11 |
| 7 | Multi-signal fusion: gesture features + time-on-task + answer changes + item difficulty | 12 |
| 8 | `cognitiveStateStore` Zustand store with per-item confidence levels | Store architecture |
| 8 | Admin per-session behavioral summary view | 24 |

**Phase 2 output:** The system extracts behavioral features and classifies confidence levels using a rule-based model trained on Phase 1 telemetry data. Admin can view per-session summaries.

### Phase 3: Student-Facing Adaptive Feedback (Weeks 9–12)

| Week | Deliverable | Patent Claims Activated |
|---|---|---|
| 9 | `CoachObservationCard` component with insight generation logic | 22 |
| 9 | Confidence × Correctness adaptive routing (fragile → re-test, overconfident → immediate fix) | 22 |
| 10 | `DisengagementInterventionModal` with break screen | 23 |
| 10 | Proof Simulation behavioral report with confidence scatter plot | 24 |
| 11 | Behavioral insights as Pro feature gate (paywall teaser) | Revenue surface |
| 12 | Gesture variant: touch-and-hold (accessibility alternative) | 16 |
| 12 | Usability testing round 1 (gesture + insight card) | Research |

**Phase 3 output:** Students see behavioral insights after sessions. The adaptive engine uses confidence data. Disengagement intervention is live. Pro paywall includes behavioral insights.

### Phase 4: Population Models + B2B Dashboard (Weeks 13–18)

| Week | Deliverable | Patent Claims Activated |
|---|---|---|
| 13–14 | Population-level behavioral model training (aggregate gesture norms per topic/item type) | 25 |
| 15 | Institutional cohort dashboard with confidence heatmap | 25, B2B surface |
| 16 | White-label theming engine (partner logo, color, branding toggle) | Commercialization |
| 17 | GPPB-ready PDF export with audit trail | Government procurement |
| 18 | ML model replacement of rule-based classifier (trained on accumulated data) | 10 |

**Phase 4 output:** Population models are live. Institutional partners can access cohort behavioral analytics. White-label is ready. ML model replaces rule-based classifier.

### Phase 5: Advanced + Hardening (Weeks 19–24)

| Week | Deliverable | Patent Claims Activated |
|---|---|---|
| 19 | Hash chain visualization for multi-section assessments | 20 |
| 20 | Nonce TTL enforcement with configurable expiry | 21 |
| 20 | Individual behavioral profile comparison (identity consistency score) | 13 |
| 21 | Real-time streaming gesture telemetry (WebSocket during gesture) | 28 |
| 22 | Gesture variant: draw-a-shape for Proof Simulation | 16 |
| 23 | A/B tests: disengagement intervention, insight card effectiveness | Research |
| 24 | Security audit: CAGE penetration testing, replay attack testing | 18, 19 |

---

## 16. Appendix: Patent Claim ↔ UX Surface Mapping

| Patent Claim | UX Surface | Component | Phase |
|---|---|---|---|
| 1(a) — Submission control with continuous confirmation | Surface 1: Confirmation Gesture | `ConfirmationGestureTrack` | 1 |
| 1(b) — Interaction signal capture | Surface 1: Confirmation Gesture | Event capture pipeline | 1 |
| 1(c) — Submission payload packaging | (Invisible — no UX surface) | `gestureSignalStore.submitPayload()` | 1 |
| 1(f) — Behavioral feature extraction | Surface 3: Admin Dashboard | Feature extraction pipeline | 2 |
| 1(g) — Cognitive state inference | Surface 3: Admin Dashboard / Surface 4: Coach Card | Inference model + `CoachObservationCard` | 2–3 |
| 1(h–j) — Multi-factor validation + state machine | Surface 2: CAGE Integrity Badge | Submission state machine | 1 |
| 3 — CAGE method | Surface 2: CAGE Integrity Badge | CAGE binding module | 1 |
| 4 — Velocity profile | (Invisible — feeds inference) | Feature extraction | 2 |
| 5 — Path deviation, dwell-time, reversals | (Invisible — feeds inference) | Feature extraction | 2 |
| 6 — Touch contact area / pressure | (Invisible — feeds inference) | Touch API capture | 2 |
| 7 — Accelerometer/gyroscope correlation | (Invisible — feeds inference) | DeviceOrientation capture | 1 |
| 8 — Jerk metric | (Invisible — feeds inference) | Feature extraction | 2 |
| 9 — Sliding window micropatterns | (Invisible — feeds inference) | Feature extraction | 2 |
| 10 — ML model training + update | (Invisible — backend) | Model training pipeline | 4 |
| 11 — Discrete confidence levels | Surface 3: Admin Dashboard / Surface 5: Scatter Plot | Confidence classifier | 2 |
| 12 — Multi-signal fusion | (Invisible — feeds inference) | Fusion module | 2 |
| 13 — Individual behavioral profile | Surface 3: Admin Dashboard (identity consistency) | Profile comparison | 5 |
| 14 — Lateral traversal start → completion | Surface 1: Confirmation Gesture | `ConfirmationGestureTrack` | 1 |
| 15 — Endpoint + temporal rejection | Surface 1: Failure states | Gesture validation logic | 1 |
| 16 — Alternative gesture modalities | Surface 1: Settings | Gesture variant selector | 3–5 |
| 17 — State machine (active → confirming → submitted) | (Invisible — server-side) | State machine module | 1 |
| 18 — Single-use session token | (Invisible — server-side) | Token management | 1 |
| 19 — Temporal policy verification | (Invisible — server-side) | Timestamp validation | 1 |
| 20 — Hash chain | Surface 2: Admin hash chain visualization | Chain verification module | 5 |
| 21 — Nonce TTL | (Invisible — server-side) | Nonce lifecycle management | 5 |
| 22 — Adaptive feedback (scoring, item selection, reports) | Surface 4: Coach Card + Adaptive Routing | Confidence × Correctness matrix | 3 |
| 23 — Disengagement detection + intervention | Surface 6: Disengagement Intervention | `DisengagementInterventionModal` | 3 |
| 24 — Aggregate session behavioral summary | Surface 5: Proof Simulation Report / Surface 3: Admin | Session summary generator | 2–3 |
| 25 — Population-level behavioral models | Surface 7: Institutional Dashboard | Population model pipeline | 4 |
| 26 — React/Next.js + Supabase implementation | (Entire system) | Stack-level claim | 1 |
| 27 — Mobile touchscreen implementation | Surface 1 + all mobile specs | Mobile-first design | 1 |
| 28 — Real-time streaming telemetry | (Invisible — WebSocket during gesture) | Streaming pipeline | 5 |

---

## Document Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | April 2026 | SlateCamp Product | Initial UX/UI implementation plan aligned to IPOPHL patent framework |

---

*This document is confidential and proprietary to SlateCamp. It contains trade secrets related to the patent-pending Behavioral Signal Capture and Cognitive State Inference System. Distribution is restricted to SlateCamp team members and authorized legal counsel.*
