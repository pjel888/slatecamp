# Error Logging Feature Specification

## Purpose

Define the phase-1 SlateCamp error logging architecture for operational failures without collapsing audit history, analytics events, and engineering telemetry into one undifferentiated system.

## Scope

Phase 1 covers:

- shared application error logger
- explicit runtime split:
  - edge-safe middleware logging: console-only
  - server-side route/action logging: console + filtered durable persistence
- first-wave integrations:
  - `src/lib/supabase/middleware.ts`
  - `src/lib/actions/quiz-v2/start-session.ts`
  - `src/lib/actions/quiz-v2/submit-answer.ts`
  - admin mutation cluster:
    - `src/lib/actions/admin/questions.ts`
    - `src/lib/actions/admin/content.ts`
    - `src/lib/actions/admin/wiki.ts`
    - `src/lib/actions/admin/roles.ts`
    - `src/lib/actions/admin/taxonomy.ts`
  - payment webhooks:
    - `src/app/api/webhooks/lemonsqueezy/route.ts`
    - `src/app/api/webhooks/payrex/route.ts`
  - Developer log viewer:
    - `src/app/developer/tools/logs/page.tsx`

## Non-Goals

- Repo-wide normalization of all throws and result contracts
- Using `audit_logs` as a general engineering telemetry table
- Adding an external monitoring vendor in phase 1
- Replacing `analytics_events` with a dedicated `application_error_logs` table before first-wave rollout stabilizes

## Storage Model

### Immutable Audit History

- Table: `audit_logs`
- Purpose: trigger-backed business/data audit history
- Examples:
  - admin content changes on covered tables
  - immutable CREATE/UPDATE/DELETE history

### Operational Application Errors

- Table: `analytics_events`
- Prefix: `app_error.`
- Purpose: phase-1 durable storage for non-middleware operational failures
- Access model:
  - direct table reads remain governed by existing `analytics_events` RLS
  - Developer tooling uses privileged server-side queries only
  - the UI never assumes direct client-side access to operational error rows

### Edge-Safe Middleware Logging

- Sink: console only
- Reason: middleware must not rely on service-role or durable DB writes in phase 1

## Event Contract

Every application error event includes:

- `severity`
- `family`
- `eventName`
- `message`
- `requestId`
- optional `traceId`
- `routeOrAction`
- optional `userId`
- optional `sessionId`
- optional `provider`
- optional `eventId`
- `fingerprint`
- `metadata`
- normalized `error`
- `createdAt`

## Correlation Contract

- `requestId`: required on every event
- `traceId`: reused where available from entitlement or request context
- `routeOrAction`: required logical source identifier
- `sessionId`: included for quiz/session flows
- `provider` + `eventId`: included for webhook flows

## Dedupe Rules

- webhook duplication: `provider + external event id`
- background-task repeat failures: `source + routeOrAction + request/session context + normalized error fingerprint`

## Behavioral Rules

- First-wave integrations must preserve current throw/return contracts.
- Non-critical background failures must stay non-blocking.
- Redaction must remove secrets and sensitive headers before durable persistence.
- Raw payment signatures, cookies, tokens, and auth headers must never persist.

## Verification Requirements

- `bun run lint`
- `bun run type-check`
- `bun run build`
- targeted Bun tests for:
  - logging core
  - middleware failure capture
  - quiz-v2 first-wave surfaces
  - admin mutation first-wave surfaces
  - webhook first-wave surfaces
  - Developer logs read model

## Future Follow-Up

- Re-evaluate a dedicated `application_error_logs` table once phase-1 event volume and query needs are validated.
- Add an external monitoring adapter after the internal event contract stabilizes.
