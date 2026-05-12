# SlateCamp IP Implementation Plan: Behavioral Signal Capture & Cognitive State Inference System

**Document Classification:** CONFIDENTIAL — Trade Secret
**Version:** 1.0
**Date:** April 2026
**Audience:** Founding Engineering Team Only

---

## 1. Extracted IP Claims and Novel Elements

### 1.1 Independent Claims Summary

| Claim ID | Title | Core Novelty | Patent Strength |
|-----------|-------|-------------|-----------------|
| **Claim 1** | Computer-Implemented Method (Broadest) | End-to-end pipeline: instrumented interaction region → signal capture → behavioral feature extraction → cognitive state inference → multi-factor validation → server-enforced state machine | Broadest protection — covers any implementation of this method |
| **Claim 2** | System Claim | Hardware/software system embodiment: processor + memory + instrumented interaction layer + feature extraction pipeline + behavioral inference model + CAGE verification + submission state machine | Protects the deployed system as a product |
| **Claim 3** | CAGE Method | Cryptographic Answer-Gesture Binding: response hash + behavioral attestation + server-issued nonce + sequence number → signed binding token → server-side verification | **Strongest novel element — zero prior art identified** |

### 1.2 Dependent Claims Grouped by Technical Subsystem

| Subsystem | Claims | Key Technical Elements |
|-----------|--------|----------------------|
| **Signal Capture** | 4–8 | Velocity profiles, path deviation, dwell-time, reversal metrics, touch pressure/area, accelerometer/gyroscope correlation, jerk metric |
| **Feature Extraction & Inference** | 9–13 | Sliding window micropatterns, ML model training with labeled data, discrete confidence classification, multi-signal fusion (gesture + assessment context), individual behavioral profile comparison |
| **Submission Control Embodiments** | 14–16 | Start-zone → completion-zone traversal, endpoint + temporal validation, configurable modalities (lateral swipe, multi-point hold, draw-shape) |
| **State Machine & Security** | 17–21 | Active → confirming → submitted state transitions, single-use session tokens, temporal policy enforcement, CAGE hash chain (Claim 20), nonce TTL + active-state gating (Claim 21) |
| **Adaptive Output** | 22–25 | Scoring weight modification, adaptive item selection, disengagement detection + intervention, aggregate session behavioral summary, population-level behavioral models |
| **Implementation** | 26–28 | React/Next.js client, Supabase/PostgreSQL backend, mobile touchscreen embodiment, real-time streaming during confirmation interaction |

### 1.3 Six Confirmed White Spaces (Novelty Anchors)

1. **Submission gesture as cognitive signal source** — No prior art in educational assessment
2. **CAGE (Cryptographic Answer-Gesture Binding)** — Zero prior art across all domains
3. **Deliberate (not passive) interaction as primary behavioral signal** — Inverts the entire behavioral biometrics field
4. **Educational integrity via internal interaction analysis** — All proctoring patents use external surveillance
5. **Submission state machine + behavioral attestation** — No combined prior art
6. **Population-level behavioral modeling for education** — Novel modeling paradigm vs. BioCatch individual profiles

---

## 2. IP Claim → Technical Implementation Mapping

### 2.1 Client-Side Architecture (React / Next.js / Zustand)

