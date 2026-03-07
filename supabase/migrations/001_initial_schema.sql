-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE user_tier AS ENUM ('free', 'pro', 'max');
CREATE TYPE question_type AS ENUM ('mcq', 'true_false', 'identification', 'essay', 'matching', 'sequence');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'flagged');

-- =============================================================
-- CORE TABLES
-- =============================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    tier user_tier DEFAULT 'free' NOT NULL,
    profession TEXT DEFAULT 'architecture',
    exam_target TEXT,
    target_exam_date DATE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    ai_tokens_used INT DEFAULT 0,
    ai_tokens_limit INT DEFAULT 0,
    daily_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    preferred_theme TEXT DEFAULT 'system',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.exam_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profession TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_domain_id UUID REFERENCES exam_domains(id),
    sort_order INT DEFAULT 0,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    profession TEXT NOT NULL,
    exam_domain_id UUID REFERENCES exam_domains(id),
    is_official BOOLEAN DEFAULT FALSE,
    is_marketplace BOOLEAN DEFAULT FALSE,
    price_cents INT DEFAULT 0,
    currency TEXT DEFAULT 'PHP',
    status content_status DEFAULT 'draft',
    question_count INT DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    total_ratings INT DEFAULT 0,
    total_purchases INT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE,
    exam_domain_id UUID REFERENCES exam_domains(id),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    question_type question_type DEFAULT 'mcq',
    prompt TEXT NOT NULL,
    choices JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    explanation_references TEXT[],
    difficulty difficulty_level DEFAULT 'medium',
    difficulty_rating FLOAT DEFAULT 0.5,
    discrimination_rating FLOAT DEFAULT 1.0,
    has_3d_component BOOLEAN DEFAULT FALSE,
    three_d_model_ref TEXT,
    image_urls TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    times_answered INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    status content_status DEFAULT 'published',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- USER ACTIVITY & SRS
-- =============================================================

CREATE TABLE public.user_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    session_id UUID,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT,
    confidence_level INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    bank_id UUID REFERENCES question_banks(id),
    exam_domain_id UUID REFERENCES exam_domains(id),
    session_type TEXT DEFAULT 'practice',
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    total_time_ms INT DEFAULT 0,
    score_percentage FLOAT,
    difficulty_mode TEXT DEFAULT 'mixed',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.srs_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    interval_days FLOAT DEFAULT 1,
    ease_factor FLOAT DEFAULT 2.5,
    repetition_count INT DEFAULT 0,
    lapses INT DEFAULT 0,
    last_quality INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- =============================================================
-- AI & DOCUMENTS
-- =============================================================

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INT,
    page_count INT,
    status TEXT DEFAULT 'processing',
    profession TEXT,
    exam_domain_id UUID REFERENCES exam_domains(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    page_number INT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id),
    messages JSONB DEFAULT '[]',
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- MARKETPLACE
-- =============================================================

CREATE TABLE public.marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE NOT NULL,
    amount_cents INT NOT NULL,
    currency TEXT DEFAULT 'PHP',
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, bank_id)
);

CREATE TABLE public.bank_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bank_id)
);

-- =============================================================
-- ANALYTICS
-- =============================================================

CREATE TABLE public.daily_user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    total_study_time_ms INT DEFAULT 0,
    domains_studied TEXT[] DEFAULT '{}',
    streak_maintained BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE public.domain_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exam_domain_id UUID REFERENCES exam_domains(id) ON DELETE CASCADE NOT NULL,
    total_attempted INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    mastery_score FLOAT DEFAULT 0,
    theta FLOAT DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exam_domain_id)
);

-- =============================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Domains are public" ON exam_domains FOR SELECT TO authenticated USING (true);

CREATE POLICY "Published banks are public" ON question_banks FOR SELECT USING (status = 'published' OR creator_id = auth.uid());
CREATE POLICY "Users can create banks" ON question_banks FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own banks" ON question_banks FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Questions follow bank access" ON questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM question_banks WHERE id = questions.bank_id AND (status = 'published' OR creator_id = auth.uid()))
);

CREATE POLICY "Own responses only" ON user_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own sessions only" ON test_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own SRS only" ON srs_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own documents only" ON documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own chunks only" ON document_chunks FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_chunks.document_id AND user_id = auth.uid())
);

CREATE POLICY "Own conversations only" ON ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own purchases only" ON marketplace_purchases FOR ALL USING (auth.uid() = buyer_id);

CREATE POLICY "Ratings are public" ON bank_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own ratings for write" ON bank_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own daily stats" ON daily_user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own mastery data" ON domain_mastery FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX idx_questions_bank ON questions(bank_id);
CREATE INDEX idx_questions_domain ON questions(exam_domain_id);
CREATE INDEX idx_user_responses_user ON user_responses(user_id);
CREATE INDEX idx_user_responses_question ON user_responses(question_id);
CREATE INDEX idx_user_responses_session ON user_responses(session_id);
CREATE INDEX idx_srs_queue_user_next ON srs_queue(user_id, next_review_at);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_domain_mastery_user ON domain_mastery(user_id);
CREATE INDEX idx_daily_stats_user_date ON daily_user_stats(user_id, date);
CREATE INDEX idx_test_sessions_user ON test_sessions(user_id);

-- =============================================================
-- FUNCTIONS
-- =============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vector similarity search for RAG
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID
) RETURNS TABLE (id UUID, content TEXT, similarity FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.user_id = filter_user_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
