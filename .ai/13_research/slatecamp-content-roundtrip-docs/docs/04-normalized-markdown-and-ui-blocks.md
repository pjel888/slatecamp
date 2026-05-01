# Normalized Markdown and UI Block Preservation

The normalization step converts rich article content into markdown that can be safely read by humans or AI without losing custom UI blocks.

## What normalization should do

```text
1. Read original.md.
2. Detect custom UI / MDX / embedded components / shortcodes / raw HTML blocks.
3. Replace each protected block with a placeholder.
4. Preserve exact raw block content in ui-blocks.json.
5. Preserve textual children/props summary for review.
6. Write normalized.md.
```

## What normalization must not do

```text
- Do not delete component data.
- Do not rewrite component props.
- Do not reorder content.
- Do not convert component data into prose as a replacement.
- Do not treat unknown UI blocks as safe prose.
```

## Placeholder format

Use a stable placeholder format:

```md
[UI_BLOCK id="ui_0007" component="ComponentName"]
summary: <short generated deterministic summary if possible>
textual_payload: <inner text or extracted labels if available>
raw_preserved: true
[/UI_BLOCK]
```

The placeholder must include a block id that maps to `ui-blocks.json`.

## Detectable block patterns

The parser should handle at least:

```text
<CapitalizedComponent ... />
<CapitalizedComponent ...>...</CapitalizedComponent>
<Namespace.Component ... />
<Namespace.Component ...>...</Namespace.Component>
{{ shortcode(...) }}
::: custom blocks :::
raw HTML with interactive attributes
markdown fenced blocks tagged as component/json/interactivity
```

## Unknown blocks

If a block looks like UI but cannot be parsed:

```text
- preserve raw block
- mark component_name = "unknown"
- mark parse_status = "unknown_block"
- include it in unknown-components report
- do not edit it
```

## Inline components

If components appear inline inside prose, replacement must preserve surrounding text.

Example:

```md
The rule is shown in <CodeTrap label="firewall" /> and often appears in exams.
```

Normalized:

```md
The rule is shown in [UI_BLOCK id="ui_0021" component="CodeTrap" /] and often appears in exams.
```

## Recomposition

The compose step must replace placeholders with exact `raw` content from `ui-blocks.json` unless an explicit edited block version exists and passes validation.
