-- Migration: 005_add_wiki_content_status.sql
-- Phase 4: Wiki Content Manager
-- Adds workflow status columns to wiki_articles

-- Add status column
ALTER TABLE public.wiki_articles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' 
CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived'));

-- Add review columns
ALTER TABLE public.wiki_articles 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

ALTER TABLE public.wiki_articles 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.wiki_articles 
ADD COLUMN IF NOT EXISTS reviewer_comments TEXT;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_wiki_articles_status ON wiki_articles(status);

-- Create index for reviewed_by
CREATE INDEX IF NOT EXISTS idx_wiki_articles_reviewed_by ON wiki_articles(reviewed_by);

-- Update existing articles to 'draft' if null
UPDATE wiki_articles SET status = 'draft' WHERE status IS NULL;