| IP Claim | Technical Implementation Requirement | Architecture Layer | Confidentiality Level |
|----------|--------------------------------------|-------------------|----------------------|
| Claim 1(a) — Instrumented interaction region | `<SubmitGesture />` React component: renders a swipe/drag confirmation control with high-frequency event listeners (`onPointerMove`, `onTouchMove`, `onPointerDown/Up`) | Frontend component (`/components/assessment/SubmitGesture.tsx`) | **Trade Secret** — interaction region design, event sampling rate, normalization logic |
| Claim 1(b) — Continuous signal capture | Event listener pipeline: captures `{eventType, x, y, timestamp, touchArea?, pressure?, deviceOrientation?}` at sub-millisecond resolution via `performance.now()` | Frontend hook (`/hooks/useGestureCapture.ts`) | **Trade Secret** — sampling strategy, buffer management, event schema |
| Claim 1(c) — Submission payload assembly | Zustand store aggregates: interaction signal array + assessment response snapshot + assessment state (item completion, timestamps) + device fingerprint + session token | Frontend store (`/stores/submissionStore.ts`) | **Patent-Protected** — payload structure per Claim 1(c) |
| Claim 3(a–e) — CAGE token generation (client) | At gesture initiation: SHA-256 hash of frozen answer state → behavioral attestation from first N events → combine with server-issued nonce + sequence number → HMAC-sign with session-derived key | Frontend module (`/lib/cage/generateBindingToken.ts`) | **HIGHEST CONFIDENTIALITY** — CAGE is the strongest novel element |
| Claim 6 — Touch pressure/area capture | `Touch.radiusX`, `Touch.radiusY`, `Touch.force` extraction from native TouchEvent API | Inside `useGestureCapture.ts` | Patent-Protected |
| Claim 7 — Accelerometer/gyroscope capture | `DeviceMotionEvent` and `DeviceOrientationEvent` listeners, concurrent with gesture capture | Frontend hook (`/hooks/useDeviceSensors.ts`) | Patent-Protected |
| Claim 14 — Start-zone → completion-zone traversal | `SubmitGesture` component defines spatial zones; gesture must traverse from `startZone` to `completionZone`; `endpointStatus` computed on pointer-up | Frontend component logic | Patent-Protected |
| Claim 16 — Configurable interaction modalities | `SubmitGesture` accepts a `modality` prop: `'lateral-swipe'`, `'touch-hold'`, `'draw-shape'` — each generates compatible signal data | Component prop interface | Patent-Protected |
| Claim 23 — Disengagement intervention | Client receives server-pushed `disengagement_signal` → renders intervention prompt (e.g., "Still there? Take a breath and refocus.") | Frontend component (`/components/assessment/EngagementPrompt.tsx`) | Patent-Protected |
| Claim 26 — React/Next.js implementation | Entire client is Next.js App Router; gesture component captures high-frequency events; normalized data streams to backend API | Overall frontend architecture | Patent-Protected (implementation claim) |
| Claim 28 — Real-time streaming | WebSocket or SSE connection opened at gesture initiation; interaction events streamed to backend before gesture completes | Frontend streaming module (`/lib/gestureStream.ts`) | Patent-Protected |

### 2.2 Server-Side Architecture (Supabase / PostgreSQL / Edge Functions)

