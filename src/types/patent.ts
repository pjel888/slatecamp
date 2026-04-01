// ─── Patent Types: Behavioral Signal Capture & Cognitive State Inference ─────
// CONFIDENTIAL — Trade Secret. IPOPHL Filing Reference.
// These types support Claims 1-28 of the patent specification.

// ─── Signal Capture (Claims 1(b), 6, 7) ─────────────────────────────────────

export interface GestureSignalEvent {
  /** Sub-millisecond timestamp via performance.now() */
  timestamp: number
  /** Event type */
  type: 'start' | 'move' | 'end' | 'cancel'
  /** Pointer X coordinate (normalized to interaction region) */
  x: number
  /** Pointer Y coordinate (normalized to interaction region) */
  y: number
  /** Touch contact width in px (Touch API) — Claim 6 */
  contactWidth?: number
  /** Touch contact height in px (Touch API) — Claim 6 */
  contactHeight?: number
  /** Derived pressure from contact area — Claim 6 */
  pressure?: number
  /** Accelerometer reading concurrent with gesture — Claim 7 */
  accelerometer?: { x: number; y: number; z: number }
  /** Gyroscope reading concurrent with gesture — Claim 7 */
  gyroscope?: { alpha: number; beta: number; gamma: number }
}

// ─── CAGE Protocol (Claims 3, 20, 21) ────────────────────────────────────────

export interface CAGEBindingToken {
  /** SHA-256 hash of frozen answer state at gesture initiation */
  responseHash: string
  /** One-way hash of first N signal events (behavioral attestation) */
  behavioralAttestation: string
  /** Server-issued nonce for replay prevention */
  nonce: string
  /** Monotonic sequence number within session */
  sequenceNumber: number
  /** HMAC-SHA256 signature of the assembled token */
  signature: string
  /** Hash of previous binding token (chain link) — Claim 20 */
  previousTokenHash: string | null
  /** Timestamp of token generation */
  generatedAt: number
}

export type CAGETrustLevel =
  | 'verified'       // Token present and all checks pass
  | 'absent'         // No token (old client, failed generation)
  | 'failed'         // Token present but verification failed (tampering detected)
  | 'timeout'        // Generation exceeded 150ms budget
  | 'nonce_expired'  // Nonce TTL exceeded
  | 'offline_nonce'  // Client-generated nonce (offline submission)
  | 'dev_mode'       // Development environment, Web Crypto unavailable

// ─── Nonce Management (Claims 18, 21) ────────────────────────────────────────

export interface IssuedNonce {
  nonce: string
  questionId: string
  sessionId: string
  userId: string
  issuedAt: string    // ISO timestamp
  expiresAt: string   // ISO timestamp
  consumed: boolean
  consumedAt: string | null
}

// ─── Submission Payload (Claims 1(c-d)) ──────────────────────────────────────

export interface PatentSubmissionPayload {
  /** Existing quiz answer fields */
  sessionId: string
  questionId: string
  selectedOptionId: string
  confidenceLevel?: number
  timeSpentMs: number

  /** Patent extension fields */
  /** Raw gesture signal events — Claim 1(b) */
  signalTrace: GestureSignalEvent[]
  /** CAGE binding token — Claim 3 */
  cageToken: CAGEBindingToken | null
  /** Device fingerprint — Claim 1(d) */
  deviceFingerprint: string
  /** Gesture duration in ms */
  gestureDurationMs: number
  /** Whether device sensors were available */
  sensorsAvailable: boolean
}

// ─── Feature Extraction (Claims 1(f), 4, 5, 8, 9, 12) ──────────────────────

