-- Harden authenticated SECURITY DEFINER RPCs that intentionally remain executable by authenticated users.
--
-- This migration does not revoke app-critical RPC grants. Instead, it closes the
-- main residual risk identified during the final advisor review: authenticated
-- callers could invoke some user-scoped SECURITY DEFINER functions with another
-- user's UUID. The RPCs now require the JWT subject to match the user-scoped
-- argument, except for service_role and admin-only notification orchestration.

CREATE OR REPLACE FUNCTION public.check_user_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
       AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
        RETURN false;
    END IF;

    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id
        AND role IN ('super_admin', 'content_admin')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type public.notification_type,
  p_title text,
  p_body text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id UUID;
  v_is_enabled BOOLEAN := true;
  v_daily_count INTEGER;
  v_pref_column TEXT;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id
     AND NOT public.has_admin_role() THEN
    RAISE EXCEPTION 'create_notification may only target the current user'
      USING ERRCODE = '42501';
  END IF;

  v_pref_column := CASE p_type
    WHEN 'score_change'    THEN 'score_changes'
    WHEN 'trail_ready'     THEN 'trail_ready'
    WHEN 'focus_review'    THEN 'focus_review'
    WHEN 'zone_transition' THEN 'milestones'
    WHEN 'proof_unlocked'  THEN 'milestones'
    WHEN 'campfire_story'  THEN 'campfire'
    WHEN 'campfire_reply'  THEN 'campfire'
    WHEN 'content_update'  THEN 'content_updates'
    WHEN 'weekly_digest'   THEN 'weekly_digest'
    WHEN 'coaching_tip'    THEN 'coaching_tips'
    WHEN 'billing'         THEN 'billing'
    WHEN 'system'          THEN 'billing'
  END;

  EXECUTE format(
    'SELECT COALESCE(
       (SELECT %I FROM public.notification_preferences WHERE user_id = $1),
       true
     )',
    v_pref_column
  ) INTO v_is_enabled USING p_user_id;

  IF NOT v_is_enabled THEN RETURN NULL; END IF;

  IF p_type NOT IN ('billing', 'system') THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND created_at >= (now() AT TIME ZONE 'Asia/Manila')::date::timestamptz
      AND type NOT IN ('billing', 'system');

    IF v_daily_count >= 3 THEN RETURN NULL; END IF;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_review_deck(p_user_id uuid, p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, node_id text, ease_factor double precision, interval_days double precision, repetitions integer, quality_last integer, next_review_at timestamp with time zone, last_reviewed_at timestamp with time zone, overdue_days double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'get_review_deck may only read the current user'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.node_id,
    c.ease_factor::DOUBLE PRECISION,
    c.interval_days::DOUBLE PRECISION,
    c.repetitions,
    c.quality_last,
    c.next_review_at,
    c.last_reviewed_at,
    (EXTRACT(EPOCH FROM (now() - c.next_review_at)) / 86400.0)::DOUBLE PRECISION AS overdue_days
  FROM public.user_srs_cards c
  WHERE c.user_id = p_user_id
    AND c.next_review_at <= now()
  ORDER BY c.next_review_at ASC
  LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_review_due_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_count INTEGER;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'get_review_due_count may only read the current user'
      USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.user_srs_cards c
  WHERE c.user_id = p_user_id
    AND c.next_review_at <= now();

  RETURN v_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_unseen_questions(
  p_user_id uuid,
  p_topic_ids uuid[],
  p_limit integer DEFAULT 20,
  p_difficulty_min numeric DEFAULT NULL::numeric,
  p_difficulty_max numeric DEFAULT NULL::numeric
)
RETURNS TABLE(question_id uuid, topic_id uuid, text text, options jsonb, difficulty numeric, prompt_image_url text, question_type text, metadata jsonb)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'get_unseen_questions may only read the current user'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    q.question_id,
    q.topic_id,
    q.text,
    q.options,
    q.difficulty,
    q.prompt_image_url,
    q.question_type,
    '{}'::JSONB AS metadata
  FROM public.questions q
  WHERE q.topic_id = ANY(p_topic_ids)
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_question_states uqs
      WHERE uqs.user_id = p_user_id
        AND uqs.question_id = q.question_id
    )
    AND (p_difficulty_min IS NULL OR q.difficulty >= p_difficulty_min)
    AND (p_difficulty_max IS NULL OR q.difficulty < p_difficulty_max)
  ORDER BY random()
  LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.select_next_item(
  p_user_id uuid,
  p_session_id uuid,
  p_discipline_id uuid,
  p_topic_id uuid DEFAULT NULL::uuid,
  p_target_p double precision DEFAULT 0.75
)
RETURNS TABLE(question_id uuid, irt_difficulty double precision, irt_discrimination double precision, irt_guessing double precision, fisher_information double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_theta FLOAT := 0.0;
  v_responses_count INTEGER := 0;
  v_answered_ids UUID[];
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'select_next_item may only select for the current user'
      USING ERRCODE = '42501';
  END IF;

  SELECT ut.theta, ut.responses_count
    INTO v_theta, v_responses_count
  FROM public.user_theta ut
  WHERE ut.user_id = p_user_id
    AND ut.discipline_id = p_discipline_id;

  SELECT ARRAY_AGG(DISTINCT ui.question_id)
    INTO v_answered_ids
  FROM public.user_interactions ui
  WHERE ui.user_id = p_user_id
    AND ui.session_id = p_session_id
    AND ui.question_id IS NOT NULL;

  v_answered_ids := COALESCE(v_answered_ids, ARRAY[]::UUID[]);

  IF v_responses_count < 5 THEN
    RETURN QUERY SELECT q.question_id, q.irt_difficulty, q.irt_discrimination, q.irt_guessing,
      -ABS(q.irt_difficulty - (v_theta + LN(p_target_p / (1.0 - p_target_p)) / GREATEST(q.irt_discrimination, 0.01))) AS fisher_information
    FROM public.questions q WHERE q.irt_discrimination > 0 AND NOT (q.question_id = ANY(v_answered_ids))
      AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
      AND EXISTS (SELECT 1 FROM public.taxonomy_tree tt WHERE tt.node_id = q.topic_id AND tt.discipline_id = p_discipline_id)
    ORDER BY fisher_information DESC LIMIT 1;
  ELSE
    RETURN QUERY SELECT q.question_id, q.irt_difficulty, q.irt_discrimination, q.irt_guessing,
      (q.irt_discrimination * q.irt_discrimination * (1.0 / (1.0 + EXP(-q.irt_discrimination * (v_theta - q.irt_difficulty)))) * (1.0 - 1.0 / (1.0 + EXP(-q.irt_discrimination * (v_theta - q.irt_difficulty))))) AS fisher_information
    FROM public.questions q WHERE q.irt_discrimination > 0 AND NOT (q.question_id = ANY(v_answered_ids))
      AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
      AND EXISTS (SELECT 1 FROM public.taxonomy_tree tt WHERE tt.node_id = q.topic_id AND tt.discipline_id = p_discipline_id)
    ORDER BY fisher_information DESC LIMIT 1;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_quiz_answer_v2(
  p_session_id uuid,
  p_question_id uuid,
  p_user_id uuid,
  p_selected_option_id text,
  p_is_correct boolean,
  p_time_spent_ms integer,
  p_confidence text,
  p_confidence_score numeric,
  p_is_suspected_lucky_guess boolean,
  p_question_order integer
)
RETURNS TABLE(interaction_id uuid, answered_count integer, correct_count integer, rationale jsonb, topic_id uuid, wiki_slug text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_interaction_id UUID;
  v_answered_total INTEGER;
  v_correct_total INTEGER;
  v_rationale JSONB;
  v_topic_id UUID;
  v_wiki_slug TEXT;
  v_was_already_answered BOOLEAN;
  v_was_previously_correct BOOLEAN;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'submit_quiz_answer_v2 may only submit for the current user'
      USING ERRCODE = '42501';
  END IF;

  SELECT ui.interaction_id, ui.is_correct, ui.topic_id
  INTO v_interaction_id, v_was_previously_correct, v_topic_id
  FROM public.user_interactions ui
  WHERE ui.session_id = p_session_id
    AND ui.question_id = p_question_id
    AND ui.user_id = p_user_id;

  v_was_already_answered := v_interaction_id IS NOT NULL;

  SELECT q.rationale, q.topic_id, wa.slug
  INTO v_rationale, v_topic_id, v_wiki_slug
  FROM public.questions q
  LEFT JOIN public.wiki_article_taxonomy wat ON wat.node_id = q.topic_id AND wat.is_primary = TRUE
  LEFT JOIN public.wiki_articles wa ON wa.article_id = wat.article_id
  WHERE q.question_id = p_question_id;

  INSERT INTO public.user_interactions (
    session_id, question_id, user_id, topic_id,
    selected_option_id, is_correct, time_spent_ms,
    confidence, confidence_score, is_suspected_lucky_guess,
    question_order, interaction_timestamp, updated_at
  ) VALUES (
    p_session_id, p_question_id, p_user_id, v_topic_id,
    p_selected_option_id, p_is_correct, p_time_spent_ms,
    p_confidence, p_confidence_score, p_is_suspected_lucky_guess,
    p_question_order, now(), now()
  )
  ON CONFLICT (user_id, session_id, question_id) DO UPDATE SET
    selected_option_id = EXCLUDED.selected_option_id,
    is_correct = EXCLUDED.is_correct,
    time_spent_ms = EXCLUDED.time_spent_ms,
    confidence = EXCLUDED.confidence,
    confidence_score = EXCLUDED.confidence_score,
    is_suspected_lucky_guess = EXCLUDED.is_suspected_lucky_guess,
    updated_at = now()
  RETURNING user_interactions.interaction_id INTO v_interaction_id;

  UPDATE public.quiz_sessions qs
  SET
    answered_count = CASE WHEN v_was_already_answered THEN qs.answered_count ELSE qs.answered_count + 1 END,
    correct_count = CASE
      WHEN v_was_already_answered THEN
        CASE
          WHEN v_was_previously_correct = p_is_correct THEN qs.correct_count
          WHEN p_is_correct THEN qs.correct_count + 1
          ELSE qs.correct_count - 1
        END
      WHEN p_is_correct THEN qs.correct_count + 1
      ELSE qs.correct_count
    END,
    updated_at = now()
  WHERE qs.session_id = p_session_id
    AND qs.user_id = p_user_id
  RETURNING qs.answered_count, qs.correct_count
  INTO v_answered_total, v_correct_total;

  RETURN QUERY SELECT v_interaction_id, v_answered_total, v_correct_total, v_rationale, v_topic_id, v_wiki_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_theta(
  p_user_id uuid,
  p_discipline_id uuid,
  p_item_difficulty double precision,
  p_item_discrimination double precision,
  p_is_correct boolean
)
RETURNS TABLE(theta double precision, theta_se double precision, responses_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_theta FLOAT := 0.0; v_theta_se FLOAT := 1.0; v_responses_count INTEGER := 0;
  v_p FLOAT; v_information FLOAT; v_gradient FLOAT; v_delta FLOAT; v_new_theta FLOAT; v_new_se FLOAT;
  v_prior_mu FLOAT := 0.0; v_prior_precision FLOAT := 1.0;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role'
     AND (SELECT auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'update_theta may only update the current user'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_theta (user_id, discipline_id, theta, theta_se, responses_count)
  VALUES (p_user_id, p_discipline_id, 0.0, 1.0, 0)
  ON CONFLICT (user_id, discipline_id) DO NOTHING;

  SELECT ut.theta, ut.theta_se, ut.responses_count
    INTO v_theta, v_theta_se, v_responses_count
  FROM public.user_theta ut
  WHERE ut.user_id = p_user_id
    AND ut.discipline_id = p_discipline_id;

  v_p := 1.0 / (1.0 + EXP(-p_item_discrimination * (v_theta - p_item_difficulty)));
  v_information := p_item_discrimination * p_item_discrimination * v_p * (1.0 - v_p);
  v_gradient := p_item_discrimination * (CASE WHEN p_is_correct THEN 1.0 ELSE 0.0 END - v_p);
  IF v_responses_count < 10 THEN
    v_gradient := v_gradient - v_prior_precision * (v_theta - v_prior_mu);
    v_information := v_information + v_prior_precision;
  END IF;
  IF v_information > 0 THEN v_delta := GREATEST(-1.0, LEAST(1.0, v_gradient / v_information)); ELSE v_delta := 0.0; END IF;
  v_new_theta := GREATEST(-4.0, LEAST(4.0, v_theta + v_delta));
  DECLARE v_total_info FLOAT; BEGIN
    v_total_info := (1.0 / GREATEST(v_theta_se * v_theta_se, 0.0001)) + v_information;
    v_new_se := 1.0 / SQRT(GREATEST(v_total_info, 0.0001));
  END;
  UPDATE public.user_theta SET theta = v_new_theta, theta_se = v_new_se, responses_count = v_responses_count + 1, updated_at = now() WHERE user_id = p_user_id AND discipline_id = p_discipline_id;
  RETURN QUERY SELECT v_new_theta, v_new_se, v_responses_count + 1;
END;
$function$;
