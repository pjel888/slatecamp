# CAGE Verification: Complete Infrastructure Implementation Plan

**Date:** 2026-04-08 (Revised)
**Status:** Proposal — pending approval
**Prerequisite for:** REL-02 (CAGE server-side verification in submit-answer.ts)
**Related:** `.ai/plans/drill-optimization-implementation-plan-2026-04-08.md` Section 07
**Patent Claims Addressed:** 3(f) response hash, 3(g) HMAC signature, 20 chain verification, 21 nonce replay prevention

---

## Current State Assessment (Verified via Supabase MCP + Codebase Audit)

### What's Working

| Component | Status | Evidence |
|-----------|--------|----------|
| Signal capture (client) | **Complete** | `useGestureSignalCapture.ts` — ring buffer, pointer events, device sensors |
| Token generation (client) | **Complete** | `generateBindingToken.ts` — HMAC-SHA256 with Web Crypto API, 150ms budget, graceful degradation |
| Nonce issuance (server) | **Complete** | `nonceService.ts` — batch issuance per question, atomic consumption with optimistic lock |
| Token transmission | **Complete** | `cageToken` field in `SubmitAnswerInput`, sent in every submission |
| Signal trace storage | **Complete** | `interaction_signal_traces` table — populated by `submit-answer.ts:347-355` |
| `issued_nonces` table | **Complete** | Functional with TTL (15 min), consumption tracking, session+question indexes |
| `cage_binding_tokens` table | **Exists but empty** | 13 columns, 3 indexes, RLS `qual: false` (service-role-only). 0 rows — never populated. |
| `verifyBindingToken.ts` | **Complete** | 4-step verification: response hash, nonce, HMAC signature (timing-safe), chain verification |
| Crypto algorithm parity | **Matched** | Client: Web Crypto SHA-256 + HMAC-SHA256. Server: Node.js crypto SHA-256 + HMAC-SHA256. Identical output. |
| `server-only` guard | **Enforced** | Both `verifyBindingToken.ts` and `nonceService.ts` import `server-only` |

### What's Broken (3 Gaps)

| Gap | Severity | Description |
|-----|----------|-------------|
| **Session key not stored server-side** | Critical | `start-session.ts:43` generates `randomBytes(32).toString('hex')`, returns to client, discards server copy. `verifyBindingToken` needs this key for HMAC verification. |
| **`verifyBindingToken` never called** | Critical | `submit-answer.ts` receives `input.cageToken` but discards it — only `input.signalTrace` is stored. The verification function exists but is dead code. |
| **`cage_binding_tokens` never populated** | High | The table exists with proper schema and service-role-only RLS, but no code writes to it. Chain verification (Claim 20) queries this table and always gets no results. |

---

## Existing `cage_binding_tokens` Schema (DO NOT RECREATE)

Verified via Supabase MCP — this table already exists with the correct schema:

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `token_id` | UUID PK | NO | `gen_random_uuid()` | Primary key |
| `interaction_id` | UUID | NO | — | Links to `user_interactions` |
| `session_id` | UUID | NO | — | Links to `quiz_sessions` |
| `question_id` | UUID | NO | — | Links to `questions` |
| `response_hash` | TEXT | NO | — | SHA-256 of canonical answer state |
| `behavioral_attestation` | TEXT | NO | — | Hash of initial signal window |
| `nonce` | TEXT | NO | — | Server-issued nonce used |
| `sequence_number` | INTEGER | NO | — | Monotonic position in session chain |
| `signature` | TEXT | NO | — | HMAC-SHA256 signature |
| `previous_token_hash` | TEXT | YES | — | Chain link (Claim 20) |
| `trust_level` | TEXT | NO | `'pending'` | `verified` / `failed` / `unavailable` / `pending` |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Token creation time |
| `verified_at` | TIMESTAMPTZ | YES | — | When verification completed |

**Indexes:** `cage_binding_tokens_pkey`, `idx_cage_tokens_interaction`, `idx_cage_tokens_session`
**RLS:** `service_only_cage_tokens` — `qual: false` (blocks all client access, service role bypasses)
**Row count:** 0

