<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# cage

## Purpose

The `cage` directory implements **CAGE**: Confidence-Aware Gesture Encoding (Patent Claims 3, 8). A cryptographic token system that binds answer selections to behavioral gesture signals (touch velocity, path deviation, pressure, jerk, pauses) collected during question answering. Used to detect and flag anomalous behavior (cheating, automated submission, outsourced answers) on the server-side for integrity verification and analytics.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | (Not present—exports from other files) |
| `generateBindingToken.ts` | CAGE token generation at gesture initiation (onPointerDown). Computes response hash, behavioral attestation, HMAC signature. |
| `verifyBindingToken.ts` | CAGE token verification: validate signature, check nonce freshness, compute trust level (verified/absent/timeout/dev_mode) |
| `nonceService.ts` | Nonce generation and server-side tracking: issue nonce per question, track expiry (prevents replay attacks) |
| `server-only-guard.ts` | Server-only assertion: prevents accidental client-side import of sensitive cryptographic code |
| `TRADE_SECRET.md` | (Confidential) Patent claim summary and technical rationale |

## For AI Agents

### Working In This Directory

**CAGE Binding Token Rules (Patent Claim 3):**
- Token generated at gesture initiation (onPointerDown), BEFORE the slider is moved.
- Captures frozen answer state: {questionId, selectedOptionId}.
- Computes one-way hash of answer state (SHA-256 for determinism).
- Records behavioral attestation: hash of first N gesture events (window_size=5 default).
- Signs token payload with session-derived HMAC-SHA256 key.
- Returns: {responseHash, behavioralAttestation, nonce, sequenceNumber, signature, previousTokenHash, generatedAt}.
- 150ms timeout budget—gracefully degrades to null token if crypto unavailable.

**Behavioral Attestation:**
- One-way hash of initial gesture events (velocity, path, pressure, jerk, pauses).
- Deterministic: same gesture sequence → same hash.
- Used to flag anomalous patterns (e.g., robotic straight line, burst submissions).

**Nonce Lifecycle:**
- Server issues nonce per question in quiz session.
- Client includes nonce in token.
- Server validates nonce in `verifyBindingToken()`: must exist, not expired, not already used.
- Prevents replay attacks (token from one question cannot be replayed on another).

**Trust Levels:**
- `verified`: Token signature valid, nonce fresh, gesture signals coherent.
- `absent`: Nonce or session key missing (pre-question setup failed).
- `timeout`: Crypto operation exceeded 150ms (graceful degradation).
- `dev_mode`: Web Crypto API unavailable (dev/test environment).
- `nonce_expired`: Nonce TTL exceeded.
- `offline_nonce`: Nonce issued during offline mode (less restrictive).

**Session Key Derivation:**
- Derived from session secret + user ID + question index (in a Server Action).
- Rotated per question for defense in depth.
- Never exposed to client except as hex string for HMAC signing.

### Common Patterns

**Generating Token (Client, onPointerDown):**
```typescript
import { generateBindingTokenSafe } from '@/lib/cage'

const answerState = { questionId: 'q-123', selectedOptionId: 'opt-b' }
const signalEvents = [] // populated as user moves slider
const { token, trustLevel } = await generateBindingTokenSafe(
  answerState,
  signalEvents,
  nonce,           // from server
  sequenceNumber,  // incremented per question
  sessionKey,      // from server
  previousTokenHash // from previous question
)

// Include token in quiz submission
```

**Verifying Token (Server, in submitQuizAnswer action):**
```typescript
import { verifyBindingToken } from '@/lib/cage'

const result = await verifyBindingToken(
  receivedToken,
  expectedAnswerState,
  sessionKey,
  questionNonce,
  sessionSecret
)

if (result.trustLevel === 'verified') {
  // Safe to accept submission
} else if (result.trustLevel === 'absent') {
  // Nonce was missing—CAGE setup failed, but allow submission
} else if (result.trustLevel !== 'dev_mode') {
  // Flag for admin review (timeout, anomalous behavior)
}
```

**Nonce Issuance (Server, in startQuizSession action):**
```typescript
import { generateNonce, issueNonce } from '@/lib/cage'

const nonce = generateNonce() // Cryptographically secure random
await issueNonce(sessionId, questionIndex, nonce, expiryMs = 60000)

// Send nonce to client with question
```

## Dependencies

### Internal

- **Types:** `CAGEBindingToken`, `GestureSignalEvent` from `@/types/patent`.
- **Server-only guard:** `server-only` package (prevents client-side imports).

### External

- **Web Crypto API:** SHA-256, HMAC-SHA256 (browser native, no npm dependency).
- **Crypto utilities:** `crypto.subtle` (modern browsers, Node.js ≥15).

---

**Last Updated:** 2026-04-02

**For patent details, see `.claude/docs/patents/cage.md` in the repository root. This is confidential IP.**
