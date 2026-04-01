// src/lib/submission/stateMachine.ts
// Patent Claims 1(h-j), 17 — Server-enforced submission state machine
// SERVER-ONLY

import './server-only-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  SubmissionFSMState,
  SubmissionStateTransition,
  MultiFactorValidationResult,
  CAGEBindingToken,
  CAGETrustLevel,
  IntegrityStatus,
} from '@/types/patent'
import type { QuizMode } from '@/types/quiz-config'
import { verifyBindingToken } from '@/lib/cage/verifyBindingToken'
import { isWithinTemporalBounds } from '@/lib/quiz/temporal-bounds'

// ─── State Machine (Claim 17) ────────────────────────────────────────────────

/**
 * Validate allowed state transitions.
 * active → confirming → submitted (success)
 * confirming → active (failure with metadata)
 */
const ALLOWED_TRANSITIONS: Record<SubmissionFSMState, SubmissionFSMState[]> = {
  active: ['confirming'],
  confirming: ['submitted', 'rejected', 'active'],
  submitted: [],    // Terminal state
  rejected: [],     // Terminal state
}

function isValidTransition(from: SubmissionFSMState, to: SubmissionFSMState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

// ─── Log Transition (immutable audit trail) ──────────────────────────────────

async function logTransition(
  interactionId: string,
  transition: SubmissionStateTransition,
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('submission_state_log').insert({
    interaction_id: interactionId,
    from_state: transition.fromState,
    to_state: transition.toState,
    validation_metadata: transition.validationMetadata ?? null,
    created_at: transition.timestamp,
  })
}

// ─── Multi-Factor Validation (Claim 1(h)) ────────────────────────────────────

interface ValidationInput {
  interactionId: string
  sessionId: string
  questionId: string
  selectedOptionId: string
  cageToken: CAGEBindingToken | null
  sessionKey: string
  gestureDurationMs: number
  mode: QuizMode
}

/**
 * Run synchronous multi-factor validation checks.
 * Per Q2 decision: only deterministic crypto checks run here.
 * Behavioral analysis runs async in post-interaction hooks.
 *
 * Checks (all <5ms total):
 * 1. CAGE hash verification
 * 2. Temporal policy (Claim 15/19)
 * 3. Assessment completeness
 */
export async function validateSubmission(
  input: ValidationInput,
): Promise<MultiFactorValidationResult> {
  const failureReasons: string[] = []

  // ── Check 1: CAGE verification (Claim 3) ────────────────────────────────
  let cageTrustLevel: CAGETrustLevel = 'absent'

  if (input.cageToken) {
    const cageResult = await verifyBindingToken(
      input.cageToken,
      { questionId: input.questionId, selectedOptionId: input.selectedOptionId },
      input.sessionKey,
      input.sessionId,
    )
    cageTrustLevel = cageResult.trustLevel

    if (!cageResult.valid) {
      // Hash mismatch is a HARD failure — answer was tampered
      if (cageResult.failureReasons.includes('response_hash_mismatch')) {
        failureReasons.push('cage_hash_mismatch')
      }
      if (cageResult.failureReasons.includes('signature_invalid')) {
        failureReasons.push('cage_signature_invalid')
      }
      // Nonce issues are softer — log but don't necessarily reject
      if (cageResult.failureReasons.includes('nonce_already_consumed')) {
        failureReasons.push('nonce_replay_detected')
      }
    }
  }
  // Absent CAGE is not a failure (per Q1 decision) — just tagged

  // ── Check 2: Temporal policy (Claims 15, 19) ───────────────────────────
  const temporalCheck = isWithinTemporalBounds(input.gestureDurationMs, input.mode)
  // Temporal violations are signals, not hard rejections (per Q5 decision)

  // ── Check 3: Session validity (Claim 18) ────────────────────────────────
  // Session token check is already done by the existing submitAnswer action
  // (validates session ownership and in_progress status)
  const sessionTokenPassed = true // Delegated to existing middleware

  // ── Check 4: Assessment completeness ────────────────────────────────────
  // Verified by existing submitAnswer: selectedOptionId is required
  const completenessPassed = !!input.selectedOptionId

  // ── Assemble result ─────────────────────────────────────────────────────
  return {
    valid: failureReasons.length === 0,
    checks: {
      cageVerification: { passed: failureReasons.length === 0, trustLevel: cageTrustLevel },
      nonceValidity: {
        passed: !failureReasons.includes('nonce_replay_detected'),
        reason: failureReasons.find((r) => r.includes('nonce')),
      },
      sessionToken: { passed: sessionTokenPassed, consumed: true },
      temporalPolicy: {
        passed: temporalCheck.withinBounds,
        durationMs: input.gestureDurationMs,
        withinBounds: temporalCheck.withinBounds,
      },
      assessmentCompleteness: { passed: completenessPassed },
    },
    failureReasons,
  }
}

// ─── State Machine Orchestrator ──────────────────────────────────────────────

/**
 * Process a submission through the server-enforced state machine.
 *
 * Flow (per Q2 Hybrid decision):
 * 1. Transition: active → confirming
 * 2. Run synchronous validation (CAGE + temporal + session)
 * 3. If valid: transition confirming → submitted
 * 4. If hard failure: transition confirming → rejected
 * 5. Log all transitions to immutable audit trail
 *
 * Returns integrity status for the submission record.
 */
export async function processSubmission(
  input: ValidationInput,
): Promise<{
  accepted: boolean
  integrityStatus: IntegrityStatus
  cageTrustLevel: CAGETrustLevel
  validationResult: MultiFactorValidationResult
}> {
  const now = new Date().toISOString()

  // Step 1: active → confirming
  await logTransition(input.interactionId, {
    fromState: 'active',
    toState: 'confirming',
    timestamp: now,
  })

  // Step 2: Run validation
  const validationResult = await validateSubmission(input)

  // Step 3/4: Transition based on result
  if (validationResult.valid) {
    await logTransition(input.interactionId, {
      fromState: 'confirming',
      toState: 'submitted',
      timestamp: now,
      validationMetadata: { checks: validationResult.checks },
    })

    return {
      accepted: true,
      integrityStatus: 'pending', // Updated async by behavioral analysis
      cageTrustLevel: validationResult.checks.cageVerification.trustLevel,
      validationResult,
    }
  }

  // Hard failure — log and reject
  await logTransition(input.interactionId, {
    fromState: 'confirming',
    toState: 'rejected',
    timestamp: now,
    validationMetadata: {
      failureReasons: validationResult.failureReasons,
      checks: validationResult.checks,
    },
  })

  return {
    accepted: false,
    integrityStatus: 'flagged',
    cageTrustLevel: validationResult.checks.cageVerification.trustLevel,
    validationResult,
  }
}
