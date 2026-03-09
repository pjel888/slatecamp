-- =============================================================
-- NOTES SYSTEM — User notes tied to Wiki subjects, Tiptap JSONB
-- =============================================================

CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.wiki_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content JSONB NOT NULL DEFAULT '{}',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    linked_wiki_page_id UUID REFERENCES public.wiki_pages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_subject_id ON public.notes(subject_id);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_user_subject ON public.notes(user_id, subject_id);

-- RLS: notes are private to the owner
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_own" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_own" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete_own" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for note images (optional; create via Dashboard or separate migration if needed)
-- Here we only create the table; storage bucket creation is typically done via Supabase Dashboard
-- or with: INSERT INTO storage.buckets (id, name, public) VALUES ('note-images', 'note-images', false);
-- and RLS policies on storage.objects for authenticated user uploads to their folder.

COMMENT ON TABLE public.notes IS 'User notes (Tiptap JSONB) organized by wiki_categories subject. linked_wiki_page_id optionally links note to a wiki reference page.';
