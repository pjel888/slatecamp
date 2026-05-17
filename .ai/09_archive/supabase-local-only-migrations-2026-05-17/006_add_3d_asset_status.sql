-- Migration: 006_add_3d_asset_status.sql
-- Phase 4: 3D Asset Manager
-- Adds workflow status columns to models_3d

-- Add status column
ALTER TABLE public.models_3d 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' 
CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));

-- Add metadata JSONB column
ALTER TABLE public.models_3d 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add review columns
ALTER TABLE public.models_3d 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

ALTER TABLE public.models_3d 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_models_3d_status ON models_3d(status);

-- Update existing assets to 'draft' if null
UPDATE models_3d SET status = 'draft' WHERE status IS NULL;
