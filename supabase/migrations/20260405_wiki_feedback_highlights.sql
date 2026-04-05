-- Migration: 20260405_wiki_feedback_highlights.sql
-- Description: Add wiki_article_feedback and wiki_highlights tables to persist wiki interactions.

CREATE TABLE IF NOT EXISTS wiki_article_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

ALTER TABLE wiki_article_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback" ON wiki_article_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON wiki_article_feedback
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own feedback" ON wiki_article_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS wiki_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    highlight_text TEXT NOT NULL,
    color TEXT DEFAULT 'yellow',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wiki_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own highlights" ON wiki_highlights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own highlights" ON wiki_highlights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights" ON wiki_highlights
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights" ON wiki_highlights
    FOR DELETE USING (auth.uid() = user_id);
