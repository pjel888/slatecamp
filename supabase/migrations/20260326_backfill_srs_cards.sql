-- Backfill user_srs_cards from existing user_node_mastery data.
-- Staggered next_review_at across the next 7 days prevents a "87 topics due"
-- pile-up on day 1 for users who already have mastery history.
-- Idempotent via ON CONFLICT DO NOTHING.

INSERT INTO public.user_srs_cards (
  user_id,
  node_id,
  ease_factor,
  interval_days,
  repetitions,
  next_review_at,
  last_reviewed_at
)
SELECT
  unm.user_id,
  unm.node_id,
  CASE
    WHEN unm.current_mastery_weight > 0.7 THEN 2.5
    WHEN unm.current_mastery_weight > 0.4 THEN 2.0
    ELSE 1.5
  END AS ease_factor,
  CASE
    WHEN unm.current_mastery_weight > 0.7 THEN 7.0
    WHEN unm.current_mastery_weight > 0.4 THEN 3.0
    ELSE 1.0
  END AS interval_days,
  LEAST(FLOOR(unm.interaction_count / 3.0)::INTEGER, 10) AS repetitions,
  now() + (random() * interval '7 days') AS next_review_at,
  unm.last_interaction_at AS last_reviewed_at
FROM public.user_node_mastery unm
WHERE unm.interaction_count > 0
ON CONFLICT (user_id, node_id) DO NOTHING;
