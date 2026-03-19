-- ═══════════════════════════════════════════════════════════════
-- Migration 020: Populate feature_flags table
-- ═══════════════════════════════════════════════════════════════
-- UX Strategy Sprint 1 Item #1 — "The paywall cannot fire.
-- Free users can access everything. Zero revenue possible."
--
-- target_tier = array of tiers that HAVE access.
-- Free users are gated OUT of features where 'free' is NOT in target_tier.
-- Paid tiers: camp, insurance, institutional.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.feature_flags (key, description, enabled, target_tier)
VALUES
  -- ── Score & Analytics ─────────────────────────────────────
  (
    'readiness_score_live',
    'Live Readiness Score updates after every session. Free users see score once (diagnostic reveal), then it is locked.',
    true,
    '{camp,insurance,institutional}'
  ),
  (
    'analytics_dashboard_full',
    'Full analytics dashboard with all 7 components (trajectory, pacing, stamina, memory, timeline, etc.).',
    true,
    '{camp,insurance,institutional}'
  ),

  -- ── Taxonomy Heatmap ──────────────────────────────────────
  (
    'taxonomy_heatmap_full',
    'Full taxonomy heatmap with node names, drill-down, and delta view. Free users see blurred silhouette only.',
    true,
    '{camp,insurance,institutional}'
  ),

  -- ── Questions ─────────────────────────────────────────────
  (
    'questions_all_difficulty',
    'Access to medium, hard, and expert difficulty questions. Free users limited to easy only.',
    true,
    '{camp,insurance,institutional}'
  ),
  (
    'questions_unlimited',
    'Unlimited daily questions. Free users capped at 20 questions/day.',
    true,
    '{camp,insurance,institutional}'
  ),

  -- ── Camp Trails ───────────────────────────────────────────
  (
    'camp_trails_full_library',
    'Access to the full trail library (all intensities). Free users get the ALE Starter trail only.',
    true,
    '{camp,insurance,institutional}'
  ),

  -- ── Advanced Features (Sprint 3) ─────────────────────────
  (
    'blindspot_protocol',
    'Focus Review: nightly scan detects persistent Red nodes, prescribes targeted remediation sessions.',
    true,
    '{camp,insurance,institutional}'
  ),
  (
    'endurance_cycle',
    'Extended Practice: calibrates sustained attention over long sessions. Gates the Proof Simulation.',
    true,
    '{camp,insurance,institutional}'
  ),
  (
    'proof_simulation',
    'Full Exam Simulation: 150 questions, 4 hours, ALE conditions. Gated by Endurance + node coverage.',
    true,
    '{camp,insurance,institutional}'
  ),

  -- ── Content Features ──────────────────────────────────────
  (
    '3d_lab_full',
    'Full 3D Lab workspace with all architectural models and spatial quizzes.',
    true,
    '{camp,insurance,institutional}'
  ),
  (
    'ai_assistant_unlimited',
    'Unlimited AI Reference Assistant queries. Free users get limited queries per day.',
    true,
    '{camp,insurance,institutional}'
  )

ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  enabled     = EXCLUDED.enabled,
  target_tier = EXCLUDED.target_tier,
  updated_at  = now();
