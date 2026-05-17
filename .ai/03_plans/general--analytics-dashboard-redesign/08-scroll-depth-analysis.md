# 08 — Scroll And Viewport-Fit Analysis

> **Refresh date**: 2026-05-16
> **Important correction**: The browser document may not scroll, but the dashboard `<main>` scrolls internally. Measure the dashboard pane, not only `document.documentElement`.

## 1. Current Source-Based Height

This section documents the original stacked route problem. The current working tree already moved to query-state tabs, but the product direction now trims the default visible payload further because a quiz-taking dashboard should not expose all 34 sections.

Overview stacks these row heights:

```text
520
220
140
260
280
360
340
280
320
320
340
280
320
320
280
```

With gaps and layout chrome, this produces roughly 5k+ px of content.

Advanced stacks:

```text
320 x 8
400 x 1
```

With gaps and layout chrome, this produces roughly 3k+ px of content.

## 2. Runtime Measurement

Playwright measured `/dashboard/analytics` at `1440x900`:

| Element | Client height | Scroll height | Meaning |
|---|---:|---:|---|
| Document | `900px` | `900px` | Browser page itself does not scroll |
| Dashboard `<main>` | `844px` | `5731px` | The dashboard content pane scrolls heavily |
| `DataLayout` content body | `792px` | `5687px` | Analytics content overflows its own visible pane |

This is the success metric to reverse: at `1440x900`, `1512x982`, and `1920x1080`, each primary active tab must fit without vertical scroll on `document`, `body`, dashboard `<main>`, or the active tab sheet.

## 3. Width Waste

At `1440x900`:

| Area | Width |
|---|---:|
| Dashboard main pane | `1376px` |
| Analytics content body | `1024px` |
| Practical unused width | `~352px` |

At `1920x1080`, the main pane grows to `1856px`, but the analytics body remains `1024px`.

The old plan treated scroll as a chart-count problem only. Runtime evidence shows width and layout mode are first-order causes.

## 4. New Fit Budget

Use the dashboard main pane as the budget:

| Viewport | Approx. main height target | Requirement |
|---|---:|---|
| `1440x900` | `~844px` | Active tab must have scroll delta `<= 8px` across `document`, `body`, dashboard `<main>`, and active tab sheet |
| `1512x982` | measure in Playwright | Active tab must have scroll delta `<= 8px` across `document`, `body`, dashboard `<main>`, and active tab sheet |
| `1920x1080` | `~1024px` | Active tab must have scroll delta `<= 8px` across `document`, `body`, dashboard `<main>`, and active tab sheet |
| Tablet landscape | measure in Playwright | Active tab should fit or have only explicit local chart overflow, with no clipped controls |
| Mobile | constrained | Use tabs and compact ordering; avoid monolithic page scroll and verify bounded per-tab content |

Do not call `1.4x` viewport height successful. That is still scrollable.

## 5. Practical Layout Implications

The prior 6-tab plan fit 5-6 sections per tab. The relevance-first plan is stricter: fit about 3 primary panels per tab and move the rest to secondary diagnostics.

For the next implementation:

- use full dashboard width,
- use a 12-column grid,
- reduce large hero/content padding,
- compress `SubjectMasteryServer` into a dashboard variant,
- place compact cards in shared rows,
- keep chart panels fixed or bounded,
- avoid section headers that consume whole rows unless they materially improve scanning.
- do not add default panels just because a chart exists.

The exact next implementation targets are now defined in [10 - Implementation Blueprint](./10-implementation-blueprint.md) and [11 - Relevance-First Tab And Data Plan](./11-relevance-first-tab-and-data-plan.md).

## 6. Verification Assertion

A later implementation should include a Playwright measurement similar to:

```ts
for (const selector of ['html', 'body', 'main', '[data-analytics-tab-panel]']) {
  const { scrollHeight, clientHeight } = await page.locator(selector).first().evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }))
  expect(scrollHeight).toBeLessThanOrEqual(clientHeight + 8)
}
```

Run this for every primary tab at `1440x900`, `1512x982`, and `1920x1080`. Mobile should have separate assertions for tab usability and bounded content, not the old 34-section stack.

Do not rely on this assertion alone. A dashboard can pass the no-scroll check while hiding content behind `overflow-hidden`. Pair it with screenshot review and DOM checks that sampled chart titles, legends, focusable controls, empty states, and form controls remain inside their visible panel bounds.
