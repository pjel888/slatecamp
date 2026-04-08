import 'server-only'
import type { CAGEBindingToken } from '@/types/patent'

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

    if (params.failureReasons?.length) {
      console.warn(`[CAGE] Token stored with failures: ${params.failureReasons.join(', ')}`)
    }
  } catch (err) {
    console.error('[CAGE] Failed to store token:', err)
    // Never block quiz flow
  }
}
