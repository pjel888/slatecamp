// src/lib/cage/nonceService.ts
// Patent Claims 18, 21 — Nonce lifecycle management
// SERVER-ONLY

import './server-only-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

const NONCE_TTL_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Issue a batch of nonces for a quiz session.
 * Called during startSession to pre-fetch one nonce per question.
 */
export async function issueNonceBatch(
  sessionId: string,
  questionIds: string[],
  userId: string,
): Promise<Map<string, { nonce: string; expiresAt: string }>> {
  const supabase = createAdminClient()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + NONCE_TTL_MS)

  const records = questionIds.map(questionId => ({
    nonce: randomUUID(),
    session_id: sessionId,
    question_id: questionId,
    user_id: userId,
    issued_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    consumed: false,
  }))

  await supabase.from('issued_nonces').insert(records)

  const nonceMap = new Map<string, { nonce: string; expiresAt: string }>()
  for (const record of records) {
    nonceMap.set(record.question_id, {
      nonce: record.nonce,
      expiresAt: record.expires_at,
    })
  }

  return nonceMap
}

/**
 * Validate a nonce without consuming it (read-only check).
 */
export async function validateNonce(
  nonce: string,
  sessionId: string,
): Promise<{ valid: boolean; reason?: string }> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('issued_nonces')
    .select('consumed, expires_at')
    .eq('nonce', nonce)
    .eq('session_id', sessionId)
    .single()

  if (!data) return { valid: false, reason: 'not_found' }
  if (data.consumed) return { valid: false, reason: 'already_consumed' }
  if (new Date(data.expires_at) < new Date()) return { valid: false, reason: 'expired' }

  return { valid: true }
}

/**
 * Consume a nonce (mark as used). Atomic — uses optimistic lock.
 */
export async function consumeNonce(nonce: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('issued_nonces')
    .update({ consumed: true, consumed_at: new Date().toISOString() })
    .eq('nonce', nonce)
    .eq('consumed', false)
    .select('nonce_id')
    .single()

  return !!data && !error
}
