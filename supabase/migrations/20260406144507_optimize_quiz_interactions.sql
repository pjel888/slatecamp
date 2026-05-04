ALTER TABLE public.quiz_sessions ADD COLUMN answered_count INTEGER NOT NULL DEFAULT 0, ADD COLUMN correct_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.submit_quiz_answer_v2(
  p_session_id UUID,
  p_question_id UUID,
  p_user_id UUID,
  p_selected_option_id TEXT,
  p_is_correct BOOLEAN,
  p_time_spent_ms INTEGER,
  p_confidence TEXT,
  p_confidence_score NUMERIC,
  p_is_suspected_lucky_guess BOOLEAN,
  p_question_order INTEGER
)
RETURNS TABLE (
  interaction_id UUID,
  answered_count INTEGER,
  correct_count INTEGER,
  rationale JSONB,
  topic_id UUID,
  wiki_article_id UUID
) AS $$
DECLARE
  v_interaction_id UUID;
  v_answered_total INTEGER;
  v_correct_total INTEGER;
  v_rationale JSONB;
  v_topic_id UUID;
  v_wiki_article_id UUID;
  v_was_already_answered BOOLEAN;
  v_was_previously_correct BOOLEAN;
BEGIN
  -- 1. Check if this question was already answered in this session (for idempotent updates)
  SELECT interaction_id, is_correct, topic_id 
  INTO v_interaction_id, v_was_previously_correct, v_topic_id
  FROM public.user_interactions
  WHERE session_id = p_session_id 
    AND question_id = p_question_id 
    AND user_id = p_user_id;

  v_was_already_answered := v_interaction_id IS NOT NULL;

  -- 2. Fetch question metadata (rationale, topic_id, wiki_article_id)
  SELECT q.rationale, q.topic_id, wa.article_id
  INTO v_rationale, v_topic_id, v_wiki_article_id
  FROM public.questions q
  LEFT JOIN public.wiki_article_taxonomy wat ON wat.node_id = q.topic_id AND wat.is_primary = TRUE
  LEFT JOIN public.wiki_articles wa ON wa.article_id = wat.article_id
  WHERE q.question_id = p_question_id;

  -- 3. Record/Update Interaction
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

  -- 4. Update session running totals
  UPDATE public.quiz_sessions
  SET 
    answered_count = CASE WHEN v_was_already_answered THEN answered_count ELSE answered_count + 1 END,
    correct_count = CASE 
      WHEN v_was_already_answered THEN 
        CASE 
          WHEN v_was_previously_correct = p_is_correct THEN correct_count
          WHEN p_is_correct THEN correct_count + 1
          ELSE correct_count - 1
        END
      WHEN p_is_correct THEN correct_count + 1
      ELSE correct_count
    END,
    updated_at = now()
  WHERE session_id = p_session_id
  RETURNING public.quiz_sessions.answered_count, public.quiz_sessions.correct_count 
  INTO v_answered_total, v_correct_total;

  RETURN QUERY SELECT v_interaction_id, v_answered_total, v_correct_total, v_rationale, v_topic_id, v_wiki_article_id;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
