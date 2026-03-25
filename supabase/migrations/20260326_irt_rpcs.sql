-- ============================================================
-- IRT RPCs: Maximum Fisher Information item selection + Newton-Raphson theta update
-- ============================================================

-- select_next_item: Maximum Fisher Information with cold-start warm-up
CREATE OR REPLACE FUNCTION public.select_next_item(
  p_user_id UUID,
  p_session_id UUID,
  p_discipline_id UUID,
  p_topic_id UUID DEFAULT NULL,
  p_target_p FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  question_id UUID,
  irt_difficulty FLOAT,
  irt_discrimination FLOAT,
  irt_guessing FLOAT,
  fisher_information FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_theta FLOAT := 0.0;
  v_responses_count INTEGER := 0;
  v_answered_ids UUID[];
BEGIN
  -- Fetch current theta estimate for this user/discipline
  SELECT ut.theta, ut.responses_count
  INTO v_theta, v_responses_count
  FROM public.user_theta ut
  WHERE ut.user_id = p_user_id
    AND ut.discipline_id = p_discipline_id;

  -- Collect already-answered question IDs in this session
  SELECT ARRAY_AGG(DISTINCT ui.question_id)
  INTO v_answered_ids
  FROM public.user_interactions ui
  WHERE ui.session_id = p_session_id
    AND ui.question_id IS NOT NULL;

  v_answered_ids := COALESCE(v_answered_ids, ARRAY[]::UUID[]);

  -- Cold-start warm-up: first 5 questions use p_target_p difficulty targeting
  -- rather than maximum Fisher information, to avoid early-session extremes
  IF v_responses_count < 5 THEN
    RETURN QUERY
    SELECT
      q.question_id,
      q.irt_difficulty,
      q.irt_discrimination,
      q.irt_guessing,
      -- placeholder score: closeness to target difficulty (θ such that P=p_target_p)
      -ABS(q.irt_difficulty - (v_theta + LN(p_target_p / (1.0 - p_target_p)) / GREATEST(q.irt_discrimination, 0.01))) AS fisher_information
    FROM public.questions q
    WHERE q.irt_discrimination > 0
      AND NOT (q.question_id = ANY(v_answered_ids))
      AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
      AND EXISTS (
        SELECT 1 FROM public.taxonomy_tree tt
        WHERE tt.node_id = q.topic_id
          AND tt.discipline_id = p_discipline_id
      )
    ORDER BY fisher_information DESC
    LIMIT 1;
  ELSE
    -- Maximum Fisher Information selection
    -- Fisher Information for 2PL: I(θ) = a² * P(θ) * (1 - P(θ))
    -- where P(θ) = 1 / (1 + exp(-a*(θ-b)))
    RETURN QUERY
    SELECT
      q.question_id,
      q.irt_difficulty,
      q.irt_discrimination,
      q.irt_guessing,
      (
        q.irt_discrimination * q.irt_discrimination
        * (1.0 / (1.0 + EXP(-q.irt_discrimination * (v_theta - q.irt_difficulty))))
        * (1.0 - 1.0 / (1.0 + EXP(-q.irt_discrimination * (v_theta - q.irt_difficulty))))
      ) AS fisher_information
    FROM public.questions q
    WHERE q.irt_discrimination > 0
      AND NOT (q.question_id = ANY(v_answered_ids))
      AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
      AND EXISTS (
        SELECT 1 FROM public.taxonomy_tree tt
        WHERE tt.node_id = q.topic_id
          AND tt.discipline_id = p_discipline_id
      )
    ORDER BY fisher_information DESC
    LIMIT 1;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.select_next_item(UUID, UUID, UUID, UUID, FLOAT) TO authenticated;


-- update_theta: Newton-Raphson MLE single-step with Bayesian prior for first 10 responses
CREATE OR REPLACE FUNCTION public.update_theta(
  p_user_id UUID,
  p_discipline_id UUID,
  p_item_difficulty FLOAT,
  p_item_discrimination FLOAT,
  p_is_correct BOOLEAN
)
RETURNS TABLE (
  theta FLOAT,
  theta_se FLOAT,
  responses_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_theta FLOAT := 0.0;
  v_theta_se FLOAT := 1.0;
  v_responses_count INTEGER := 0;
  v_p FLOAT;
  v_information FLOAT;
  v_gradient FLOAT;
  v_delta FLOAT;
  v_new_theta FLOAT;
  v_new_se FLOAT;
  -- Bayesian prior: N(0, 1) — standard normal
  v_prior_mu FLOAT := 0.0;
  v_prior_precision FLOAT := 1.0; -- 1 / prior_variance
BEGIN
  -- Fetch or initialize user theta record
  INSERT INTO public.user_theta (user_id, discipline_id, theta, theta_se, responses_count)
  VALUES (p_user_id, p_discipline_id, 0.0, 1.0, 0)
  ON CONFLICT (user_id, discipline_id) DO NOTHING;

  SELECT ut.theta, ut.theta_se, ut.responses_count
  INTO v_theta, v_theta_se, v_responses_count
  FROM public.user_theta ut
  WHERE ut.user_id = p_user_id
    AND ut.discipline_id = p_discipline_id;

  -- 2PL probability: P(correct | θ, a, b) = 1 / (1 + exp(-a*(θ-b)))
  v_p := 1.0 / (1.0 + EXP(-p_item_discrimination * (v_theta - p_item_difficulty)));

  -- Fisher information for this item
  v_information := p_item_discrimination * p_item_discrimination * v_p * (1.0 - v_p);

  -- Newton-Raphson gradient (score function)
  v_gradient := p_item_discrimination * (CASE WHEN p_is_correct THEN 1.0 ELSE 0.0 END - v_p);

  -- Apply Bayesian prior for first 10 responses (shrink toward 0)
  IF v_responses_count < 10 THEN
    -- Add prior contribution to gradient and information
    v_gradient := v_gradient - v_prior_precision * (v_theta - v_prior_mu);
    v_information := v_information + v_prior_precision;
  END IF;

  -- Newton-Raphson step: θ_new = θ + gradient / information
  -- Clamp step size to ±1.0 to prevent wild jumps
  IF v_information > 0 THEN
    v_delta := v_gradient / v_information;
    v_delta := GREATEST(-1.0, LEAST(1.0, v_delta));
  ELSE
    v_delta := 0.0;
  END IF;

  v_new_theta := v_theta + v_delta;
  -- Enforce theta bounds [-4, 4]
  v_new_theta := GREATEST(-4.0, LEAST(4.0, v_new_theta));

  -- Standard error: SE = 1 / sqrt(total_information)
  -- Approximate total information as 1/SE² + new item information
  DECLARE
    v_total_info FLOAT;
  BEGIN
    v_total_info := (1.0 / GREATEST(v_theta_se * v_theta_se, 0.0001)) + v_information;
    v_new_se := 1.0 / SQRT(GREATEST(v_total_info, 0.0001));
  END;

  -- Persist updated theta
  UPDATE public.user_theta
  SET
    theta = v_new_theta,
    theta_se = v_new_se,
    responses_count = v_responses_count + 1,
    updated_at = now()
  WHERE user_id = p_user_id
    AND discipline_id = p_discipline_id;

  RETURN QUERY SELECT v_new_theta, v_new_se, v_responses_count + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_theta(UUID, UUID, FLOAT, FLOAT, BOOLEAN) TO authenticated;