This schema already supports both token storage AND audit trail (trust_level + verified_at). No separate audit table needed.

---

## Implementation Plan

### Migration: Add `cage_session_key` Column to `quiz_sessions`

```sql
ALTER TABLE quiz_sessions
ADD COLUMN IF NOT EXISTS cage_session_key TEXT;

COMMENT ON COLUMN quiz_sessions.cage_session_key IS
  'CAGE HMAC signing key (64-char hex string from randomBytes(32)). Service role only — no RLS
   policy grants client access. Null if CAGE unavailable at session start.';
```

**Why TEXT not BYTEA:** The entire CAGE system operates on hex strings. `randomBytes(32).toString('hex')` produces a 64-char hex string. Both `generateBindingToken` (client) and `verifyBindingToken` (server) consume hex strings via `Buffer.from(keyHex, 'hex')`. Storing as TEXT avoids conversion at every read/write boundary.

**Why no encryption:** The session key is an HMAC signing key, not a credential. If an attacker has DB access, they already have the answers. The key only proves that a specific client generated a specific token — forging a token still requires defeating nonce validation, timing checks, and behavioral attestation. Access control is enforced by Supabase's service-role boundary (no RLS policy = no client access). Supabase Cloud provides storage encryption at rest.

**Why no separate table:** The key has a 1:1 relationship with `quiz_sessions` and shares its lifecycle (created at session start, irrelevant after session completion, deleted with session). A separate table adds a join for zero benefit.

---

### Code Changes

#### 1. `src/lib/actions/quiz-v2/start-session.ts` — Store Session Key

**Current (line 199-216, inside `Promise.all`):**
```typescript
supabase.from('quiz_sessions').insert({
  user_id: user.id,
  // ... existing fields ...
})
```

**Change:** Add `cage_session_key: sessionKey` to the insert object. The `sessionKey` is already available from `issueSessionSecurity` (line 233).

**Reorder:** Move `issueSessionSecurity` call BEFORE the session insert (currently after). This ensures the key is available at insert time. The session_id is generated by `gen_random_uuid()` default, but `issueSessionSecurity` needs the session_id for nonce issuance — so the insert must happen first. **Resolution:** Insert with `cage_session_key` set to a pre-generated key, then issue nonces with the returned session_id:

```
1. sessionKey = randomBytes(32).toString('hex')
2. Insert quiz_sessions with cage_session_key = sessionKey
3. issueNonceBatch(session.session_id, questionIds, userId) — uses session_id from insert
4. Return sessionKey + nonces to client
```

This is a minor restructure of `issueSessionSecurity` — split key generation (sync, no dependencies) from nonce issuance (async, needs session_id).

#### 2. `src/lib/cage/cageTokenStore.ts` — NEW: Token Storage Utility

```typescript
'use server'
import './server-only-guard'

interface StoreCageTokenParams {
  interactionId: string
  sessionId: string
  questionId: string
  token: CAGEBindingToken
  trustLevel: 'verified' | 'failed' | 'unavailable'
  failureReasons?: string[]
}

export const storeCageToken = async (params: StoreCageTokenParams): Promise<void> => {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    await admin.from('cage_binding_tokens').insert({
      interaction_id: params.interactionId,
      session_id: params.sessionId,
      question_id: params.questionId,
      response_hash: params.token.responseHash,
      behavioral_attestation: params.token.behavioralAttestation,
      nonce: params.token.nonce,
      sequence_number: params.token.sequenceNumber,
      signature: params.token.signature,
      previous_token_hash: params.token.previousTokenHash,
      trust_level: params.trustLevel,
      verified_at: params.trustLevel !== 'unavailable' ? new Date().toISOString() : null,
    })
  } catch (err) {
    console.error('[CAGE] Failed to store token:', err)
    // Never block quiz flow
  }
}
```

**Key design decisions:**
- Uses admin/service client (bypasses RLS)
- Fire-and-forget — caller wraps in `void` or `Promise.allSettled`
- Stores the full token (all fields from `CAGEBindingToken`) — enables chain verification AND audit trail in one table
- Sets `trust_level` based on verification result
- Sets `verified_at` only for tokens that were actually verified (not `unavailable`)

