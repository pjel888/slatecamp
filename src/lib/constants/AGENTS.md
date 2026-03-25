<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# constants

## Purpose

Centralized configuration and constants. Single source of truth for site metadata, route paths, design tokens, enum values, error messages, and thresholds. Eliminates magic strings and ensures consistency across the application.

## Key Files

| File | Description |
|------|-------------|
| **index.ts** | Main export barrel; re-exports all constants |
| **site.ts** | Site metadata: name, description, branding |
| **routes.ts** | Centralized route paths (ROUTES object); route builders with params |
| **readiness.ts** | Readiness score thresholds, labels, color tokens (70/40 for success/warning) |
| **mastery.ts** | Mastery scoring thresholds, progression levels |
| **analytics.ts** | Analytics event names, event property keys |
| **ads.ts** | Ad placement configuration, frequency caps |
| **pricing.ts** | Pricing plans, feature matrix, billing periods |
| **developer.ts** | Developer/API constants, feature flags, debug settings |

## For AI Agents

### Working In This Directory

1. **Import from the barrel** — use `import { ROUTES, siteConfig } from '@/lib/constants'`.
2. **No magic strings** — always reach for the constant instead of hardcoding.
3. **Route builders** — use functions like `ROUTES.QUIZ_SESSION(sessionId)` for dynamic routes.
4. **Design tokens** — readiness/mastery colors are CSS variables (e.g., `var(--success)`), not hex codes.
5. **Thresholds are immutable** — use `as const` for strict typing.

### Common Patterns

**Using route constants:**
```typescript
import { ROUTES } from '@/lib/constants'

// Static routes
const dashboardUrl = ROUTES.DASHBOARD // "/dashboard"
const wikiUrl = ROUTES.WIKI // "/dashboard/wiki"

// Dynamic routes
const sessionUrl = ROUTES.QUIZ_SESSION(sessionId) // "/dashboard/quiz/{sessionId}"
const noteUrl = ROUTES.NOTE(noteId) // "/dashboard/notes/{noteId}"

// Redirect or href
<a href={ROUTES.QUIZ_SESSION(id)}>Continue Quiz</a>
redirect(ROUTES.DASHBOARD)
```

**Readiness score labels and colors:**
```typescript
import { getReadinessLabel, getReadinessColor, READINESS_THRESHOLDS } from '@/lib/constants'

const score = 75
const label = getReadinessLabel(score) // "Strong"
const color = getReadinessColor(score) // "var(--success)"

// Check threshold
if (score >= READINESS_THRESHOLDS.EXAM_READY) {
  // User is exam-ready (≥90)
}
```

**Site config in metadata:**
```typescript
import { siteConfig } from '@/lib/constants'

// In layout metadata
export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}
```

**Analytics event names:**
```typescript
import { ANALYTICS_EVENTS } from '@/lib/constants'

trackServerEvent(ANALYTICS_EVENTS.QUIZ_STARTED, {
  sessionId,
  testMode: 'camp',
})
```

## Dependencies

### Internal

None — constants are leaf nodes with no internal imports.

### External

None — pure TypeScript/JavaScript objects.

<!-- MANUAL: -->
