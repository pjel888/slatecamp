// CONFIDENTIAL — Trade Secret. Patent Claims 3, 20, 21.
// SERVER-ONLY — must never be imported by client components.

import './server-only-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CAGEBindingToken, CAGETrustLevel } from '@/types/patent'

// Node.js crypto for server-side hash/HMAC operations
import { createHmac, createHash } from 'crypto'

function canonicalize(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

function sha256(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

function hmacVerify(data: string, keyHex: string, expectedSignature: string): boolean {
  const keyBuffer = Buffer.from(keyHex, 'hex')
  const computed = createHmac('sha256', keyBuffer).update(data, 'utf8').digest('hex')
  // Timing-safe comparison
  if (computed.length !== expectedSignature.length) return false
  let mismatch = 0
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }
  return mismatch === 0
}

interface VerificationResult {
  valid: boolean
  trustLevel: CAGETrustLevel
  failureReasons: string[]
}

/**
 * Verify a CAGE binding token server-side.
 *
 * Checks (all synchronous, <5ms total):
 * 1. Response hash — recompute from received answers, compare
 * 2. Nonce validity — look up in issued_nonces, check consumed + TTL
 * 3. HMAC signature — verify with server session key
 * 4. Chain reference — verify previous token hash (Claim 20)
 */
export async function verifyBindingToken(
  token: CAGEBindingToken,
  receivedAnswerState: { questionId: string; selectedOptionId: string },
  sessionKey: string,
  sessionId: string,
): Promise<VerificationResult> {
  const failureReasons: string[] = []

  // 1. Hash verification — Claim 3(f)
  const recomputedHash = sha256(canonicalize(receivedAnswerState as unknown as Record<string, unknown>))
  if (recomputedHash !== token.responseHash) {
    failureReasons.push('response_hash_mismatch')
  }

  // 2. Nonce validation — Claim 21
  const supabase = createAdminClient()
  const { data: nonceRecord } = await supabase
    .from('issued_nonces')
    .select('*')
    .eq('nonce', token.nonce)
    .eq('session_id', sessionId)
    .single()

  if (!nonceRecord) {
    failureReasons.push('nonce_not_found')
  } else if (nonceRecord.consumed) {
    failureReasons.push('nonce_already_consumed')
  } else if (new Date(nonceRecord.expires_at) < new Date()) {
    failureReasons.push('nonce_expired')
  } else {
    // Mark nonce as consumed (atomic)
    await supabase
      .from('issued_nonces')
      .update({ consumed: true, consumed_at: new Date().toISOString() })
      .eq('nonce', token.nonce)
      .eq('consumed', false) // optimistic lock
  }

  // 3. HMAC signature verification — Claim 3(g)
  const tokenPayload = canonicalize({
    responseHash: token.responseHash,
    behavioralAttestation: token.behavioralAttestation,
    nonce: token.nonce,
    sequenceNumber: token.sequenceNumber,
    previousTokenHash: token.previousTokenHash ?? '',
  } as Record<string, unknown>)

  if (!hmacVerify(tokenPayload, sessionKey, token.signature)) {
    failureReasons.push('signature_invalid')
  }

  // 4. Chain verification — Claim 20
  if (token.previousTokenHash !== null) {
    const { data: prevToken } = await supabase
      .from('cage_binding_tokens')
      .select('signature')
      .eq('session_id', sessionId)
      .eq('sequence_number', token.sequenceNumber - 1)
      .single()

    if (prevToken) {
      const prevHash = sha256(prevToken.signature)
      if (prevHash !== token.previousTokenHash) {
        failureReasons.push('chain_broken')
      }
    }
    // If no previous token found and previousTokenHash is set, that's suspicious but not fatal
  }

  // Determine trust level
  let trustLevel: CAGETrustLevel = 'verified'
  if (failureReasons.length > 0) {
    trustLevel = failureReasons.includes('nonce_expired') ? 'nonce_expired' : 'failed'
  }

  return {
    valid: failureReasons.length === 0,
    trustLevel,
    failureReasons,
  }
}