#### 3. `src/lib/actions/quiz-v2/submit-answer.ts` — Wire Verification

**In `runPostSubmitWork` (line 287), add a new background task:**

```typescript
// CAGE verification (fire-and-forget)
if (interactionId && input.cageToken) {
  backgroundTasks.push(
    (async () => {
      try {
        // Fetch session key from DB (service client already available)
        const { data: sessionRow } = await supabase
          .from('quiz_sessions')
          .select('cage_session_key')
          .eq('session_id', parsedInput.sessionId)
          .single()

        const cageSessionKey = sessionRow?.cage_session_key as string | null
        const token = input.cageToken as CAGEBindingToken

        if (!cageSessionKey) {
          // Key unavailable — store token without verification
          await storeCageToken({
            interactionId: interactionId!,
            sessionId: parsedInput.sessionId,
            questionId: parsedInput.questionId,
            token,
            trustLevel: 'unavailable',
          })
          console.warn('[CAGE] Session key unavailable, skipping verification')
          return
        }

        // Run verification
        const result = await verifyBindingToken(
          token,
          { questionId: parsedInput.questionId, selectedOptionId: parsedInput.selectedOptionId },
          cageSessionKey,
          parsedInput.sessionId,
        )

        // Store token with verification result
        await storeCageToken({
          interactionId: interactionId!,
          sessionId: parsedInput.sessionId,
          questionId: parsedInput.questionId,
          token,
          trustLevel: result.trustLevel as 'verified' | 'failed',
          failureReasons: result.failureReasons.length > 0 ? result.failureReasons : undefined,
        })

        console.log(`[CAGE] session=${parsedInput.sessionId} status=${result.trustLevel} reasons=${result.failureReasons.join(',')}`)
      } catch (err) {
        console.error('[CAGE] Verification pipeline failed:', err)
        // Never block quiz flow
      }
    })(),
  )
}
```

**Why fetch session key per submission?** The `session` row is already fetched in the main path (line 97-109), but it doesn't select `cage_session_key`. Two options:
- **Option A:** Add `cage_session_key` to the existing session select (line 102). Saves a DB round-trip but puts key in memory for the entire request.
- **Option B:** Separate fetch in the background task. Adds ~20ms but keeps key access isolated.

**Recommendation:** Option A — the key is already a hex string in memory on the client side. Having it in server memory during the request adds no meaningful risk, and saves a round-trip.

#### 4. No Client-Side Changes Required

The client already generates tokens and sends them. The `useQuizStore.submitCurrentAnswer` flow is unchanged. The `sessionKey` is already returned from `startSession` and stored in the Zustand store.

---

### Files Modified (Complete List)

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/migrations/20260408_cage_session_key.sql` | NEW | Add `cage_session_key TEXT` column to `quiz_sessions` |
| `src/lib/cage/cageTokenStore.ts` | NEW | `storeCageToken()` — fire-and-forget token persistence |
| `src/lib/actions/quiz-v2/start-session.ts` | MODIFY | Store `cage_session_key` in session insert; restructure key generation |
| `src/lib/actions/quiz-v2/submit-answer.ts` | MODIFY | Add CAGE verification background task in `runPostSubmitWork`; add `cage_session_key` to session select |

### Files NOT Modified

| File | Reason |
|------|--------|
| `src/lib/cage/verifyBindingToken.ts` | Already complete — all 4 verification steps work |
| `src/lib/cage/nonceService.ts` | Already complete — nonce issuance and consumption work |
| `src/lib/cage/generateBindingToken.ts` | Client-side, identity-locked area |
| `src/stores/useQuizStore.ts` | Client-side flow unchanged |
| `src/components/quiz-v2/SlideToSubmit.tsx` | Identity-locked |
| `src/components/quiz-v2/GestureCaptureZone.tsx` | Identity-locked |

---

## Implementation Estimate (Revised)

| Task | Time |
|------|------|
| Migration: add `cage_session_key` column | 10 min |
| `cageTokenStore.ts` utility | 30 min |
| `start-session.ts`: restructure key generation + store in insert | 30 min |
| `submit-answer.ts`: wire verification + token storage in background | 45 min |
| Type-check + build verification | 15 min |
| End-to-end verification (5-step protocol below) | 45 min |
| **Total** | **~3h** |

---

## Verification Protocol

### Step 1: Schema Verification
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'quiz_sessions' AND column_name = 'cage_session_key';
-- Expected: cage_session_key, text
```

