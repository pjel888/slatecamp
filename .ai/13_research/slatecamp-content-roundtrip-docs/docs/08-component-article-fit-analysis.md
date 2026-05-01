# Component-to-Article Fit Analysis

This is a later analysis layer, but the export system must prepare for it.

## Purpose

SlateCamp has custom learning UI components, but not every article should use every component. The system should make it possible to determine which components are suitable for each article based on actual component inventory and article data.

## Inputs

```text
article normalized.md
article metadata
taxonomy context
linked questions
source data
component inventory
component usage report
```

## Output concept

The future analysis can produce:

```text
recommended_components
placement_suggestions
reason
required_data
risk
implementation_complexity
```

## Important constraint

This milestone should not auto-insert components. It should only generate the inventory and usage data needed for later analysis.

## Component fit should depend on article type

Examples:

```text
code requirement article -> requirement card, trap checker, scenario classifier
formula/computation article -> formula stepper, worked example, mistake detector
professional practice article -> process timeline, role/responsibility matrix
history article -> timeline, comparison cards, image reference block
design principle article -> visual comparison, critique prompt, annotated example
```

The implementation should not hardcode these recommendations into article content. Keep this as metadata/reporting only until a later content upgrade phase.
