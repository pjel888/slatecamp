# Component Inventory Codebase Audit

The folder `.ai/content-audit-export/component-inventory/` must be generated from an actual scan of the SlateCamp repository.

Do not guess available components.
Do not hardcode component names from memory.
Do not rely only on article usage.

## Goal

Identify the `.tsx`/`.jsx` components that could be used in article content or learning interactions.

## Scan targets

Scan likely source folders such as:

```text
components/
src/components/
app/**/components/
features/
lib/
content/
```

The implementation should discover actual paths from the repo. Do not assume only one folder.

## File extensions

Scan:

```text
.tsx
.jsx
.ts
.js
.mdx if present
```

But component inventory should primarily identify React components from `.tsx`/`.jsx`.

## What to extract per component

```text
component_name
file_path
export_type: default | named | anonymous_default | unknown
props_type_name
props_schema if inferable
prop_names
required_props
optional_props
child_support
imports
used_components
has_interactivity
uses_client_directive
uses_state
uses_effect
uses_canvas_or_svg
uses_threejs
uses_framer_motion
uses_radix_or_dialog
uses_charting
uses_supabase
uses_questions
uses_article_id
likely_article_embeddable
confidence
reason
raw_snippet
```

## How to detect article-embeddable components

Signals:

```text
- imported in markdown/MDX renderer or content renderer
- referenced in article content
- component name appears in `wiki_articles.content`
- accepts props suitable for content data
- lives in article/wiki/learning/interactive folder
- does not require user auth or page-level layout context
- renders self-contained teaching UI
```

## Output files

Generate:

```text
.ai/content-audit-export/component-inventory/components.json
.ai/content-audit-export/component-inventory/component-files.json
.ai/content-audit-export/component-inventory/component-usage-in-articles.json
.ai/content-audit-export/component-inventory/unknown-components.json
.ai/content-audit-export/component-inventory/component-fit-notes.md
```

## Component usage in articles

Scan every `original.md` for component tags and shortcodes. Map article usage to component inventory.

Output should answer:

```text
Which components exist in repo?
Which components appear in articles?
Which article uses which component?
Which component tags appear in articles but cannot be found in repo?
Which repo components appear designed for articles but are unused?
```

## This is an audit, not recommendation yet

Do not automatically insert components into articles. This phase only inventories and reports.
