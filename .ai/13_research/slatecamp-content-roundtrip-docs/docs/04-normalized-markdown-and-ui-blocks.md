# Normalized Markdown and UI Block Preservation

The normalization step converts rich article content into markdown that can be safely read by humans or AI without losing custom UI blocks.

## What normalization does

```text
1. Read original.md.
2. Detect custom UI / MDX / embedded components / shortcodes / raw HTML blocks.
3. Detect explicitly tagged fenced UI blocks.
4. Replace each protected block with a placeholder.
5. Preserve exact raw block content in ui-blocks.json.
6. Preserve textual children/props summary for review.
7. Write normalized.md, parser-errors.json, and ui-block-edits.json.
```

## What normalization must not do

```text
- Do not delete component data.
- Do not rewrite component props.
- Do not reorder content.
- Do not convert component data into prose as a replacement.
- Do not treat unknown UI blocks as safe prose.
- Do not parse ordinary code fences as UI components.
```

## Placeholder format

Implemented placeholder format:

```md
[SLATECAMP_UI_BLOCK:ui_0007 component="ComponentName" status="preserved"]
Extracted summary:
- Props: title="Example", active=true
- Text: inner text or extracted labels if available
[/SLATECAMP_UI_BLOCK]
```

The placeholder must include a block id that maps to `ui-blocks.json`. Current generated ids use `ui_0001`, `ui_0002`, etc. Recomposition accepts older `block_0001` ids as aliases.

## Detectable block patterns

The parser handles at least:

```text
<CapitalizedComponent ... />
<CapitalizedComponent ...>...</CapitalizedComponent>
<Namespace.Component ... />
<Namespace.Component ...>...</Namespace.Component>
{{ shortcode(...) }}
::: custom blocks :::
raw HTML blocks such as div/iframe/script/style/details/video/canvas/svg/section/aside
explicit fenced UI blocks tagged component, slatecamp-ui, ui-block, interactive, interactivity, or mdx-component
json/jsonc fences only when they explicitly include raw_preserved=true or slatecamp_ui=true
```

Ordinary code fences such as `tsx`, `ts`, `js`, and normal `json` examples remain protected and are not parsed as UI components.

## Unknown blocks

If a block looks like UI but cannot be parsed:

```text
- preserve raw block
- mark status = "unknown"
- mark parse_status = "unknown_block"
- include it in parser-errors.json and inventory usage outputs
- do not edit it
```

## Inline components

If components appear inline inside prose, replacement preserves surrounding text.

Example:

```md
The rule is shown in <CodeTrap label="firewall" /> and often appears in exams.
```

Normalized:

```md
The rule is shown in [SLATECAMP_UI_BLOCK:ui_0021 component="CodeTrap" status="preserved"]
Extracted summary:
- Props: label="firewall"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK] and often appears in exams.
```

## Recomposition

The compose step replaces placeholders with exact `raw` content from `ui-blocks.json`. If a placeholder cannot be resolved or a preserved block would be lost, composition writes `compose-error.json` and candidate generation is blocked.