| IP Claim | Technical Implementation Requirement | Architecture Layer | Confidentiality Level |
|----------|--------------------------------------|-------------------|----------------------|
| Claim 1(e–f) — Receive payload + extract features | API route receives submission payload; behavioral signal processing module normalizes raw events → computes feature vectors | API route (`/app/api/assessment/submit/route.ts`) + Feature extraction service | **Trade Secret** — feature extraction formulas, normalization algorithms |
| Claim 1(f)(i–ii) — Path metric + temporal metric | `interactionPathMetric`: total displacement magnitude in interaction region; `temporalMetric`: duration from first event to last | Feature extraction pipeline | **Trade Secret** — exact computation methods |
| Claim 1(g) — Cognitive state inference | Trained ML model receives feature vector → outputs `decisionConfidence`, `hesitancyIndex`, `cognitiveLoadProxy`, `anomalousBehaviorLikelihood` | Inference service (initially rule-based, evolving to ML) | **HIGHEST CONFIDENTIALITY** — model architecture, weights, training data, thresholds |
| Claim 1(h) — Multi-factor validation | Validation module checks: (i) behavioral state indicators pass thresholds, (ii) device ID matches registered records, (iii) session token valid + unconsumed, (iv) assessment completeness verified | Submission validation service | Patent-Protected |
| Claim 1(i–j) — State machine transition | Server-enforced FSM: `active` → `confirming` → `submitted` (success) OR `confirming` → `active` (failure with metadata) | State machine module (`/lib/submission/stateMachine.ts`) | Patent-Protected |
| Claim 3(f–h) — CAGE verification (server) | Recompute SHA-256 of received answers → compare to binding token hash; validate nonce against issued-nonce table (mark consumed); verify HMAC signature | CAGE verification service (`/lib/cage/verifyBindingToken.ts`) | **HIGHEST CONFIDENTIALITY** |
| Claim 4 — Velocity profile extraction | Compute velocity from path/time; flag anomalous if velocity outside deliberate-interaction thresholds | Feature extraction pipeline | Trade Secret |
| Claim 5 — Path deviation, dwell-time, reversal | Deviation from nominal trajectory; time in sub-regions; direction change count | Feature extraction pipeline | Trade Secret |
| Claim 8 — Jerk metric | Rate of change of acceleration along interaction trajectory → motor control smoothness indicator | Feature extraction pipeline | Trade Secret |
| Claim 9 — Sliding window micropatterns | Detect micro-pauses, velocity bursts, directional oscillations at sub-gesture granularity | Feature extraction pipeline | Trade Secret |
| Claim 10 — Model training + continuous update | Labeled dataset: `{signalData, isDeliberate, confidenceLevel}` → train/retrain inference model | ML training pipeline (offline) | **HIGHEST CONFIDENTIALITY** — training data, labels, model iteration |
| Claim 11 — Discrete confidence classification | Classify into: `high_confidence`, `moderate_confidence`, `low_confidence`, `guessing` — from velocity + deviation + temporal features | Inference model output layer | Trade Secret |
| Claim 12 — Multi-signal fusion | Combine gesture features with assessment context: `timeOnTask`, `answerChangeCount`, `itemDifficulty` → composite behavioral classification | Fusion module in inference pipeline | Trade Secret |
| Claim 13 — Individual profile comparison | Compare current feature vector to stored user behavioral profile → `identityConsistencyScore`; raise anomaly flag if below threshold | Inference module + user profile store | Trade Secret |
| Claim 15 — Endpoint + temporal rejection | Reject if: completion zone not reached OR interaction duration outside acceptable range | Submission validation pre-check | Patent-Protected |
| Claim 17 — Three-state FSM with failure metadata | `active` ↔ `confirming` → `submitted`; failed validations return to `active` with `validationMetadata` appended | State machine module | Patent-Protected |
| Claim 18 — Single-use session token | Token issued at assessment start; `consumed_tokens` table; reject if token already consumed | Session management service + Supabase table | Patent-Protected |
| Claim 19 — Temporal policy enforcement | Verify: `assessmentStart` → `gestureInitiation` → `serverReceipt` all within permitted time window | Temporal validation module | Patent-Protected |
| Claim 20 — CAGE hash chain | Each binding token references the previous one; chain-head verification confirms entire session integrity | CAGE chain module | **HIGHEST CONFIDENTIALITY** |
| Claim 21 — Nonce TTL + active-state gating | Nonce has configurable TTL; server rejects expired nonces; new nonce issued only after verifying active state + authenticated session | Nonce management service | Patent-Protected |
| Claim 22 — Adaptive scoring/feedback | Behavioral indicators modify: scoring weights, next-item selection, post-assessment behavioral report generation | Adaptive output module | Patent-Protected |
| Claim 24 — Aggregate session summary | Per-item confidence, session consistency metrics, integrity flag counts → stored as submission metadata for admin review | Analytics/reporting module + Supabase table | Patent-Protected |
| Claim 25 — Population-level behavioral models | Build population-level gesture models per assessment item type; compare individual against population rather than individual baseline only | Population model training pipeline | **HIGHEST CONFIDENTIALITY** — novel modeling paradigm |
| Claim 26 — PostgreSQL/Supabase backend | Interaction traces persisted in PostgreSQL via Supabase; real-time feature extraction pipeline | Database layer | Patent-Protected (implementation claim) |

### 2.3 Data Schema Requirements (Supabase / PostgreSQL)

| Table | Purpose | Supporting Claims | Security |
|-------|---------|------------------|----------|
| `interaction_traces` | Raw gesture event streams per submission attempt | Claims 1(b), 4–9, 26 | Encrypted at rest; RLS: user + admin only |
| `cage_binding_tokens` | Binding tokens with response hashes, nonces, sequence numbers, signatures | Claims 3, 20, 21 | **Highest security** — encrypted, no client read access |
| `issued_nonces` | Server-issued nonces with TTL and consumed status | Claims 18, 21 | Write-once; append-only pattern |
| `consumed_session_tokens` | Previously consumed single-use session tokens | Claim 18 | Append-only; indexed for fast lookup |
| `behavioral_features` | Extracted feature vectors per submission | Claims 4–9, 11, 12 | Trade secret — no external API exposure |
| `cognitive_state_indicators` | Inference model outputs per submission | Claims 1(g), 11, 22–25 | Trade secret — no external API exposure |
| `submission_state_log` | State machine transition audit trail | Claims 1(i–j), 17 | Immutable audit log |
| `user_behavioral_profiles` | Stored per-user behavioral baselines | Claim 13 | Encrypted; RLS: system-only read |
| `population_behavioral_models` | Aggregate models per assessment item type | Claim 25 | **Highest security** — core trade secret |
| `session_behavioral_summaries` | Per-session aggregate reports for admin review | Claim 24 | RLS: admin only |
| `device_fingerprints` | Registered device records for identity verification | Claim 1(h)(ii) | Encrypted; hashed identifiers only |

