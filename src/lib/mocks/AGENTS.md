<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# mocks

## Purpose

The `mocks` directory contains mock data and fake API responses for testing, staging, and demo mode: database status, infrastructure health, API latency metrics. Used to populate developer dashboard and enable offline testing without requiring live backend connections.

## Key Files

| File | Description |
|------|-------------|
| `status.ts` | Mock status endpoints: `getDatabaseStatus()`, `getInfrastructureStatus()` (async, 200ms delay) |

## For AI Agents

### Working In This Directory

**Mock Data Pattern:**
- Each function is async and returns a typed response matching the real API shape.
- Includes artificial 200ms delay to simulate network latency.
- Used in staging and demo deployments; swap the body for a real fetch() call in production.

**Database Status:**
- Connections: active, idle, max pool size.
- Table inventory: row counts, storage size per table.
- Migrations: applied migrations with timestamps and status.
- Used to monitor data growth and schema changes.

**Infrastructure Status:**
- API latency: p50, p95, p99 percentiles in milliseconds.
- Edge functions: operational status and last invocation timestamp per function.
- Deployment: latest deployment timestamp, commit hash, duration, success/failure status.
- Used to detect performance degradation and function failures.

### Common Patterns

**Getting Database Status:**
```typescript
import { getDatabaseStatus } from '@/lib/mocks'

const status = await getDatabaseStatus()
// {
//   connections: { active: 12, idle: 8, max: 20 },
//   tables: [
//     { name: 'users', rowCount: 2847, size: '14.2 MB' },
//     ...
//   ],
//   migrations: [...]
// }
```

**Getting Infrastructure Status:**
```typescript
import { getInfrastructureStatus } from '@/lib/mocks'

const status = await getInfrastructureStatus()
// {
//   apiLatency: { p50: 45, p95: 189, p99: 342, unit: 'ms' },
//   edgeFunctions: [
//     { name: 'compute-readiness-score', status: 'operational', lastInvocation: '...' },
//     ...
//   ],
//   deployment: { timestamp, status, commit, duration }
// }
```

**In Developer Dashboard:**
```typescript
'use client'

import { getDatabaseStatus, getInfrastructureStatus } from '@/lib/mocks'

export const DeveloperDashboard = async () => {
  const dbStatus = await getDatabaseStatus()
  const infra = await getInfrastructureStatus()
  
  return (
    <div>
      <DatabaseOverview tables={dbStatus.tables} />
      <EdgeFunctionStatus functions={infra.edgeFunctions} />
      <DeploymentStatus {...infra.deployment} />
    </div>
  )
}
```

## Dependencies

### Internal

- **Types:** `DatabaseStatus`, `InfrastructureStatus` from `@/types/developer`.

### External

- **No external npm dependencies** (pure mock data).

---

**Last Updated:** 2026-04-02

**For developer portal design, consult `.claude/agents/` in the repository root.**
