# Flag Report: Longest Option Bias — Public Trustee vs Guild (RA 9266)

**Flag ID:** 012
**Date:** 2026-05-02
**Dimension:** B — Longest Option = Correct Answer (Lazy Design)
**Article UUID:** ab6d74a1-744c-4961-816a-b088bb707848
**Article Title:** PRBOA Powers
**Question ID:** 926e3a06-edb7-4617-ba84-521369613223
**Model ID:** ALE-PRAC-LAW-005-010
**Severity:** MEDIUM
**Category:** Law/Code (RA 9266 — Section 7)

## Issue: Longest Option Bias

The correct answer (option b) is the longest by a factor of 3-9x, making it trivially identifiable.

## Option Length Analysis

| Option | Length (chars) | Text |
|--------|---------------|------|
| a | ~110 | "The Board is a professional guild; Section 7 empowers it to maximize member benefits, focusing on internal interests rather than public welfare" |
| **b (correct)** | **~340** | "As public trustee, the Board acts for public benefit, not member interests; Section 7 grants broad powers including enforcement and standard-setting that override member preferences when conflicts arise. A guild would maximize member benefits; the Board must prioritize public protection." |
| c | ~35 | "There is no distinction; public trustee and guild roles are identical" |
| d | ~100 | "Section 7 limits Board power to prevent public protection, which contradicts the intended role of safeguarding public interest" |

**Ratio:** Correct answer is ~10x the length of option c, ~3x the length of options a and d.

## Why This Looks Like Lazy Design

This is an "analyze" level question (difficulty 0.9) asking about a conceptual distinction between "public trustee" and "professional guild." The correct answer provides a complete tutorial on the distinction. Option c is a ridiculous throwaway ("there is no distinction") that no one would select. Options a and d make clearly wrong claims. The disparity makes the question a trivial length-recognition task rather than a meaningful assessment.

## Recommended Correction

Create distractors that are equally detailed and plausible. For example, provide a distractor that argues the Board role is primarily guild-like but with plausible justification, rather than obviously wrong statements.

## Cross-Reference

This article also has Flag-004 (wrong power count error propagation).
