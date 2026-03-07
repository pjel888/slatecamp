-- Review session configurations (saved quiz setups users can retake)
CREATE TABLE public.review_session_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    bank_configs JSONB NOT NULL DEFAULT '[]',
    session_type TEXT DEFAULT 'practice',
    total_questions INT DEFAULT 0,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.review_session_configs.bank_configs IS 'Array of {bankId, bankTitle, questionCount} objects defining the session composition.';

ALTER TABLE public.test_sessions
  ADD COLUMN IF NOT EXISTS config_id UUID REFERENCES review_session_configs(id),
  ADD COLUMN IF NOT EXISTS session_config JSONB;

COMMENT ON COLUMN public.test_sessions.session_config IS 'Snapshot of the bank configuration used for this session.';

CREATE INDEX idx_review_configs_user ON review_session_configs(user_id);
