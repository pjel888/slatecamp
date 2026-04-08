# CAGE Session Key Server-Side Storage — Proposal

**Date:** 2026-04-08
**Status:** Proposal (not yet approved for implementation)
**Prerequisite for:** REL-02 (CAGE server-side verification wiring in submit-answer.ts)
**Related:** `.ai/plans/drill-optimization-implementation-plan-2026-04-08.md` Section 07, REL-02

---

## Problem

The CAGE system generates a 32-byte session key server-side (`start-session.ts:43`), returns it to the client, and the client uses it as an HMAC-SHA256 signing key for binding tokens. However, `verifyBindingToken.ts:46` needs the same key to verify signatures server-side — and the key is never stored server-side. It only lives in the client's Zustand store (memory, not persisted).

**Result:** CAGE tokens are generated and sent to the server but never verified. The chain-of-evidence integrity (Patent Claims 3(g), 20) is unenforceable.

---

## Current Flow (Broken)

```
start-session.ts → randomBytes(32) → sessionKey
                 ↓                     ↓
            (discarded)           returned to client
                                      ↓
                              useQuizStore.sessionKey
                                      ↓
                        generateBindingToken(... sessionKey ...)
                                      ↓
                              cageToken.signature (HMAC)
                                      ↓
                           submitAnswer({ cageToken })
                                      ↓
                    verifyBindingToken(token, ..., sessionKey???)
                                                   ↑
                                            NOT AVAILABLE
```

---

## Proposed Fix

### Option A: Store Encrypted Key in `quiz_sessions.cage_session_key` (Recommended)

**Approach:** Add an encrypted column to `quiz_sessions`. Encrypt the key at rest using a server-side encryption key from environment variables. Decrypt on demand during verification.

**Migration:**
```sql
ALTER TABLE quiz_sessions
ADD COLUMN IF NOT EXISTS cage_session_key TEXT;

COMMENT ON COLUMN quiz_sessions.cage_session_key IS
  'AES-256-GCM encrypted CAGE session key. Decrypt with CAGE_ENCRYPTION_KEY env var. Null if CAGE not available.';
```

**Code Changes:**

| File | Change |
|------|--------|
| `src/lib/cage/keyEncryption.ts` | **NEW** — `encryptSessionKey(key, envKey)` and `decryptSessionKey(ciphertext, envKey)` using AES-256-GCM |
| `src/lib/actions/quiz-v2/start-session.ts` | After generating `sessionKey`, encrypt and store in `quiz_sessions.cage_session_key` during the session insert |
| `src/lib/actions/quiz-v2/submit-answer.ts` | In `runPostSubmitWork`, fetch `cage_session_key` from session, decrypt, pass to `verifyBindingToken` |
| `.env.local` | Add `CAGE_ENCRYPTION_KEY` (32-byte hex, generated once per environment) |

**Pros:**
- Key stored alongside session (natural lifecycle — deleted when session deleted)
- Encrypted at rest — compromise of DB dump doesn't leak signing keys
- Minimal schema change (1 column)
- No new tables

**Cons:**
- Requires environment variable management (`CAGE_ENCRYPTION_KEY`)
- If encryption key is lost, all stored session keys become unrecoverable (but CAGE is non-blocking, so this just means verification becomes unavailable — quiz still works)

### Option B: Dedicated `cage_session_keys` Table

**Approach:** Separate table with server-side key storage, indexed by session_id.

```sql
CREATE TABLE cage_session_keys (
  session_id UUID PRIMARY KEY REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: service role only (no client access)
ALTER TABLE cage_session_keys ENABLE ROW LEVEL SECURITY;
-- No policies = no client access (only service role can read/write)
```

**Pros:**
- Clean separation of concerns
- RLS naturally prevents any client access
- Can be independently audited/rotated

**Cons:**
- Extra table and join for verification
- Extra insert during session creation (adds latency)
- Overkill for a single column

### Option C: Store Key Hash + Use HKDF Derivation

**Approach:** Don't store the raw key. Instead, derive it deterministically from `session_id + server_secret` using HKDF. Both client and server can independently derive the same key.

**Pros:**
- No storage needed
- Deterministic — can always re-derive

**Cons:**
- Client needs the server secret (security regression)
- Changes the key generation model (currently random, this makes it deterministic)
- Not compatible with the current `randomBytes` approach without changing the client

---

## Recommendation: Option A

Option A is the simplest, most secure, and requires the fewest changes. The `quiz_sessions` table already stores all session state — adding an encrypted key column is natural.

---

## Implementation Estimate

| Task | Time |
|------|------|
| `keyEncryption.ts` utility (encrypt/decrypt AES-256-GCM) | 1h |
| Migration: add `cage_session_key` column | 15min |
| `start-session.ts`: encrypt + store key during insert | 30min |
| `submit-answer.ts`: fetch + decrypt key, call `verifyBindingToken` in background | 1h |
| Environment variable setup + documentation | 30min |
| Testing (token generation → submission → verification round-trip) | 1h |
| **Total** | **4-5h** |

---

## Verification Protocol

1. Start a Camp session → submit an answer → check server logs for `[CAGE] Verification: verified` 
2. Tamper with a CAGE token client-side (modify `responseHash`) → submit → verify server logs show `[CAGE] Verification: failed, reasons: [response_hash_mismatch, signature_invalid]`
3. Submit without CAGE token → verify submission succeeds (graceful degradation preserved)
4. Check DB: `quiz_sessions.cage_session_key` is non-null and not plaintext (encrypted ciphertext)
5. Rotate `CAGE_ENCRYPTION_KEY` → verify new sessions work, old session keys become unverifiable (acceptable — CAGE is non-blocking)

---

## Dependencies

- `CAGE_ENCRYPTION_KEY` must be provisioned in all environments (dev, staging, prod)
- The `cage_binding_tokens` table referenced in `verifyBindingToken.ts:100` for chain verification also needs a CREATE TABLE migration (currently missing from the codebase)
- The `issued_nonces` table exists and is functional

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Encryption key loss | Low | Medium (verification disabled, quiz unaffected) | Document key in secrets manager |
| Performance overhead of decrypt per submission | Very Low | None (AES-256-GCM decryption is <1ms) | N/A |
| Breaking existing CAGE token generation | None | N/A | Server-side storage is additive — client flow unchanged |
| RLS policy allowing key leakage | Low | High | Column is only accessed via service client, never via user client |

---

## Open Questions

1. **Should verified tokens be stored?** `verifyBindingToken.ts` references a `cage_binding_tokens` table for chain verification — this table doesn't exist yet. Should it be created as part of this work?
2. **Key rotation policy:** Should session keys be rotatable? (Current answer: no — each key is session-scoped and ephemeral)
3. **Audit logging:** Should verification results be stored for compliance audit? (e.g., `cage_verification_log` table)

---

*This proposal does not modify any identity-locked components or Do-Not-Touch registry files.*
