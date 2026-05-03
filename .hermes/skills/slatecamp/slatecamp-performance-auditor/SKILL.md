---
name: slatecamp-performance-auditor
description: Performance audit workflow for Slatecamp. Use for slow pages, heavy bundles, inefficient queries, render churn, network waterfalls, or reliability bottlenecks.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Performance Auditor

## When to Use

Use when the user reports slowness, unreliable behavior, expensive operations, heavy pages, or when a feature may affect performance.

## Procedure

1. Identify the user-visible performance issue.
2. Inspect the likely path: bundle, render, network, server, database, or third-party service.
3. Gather evidence before optimizing.
4. Propose the smallest fix with measurable verification.
5. Avoid speculative micro-optimizations.

## Output

For each finding, report evidence, impact, fix, and verification.