---

## 3. Phased Implementation Roadmap

### Phase 0: IP-First Architectural Scaffolding (Weeks 1–2)

**Objective:** Establish the module boundaries, file structure, and security posture before any feature code is written. Every module boundary maps to a patent claim boundary.

- [ ] **Create isolated module directories** that mirror claim groupings:
  ```
  /src/lib/cage/           — Claims 3, 20, 21 (CAGE protocol)
  /src/lib/signals/        — Claims 1(b), 4–9 (signal capture + feature extraction)
  /src/lib/inference/      — Claims 1(g), 10–13, 25 (behavioral models)
  /src/lib/submission/     — Claims 1(h–j), 17–19 (state machine + validation)
  /src/lib/adaptive/       — Claims 22–25 (adaptive outputs)
  /src/components/assessment/  — Claims 1(a), 14–16, 23, 28 (UI components)
  /src/hooks/              — useGestureCapture, useDeviceSensors
  /src/stores/             — submissionStore (Zustand)
  ```
- [ ] **Establish `.gitignore` and access control** for trade secret modules: `/src/lib/cage/`, `/src/lib/inference/`, and `/src/lib/signals/` feature extraction formulas must never appear in public repos, documentation sites, or client-accessible bundles.
- [ ] **Create `TRADE_SECRET.md` markers** in each confidential directory: file stating "Contents of this directory constitute trade secrets of SlateCamp. Do not copy, distribute, or discuss outside authorized personnel."
- [ ] **Configure Next.js server-only boundaries:** All feature extraction (Claims 4–9), inference (Claims 10–13), CAGE verification (Claim 3 server-side), and state machine logic (Claims 17–19) execute in Server Actions or API routes — never in client bundles. Use `import 'server-only'` guard in every server module.
- [ ] **Implement the `server-only` import guard test:** CI pipeline step that fails the build if any file in `/lib/cage/`, `/lib/inference/`, or `/lib/signals/` (server modules) is imported by a client component.
- [ ] **Design Supabase schema** for all 11 tables listed in Section 2.3 with RLS policies drafted.

### Phase 1: CAGE Protocol — The Crown Jewel (Weeks 3–5)

**Objective:** Implement Claims 3, 20, and 21 first. CAGE is the strongest novel element with zero prior art — it is the patent's anchor.

- [ ] **Client — `generateBindingToken.ts`:**
  - [ ] On gesture initiation (`onPointerDown` / `onTouchStart`): freeze current answer state from Zustand store
  - [ ] Compute SHA-256 hash of serialized answer state (canonical JSON serialization — deterministic key ordering)
  - [ ] Compute behavioral attestation value from first N interaction events (one-way hash of initial signal window)
  - [ ] Retrieve server-issued nonce from session context
  - [ ] Increment monotonic sequence counter
  - [ ] Assemble binding token: `{responseHash, behavioralAttestation, nonce, sequenceNumber}`
  - [ ] HMAC-sign binding token with session-derived key (HMAC-SHA256)
  - [ ] **(Claim 20):** Include reference to previous binding token hash to form chain

- [ ] **Server — `verifyBindingToken.ts`:**
  - [ ] Recompute SHA-256 of received answer data → compare to `responseHash` in token
  - [ ] Look up `nonce` in `issued_nonces` table → verify not consumed, not expired (TTL check per Claim 21)
  - [ ] Mark nonce as consumed (atomic operation)
  - [ ] Verify HMAC signature with server-held session key
  - [ ] **(Claim 20):** Verify chain reference against stored previous token
  - [ ] Return `{valid: boolean, failureReasons: string[]}`

- [ ] **Nonce management service:**
  - [ ] Issue nonce only when assessment instance is `active` AND user session is authenticated (Claim 21)
  - [ ] Configurable TTL (default: 120 seconds)
  - [ ] Supabase function: `issue_nonce(assessment_id, user_id) → {nonce, expires_at}`

- [ ] **Write integration tests** covering: tampered answers (hash mismatch), replayed nonces (consumed check), expired nonces (TTL), broken chain (Claim 20), forged signature.

### Phase 2: Instrumented Interaction Region & Signal Capture (Weeks 5–7)

**Objective:** Implement Claims 1(a), 1(b), 6, 7, 14, 16 — the client-side gesture component and raw signal pipeline.

