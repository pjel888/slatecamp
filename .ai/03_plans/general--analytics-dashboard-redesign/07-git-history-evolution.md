# 07 — Git History & Evolution

> Historical context for why `/dashboard/analytics` became overloaded. This file is advisory; live source and runtime measurements take precedence.

## 1. Summary

Analytics appears to have grown from a small set of dashboard metrics into a consolidated destination for learner data. The current source has 34 sections: 25 on Overview and 9 on Advanced.

The historical lesson is not "add more tabs." The lesson is that a surface that keeps accepting charts without an information architecture will become a report, not a dashboard. The 2026-05-16 product review sharpened this further: even well-organized tabs can still show too much if every chart remains default-visible.

## 2. Evolution Pattern

| Phase | What changed | Product implication |
|---|---|---|
| Initial analytics | A smaller analytics page emerged with core visualizations | Original layout could tolerate stacking |
| Dashboard consolidation | More detail surfaces moved out of dashboard overview | Analytics became the dumping point for detail |
| Advanced analytics | Expert/secondary charts were added under `Deep Insights` | The split became sophistication-based, not task-based |
| Performance/design cleanup | Caching and design tokens improved charts | The chart system is worth preserving |

## 3. Current Historical Interpretation

The current two-tab model likely reflects an incremental attempt to separate basic and advanced analytics. It did not solve the product problem because both tabs remain long vertical stacks.

Use history as a warning:

- Do not create a new "Misc" or "Deep" bucket.
- Do not allow future additions without assigning them to a user question.
- Do not let a tab exceed the viewport-fit budget without an explicit product review.
- Do not let the primary dashboard exceed the learner's decision budget; advanced diagnostics need a separate, intentional affordance.
- Preserve established chart aesthetics unless the redesign requires a compact variant.

## 4. Implementation Lesson

The redesign should introduce a governance rule:

> A new analytics section must declare its user question, primary/secondary status, tab, grid span, height budget, and fallback behavior before it is added to the route.

That rule is more important than the exact first-pass layout because it prevents the page from re-accreting into another long scroll.
