// CONFIDENTIAL — Trade Secret. Patent Claim 3.

import type { CAGEBindingToken, GestureSignalEvent } from '@/types/patent'

/**
 * Canonical JSON serialization for deterministic hashing.
 * Sorted keys, no whitespace, UTF-8.
 */
function canonicalize(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

/**
 * SHA-256 hash via Web Crypto API.
 * Returns hex string.
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * HMAC-SHA256 signing via Web Crypto API.
 */
async function hmacSign(data: string, keyHex: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyBuffer = new Uint8Array(keyHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Compute behavioral attestation from the first N signal events.
 * One-way hash of the initial signal window.
 */
async function computeBehavioralAttestation(
  events: GestureSignalEvent[],
  windowSize: number = 5,
): Promise<string> {
  const window = events.slice(0, windowSize)
  const serialized = canonicalize({ events: window } as Record<string, unknown>)
  return sha256(serialized)
}

/**
 * Generate a CAGE binding token at gesture initiation.
 *
 * Called when the user's finger touches the slide handle (onPointerDown).
 * Must complete within 150ms budget.
 *
 * @param answerState - Frozen answer snapshot: { questionId, selectedOptionId }
 * @param signalEvents - First N gesture events captured so far
 * @param nonce - Server-issued nonce for this question
 * @param sequenceNumber - Monotonic counter within the session
 * @param sessionKey - Session-derived HMAC signing key (hex)
 * @param previousTokenHash - Hash of previous CAGE token (null for first question)
 */
export async function generateBindingToken(
  answerState: { questionId: string; selectedOptionId: string },
  signalEvents: GestureSignalEvent[],
  nonce: string,
  sequenceNumber: number,
  sessionKey: string,
  previousTokenHash: string | null,
): Promise<CAGEBindingToken> {
  // 1. Hash frozen answer state
  const responseHash = await sha256(canonicalize(answerState as unknown as Record<string, unknown>))

  // 2. Behavioral attestation from initial signal window
  const behavioralAttestation = await computeBehavioralAttestation(signalEvents)

  // 3. Assemble token payload
  const tokenPayload = canonicalize({
    responseHash,
    behavioralAttestation,
    nonce,
    sequenceNumber,
    previousTokenHash: previousTokenHash ?? '',
  } as Record<string, unknown>)

  // 4. Sign with session key
  const signature = await hmacSign(tokenPayload, sessionKey)

  return {
    responseHash,
    behavioralAttestation,
    nonce,
    sequenceNumber,
    signature,
    previousTokenHash,
    generatedAt: performance.now(),
  }
}

/**
 * Safe wrapper that respects the 150ms budget and graceful degradation.
 * Returns null on timeout or error (submission proceeds without CAGE per Q1 decision).
 */
export async function generateBindingTokenSafe(
  answerState: { questionId: string; selectedOptionId: string },
  signalEvents: GestureSignalEvent[],
  nonce: string | null,
  sequenceNumber: number,
  sessionKey: string | null,
  previousTokenHash: string | null,
): Promise<{ token: CAGEBindingToken | null; trustLevel: 'verified' | 'absent' | 'timeout' | 'dev_mode' | 'nonce_expired' | 'offline_nonce' }> {
  // Check if Web Crypto is available
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return { token: null, trustLevel: 'dev_mode' }
  }

  // Check nonce availability
  if (!nonce) {
    return { token: null, trustLevel: 'absent' }
  }

  if (!sessionKey) {
    return { token: null, trustLevel: 'absent' }
  }

  try {
    const result = await Promise.race([
      generateBindingToken(answerState, signalEvents, nonce, sequenceNumber, sessionKey, previousTokenHash),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('CAGE_TIMEOUT')), 150)),
    ])

    if (!result) {
      return { token: null, trustLevel: 'timeout' }
    }

    return { token: result as CAGEBindingToken, trustLevel: 'verified' }
  } catch (error) {
    if (error instanceof Error && error.message === 'CAGE_TIMEOUT') {
      return { token: null, trustLevel: 'timeout' }
    }
    return { token: null, trustLevel: 'absent' }
  }
}