- [ ] **`<SubmitGesture />` component (Claim 1(a), 14, 16):**
  - [ ] Render interaction region with configurable modality prop (`lateral-swipe` default)
  - [ ] Define `startZone` and `completionZone` spatial boundaries
  - [ ] Attach `onPointerDown`, `onPointerMove`, `onPointerUp` (and touch equivalents)
  - [ ] Visual feedback: progress indicator showing traversal from start to completion
  - [ ] Accessibility: keyboard fallback for non-touch/non-pointer devices
  - [ ] Mobile-first: full-width swipe track, 56px minimum touch target height

- [ ] **`useGestureCapture` hook (Claim 1(b), 6):**
  - [ ] Capture per event: `{eventType, x, y, timestamp: performance.now(), touchArea?, pressure?, radiusX?, radiusY?}`
  - [ ] Buffer events in `useRef` array (not state — avoid re-renders)
  - [ ] Normalize coordinates to interaction region local space
  - [ ] Compute `endpointStatus`: did pointer reach `completionZone`?
  - [ ] Compute raw `temporalMetric`: `lastEvent.timestamp - firstEvent.timestamp`

- [ ] **`useDeviceSensors` hook (Claim 7):**
  - [ ] Request permission for `DeviceMotionEvent` / `DeviceOrientationEvent` (required on iOS 13+)
  - [ ] Capture concurrent accelerometer + gyroscope data during gesture window
  - [ ] Graceful degradation: if sensors unavailable, proceed without — sensors are additive, not required

- [ ] **Payload assembly in `submissionStore.ts` (Claim 1(c)):**
  - [ ] Aggregate: signal data + CAGE token + device fingerprint + assessment state + session token
  - [ ] Serialize and transmit via API route (Claim 1(d))

- [ ] **(Claim 28) Real-time streaming option:**
  - [ ] WebSocket connection opened at gesture initiation
  - [ ] Events streamed in micro-batches (every 50ms) to backend
  - [ ] Enables server-side feature extraction to begin before gesture completes
  - [ ] Fallback: batch upload if WebSocket unavailable

### Phase 3: Server-Side Feature Extraction Pipeline (Weeks 7–9)

**Objective:** Implement Claims 1(f), 4, 5, 8, 9, 12 — the behavioral signal processing module.

- [ ] **Feature extraction pipeline (`/lib/signals/extractFeatures.ts`):**
  - [ ] **Interaction path metric (Claim 1(f)(i)):** Total displacement magnitude across interaction region
  - [ ] **Temporal metric (Claim 1(f)(ii)):** Duration of continuous confirmation interaction
  - [ ] **Velocity profile (Claim 4):** Computed from path/time; threshold-based deliberate vs. accidental/automated classification
  - [ ] **Path deviation (Claim 5(i)):** Deviation from nominal (straight-line) trajectory between start and completion zones
  - [ ] **Dwell-time (Claim 5(ii)):** Time spent in defined sub-regions of interaction region
  - [ ] **Reversal metric (Claim 5(iii)):** Count of direction changes during gesture
  - [ ] **Pressure profile (Claim 6):** Variation in touch force/area during gesture (when available)
  - [ ] **Jerk metric (Claim 8):** Rate of change of acceleration → motor control smoothness
  - [ ] **Sliding window micropatterns (Claim 9):** Detect micro-pauses, velocity bursts, directional oscillations

- [ ] **Multi-signal fusion (Claim 12):**
  - [ ] Combine gesture features with assessment context: `timeOnTaskPerItem`, `answerChangeCount`, `itemDifficulty`
  - [ ] Output: composite multi-dimensional feature vector

- [ ] **Persist extracted features** to `behavioral_features` table (never exposed via any client-facing API).

- [ ] **CRITICAL TRADE SECRET BOUNDARY:** Feature extraction formulas, normalization constants, threshold values, and sliding window parameters are the core trade secrets. These must:
  - [ ] Live exclusively in server-side code
  - [ ] Never be documented in public-facing materials
  - [ ] Be referenced in patent specification only at the level of general method description
  - [ ] Be excluded from any open-source releases

### Phase 4: Cognitive State Inference Engine (Weeks 9–12)

**Objective:** Implement Claims 1(g), 10, 11, 13, 25 — the trained behavioral model.

- [ ] **Phase 4a — Rule-based inference (ship first):**
  - [ ] Threshold-based classification using extracted features
  - [ ] Output indicators: `decisionConfidence` (high/moderate/low/guessing per Claim 11), `hesitancyIndex`, `cognitiveLoadProxy`, `anomalousBehaviorLikelihood`
  - [ ] Thresholds derived from internal testing and initial user data
  - [ ] **This ships first** to begin collecting labeled data for ML model training

