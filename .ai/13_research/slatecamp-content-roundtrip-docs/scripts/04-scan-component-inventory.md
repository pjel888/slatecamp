# Script Spec: Scan Component Inventory

Suggested file:

```text
scripts/content-audit/scan-component-inventory.ts
```

## Responsibilities

```text
- scan repo source files
- identify exported React components
- infer props where possible
- detect likely article embeddability
- compare components against article usage
- output component inventory files
```

## AST vs regex

Prefer AST/TypeScript parser if available.

If not, MVP can use conservative extraction:

```text
export function ComponentName
export const ComponentName
export default function ComponentName
interface ComponentNameProps
type ComponentNameProps
```

## Do not modify source files

Inventory is read-only.