### Step 2: Key Storage Verification
Start a Camp session (10 questions). Then:
```sql
SELECT session_id, cage_session_key IS NOT NULL as has_key,
       LENGTH(cage_session_key) as key_length
FROM quiz_sessions ORDER BY started_at DESC LIMIT 1;
-- Expected: has_key=true, key_length=64 (32 bytes as hex)
```

### Step 3: Token Verification Round-Trip
Submit an answer in the session. Then:
```sql
SELECT token_id, trust_level, verified_at, sequence_number
FROM cage_binding_tokens ORDER BY created_at DESC LIMIT 1;
-- Expected: trust_level='verified', verified_at IS NOT NULL
```

### Step 4: Chain Verification
Submit 3 answers in sequence. Then:
```sql
SELECT sequence_number, previous_token_hash IS NOT NULL as has_prev,
       trust_level
FROM cage_binding_tokens
WHERE session_id = '<session_id>'
ORDER BY sequence_number;
-- Expected: seq 0 has_prev=false, seq 1+ has_prev=true, all trust_level='verified'
```

### Step 5: Graceful Degradation
Submit an answer without CAGE token (e.g., from a session where CAGE generation failed):
- Verify answer submission succeeds
- Verify no `cage_binding_tokens` row is created (token was null)
- Verify no error in server logs

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Session key visible in DB to service role | Expected | None | Service role is already trusted with all data; Supabase Cloud encrypts at rest |
| Performance overhead of verification per submission | Very Low | ~20ms per answer | Runs in `Promise.allSettled` background task — never on critical path |
| Nonce double-consumption (verifyBindingToken + nonceService both consume) | Low | Soft failure | Both use identical optimistic lock pattern — first wins, second gets null (logged, not fatal) |
| Breaking existing quiz flow | None | N/A | All CAGE code is fire-and-forget with try/catch. Quiz flow is unchanged. |
| `cage_binding_tokens` insert failures | Low | Token not stored (audit gap) | Logged to console; does not block answer submission |

---

## Architectural Notes

### Why No Encryption Layer
The session key is an HMAC signing key whose purpose is attestation, not authentication. An attacker with DB access already has the answers, scores, and timing data. The key only proves that a specific physical gesture generated a specific token. Forging tokens additionally requires defeating: (1) nonce replay prevention, (2) timing bounds, (3) behavioral attestation hashes. The service-role boundary + Supabase Cloud's storage encryption at rest provide sufficient protection.

### Why No New Environment Variables
Previous proposal required `CAGE_ENCRYPTION_KEY`. Dropping the encryption layer eliminates this. Zero env var changes needed.

### Why the Existing Table Schema Is Better Than the Revised Proposal
The user's earlier revision proposed a simplified `cage_binding_tokens` with `token_hash` and `status` fields. The existing table stores the **full token decomposition** (response_hash, behavioral_attestation, nonce, signature separately). This is superior because:
1. Chain verification queries `signature` directly (not a hash-of-hash)
2. Forensic audit can inspect individual fields without client cooperation
3. Matches the `CAGEBindingToken` interface 1:1 — no lossy transformation

### Nonce Consumption Timing
`verifyBindingToken.ts` consumes the nonce as part of verification (line 77-82). This happens in the background task AFTER the answer is already recorded. If the nonce was somehow consumed earlier (e.g., duplicate submission), verification will flag `nonce_already_consumed` — a soft failure that doesn't block the quiz.

---

*This proposal does not modify any identity-locked components or Do-Not-Touch registry files. No new environment variables required. No client-side changes required.*