- [ ] **Phase 4b — ML model training (after sufficient data):**
  - [ ] Collect labeled training data: `{featureVector, isDeliberate: boolean, confidenceLabel: string}` (Claim 10)
  - [ ] Labels from: self-reported confidence (post-item survey on subset), answer correctness correlation, admin review
  - [ ] Train classification model (e.g., gradient-boosted trees or small neural network)
  - [ ] Validate on held-out test set
  - [ ] Deploy model to server-side inference pipeline
  - [ ] Implement continuous model update loop (Claim 10): new data → retrain periodically

- [ ] **Individual behavioral profile comparison (Claim 13):**
  - [ ] After N submissions per user, build stored behavioral profile (mean + variance of feature vectors)
  - [ ] Compare current submission features against profile → `identityConsistencyScore`
  - [ ] Raise anomaly flag if score below threshold

- [ ] **Population-level behavioral models (Claim 25):**
  - [ ] Aggregate gesture patterns per assessment item type (MCQ, multi-select, design problem, etc.)
  - [ ] Compare individual against population distribution rather than (or in addition to) individual baseline
  - [ ] **HIGHEST CONFIDENTIALITY:** Population model parameters, training methodology, and item-type taxonomy are core trade secrets

- [ ] **Persist inference outputs** to `cognitive_state_indicators` table.

### Phase 5: Submission State Machine & Multi-Factor Validation (Weeks 12–14)

**Objective:** Implement Claims 1(h–j), 15, 17, 18, 19 — the server-enforced validation framework.

- [ ] **State machine module (`/lib/submission/stateMachine.ts`):**
  - [ ] Define states: `active`, `confirming`, `submitted`, `rejected`
  - [ ] Transition rules per Claim 17:
    - `active` → `confirming`: on receipt of submission payload
    - `confirming` → `submitted`: when ALL multi-factor conditions pass
    - `confirming` → `active`: when any condition fails (with `validationMetadata` recorded)
  - [ ] All transitions logged to `submission_state_log` (immutable audit trail)

- [ ] **Multi-factor validation checks (Claim 1(h)):**
  - [ ] **(i)** Behavioral state indicators: `anomalousBehaviorLikelihood` below threshold; `decisionConfidence` above minimum
  - [ ] **(ii)** Device identity: `deviceFingerprint` matches `device_fingerprints` registered records
  - [ ] **(iii)** Session token: valid, unconsumed → mark consumed (Claim 18)
  - [ ] **(iv)** Assessment completeness: required items answered per assessment rules
  - [ ] **(v)** CAGE binding: `verifyBindingToken()` passes (Claim 3 server verification)
  - [ ] **(vi)** Temporal policy: all timestamps within permitted window (Claim 19)

- [ ] **Endpoint + temporal pre-rejection (Claim 15):**
  - [ ] Reject before full validation if: `endpointStatus !== 'reached'` OR `temporalMetric` outside acceptable range

- [ ] **Response actions (Claim 1(i–j)):**
  - [ ] Accepted: transition to `submitted`, record answers as accepted
  - [ ] Rejected: maintain `active`, return rejection reason + request for re-submission or further action

### Phase 6: Adaptive Output & Reporting (Weeks 14–16)

**Objective:** Implement Claims 22, 23, 24 — the adaptive feedback loop.

- [ ] **Adaptive scoring (Claim 22(i)):**
  - [ ] Behavioral confidence indicators weight answer scores (e.g., high-confidence correct answers weighted higher for mastery estimation)
  - [ ] Integration point with existing Readiness Score engine

- [ ] **Adaptive item selection (Claim 22(ii)):**
  - [ ] Inferred cognitive state feeds into Camp Mode / Storm Mode item selection
  - [ ] Example: detected `guessing` pattern → serve easier diagnostic item to recalibrate

- [ ] **Disengagement detection (Claim 23):**
  - [ ] Sustained low cognitive engagement (multiple consecutive `low_confidence` + high `hesitancyIndex`) triggers server-pushed intervention signal
  - [ ] Client renders `<EngagementPrompt />` component

- [ ] **Session behavioral summary (Claim 24):**
  - [ ] Per-item confidence indicators
  - [ ] Session-level behavioral consistency metrics
  - [ ] Integrity flag counts
  - [ ] Stored as metadata on submission record
  - [ ] Accessible to assessment administrators via admin dashboard

