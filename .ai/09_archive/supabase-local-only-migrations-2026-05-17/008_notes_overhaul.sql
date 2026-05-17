-- ============================================================
-- Migration 008: Notes Overhaul
-- Adds contextual anchoring, pedagogical metadata, image storage
-- ============================================================

-- -------------------------------------------------------
-- PART 1: Add missing/new columns to public.notes
-- -------------------------------------------------------

-- is_pinned: referenced in app code but absent from schema (critical fix)
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false NOT NULL;

-- question_id: anchor a note to a specific exam question (Testing Hub context)
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS question_id uuid
  REFERENCES public.questions(question_id) ON DELETE SET NULL;

-- session_id: anchor a note to the quiz session it was captured during
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS session_id uuid
  REFERENCES public.quiz_sessions(session_id) ON DELETE SET NULL;

-- article_id: anchor a note to a specific Wiki article (Wiki context)
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS article_id uuid
  REFERENCES public.wiki_articles(article_id) ON DELETE SET NULL;

-- note_type: differentiate template / capture mode
-- Values: 'standard' | 'quick_capture' | 'cornell' | 'gap_analysis'
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS note_type text DEFAULT 'standard' NOT NULL;

-- tags: free-form taxonomy labels for cross-cutting filtering
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- color: optional visual color-coding (hex string, e.g. '#3B82F6')
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS color text;

-- -------------------------------------------------------
-- PART 2: Performance indexes
-- -------------------------------------------------------

-- Taxonomy-scoped note lookup (Notes Hub "By Topic" filter)
CREATE INDEX IF NOT EXISTS idx_notes_user_topic
  ON public.notes(user_id, topic_id)
  WHERE topic_id IS NOT NULL;

-- Question-scoped lookup (Testing Hub in-question note pull)
CREATE INDEX IF NOT EXISTS idx_notes_user_question
  ON public.notes(user_id, question_id)
  WHERE question_id IS NOT NULL;

-- Wiki article-scoped lookup
CREATE INDEX IF NOT EXISTS idx_notes_user_article
  ON public.notes(user_id, article_id)
  WHERE article_id IS NOT NULL;

-- Default list ordering
CREATE INDEX IF NOT EXISTS idx_notes_user_updated
  ON public.notes(user_id, updated_at DESC);

-- Pinned notes float first
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned
  ON public.notes(user_id, is_pinned DESC, updated_at DESC);

-- -------------------------------------------------------
-- PART 3: Storage bucket for note images
-- -------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-images',
  'note-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Users can upload only into their own folder: note-images/{user_id}/...
CREATE POLICY "Users can upload own note images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'note-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own images
CREATE POLICY "Users can read own note images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'note-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own note images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'note-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