export interface BehavioralFeatureVector {
  /** Total displacement magnitude in interaction region — Claim 1(f)(i) */
  interactionPathMetric: number
  /** Duration of continuous confirmation interaction — Claim 1(f)(ii) */
  temporalMetric: number
  /** Path/time ratio; threshold-based deliberate vs accidental — Claim 4 */
  velocityProfile: {
    mean: number
    max: number
    stdDev: number
    isDeliberate: boolean
  }
  /** Deviation from straight-line trajectory — Claim 5(i) */
  pathDeviation: number
  /** Time spent in sub-regions of interaction area — Claim 5(ii) */
  dwellTimes: { zone: string; ms: number }[]
  /** Count of direction changes — Claim 5(iii) */
  reversalCount: number
  /** Touch force/area variation — Claim 6 */
  pressureProfile: {
    mean: number
    variance: number
    available: boolean
  }
  /** Rate of change of acceleration (motor smoothness) — Claim 8 */
  jerkMetric: number
  /** Micro-pauses, velocity bursts, oscillations — Claim 9 */
  micropatterns: {
    pauseCount: number
    burstCount: number
    oscillationCount: number
  }
  /** Assessment context for multi-signal fusion — Claim 12 */
  assessmentContext: {
    timeOnTaskMs: number
    answerChangeCount: number
    itemDifficulty: number
  }
}

// ─── Cognitive State Inference (Claims 1(g), 11) ─────────────────────────────

export type ConfidenceClassification = 'high' | 'moderate' | 'low' | 'guessing'

export interface CognitiveStateIndicators {
  /** Discrete confidence level — Claim 11 */
  decisionConfidence: ConfidenceClassification
  /** 0-1 continuous hesitancy measure */
  hesitancyIndex: number
  /** 0-1 proxy for cognitive load from behavioral signals */
  cognitiveLoadProxy: number
  /** 0-1 likelihood of anomalous behavior pattern */
  anomalousBehaviorLikelihood: number
  /** 0-1 consistency with user's historical profile — Claim 13 */
  identityConsistencyScore: number | null
}

// ─── Submission State Machine (Claims 1(h-j), 17) ───────────────────────────

export type SubmissionFSMState = 'active' | 'confirming' | 'submitted' | 'rejected'

export interface SubmissionStateTransition {
  fromState: SubmissionFSMState
  toState: SubmissionFSMState
  timestamp: string
  validationMetadata?: Record<string, unknown>
}

export type IntegrityStatus = 'pending' | 'verified' | 'flagged' | 'under_review'

// ─── Validation Result (Claim 1(h)) ─────────────────────────────────────────

export interface MultiFactorValidationResult {
  /** Overall pass/fail */
  valid: boolean
  /** Individual check results */
  checks: {
    cageVerification: { passed: boolean; trustLevel: CAGETrustLevel }
    nonceValidity: { passed: boolean; reason?: string }
    sessionToken: { passed: boolean; consumed: boolean }
    temporalPolicy: { passed: boolean; durationMs: number; withinBounds: boolean }
    assessmentCompleteness: { passed: boolean }
  }
  /** Failure reasons (empty if valid) */
  failureReasons: string[]
}

// ─── Temporal Bounds Config (Claim 15) ───────────────────────────────────────

export interface TemporalBounds {
  minMs: number
  maxMs: number
}

// ─── Adaptive Output (Claims 22-25) ──────────────────────────────────────────

export interface CoachObservation {
  /** Natural language insight for the student */
  message: string
  /** Topic recommendations based on confidence × correctness */
  recommendations: { topicName: string; action: 'revisit' | 'reinforce' | 'celebrate' }[]
  /** Whether the signal quality was sufficient to surface this insight */
  signalStrength: 'strong' | 'moderate' | 'insufficient'
}

export interface SessionBehavioralSummary {
  /** Per-item confidence classification */
  itemConfidenceLevels: Record<string, ConfidenceClassification>
  /** Session-level metrics */
  sessionConsistencyScore: number
  sessionEngagementScore: number
  /** Integrity flag counts */
  integrityFlags: {
    cageFailures: number
    temporalAnomalies: number
    behavioralAnomalies: number
  }
}