- [ ] **Post-assessment behavioral report (Claim 22(iii)):**
  - [ ] Student-facing: "Your decision confidence was highest on structural design items"
  - [ ] Admin-facing: aggregate integrity and engagement metrics per cohort

---

## 4. IP Protection Operational Controls

### 4.1 Code Confidentiality Matrix

| Module | Confidentiality | Allowed in Client Bundle | Allowed in Public Repo | Allowed in API Docs |
|--------|----------------|--------------------------|----------------------|---------------------|
| CAGE token generation (client-side) | Highest | Yes (obfuscated — runs on client necessarily) | **NO** | **NO** |
| CAGE verification (server-side) | Highest | **NO** | **NO** | **NO** |
| Feature extraction formulas | Highest | **NO** | **NO** | **NO** |
| Inference model + weights | Highest | **NO** | **NO** | **NO** |
| Population behavioral models | Highest | **NO** | **NO** | **NO** |
| State machine logic | Patent-Protected | **NO** | **NO** | Schema only |
| `SubmitGesture` component | Patent-Protected | Yes (renders on client) | **NO** | **NO** |
| Signal capture hooks | Patent-Protected | Yes (captures on client) | **NO** | **NO** |
| Database schema | Patent-Protected | **NO** | **NO** | **NO** |

### 4.2 Client-Side Obfuscation Requirements

The CAGE client module (`generateBindingToken.ts`) and gesture capture hooks necessarily execute in the browser. Mitigations:

- [ ] **Code minification + obfuscation** via Next.js production build (default) — verify variable names, function names are mangled
- [ ] **Avoid descriptive function names in client bundle** — use code-name identifiers in production builds for CAGE-related functions
- [ ] **WebAssembly compilation** (future): compile CAGE token generation to WASM for stronger obfuscation
- [ ] **Server-side validation is the true protection:** Even if a client module is reverse-engineered, the server-side verification, feature extraction, and inference remain opaque

### 4.3 Development Practices for Patent Support

- [ ] **Maintain dated invention logs:** Every commit touching Claims 1–28 modules should include a brief `INVENTION_LOG.md` entry noting what was implemented, when, and by whom. This supports priority date evidence and patent prosecution.
- [ ] **Do not publish architecture diagrams** that reveal the internal pipeline of CAGE, feature extraction, or inference — patent specification drawings serve this purpose; product documentation should describe capabilities, not mechanisms.
- [ ] **Employment/contractor agreements:** All contributors to Claims 1–28 modules must sign IP assignment agreements assigning all inventions to SlateCamp. Draft before any contributor touches these modules.
- [ ] **Worked example data collection (per 2025 AI Guidelines):** Collect and preserve at least one quantitative worked example (e.g., gesture velocity variance correlated with self-reported answer confidence) for inclusion in the patent specification before filing.

### 4.4 GPPB Activation Checklist (Post-Filing)

Once the IPOPHL filing receipt is obtained:

- [ ] Register SlateCamp as Qualified Startup Business (MSME, 1–5 years operation, commercializing IP rights)
- [ ] Prepare bid documentation referencing IPOPHL filing receipt as IP proof
- [ ] Target procuring entities: PRC (ALE administration), CHED, DepEd, DICT, state universities
- [ ] **CRITICAL:** In any government procurement contract, negotiate explicit IP retention clause per Section 7.1 — default awards IP to the Procuring Entity for commissioned work. Never sign without this clause.

---

## 5. Commercial Integration with Existing Revenue Architecture

### 5.1 How the Patent Strengthens Each Revenue Stream

| Revenue Stream | Patent Impact | Implementation Dependency |
|----------------|---------------|--------------------------|
| **B2C Subscription** | Behavioral confidence reporting becomes a premium feature ("See how confident your answers were") | Phase 6 — Adaptive Output |
| **White-Label Licensing** | Patent protection prevents licensees from extracting and replicating the integrity engine | All phases — the patent makes white-labeling safe |
| **Readiness Score API** | Behavioral signals enrich Readiness Score calibration; CAGE provides integrity attestation for API consumers | Phase 4 inference + Phase 1 CAGE |
| **Performance Intelligence** | Population-level behavioral models (Claim 25) are a proprietary data product | Phase 4b — Population models |
| **Guarantee Pro** | Behavioral integrity data validates that Guarantee Pro users genuinely completed assessments (not gamed) | Phase 5 — State machine validation |
| **Platform Expansion** | Patent covers the method and system generically — applies to Nursing, CE, CPA exams without modification | All claims are profession-agnostic |
| **3D Lab Licensing** | Separate product line; not directly covered by this patent — consider separate trade dress / trade secret protections | N/A |
| **Government Procurement (GPPB)** | Filing receipt alone enables direct procurement pathway | Phase 0 — file ASAP |

