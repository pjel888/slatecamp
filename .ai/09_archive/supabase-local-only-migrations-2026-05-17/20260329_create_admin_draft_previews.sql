-- Migration: Create admin_draft_previews table
-- Description: Temporary storage for real-time draft previews in the admin editor.

CREATE TABLE IF NOT EXISTS public.admin_draft_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.wiki_articles(article_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_draft_previews ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins have full access to draft previews"
    ON public.admin_draft_previews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Add an index on created_at for easy cleanup of old previews
CREATE INDEX idx_admin_draft_previews_created_at ON public.admin_draft_previews(created_at);
