-- ═══════════════════════════════════════════════════════════════
-- Migration 020: Populate feature_flags table
-- ═══════════════════════════════════════════════════════════════
-- UX Strategy Sprint 1 Item #1 — "The paywall cannot fire.
-- Free users can access everything. Zero revenue possible."
--
-- target_tier = array of tiers that HAVE access.
-- Free users are gated OUT of features where 'free' is NOT in target_tier.
-- Canonical paid tiers: pro, prime, institutional, enterprise.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.feature_flags (key, description, enabled, target_tier)
VALUES
  -- ── Score & Analytics ─────────────────────────────────────
  (
    'readiness_score_live',
    'Live Readiness Score updates after every session. Free users see score once (diagnostic reveal), then it is locked.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),
  (
    'analytics_dashboard_full',
    'Full analytics dashboard with all 7 components (trajectory, pacing, stamina, memory, timeline, etc.).',
    true,
    '{pro,prime,institutional,enterprise}'
  ),

  -- ── Taxonomy Heatmap ──────────────────────────────────────
  (
    'taxonomy_heatmap_full',
    'Full taxonomy heatmap with node names, drill-down, and delta view. Free users see blurred silhouette only.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),

  -- ── Questions ─────────────────────────────────────────────
  (
    'questions_all_difficulty',
    'Access to medium, hard, and expert difficulty questions. Free users limited to easy only.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),
  (
    'questions_unlimited',
    'Unlimited daily questions. Free users capped at 20 questions/day.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),

  -- ── Camp Trails ───────────────────────────────────────────
  (
    'camp_trails_full_library',
    'Access to the full trail library (all intensities). Free users get the LEA Starter trail only.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),

  -- ── Advanced Features (Sprint 3) ─────────────────────────
  (
    'blindspot_protocol',
    'Focus Review: nightly scan detects persistent Red nodes, prescribes targeted remediation sessions.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),
  (
    'endurance_cycle',
    'Extended Practice: calibrates sustained attention over long sessions. Gates the Proof Simulation.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),
  (
    'proof_simulation',
    'Full Exam Simulation: 150 questions, 4 hours, LEA conditions. Gated by Endurance + node coverage.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),

  -- ── Content Features ──────────────────────────────────────
  (
    '3d_lab_full',
    'Full 3D Lab workspace with all architectural models and spatial quizzes.',
    true,
    '{pro,prime,institutional,enterprise}'
  ),
  (
    'ai_assistant_unlimited',
    'Unlimited AI Reference Assistant queries. Free users get limited queries per day.',
    true,
    '{pro,prime,institutional,enterprise}'
  )

ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  enabled     = EXCLUDED.enabled,
  target_tier = EXCLUDED.target_tier,
  updated_at  = now();
