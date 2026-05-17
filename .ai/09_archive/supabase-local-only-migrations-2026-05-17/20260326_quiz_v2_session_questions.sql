-- ══════════════════════════════════════════════════════════════════════════════
-- Quiz Engine v2: session_questions junction table
-- Doc 03 §2.2 — Replaces question_ids UUID[] with proper junction for analytics
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.session_questions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      UUID NOT NULL REFERENCES public.quiz_sessions(session_id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.questions(question_id) ON DELETE RESTRICT,
  position        INTEGER NOT NULL,                     -- 1-indexed question order
  user_answer_id  TEXT,                                 -- option ID selected (TEXT to match user_interactions.selected_option_id)
  is_correct      BOOLEAN,                             -- NULL if unanswered
  is_skipped      BOOLEAN NOT NULL DEFAULT false,
  is_flagged      BOOLEAN NOT NULL DEFAULT false,
  confidence_level SMALLINT,                            -- 1=guessing, 2=somewhat, 3=very sure
  time_spent_ms   INTEGER,                             -- milliseconds on this question
  answered_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_session_questions_session
  ON public.session_questions(session_id);

CREATE INDEX IF NOT EXISTS idx_session_questions_question
  ON public.session_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_session_questions_position
  ON public.session_questions(session_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_session_questions_unique
  ON public.session_questions(session_id, question_id);

-- RLS: Users can only access their own session questions
CREATE POLICY "Users can read own session questions"
  ON public.session_questions FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM public.quiz_sessions
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own session questions"
  ON public.session_questions FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT session_id FROM public.quiz_sessions
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own session questions"
  ON public.session_questions FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM public.quiz_sessions
      WHERE user_id = (SELECT auth.uid())
    )
  );
