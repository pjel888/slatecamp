# Component Inventory Command Spec

## Purpose

Scan the actual SlateCamp codebase for `.tsx`/`.jsx` components and produce inventory files.

## Input

```text
repo source files
exported original.md files
normalized.md files
```

## Output

```text
component-inventory/components.json
component-inventory/component-files.json
component-inventory/component-usage-in-articles.json
component-inventory/unknown-components.json
component-inventory/component-fit-notes.md
```

## Behavior

Detect exported React components, props, usage signals, and whether they are likely embeddable in article content.

## Safety

Do not edit component source files.
Do not insert components into articles.