### 5.2 Competitive Moat Amplification

| Moat | How This Patent Strengthens It |
|------|-------------------------------|
| **Data Moat** | Behavioral telemetry creates an entirely new data category no competitor possesses — population-level gesture models per item type |
| **Founder Moat** | Patent filed by architect-founder adds a legal defensibility layer to domain expertise |
| **Content Moat** | Behavioral integrity verification ensures content quality signal: "Our questions are answered by verified humans under genuine cognitive engagement" |
| **Network Moat** | Integrity attestation increases trust → more institutional adoption → more users → more data → stronger models |
| **Distribution Moat** | GPPB pathway unlocked by filing receipt → direct government sales channel |

---

## 6. Risk Register and Missing Information

### 6.1 Identified Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Client-side CAGE code reverse-engineered | Medium | Server-side verification is the real protection; client is convenience, not security. WASM compilation as future hardening. |
| Insufficient labeled training data for ML model (Claim 10) | High | Ship rule-based inference first (Phase 4a); collect implicit labels (answer correctness) from day one; add optional post-item confidence survey |
| `DeviceMotionEvent` permission denied on iOS | Low | Graceful degradation — sensor data is additive (Claim 7), not required for core pipeline |
| Patent prosecution delayed (2–5 year timeline) | Medium | Trade secret protection operates independently of patent grant; GPPB activation requires only filing receipt |
| Competitor files similar patent in another jurisdiction | Medium | File IPOPHL first for priority date; consider PCT within 12 months |

### 6.2 Insufficient Detail — Halted Execution Points

The following items require additional specification before implementation can proceed:

| Item | What Is Missing | Required Action |
|------|----------------|-----------------|
| **ML model architecture for Claim 10** | The patent specifies "trained behavioral model" but does not prescribe a specific architecture. This is correct for patentability (broader claim) but insufficient for implementation. | Engineering decision: select model type (gradient-boosted trees recommended for initial deployment given small dataset size). Document decision in invention log. |
| **Exact threshold values for Claim 4 velocity anomaly detection** | The patent correctly avoids specifying exact thresholds (trade secret). Implementation requires empirical calibration. | Collect gesture data from internal testing cohort (N≥50); derive thresholds from distribution analysis; store as server-side configuration (not hardcoded). |
| **Canonical JSON serialization spec for CAGE hash** | The patent specifies SHA-256 hash of "assessment response data" but does not define serialization format. Hash reproducibility requires deterministic serialization. | Define and document a canonical JSON serialization (sorted keys, no whitespace, UTF-8) in the CAGE specification. This is an implementation detail, not a patent claim element. |
| **Device fingerprinting method** | Claim 1(h)(ii) references "device identifier" and "registered device records" but does not specify the fingerprinting technique. | Engineering decision: use combination of `navigator.userAgent`, screen dimensions, WebGL renderer, and a server-issued device registration token. Avoid aggressive fingerprinting (privacy). |
| **"Acceptable time range" for Claim 15 temporal rejection** | The patent claims rejection when interaction duration is "outside of an acceptable time range" but does not define the range. | Empirical calibration from testing cohort. Expected range: 300ms–5000ms for lateral swipe. Store as server-side config. |

---

## 7. Filing Execution Checklist

- [ ] Finalize patent specification with worked example (quantitative gesture data correlated with confidence)
- [ ] Prepare drawings: system architecture flowchart, CAGE protocol sequence diagram, state machine diagram, gesture telemetry feature visualization
- [ ] File electronically via IPOPHL eInventionFile portal
- [ ] Pay base filing fee: PHP 1,737.20 (small entity rate) + excess claim fees for 28 claims beyond base 5
- [ ] Obtain filing receipt → immediately activate GPPB qualification process
- [ ] Calendar: request substantive examination within 6 months of publication (publication = 18 months post-filing)
- [ ] Calendar: evaluate PCT filing within 12 months of IPOPHL priority date
- [ ] Calendar: evaluate ASPEC (ASEAN) coverage based on expansion plans

---

*This document is a trade secret of SlateCamp. Distribution is restricted to authorized personnel only. Do not share, publish, or discuss contents outside the founding engineering team.*
