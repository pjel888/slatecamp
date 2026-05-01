# Normalize Command Spec

## Purpose

Generate `normalized.md` and `ui-blocks.json` for exported articles.

## Input

```text
original.md
article-metadata.json
```

## Output

```text
normalized.md
ui-blocks.json
component-usage.json
parser-errors.json if needed
```

## Behavior

Custom UI blocks are replaced with placeholders and preserved exactly in `ui-blocks.json`.

## Safety

If parser confidence is low, mark the article as requiring review. Do not delete anything.
