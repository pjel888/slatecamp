# Objective

Implement a local **content round-trip system** for SlateCamp.

The system should let us:

```text
1. Export articles from Supabase.
2. Export linked questions for each article.
3. Export sources and taxonomy metadata.
4. Preserve exact article markdown/MDX/custom UI content.
5. Produce normalized markdown for analysis.
6. Extract custom UI blocks into structured sidecar files.
7. Audit actual repo components from `.tsx`/`.jsx` source files.
8. Detect which articles already use which components.
9. Allow local edits to normalized markdown.
10. Recompose safe candidate article content.
11. Diff local candidate content against original Supabase content.
12. Push approved changes back to Supabase with stale-checks.
```

This is the foundation for later AI fact-checking and learning-experience upgrades. It should not fact-check yet.

## Why this is needed

SlateCamp articles are not plain markdown only. Some contain embedded UI or custom interactive learning blocks. Some articles underuse available interactivity. If AI or a script rewrites raw article content directly, it can break component syntax, lose props, or erase embedded data.

The correct first step is to separate content layers:

```text
Original article string
  -> protected custom UI blocks
  -> normalized reviewable markdown
  -> linked questions
  -> sources
  -> taxonomy context
  -> component inventory from codebase
```

## Success definition

A developer should be able to run a local command and get a full local export of article bundles, then safely edit/compose/diff/push without losing custom UI blocks or article-question connections.
