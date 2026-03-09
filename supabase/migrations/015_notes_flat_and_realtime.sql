-- =============================================================
-- NOTES (flat) — Standalone note-taking, no subject tree
-- Run in Supabase SQL Editor or via migration
-- =============================================================

-- Drop existing notes table (from 014) so we can recreate flat
DROP TABLE IF EXISTS public.notes;

CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Note',
    content JSONB NOT NULL DEFAULT '{}',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);

-- RLS: users can only access their own notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_own" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_own" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete_own" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Enable Real-time for multi-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

COMMENT ON TABLE public.notes IS 'User notes (Tiptap JSONB). Flat list, no subject/category.';
